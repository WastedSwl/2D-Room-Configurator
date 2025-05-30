// ==== src\components\Configurator\Configurator.jsx ====
import React, { useRef, useEffect, useState, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import useViewTransform from "./hooks/useViewTransform";
import useModifierKeys from "./hooks/useModifierKeys";
import useMouseInteractions from "./hooks/useMouseInteractions";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import ConfiguratorToolbar from "./toolbar/ConfiguratorToolbar";
import SvgCanvas from "./canvas/SvgCanvas";
import StatusBar from "./statusbar/StatusBar";
import PropertiesPanel from "./sidebar/PropertiesPanel";
import ElementSelectionPanel from "./sidebar/ElementSelectionPanel";
import ModuleTemplateSelectionPanel from "./sidebar/ModuleTemplateSelectionPanel";
import ContextMenu from "./common/ContextMenu";
import {
  MODES,
  OBJECT_TYPES,
  DEFAULT_MODULE_CELLS_LONG,
  DEFAULT_MODULE_CELLS_WIDE,
  GRID_CELL_SIZE_M,
  defaultObjectSizes,
  WALL_THICKNESS_M_RENDER,
  INITIAL_PPM,
  EPSILON,
  MODULE_TEMPLATES,
  DOCKED_SPLIT_WALL_THICKNESS_M,
  DOCKED_SPLIT_WALL_OFFSET_M,
} from "./configuratorConstants";
import { checkOverlapWithRotation, getModuleVertices, subtractVectors, normalizeVector, dotProduct, distance } from "./configuratorUtils";
import AuthContext from "../contexts/AuthContext";

const generateId = (prefix = "id_") =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;

const initialFloorId = "floor_0";
const initialFloors = [{ id: initialFloorId, name: "Этаж 1" }];
const initialProjectObjects = { [initialFloorId]: [] };

const faceDefinitions = [
  { name: "Top",    indices: [0,1], getExtent: mod => mod.cellsWide, getSegKey: (i,mod) => `${i},0_h`,             getOffsetSign: () => -1, mapsKDirectly: true },
  { name: "Right",  indices: [1,2], getExtent: mod => mod.cellsLong, getSegKey: (i,mod) => `${mod.cellsWide},${i}_v`, getOffsetSign: () =>  1, mapsKDirectly: true },
  { name: "Bottom", indices: [2,3], getExtent: mod => mod.cellsWide, getSegKey: (i,mod) => `${i},${mod.cellsLong}_h`, getOffsetSign: () =>  1, mapsKDirectly: false },
  { name: "Left",   indices: [3,0], getExtent: mod => mod.cellsLong, getSegKey: (i,mod) => `0,${i}_v`,             getOffsetSign: () => -1, mapsKDirectly: false }
];

const Configurator = () => {
  const { user, logout } = useContext(AuthContext);
  const svgRef = useRef(null);
  const mainContainerRef = useRef(null);
  const loadFileInputRef = useRef(null);
  const [activeMode, setActiveMode] = useState(MODES.MODULAR);
  const [projectObjects, setProjectObjects] = useState(initialProjectObjects);
  const [floors, setFloors] = useState(initialFloors);
  const [currentFloorId, setCurrentFloorId] = useState(initialFloorId);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);
  const [modulePlacementCoords, setModulePlacementCoords] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const modifierKeys = useModifierKeys(mainContainerRef, svgRef);
  const { viewTransform, setViewTransform, screenToWorld } = useViewTransform(svgRef);
  const [elementTypeToPlace, setElementTypeToPlace] = useState(null);
  const objectsOnCurrentFloor = projectObjects[currentFloorId] || [];

  const getObjectById = useCallback(
    (id, floorIdToSearch = currentFloorId) => {
      if (!id) return null;
      const objectsToSearch = projectObjects[floorIdToSearch] || [];
      const module = objectsToSearch.find(
        (obj) => obj.id === id && obj.type === OBJECT_TYPES.MODULE,
      );
      if (module) return module;
      for (const mod of objectsToSearch.filter((o) => o.type === OBJECT_TYPES.MODULE)) {
        for (const segmentKey in mod.wallSegments) {
          const segment = mod.wallSegments[segmentKey];
          if (segment.id === id) {
            return {
              ...segment,
              type: OBJECT_TYPES.WALL_SEGMENT,
              parentModule: mod,
              segmentKey,
            };
          }
          if (segment.elements) {
            for (const element of segment.elements) {
              if (element.id === id)
                return {
                  ...element,
                  type: element.type,
                  parentWallSegment: segment,
                  parentModule: mod,
                  segmentKey,
                };
            }
          }
        }
      }
      return null;
    },
    [projectObjects, currentFloorId],
  );

  const primarySelectedObject = getObjectById(selectedObjectId);
  const canShowInitialModuleButton =
    activeMode === MODES.MODULAR &&
    objectsOnCurrentFloor.filter(obj => obj.type === OBJECT_TYPES.MODULE).length === 0;
  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const createNewModule = useCallback((config) => {
    const {
      posX = 0,
      posY = 0,
      cellsWide = DEFAULT_MODULE_CELLS_WIDE,
      cellsLong = DEFAULT_MODULE_CELLS_LONG,
      label,
      internalWallSegments: templateInternalWalls = {},
      predefinedElements: templatePredefinedElements = [],
      rotation = 0,
      mirroredX = false,
    } = config;
    const moduleId = generateId("module_");
    const actualLabel = label || `Модуль ${cellsWide}x${cellsLong}`;
    const newModuleWallSegments = {};

    const getDefaultSegmentProps = () => ({
        elements: [],
        thickness: WALL_THICKNESS_M_RENDER,
        isDocked: false,
        renderOffset: 0,
        isPassageWithPartner: false,
        isFullyOpenPassage: false,
        partnerSegmentId: null,
        partnerModuleId: null,
        wasPartnerModuleId: null,
        wasRenderOffset: null,
    });

    for (let i = 0; i < cellsWide; i++) {
      newModuleWallSegments[`${i},0_h`] = { id: generateId("wall_"), ...getDefaultSegmentProps() };
      newModuleWallSegments[`${i},${cellsLong}_h`] = { id: generateId("wall_"), ...getDefaultSegmentProps() };
    }
    for (let j = 0; j < cellsLong; j++) {
      newModuleWallSegments[`0,${j}_v`] = { id: generateId("wall_"), ...getDefaultSegmentProps() };
      newModuleWallSegments[`${cellsWide},${j}_v`] = { id: generateId("wall_"), ...getDefaultSegmentProps() };
    }

    for (const segmentKey in templateInternalWalls) {
      if (Object.prototype.hasOwnProperty.call(templateInternalWalls, segmentKey)) {
        const wallData = templateInternalWalls[segmentKey];
        newModuleWallSegments[segmentKey] = {
            id: generateId("wall_"),
            ...getDefaultSegmentProps(),
            thickness: wallData.thickness || WALL_THICKNESS_M_RENDER
        };
      }
    }

    templatePredefinedElements.forEach(elConfig => {
      const targetSegment = newModuleWallSegments[elConfig.segmentKey];
      if (targetSegment) {
        let elementWidth = elConfig.properties?.width || defaultObjectSizes[elConfig.type]?.width || GRID_CELL_SIZE_M;
        let positionOnSegment = elConfig.properties?.positionOnSegment || 0.5;

        if (elConfig.type === OBJECT_TYPES.DOOR || elConfig.type === OBJECT_TYPES.WINDOW) {
            elementWidth = GRID_CELL_SIZE_M;
            positionOnSegment = 0.5;
        }
        
        const newElement = { 
            id: generateId(`${elConfig.type}_`), 
            type: elConfig.type, 
            ...elConfig.properties,
            width: elementWidth,
            positionOnSegment: positionOnSegment
        };
        if (!Array.isArray(targetSegment.elements)) {
            targetSegment.elements = [];
        }
        targetSegment.elements.push(newElement);
      }
    });

    return {
      id: moduleId, type: OBJECT_TYPES.MODULE, x: posX, y: posY, cellsWide, cellsLong,
      width: cellsWide * GRID_CELL_SIZE_M, height: cellsLong * GRID_CELL_SIZE_M,
      rotation: rotation, label: actualLabel, wallSegments: newModuleWallSegments,
      mirroredX: mirroredX,
    };
  }, [GRID_CELL_SIZE_M]);

  const openTemplateSelectionPanel = useCallback((coords = { worldX: 0, worldY: 0 }) => {
    if (!canShowInitialModuleButton && !coords) return;
    setModulePlacementCoords(coords);
    setIsTemplatePanelOpen(true);
    setSelectedObjectId(null);
    closeContextMenu();
  }, [canShowInitialModuleButton, closeContextMenu]);

  const addModuleFromTemplate = useCallback((template) => {
    if (!modulePlacementCoords) {
      setIsTemplatePanelOpen(false);
      return;
    }
    const { worldX, worldY } = modulePlacementCoords;
    const snappedX = Math.round(worldX / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M;
    const snappedY = Math.round(worldY / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M;
    const moduleConfig = {
      posX: snappedX, posY: snappedY, cellsWide: template.cellsWide, cellsLong: template.cellsLong,
      label: template.label, internalWallSegments: template.internalWallSegments, predefinedElements: template.predefinedElements,
      rotation: 0, mirroredX: template.mirroredX || false,
    };
    const tempNewModule = createNewModule(moduleConfig);
    const existingModulesOnFloor = (projectObjects[currentFloorId] || []).filter(
      obj => obj.type === OBJECT_TYPES.MODULE
    );
    let canPlaceModule = true;
    for (const existingModule of existingModulesOnFloor) {
      if (checkOverlapWithRotation(tempNewModule, existingModule)) {
        canPlaceModule = false;
        break;
      }
    }
    if (!canPlaceModule) {
      toast.error("Невозможно разместить модуль: пересечение с существующим модулем.");
      setIsTemplatePanelOpen(false);
      setModulePlacementCoords(null);
      closeContextMenu();
      return;
    }
    const newModule = tempNewModule;
    setProjectObjects(prev => ({
      ...prev,
      [currentFloorId]: [...(prev[currentFloorId] || []), newModule]
    }));
    setSelectedObjectId(newModule.id);
    setIsTemplatePanelOpen(false);
    setModulePlacementCoords(null);
    closeContextMenu();
  }, [createNewModule, closeContextMenu, modulePlacementCoords, GRID_CELL_SIZE_M, currentFloorId, projectObjects]);

  const addModuleFromToolbar = useCallback(() => {
    let newX = 0;
    let newY = 0;
    const modulesOnly = objectsOnCurrentFloor.filter((o) => o.type === OBJECT_TYPES.MODULE);
    if (modulesOnly.length > 0) {
      const rightmostModule = modulesOnly.filter((obj) => typeof obj.x === "number" && typeof obj.y === "number")
        .sort((a, b) => (b.x || 0) + (b.width || 0) - ((a.x || 0) + (a.width || 0)))[0] || modulesOnly[modulesOnly.length - 1];
      if (rightmostModule) {
        newX = (rightmostModule.x || 0) + (rightmostModule.width || DEFAULT_MODULE_CELLS_WIDE * GRID_CELL_SIZE_M) + GRID_CELL_SIZE_M * 2;
        newY = rightmostModule.y || 0;
      } else {
        newX = (DEFAULT_MODULE_CELLS_WIDE * GRID_CELL_SIZE_M + GRID_CELL_SIZE_M * 2) * modulesOnly.length;
      }
    }
    setModulePlacementCoords({ worldX: newX, worldY: newY });
    setIsTemplatePanelOpen(true);
    setSelectedObjectId(null);
    closeContextMenu();
  }, [objectsOnCurrentFloor, closeContextMenu, GRID_CELL_SIZE_M]);

  const addNewModuleViaContextMenu = useCallback((worldX, worldY) => {
    if (activeMode !== MODES.MODULAR) return;
    openTemplateSelectionPanel({ worldX, worldY });
  }, [activeMode, openTemplateSelectionPanel]);

  const handleAiGeneratedModules = useCallback((aiModules, notes) => {
    if (!aiModules || !Array.isArray(aiModules) || aiModules.length === 0) {
      toast.info(notes || "ИИ не сгенерировал модули или вернул пустой результат.");
      return;
    }
    setProjectObjects(prev => {
      let currentFloorObjects = [...(prev[currentFloorId] || [])];
      const newModulesToAdd = [];
      let firstNewModuleId = null;
      for (const aiModuleData of aiModules) {
        const moduleConfig = {
          posX: parseFloat(aiModuleData.posX) || 0,
          posY: parseFloat(aiModuleData.posY) || 0,
          cellsWide: parseInt(aiModuleData.cellsWide) || DEFAULT_MODULE_CELLS_WIDE,
          cellsLong: parseInt(aiModuleData.cellsLong) || DEFAULT_MODULE_CELLS_LONG,
          label: aiModuleData.label || `AI Модуль`,
          internalWallSegments: aiModuleData.internalWallSegments || {},
          predefinedElements: aiModuleData.predefinedElements || [],
          rotation: parseInt(aiModuleData.rotation) || 0,
          mirroredX: aiModuleData.mirroredX === true,
        };
        moduleConfig.posX = Math.round(moduleConfig.posX / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M;
        moduleConfig.posY = Math.round(moduleConfig.posY / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M;
        const newModule = createNewModule(moduleConfig);
        let canPlaceModule = true;
        const modulesToCheckOverlap = [...currentFloorObjects, ...newModulesToAdd];
        for (const existingModule of modulesToCheckOverlap) {
          if (checkOverlapWithRotation(newModule, existingModule)) {
            canPlaceModule = false;
            toast.warn(`Модуль "${newModule.label}" от ИИ (${newModule.id.slice(-4)}) пересекается и не будет добавлен.`);
            break;
          }
        }
        if (canPlaceModule) {
          newModulesToAdd.push(newModule);
          if (!firstNewModuleId) firstNewModuleId = newModule.id;
        }
      }
      if (newModulesToAdd.length > 0) {
        if (firstNewModuleId) setSelectedObjectId(firstNewModuleId);
        return { ...prev, [currentFloorId]: [...currentFloorObjects, ...newModulesToAdd] };
      }
      return prev;
    });
    if (notes) toast.info(`Заметки от ИИ: ${notes}`, { autoClose: 7000 });
  }, [currentFloorId, createNewModule, GRID_CELL_SIZE_M]);

  const handleToggleWallSegment = useCallback(
    (moduleId, cellX, cellY, orientation, segmentIdToToggle) => {
      setProjectObjects(prevProjectObjects => {
        const currentFloorObjects = prevProjectObjects[currentFloorId] || [];
        const newFloorObjects = currentFloorObjects.map((obj) => {
          if (obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE) {
            const newModule = { ...obj, wallSegments: { ...obj.wallSegments } };
            const segmentKey = `${cellX},${cellY}_${orientation}`;
            let isPerimeter = false;
            if (orientation === "h" && (cellY === 0 || cellY === newModule.cellsLong)) isPerimeter = true;
            if (orientation === "v" && (cellX === 0 || cellX === newModule.cellsWide)) isPerimeter = true;
            if (newModule.wallSegments[segmentKey]) {
              if (newModule.wallSegments[segmentKey].isDocked) { toast.warn("Нельзя удалить стыковочную стену этим способом."); return obj;}
              if (isPerimeter) { toast.warn("Периметральные стены не могут быть удалены."); return obj; }
              if (newModule.wallSegments[segmentKey].elements && newModule.wallSegments[segmentKey].elements.length > 0) {
                toast.warn("Нельзя удалить стену с элементами. Сначала удалите элементы."); return obj;
              }
              const wallIdToDelete = newModule.wallSegments[segmentKey].id;
              delete newModule.wallSegments[segmentKey];
              if (selectedObjectId === wallIdToDelete) setSelectedObjectId(null);
            } else if (!isPerimeter) {
              newModule.wallSegments[segmentKey] = { id: generateId("wall_"), elements: [], thickness: WALL_THICKNESS_M_RENDER, isDocked: false, renderOffset: 0, isPassageWithPartner: false, isFullyOpenPassage: false, partnerSegmentId: null, partnerModuleId: null, wasPartnerModuleId: null, wasRenderOffset: null };
            }
            return newModule;
          }
          return obj;
        });
        return { ...prevProjectObjects, [currentFloorId]: newFloorObjects };
      });
      closeContextMenu();
    },
    [selectedObjectId, closeContextMenu, currentFloorId]
  );

  const deleteWallSegment = useCallback(
    (moduleId, segmentKey) => {
      setProjectObjects(prevProjectObjects => {
        const currentFloorObjects = prevProjectObjects[currentFloorId] || [];
        const newFloorObjects = currentFloorObjects.map((obj) => {
          if (obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE) {
            const newModule = { ...obj, wallSegments: { ...obj.wallSegments } };
            const segment = newModule.wallSegments[segmentKey];
            if (!segment) return obj;
            if (segment.isDocked) { toast.warn("Нельзя удалить стыковочную стену этим способом. Используйте управление стыком."); return obj;}
            const [coords, orientation] = segmentKey.split("_");
            const cellX = parseInt(coords.split(",")[0]);
            const cellY = parseInt(coords.split(",")[1]);
            let isPerimeter = false;
            if (orientation === "h" && (cellY === 0 || cellY === newModule.cellsLong)) isPerimeter = true;
            if (orientation === "v" && (cellX === 0 || cellX === newModule.cellsWide)) isPerimeter = true;
            if (isPerimeter) { toast.warn("Периметральные стены модуля не могут быть удалены этим способом."); return obj; }
            if (segment.elements && segment.elements.length > 0) { toast.warn("Нельзя удалить стену с элементами. Сначала удалите элементы."); return obj; }
            const wallIdToDelete = segment.id;
            delete newModule.wallSegments[segmentKey];
            if (selectedObjectId === wallIdToDelete) setSelectedObjectId(null);
            return newModule;
          }
          return obj;
        });
        return { ...prevProjectObjects, [currentFloorId]: newFloorObjects };
      });
      closeContextMenu();
    },
    [selectedObjectId, closeContextMenu, currentFloorId]
  );

  const handleElementSelectionFromPanel = useCallback((type) => {
    setElementTypeToPlace(prevType => prevType === type ? null : type);
    setSelectedObjectId(null);
    closeContextMenu();
  }, [closeContextMenu]);

  const addElementToWall = useCallback(
    (elementType, targetModuleId, targetSegmentKey, initialProperties = {}) => {
      setProjectObjects(prevProjectObjects => {
        const currentFloorObjects = prevProjectObjects[currentFloorId] || [];
        const newFloorObjects = currentFloorObjects.map((obj) => {
          if (obj.id === targetModuleId && obj.type === OBJECT_TYPES.MODULE) {
            const newModule = { ...obj, wallSegments: { ...obj.wallSegments } };
            const segment = newModule.wallSegments[targetSegmentKey];
            if (segment) {
              if(segment.isPassageWithPartner && segment.thickness < WALL_THICKNESS_M_RENDER / 2 || segment.isFullyOpenPassage) {
                toast.error("Нельзя добавить элемент в объединенный или полностью открытый проем.");
                return obj;
              }
              if(elementType !== OBJECT_TYPES.DOOR && elementType !== OBJECT_TYPES.WINDOW && elementType !== OBJECT_TYPES.PANORAMIC_WINDOW) {
                  const hasWindowOrDoor = segment.elements?.some(el => el.type === OBJECT_TYPES.DOOR || el.type === OBJECT_TYPES.WINDOW || el.type === OBJECT_TYPES.PANORAMIC_WINDOW);
                  if (hasWindowOrDoor) {
                      toast.error("Нельзя добавить аксессуар на стену с окном или дверью.");
                      return obj;
                  }
              }

              const elementDefaults = defaultObjectSizes[elementType];
              let elementWidth = initialProperties.width || elementDefaults.width;
              let positionOnSegment = initialProperties.positionOnSegment || 0.5;

              const isFullSegmentWidthElementType = (elementType === OBJECT_TYPES.DOOR || elementType === OBJECT_TYPES.WINDOW);
              if (isFullSegmentWidthElementType) {
                elementWidth = GRID_CELL_SIZE_M; 
                positionOnSegment = 0.5;
              }
              
              let isPlaceable = elementDefaults && elementWidth <= GRID_CELL_SIZE_M + EPSILON;
              if (elementType === OBJECT_TYPES.DOOR || elementType === OBJECT_TYPES.WINDOW || elementType === OBJECT_TYPES.PANORAMIC_WINDOW) {
                isPlaceable = isPlaceable && (!segment.elements || segment.elements.filter(el =>
                  el.type === OBJECT_TYPES.DOOR || el.type === OBJECT_TYPES.WINDOW || el.type === OBJECT_TYPES.PANORAMIC_WINDOW).length === 0);
              }
              if (!isPlaceable) {
                toast.error("Невозможно разместить элемент на этом сегменте стены.");
                return obj;
              }
              const newElement = {
                id: generateId(`${elementType}_`), type: elementType,
                positionOnSegment: positionOnSegment,
                width: elementWidth,
                ...(elementType === OBJECT_TYPES.DOOR && { hingeSide: "left" }), // isOpen и openingAngle убраны, т.к. дверь всегда открыта
                ...(elementType === OBJECT_TYPES.WINDOW && { height: elementDefaults.height }),
                ...(elementType === OBJECT_TYPES.PANORAMIC_WINDOW && { height: elementDefaults.height }),
                ...(elementType === OBJECT_TYPES.RADIATOR && { height: elementDefaults.height }),
                ...(elementType === OBJECT_TYPES.KITCHEN_ELEMENT && { height: elementDefaults.height, depth: elementDefaults.depth }),
                ...initialProperties,
                width: elementWidth, 
                positionOnSegment: positionOnSegment,
              };
              if (!segment.elements) segment.elements = [];
              segment.elements.push(newElement);
              newModule.wallSegments[targetSegmentKey] = segment;
              setSelectedObjectId(newElement.id);
              return newModule;
            }
          }
          return obj;
        });
        return { ...prevProjectObjects, [currentFloorId]: newFloorObjects };
      });
      setElementTypeToPlace(null);
      closeContextMenu();
    },
    [closeContextMenu, currentFloorId, GRID_CELL_SIZE_M, EPSILON]
  );

  const handleWallSegmentClickForPlacement = useCallback((segmentId) => {
    if (!elementTypeToPlace) return;
    const segmentObject = getObjectById(segmentId);
    if (segmentObject && segmentObject.type === OBJECT_TYPES.WALL_SEGMENT) {
      if ((segmentObject.isPassageWithPartner && segmentObject.thickness < WALL_THICKNESS_M_RENDER / 2) || segmentObject.isFullyOpenPassage){
         toast.error("Нельзя разместить элемент в объединенном или полностью открытом проеме.");
         setElementTypeToPlace(null);
         return;
      }
      if(elementTypeToPlace !== OBJECT_TYPES.DOOR && elementTypeToPlace !== OBJECT_TYPES.WINDOW && elementTypeToPlace !== OBJECT_TYPES.PANORAMIC_WINDOW) {
          const hasWindowOrDoor = segmentObject.elements?.some(el => el.type === OBJECT_TYPES.DOOR || el.type === OBJECT_TYPES.WINDOW || el.type === OBJECT_TYPES.PANORAMIC_WINDOW);
          if (hasWindowOrDoor) {
              toast.error("Нельзя добавить аксессуар на стену с окном или дверью.");
              setElementTypeToPlace(null);
              return;
          }
      }
      const { parentModule, segmentKey } = segmentObject;
      addElementToWall(elementTypeToPlace, parentModule.id, segmentKey);
    } else {
      setElementTypeToPlace(null);
    }
  }, [elementTypeToPlace, getObjectById, addElementToWall]);

  const updateSelectedObjectProperty = useCallback(
    (key, value) => {
      if (!selectedObjectId || !primarySelectedObject) return;
      setElementTypeToPlace(null);
      const numericProps = ["x", "y", "width", "height", "rotation", "openingAngle", "positionOnSegment", "thickness", "renderOffset", "depth"];
      let processedValue = value;
      if (numericProps.includes(key)) {
        processedValue = parseFloat(value);
        if (isNaN(processedValue)) {
          if (value === "" && (key === "x" || key === "y" || key === "rotation" || key === "thickness" || key === "renderOffset" || key === "depth")) processedValue = 0;
          else return;
        }
      } else if (typeof value === "string" && (value.toLowerCase() === "true" || value.toLowerCase() === "false")) {
        processedValue = value.toLowerCase() === "true";
      }
      
      if (
          (primarySelectedObject.type === OBJECT_TYPES.DOOR || primarySelectedObject.type === OBJECT_TYPES.WINDOW) &&
          (key === "width" || key === "positionOnSegment")
         ) {
          toast.info(`Свойство '${key}' для этого типа элемента управляется автоматически.`);
          return;
      }

      setProjectObjects(prevProjectObjects => {
        const currentFloorObjects = prevProjectObjects[currentFloorId] || [];
        const newFloorObjects = currentFloorObjects.map((obj) => {
          if (obj.id === selectedObjectId && obj.type === OBJECT_TYPES.MODULE) {
            if (key === "label") return { ...obj, [key]: processedValue };
            if (key === "rotation") {
              processedValue = (Math.round(processedValue / 90) * 90) % 360;
              if (processedValue < 0) processedValue += 360;
            }
            return { ...obj, [key]: processedValue };
          }
          if (primarySelectedObject.parentModule?.id && obj.id === primarySelectedObject.parentModule.id && obj.type === OBJECT_TYPES.MODULE) {
            const newModule = { ...obj, wallSegments: { ...obj.wallSegments } };
            let changed = false;
            if (primarySelectedObject.segmentKey && newModule.wallSegments[primarySelectedObject.segmentKey]) {
              const segment = newModule.wallSegments[primarySelectedObject.segmentKey];
              if (primarySelectedObject.type === OBJECT_TYPES.WALL_SEGMENT && segment.id === selectedObjectId) {
                 if ((key === "thickness" || key === "renderOffset") && !segment.isFullyOpenPassage && !segment.isDocked) {
                  changed = true;
                  newModule.wallSegments[primarySelectedObject.segmentKey] = { ...segment, [key]: processedValue };
                }
              } else {
                const newElements = (segment.elements || []).map((el) => {
                  if (el.id === selectedObjectId) {
                    changed = true; return { ...el, [key]: processedValue };
                  }
                  return el;
                });
                if (changed) newModule.wallSegments[primarySelectedObject.segmentKey] = { ...segment, elements: newElements };
              }
            }
            return changed ? newModule : obj;
          }
          return obj;
        });
        return { ...prevProjectObjects, [currentFloorId]: newFloorObjects };
      });
    },
    [selectedObjectId, primarySelectedObject, currentFloorId]
  );

  const updateModulePosition = useCallback((moduleId, newX, newY) => {
    setProjectObjects(prev => ({
      ...prev,
      [currentFloorId]: (prev[currentFloorId] || []).map(obj =>
        obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE ? { ...obj, x: newX, y: newY } : obj
      )
    }));
  }, [currentFloorId]);

  const snapAndFinalizeModulePosition = useCallback(
    (moduleId, originalModuleX, originalModuleY, originalModuleRotation) => {
      setProjectObjects(prevProjectObjects => {
        let currentFloorObjects = [...(prevProjectObjects[currentFloorId] || [])];
        const moduleToFinalizeIndex = currentFloorObjects.findIndex(obj => obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE);
        if (moduleToFinalizeIndex === -1) return prevProjectObjects;

        let moduleToFinalize = currentFloorObjects[moduleToFinalizeIndex];

        const snappedX = GRID_CELL_SIZE_M > 0 ? Math.round(moduleToFinalize.x / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M : moduleToFinalize.x;
        const snappedY = GRID_CELL_SIZE_M > 0 ? Math.round(moduleToFinalize.y / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M : moduleToFinalize.y;

        const potentialMovedModuleState = {
          ...moduleToFinalize,
          x: snappedX,
          y: snappedY,
        };

        const otherModules = currentFloorObjects.filter(
          obj => obj.id !== moduleId && obj.type === OBJECT_TYPES.MODULE
        );

        let isOverlapping = false;
        for (const otherModule of otherModules) {
          if (checkOverlapWithRotation(potentialMovedModuleState, otherModule)) {
            isOverlapping = true;
            break;
          }
        }

        let finalX, finalY, finalRotation;
        let hasMovedSignificantly = false;

        if (isOverlapping) {
          toast.warn("Перемещение невозможно: модули пересекаются. Модуль возвращен и выровнен.");
          finalX = originalModuleX;
          finalY = originalModuleY;
          finalRotation = originalModuleRotation;
        } else {
          finalX = snappedX;
          finalY = snappedY;
          finalRotation = moduleToFinalize.rotation || 0;
          if (Math.abs(finalX - originalModuleX) > EPSILON ||
              Math.abs(finalY - originalModuleY) > EPSILON ||
              Math.abs(finalRotation - originalModuleRotation) > EPSILON ) {
            hasMovedSignificantly = true;
          }
        }

        moduleToFinalize = { ...moduleToFinalize, x: finalX, y: finalY, rotation: finalRotation };
        currentFloorObjects[moduleToFinalizeIndex] = moduleToFinalize;

        if (hasMovedSignificantly || isOverlapping) {
            const modulesPreviouslyDockedWithMoved = [];
            (prevProjectObjects[currentFloorId] || []).forEach(prevModule => {
                if (prevModule.type === OBJECT_TYPES.MODULE && prevModule.id !== moduleId) {
                    for (const segKey in prevModule.wallSegments) {
                        if (prevModule.wallSegments[segKey].partnerModuleId === moduleId) {
                            modulesPreviouslyDockedWithMoved.push(prevModule.id);
                            break;
                        }
                    }
                }
            });

            const allModulesToResetDocking = [moduleId, ...modulesPreviouslyDockedWithMoved];
            allModulesToResetDocking.forEach(modIdToReset => {
                const moduleInstanceIndex = currentFloorObjects.findIndex(m => m.id === modIdToReset);
                if (moduleInstanceIndex !== -1) {
                    const moduleInstance = currentFloorObjects[moduleInstanceIndex];
                    const newWallSegments = { ...moduleInstance.wallSegments };
                    let changed = false;
                    for (const segmentKey in newWallSegments) {
                        const segment = newWallSegments[segmentKey];
                        if (segment.isDocked || segment.isPassageWithPartner) {
                            newWallSegments[segmentKey] = {
                                ...segment,
                                thickness: WALL_THICKNESS_M_RENDER,
                                renderOffset: 0,
                                isDocked: false,
                                isPassageWithPartner: false,
                                partnerModuleId: null,
                                partnerSegmentId: null,
                                wasPartnerModuleId: segment.isFullyOpenPassage ? segment.wasPartnerModuleId : null,
                                wasRenderOffset: segment.isFullyOpenPassage ? segment.wasRenderOffset : null,
                            };
                            if (hasMovedSignificantly && segment.isFullyOpenPassage && segment.wasPartnerModuleId === (modIdToReset === moduleId ? modulesPreviouslyDockedWithMoved[0] : moduleId) ){
                                newWallSegments[segmentKey].isFullyOpenPassage = false;
                            }
                            changed = true;
                        }
                    }
                    if (changed) {
                        currentFloorObjects[moduleInstanceIndex] = { ...moduleInstance, wallSegments: newWallSegments };
                    }
                }
            });
        }

        let movedModuleAfterReset = currentFloorObjects.find(obj => obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE);
        if (!movedModuleAfterReset) return prevProjectObjects;

        const updateWallSegmentInCurrentObjects = (targetModuleId, segmentKey, updates) => {
            const targetModuleIndex = currentFloorObjects.findIndex(m => m.id === targetModuleId);
            if (targetModuleIndex !== -1 && currentFloorObjects[targetModuleIndex].wallSegments[segmentKey]) {
                const targetModule = currentFloorObjects[targetModuleIndex];
                const updatedWallSegments = {
                    ...targetModule.wallSegments,
                    [segmentKey]: {
                        ...targetModule.wallSegments[segmentKey],
                        ...updates,
                    }
                };
                if(updates.isDocked && updatedWallSegments[segmentKey].isFullyOpenPassage){
                    updatedWallSegments[segmentKey].isFullyOpenPassage = false;
                    updatedWallSegments[segmentKey].wasPartnerModuleId = null;
                    updatedWallSegments[segmentKey].wasRenderOffset = null;
                }
                currentFloorObjects[targetModuleIndex] = { ...targetModule, wallSegments: updatedWallSegments };
            }
        };

        const otherModulesForDocking = currentFloorObjects.filter(
          obj => obj.id !== moduleId && obj.type === OBJECT_TYPES.MODULE
        );

        const checkAndApplyDockingBetweenFaces = (
            mModule, oModule,
            mFaceDef, oFaceDef
        ) => {
            const vertsM = getModuleVertices(mModule);
            const vertsO = getModuleVertices(oModule);
            const mP1 = vertsM[mFaceDef.indices[0]];
            const mP2 = vertsM[mFaceDef.indices[1]];
            const oP1 = vertsO[oFaceDef.indices[0]];
            const oP2 = vertsO[oFaceDef.indices[1]];
            const dirM = normalizeVector(subtractVectors(mP2, mP1));
            const dirO = normalizeVector(subtractVectors(oP2, oP1));
            if (Math.abs(dotProduct(dirM, dirO)) < 0.99) return; 
            if (dotProduct(dirM, dirO) > -0.99) return; 
            const normalToLineM = { x: -dirM.y, y: dirM.x };
            const distO1ToLineM = Math.abs(dotProduct(subtractVectors(oP1, mP1), normalToLineM));
            if (distO1ToLineM > EPSILON * 10) return; 
            const val_m1_proj = 0;
            const val_m2_proj = distance(mP1, mP2);
            const val_o1_proj = dotProduct(subtractVectors(oP1, mP1), dirM);
            const val_o2_proj = dotProduct(subtractVectors(oP2, mP1), dirM);
            const overlap_start_proj = Math.max(Math.min(val_m1_proj, val_m2_proj), Math.min(val_o1_proj, val_o2_proj));
            const overlap_end_proj = Math.min(Math.max(val_m1_proj, val_m2_proj), Math.max(val_o1_proj, val_o2_proj));
            let overlapLength = overlap_end_proj - overlap_start_proj;
            if (overlapLength < GRID_CELL_SIZE_M - EPSILON) return; 
            const numOverlappingCellsStrict = Math.floor((overlapLength + EPSILON) / GRID_CELL_SIZE_M);
            const perfectlyAlignedOverlapLength = numOverlappingCellsStrict * GRID_CELL_SIZE_M;
            if (Math.abs(overlapLength - perfectlyAlignedOverlapLength) > GRID_CELL_SIZE_M * 0.1 || numOverlappingCellsStrict === 0) return;
            overlapLength = perfectlyAlignedOverlapLength;
            const world_overlap_start_point = { x: mP1.x + dirM.x * overlap_start_proj, y: mP1.y + dirM.y * overlap_start_proj };
            const mFaceExtentDimCells = mFaceDef.getExtent(mModule);
            const oFaceExtentDimCells = oFaceDef.getExtent(oModule);
            const dist_mP1_to_overlap_start = dotProduct(subtractVectors(world_overlap_start_point, mP1), dirM);
            let firstCellIndexM = Math.round(dist_mP1_to_overlap_start / GRID_CELL_SIZE_M);
            firstCellIndexM = Math.max(0, Math.min(firstCellIndexM, mFaceExtentDimCells - numOverlappingCellsStrict));
            const dist_oP1_to_overlap_start = dotProduct(subtractVectors(world_overlap_start_point, oP1), dirO); 
            let firstCellIndexO = Math.round(dist_oP1_to_overlap_start / GRID_CELL_SIZE_M);
            firstCellIndexO = Math.max(0, Math.min(firstCellIndexO, oFaceExtentDimCells - numOverlappingCellsStrict));

            for (let k = 0; k < numOverlappingCellsStrict; k++) {
                let m_iter_idx = firstCellIndexM + k;
                let o_iter_idx = firstCellIndexO + (numOverlappingCellsStrict - 1 - k);
                const actual_m_cell_idx = mFaceDef.mapsKDirectly ? m_iter_idx : (mFaceExtentDimCells - 1 - m_iter_idx);
                const actual_o_cell_idx = oFaceDef.mapsKDirectly ? o_iter_idx : (oFaceExtentDimCells - 1 - o_iter_idx);
                if (actual_m_cell_idx < 0 || actual_m_cell_idx >= mFaceExtentDimCells || actual_o_cell_idx < 0 || actual_o_cell_idx >= oFaceExtentDimCells) continue;
                const currentMovedSegKey = mFaceDef.getSegKey(actual_m_cell_idx, mModule);
                const currentOtherSegKey = oFaceDef.getSegKey(actual_o_cell_idx, oModule);
                const mModuleInstance = currentFloorObjects.find(mod => mod.id === mModule.id);
                const oModuleInstance = currentFloorObjects.find(mod => mod.id === oModule.id);
                if(!mModuleInstance || !oModuleInstance) continue;
                const movedWallSegment = mModuleInstance.wallSegments[currentMovedSegKey];
                const otherWallSegment = oModuleInstance.wallSegments[currentOtherSegKey];
                if (!movedWallSegment || !otherWallSegment) continue;
                if (movedWallSegment.isFullyOpenPassage || otherWallSegment.isFullyOpenPassage) continue;
                const originalMModuleState = (prevProjectObjects[currentFloorId] || []).find(m => m.id === mModule.id);
                const originalOModuleState = (prevProjectObjects[currentFloorId] || []).find(m => m.id === oModule.id);
                if (!originalMModuleState || !originalOModuleState) continue;
                const originalMovedWall = originalMModuleState.wallSegments[currentMovedSegKey];
                const originalOtherWall = originalOModuleState.wallSegments[currentOtherSegKey];
                const passageStateToPreserve = originalMovedWall && originalMovedWall.isPassageWithPartner && originalOtherWall && originalOtherWall.isPassageWithPartner && !originalMovedWall.isFullyOpenPassage && !originalOtherWall.isFullyOpenPassage && originalMovedWall.partnerModuleId === oModule.id && originalOtherWall.partnerModuleId === mModule.id && originalMovedWall.partnerSegmentId === (originalOtherWall ? originalOtherWall.id : null) && originalOtherWall.partnerSegmentId === (originalMovedWall ? originalMovedWall.id : null) && !isOverlapping;
                updateWallSegmentInCurrentObjects(mModule.id, currentMovedSegKey, { thickness: passageStateToPreserve ? WALL_THICKNESS_M_RENDER : DOCKED_SPLIT_WALL_THICKNESS_M, renderOffset: passageStateToPreserve ? 0 : mFaceDef.getOffsetSign() * DOCKED_SPLIT_WALL_OFFSET_M, isDocked: true, isPassageWithPartner: passageStateToPreserve, partnerModuleId: oModule.id, partnerSegmentId: otherWallSegment.id });
                const potentiallyUpdatedMovedWallSegment = currentFloorObjects.find(mod => mod.id === mModule.id)?.wallSegments[currentMovedSegKey];
                if(!potentiallyUpdatedMovedWallSegment) continue;
                updateWallSegmentInCurrentObjects(oModule.id, currentOtherSegKey, { thickness: passageStateToPreserve ? WALL_THICKNESS_M_RENDER : DOCKED_SPLIT_WALL_THICKNESS_M, renderOffset: passageStateToPreserve ? 0 : oFaceDef.getOffsetSign() * DOCKED_SPLIT_WALL_OFFSET_M, isDocked: true, isPassageWithPartner: passageStateToPreserve, partnerModuleId: mModule.id, partnerSegmentId: potentiallyUpdatedMovedWallSegment.id });
            }
        };

        for (const otherModule of otherModulesForDocking) {
            let currentMovedModule = currentFloorObjects.find(m => m.id === moduleId);
            if (!currentMovedModule) break; 
            let currentOtherModule = currentFloorObjects.find(m => m.id === otherModule.id);
            if (!currentOtherModule) continue;
            for (const mFaceDef of faceDefinitions) {
                if (!currentMovedModule) break;
                for (const oFaceDef of faceDefinitions) {
                    if (!currentMovedModule || !currentOtherModule) break; 
                    checkAndApplyDockingBetweenFaces( currentMovedModule, currentOtherModule, mFaceDef, oFaceDef );
                    currentMovedModule = currentFloorObjects.find(m => m.id === moduleId);
                    if (!currentMovedModule) break;
                    currentOtherModule = currentFloorObjects.find(m => m.id === otherModule.id); 
                    if (!currentOtherModule) break;
                }
                if (!currentMovedModule || !currentOtherModule) break;
            }
            if (!currentMovedModule) break;
        }
        return { ...prevProjectObjects, [currentFloorId]: currentFloorObjects };
      });
    },
    [currentFloorId, GRID_CELL_SIZE_M, WALL_THICKNESS_M_RENDER, DOCKED_SPLIT_WALL_THICKNESS_M, DOCKED_SPLIT_WALL_OFFSET_M, EPSILON]
  );

  const setDockedLinePassageState = useCallback((clickedSegmentObject, makePassage) => {
    if (!clickedSegmentObject || !clickedSegmentObject.isDocked || !clickedSegmentObject.parentModule) return;
    const { parentModule, segmentKey: clickedSegmentKey } = clickedSegmentObject;
    const [coords, orientation] = clickedSegmentObject.segmentKey.split("_");
    setProjectObjects(prev => {
        let processedObjects = [...(prev[currentFloorId] || [])];
        const updateWallProperties = (moduleId, segKey, passageState) => {
            processedObjects = processedObjects.map(m => {
                if (m.id === moduleId && m.wallSegments[segKey]) {
                    const segment = m.wallSegments[segKey];
                    let newThickness = passageState ? WALL_THICKNESS_M_RENDER : DOCKED_SPLIT_WALL_THICKNESS_M;
                    let newRenderOffset = 0;
                    if (!passageState) {
                        const thisModule = processedObjects.find(mod => mod.id === moduleId);
                        if (thisModule) {
                            const [cellIndicesStr, wallOrientation] = segKey.split("_");
                            const [cellXStr, cellYStr] = cellIndicesStr.split(",");
                            const cellX = parseInt(cellXStr); const cellY = parseInt(cellYStr);
                            let relevantFaceDef = null;
                            if (wallOrientation === 'h') { if (cellY === 0) relevantFaceDef = faceDefinitions.find(fd => fd.name === "Top"); else if (cellY === thisModule.cellsLong) relevantFaceDef = faceDefinitions.find(fd => fd.name === "Bottom");
                            } else { if (cellX === 0) relevantFaceDef = faceDefinitions.find(fd => fd.name === "Left"); else if (cellX === thisModule.cellsWide) relevantFaceDef = faceDefinitions.find(fd => fd.name === "Right"); }
                            if(relevantFaceDef) newRenderOffset = relevantFaceDef.getOffsetSign() * DOCKED_SPLIT_WALL_OFFSET_M;
                            else newRenderOffset = segment.wasRenderOffset !== null ? segment.wasRenderOffset : DOCKED_SPLIT_WALL_OFFSET_M;
                        } else newRenderOffset = segment.wasRenderOffset !== null ? segment.wasRenderOffset : DOCKED_SPLIT_WALL_OFFSET_M;
                    }
                    return { ...m, wallSegments: { ...m.wallSegments, [segKey]: { ...segment, isPassageWithPartner: passageState, isFullyOpenPassage: false, elements: passageState ? [] : (segment.elements || []), thickness: newThickness, renderOffset: newRenderOffset, wasRenderOffset: passageState ? segment.renderOffset : segment.wasRenderOffset, } } };
                }
                return m;
            });
        };
        const moduleInstance = processedObjects.find(m => m.id === parentModule.id);
        if(!moduleInstance) return prev;
        const cellsDimension = orientation === 'v' ? moduleInstance.cellsLong : moduleInstance.cellsWide;
        for (let i = 0; i < cellsDimension; i++) {
            const currentSegKey = orientation === 'v' ? `${coords.split(",")[0]},${i}_v` : `${i},${coords.split(",")[1]}_h`;
            const currentSegment = moduleInstance.wallSegments[currentSegKey];
            if (currentSegment && currentSegment.isDocked && currentSegment.partnerModuleId === (clickedSegmentObject.partnerModuleId || clickedSegmentObject.wasPartnerModuleId)) {
                updateWallProperties(moduleInstance.id, currentSegKey, makePassage);
                if(currentSegment.partnerModuleId && currentSegment.partnerSegmentId){
                    const partnerModule = processedObjects.find(pM => pM.id === currentSegment.partnerModuleId);
                    if (partnerModule) {
                        const partnerSegData = Object.entries(partnerModule.wallSegments).find(([,seg]) => seg.id === currentSegment.partnerSegmentId);
                        if (partnerSegData) { const partnerSegKey = partnerSegData[0]; updateWallProperties(currentSegment.partnerModuleId, partnerSegKey, makePassage); }
                    }
                }
            }
        }
        return { ...prev, [currentFloorId]: processedObjects };
    });
    closeContextMenu();
  }, [currentFloorId, closeContextMenu, WALL_THICKNESS_M_RENDER, DOCKED_SPLIT_WALL_THICKNESS_M]);

  const setDockedWallsDeletedState = useCallback((clickedSegmentObject, makeOpenPassage) => {
    if (!clickedSegmentObject || !clickedSegmentObject.isDocked || !clickedSegmentObject.parentModule) return;
    const { parentModule, segmentKey: clickedSegmentKey } = clickedSegmentObject;
    const [coords, orientation] = clickedSegmentObject.segmentKey.split("_");
    setProjectObjects(prev => {
        let processedObjects = [...(prev[currentFloorId] || [])];
        const updateWallPropertiesForOpenPassage = (moduleId, segKey, isOpen) => {
            processedObjects = processedObjects.map(m => {
                if (m.id === moduleId && m.wallSegments[segKey]) {
                    const segment = m.wallSegments[segKey];
                    let newThickness, newRenderOffset, newIsPassagePartner, currentPartnerId = segment.partnerModuleId, currentWasPartnerId = segment.wasPartnerModuleId, newWasRenderOffset = segment.wasRenderOffset;
                    if (isOpen) { newThickness = 0.001; newRenderOffset = 0; newIsPassagePartner = false; currentWasPartnerId = segment.partnerModuleId; newWasRenderOffset = (segment.isDocked && !segment.isPassageWithPartner && !segment.isFullyOpenPassage) ? segment.renderOffset : null;
                    } else {
                        newThickness = DOCKED_SPLIT_WALL_THICKNESS_M; newIsPassagePartner = false; currentPartnerId = segment.wasPartnerModuleId;
                        const thisModule = processedObjects.find(mod => mod.id === moduleId);
                        if (thisModule) {
                            const [cellIndicesStr, wallOrientation] = segKey.split("_"); const [cellXStr, cellYStr] = cellIndicesStr.split(","); const cellX = parseInt(cellXStr); const cellY = parseInt(cellYStr);
                            let relevantFaceDef = null;
                            if (wallOrientation === 'h') { if (cellY === 0) relevantFaceDef = faceDefinitions.find(fd => fd.name === "Top"); else if (cellY === thisModule.cellsLong) relevantFaceDef = faceDefinitions.find(fd => fd.name === "Bottom");
                            } else { if (cellX === 0) relevantFaceDef = faceDefinitions.find(fd => fd.name === "Left"); else if (cellX === thisModule.cellsWide) relevantFaceDef = faceDefinitions.find(fd => fd.name === "Right"); }
                            if(relevantFaceDef) newRenderOffset = relevantFaceDef.getOffsetSign() * DOCKED_SPLIT_WALL_OFFSET_M;
                            else newRenderOffset = segment.wasRenderOffset !== null ? segment.wasRenderOffset : DOCKED_SPLIT_WALL_OFFSET_M;
                        } else newRenderOffset = segment.wasRenderOffset !== null ? segment.wasRenderOffset : DOCKED_SPLIT_WALL_OFFSET_M;
                        currentWasPartnerId = null; newWasRenderOffset = null;
                    }
                    return { ...m, wallSegments: { ...m.wallSegments, [segKey]: { ...segment, isFullyOpenPassage: isOpen, isPassageWithPartner: newIsPassagePartner, elements: [], thickness: newThickness, renderOffset: newRenderOffset, partnerModuleId: currentPartnerId, wasPartnerModuleId: currentWasPartnerId, wasRenderOffset: newWasRenderOffset, } } };
                }
                return m;
            });
        };
        const moduleInstance = processedObjects.find(m => m.id === parentModule.id);
        if(!moduleInstance) return prev;
        const cellsDimension = orientation === 'v' ? moduleInstance.cellsLong : moduleInstance.cellsWide;
        for (let i = 0; i < cellsDimension; i++) {
            const currentSegKey = orientation === 'v' ? `${coords.split(",")[0]},${i}_v` : `${i},${coords.split(",")[1]}_h`;
            const currentSegment = moduleInstance.wallSegments[currentSegKey];
            if (currentSegment && currentSegment.isDocked && currentSegment.partnerModuleId === (clickedSegmentObject.partnerModuleId || clickedSegmentObject.wasPartnerModuleId)) {
                const partnerIdToUpdate = makeOpenPassage ? currentSegment.partnerModuleId : currentSegment.wasPartnerModuleId;
                updateWallPropertiesForOpenPassage(moduleInstance.id, currentSegKey, makeOpenPassage);
                if(partnerIdToUpdate && currentSegment.partnerSegmentId){
                    const partnerModule = processedObjects.find(pM => pM.id === partnerIdToUpdate);
                    if (partnerModule) {
                        const partnerSegData = Object.entries(partnerModule.wallSegments).find(([,seg]) => seg.id === currentSegment.partnerSegmentId);
                        if (partnerSegData) { const partnerSegKey = partnerSegData[0]; updateWallPropertiesForOpenPassage(partnerIdToUpdate, partnerSegKey, makeOpenPassage); }
                    }
                }
            }
        }
        if (!makeOpenPassage) setSelectedObjectId(null); else setSelectedObjectId(clickedSegmentObject.id);
        return { ...prev, [currentFloorId]: processedObjects };
    });
    closeContextMenu();
    if (makeOpenPassage) toast.info("Стены на стыке удалены (создан проем)."); else toast.info("Стены на стыке восстановлены.");
  }, [currentFloorId, closeContextMenu, DOCKED_SPLIT_WALL_THICKNESS_M]);

  const undockModuleCompletely = useCallback((moduleIdToUndock, floorObjects) => {
    let updatedFloorObjects = [...floorObjects];
    const moduleToUndockIndex = updatedFloorObjects.findIndex(m => m.id === moduleIdToUndock);
    if (moduleToUndockIndex === -1) return floorObjects;
    const moduleToUndock = updatedFloorObjects[moduleToUndockIndex];
    const newModuleWallSegments = { ...moduleToUndock.wallSegments };
    let moduleChanged = false;
    for (const segKey in newModuleWallSegments) {
        const segment = newModuleWallSegments[segKey];
        if (segment.isDocked || segment.isPassageWithPartner || segment.isFullyOpenPassage) {
            const partnerModuleId = segment.partnerModuleId || segment.wasPartnerModuleId;
            const partnerSegmentId = segment.partnerSegmentId;
            newModuleWallSegments[segKey] = { ...segment, thickness: WALL_THICKNESS_M_RENDER, renderOffset: 0, isDocked: false, isPassageWithPartner: false, isFullyOpenPassage: false, partnerModuleId: null, partnerSegmentId: null, wasPartnerModuleId: null, wasRenderOffset: null, };
            moduleChanged = true;
            if (partnerModuleId) {
                const partnerModuleIndex = updatedFloorObjects.findIndex(m => m.id === partnerModuleId);
                if (partnerModuleIndex !== -1) {
                    const partnerModule = { ...updatedFloorObjects[partnerModuleIndex] };
                    const newPartnerWallSegments = { ...partnerModule.wallSegments };
                    let partnerChanged = false;
                    for (const pSegKey in newPartnerWallSegments) {
                        if (newPartnerWallSegments[pSegKey].partnerModuleId === moduleIdToUndock || (newPartnerWallSegments[pSegKey].id === partnerSegmentId && (newPartnerWallSegments[pSegKey].partnerModuleId === moduleIdToUndock || newPartnerWallSegments[pSegKey].wasPartnerModuleId === moduleIdToUndock))) {
                             newPartnerWallSegments[pSegKey] = { ...newPartnerWallSegments[pSegKey], thickness: WALL_THICKNESS_M_RENDER, renderOffset: 0, isDocked: false, isPassageWithPartner: false, isFullyOpenPassage: false, partnerModuleId: null, partnerSegmentId: null, wasPartnerModuleId: null, wasRenderOffset: null, };
                            partnerChanged = true;
                        }
                    }
                    if (partnerChanged) updatedFloorObjects[partnerModuleIndex] = { ...partnerModule, wallSegments: newPartnerWallSegments };
                }
            }
        }
    }
    if (moduleChanged) updatedFloorObjects[moduleToUndockIndex] = { ...moduleToUndock, wallSegments: newModuleWallSegments };
    return updatedFloorObjects;
  }, []);

  const handleMirrorModule = useCallback((moduleId, axis = 'horizontal') => {
      setProjectObjects(prev => {
          let currentFloorObjects = [...(prev[currentFloorId] || [])];
          const targetModuleIndex = currentFloorObjects.findIndex(obj => obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE);
          if (targetModuleIndex === -1) return prev;
          currentFloorObjects = undockModuleCompletely(moduleId, currentFloorObjects);
          const moduleToMirror = { ...currentFloorObjects.find(m => m.id === moduleId) };
          const { cellsWide, cellsLong, wallSegments: oldWallSegments } = moduleToMirror;
          const newWallSegments = {};
          if (axis === 'horizontal') {
              moduleToMirror.mirroredX = !moduleToMirror.mirroredX;
              for (const oldKey in oldWallSegments) {
                  const segment = { ...oldWallSegments[oldKey], elements: [] };
                  const [coords, orientation] = oldKey.split("_");
                  let [x, y] = coords.split(",").map(Number);
                  let newKey;
                  if (orientation === 'h') { x = cellsWide - 1 - x; newKey = `${x},${y}_${orientation}`; } 
                  else { x = cellsWide - x; newKey = `${x},${y}_${orientation}`; }
                  oldWallSegments[oldKey].elements.forEach(el => {
                      const newEl = { ...el, positionOnSegment: 1 - el.positionOnSegment };
                      if (el.type === OBJECT_TYPES.DOOR) newEl.hingeSide = el.hingeSide === 'left' ? 'right' : 'left';
                      segment.elements.push(newEl);
                  });
                  newWallSegments[newKey] = segment;
              }
              moduleToMirror.wallSegments = newWallSegments;
          }
          currentFloorObjects[targetModuleIndex] = moduleToMirror;
          return { ...prev, [currentFloorId]: currentFloorObjects };
      });
      closeContextMenu();
      toast.info("Модуль отзеркален. Стыковки сброшены.");
  }, [currentFloorId, undockModuleCompletely, closeContextMenu]);

  const handleRotateModule = useCallback((moduleId) => {
    let moduleBeforeRotationData = null;
    let rotationHappenedSuccess = false;
    setProjectObjects(prev => {
        let currentFloorObjects = [...(prev[currentFloorId] || [])];
        const targetModuleIndex = currentFloorObjects.findIndex(obj => obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE);
        if (targetModuleIndex === -1) return prev;
        const targetModuleOriginal = currentFloorObjects[targetModuleIndex];
        moduleBeforeRotationData = { x: targetModuleOriginal.x, y: targetModuleOriginal.y, rotation: targetModuleOriginal.rotation || 0 };
        currentFloorObjects = undockModuleCompletely(moduleId, currentFloorObjects);
        const targetModule = { ...currentFloorObjects.find(m => m.id === moduleId) };
        const currentRotation = targetModule.rotation || 0;
        const newRotation = (currentRotation + 90) % 360;
        const newRotationSanitized = newRotation < 0 ? newRotation + 360 : newRotation;
        const rotatedModuleAttempt = { ...targetModule, rotation: newRotationSanitized };
        const otherModulesOnFloor = currentFloorObjects.filter(other => other.id !== moduleId && other.type === OBJECT_TYPES.MODULE);
        let canRotate = true;
        for(const other of otherModulesOnFloor) { if (checkOverlapWithRotation(rotatedModuleAttempt, other)) { canRotate = false; break; } }
        if (canRotate) {
            rotationHappenedSuccess = true;
            const finalTargetModuleIndex = currentFloorObjects.findIndex(m => m.id === moduleId);
            currentFloorObjects[finalTargetModuleIndex] = rotatedModuleAttempt;
            return { ...prev, [currentFloorId]: currentFloorObjects };
        } else {
            toast.error("Поворот невозможен: модуль будет пересекаться с другим.");
            return { ...prev, [currentFloorId]: currentFloorObjects }; // Return currentFloorObjects even if rotation failed, as undocking happened
        }
    });
    if (rotationHappenedSuccess && moduleBeforeRotationData) {
        snapAndFinalizeModulePosition(moduleId, moduleBeforeRotationData.x, moduleBeforeRotationData.y, moduleBeforeRotationData.rotation );
    }
    closeContextMenu();
  }, [currentFloorId, snapAndFinalizeModulePosition, undockModuleCompletely, closeContextMenu]);

  const deleteSelectedObject = useCallback(() => {
    if (!selectedObjectId || !primarySelectedObject) return;
    const objectToDelete = primarySelectedObject;
    setProjectObjects(prevProjectObjects => {
      let currentFloorObjects = [...(prevProjectObjects[currentFloorId] || [])];
      if (objectToDelete.type === OBJECT_TYPES.MODULE) {
        currentFloorObjects = undockModuleCompletely(objectToDelete.id, currentFloorObjects);
        currentFloorObjects = currentFloorObjects.filter((obj) => obj.id !== objectToDelete.id);
      } else {
        const { parentModule, segmentKey } = objectToDelete;
        if (parentModule) {
          if (objectToDelete.type === OBJECT_TYPES.WALL_SEGMENT) {
            toast.warn("Для удаления сегмента стены используйте контекстное меню на стене.");
            return prevProjectObjects;
          } else {
            currentFloorObjects = currentFloorObjects.map((obj) => {
              if (obj.id === parentModule.id && obj.type === OBJECT_TYPES.MODULE) {
                const newModule = { ...obj, wallSegments: { ...obj.wallSegments } };
                if (segmentKey && newModule.wallSegments[segmentKey]) {
                  const segment = newModule.wallSegments[segmentKey];
                  const newElements = (segment.elements || []).filter((el) => el.id !== objectToDelete.id);
                  newModule.wallSegments[segmentKey] = { ...segment, elements: newElements, };
                  return newModule;
                }
              }
              return obj;
            });
          }
        }
      }
      return { ...prevProjectObjects, [currentFloorId]: currentFloorObjects };
    });
    setSelectedObjectId(null);
    setElementTypeToPlace(null);
    closeContextMenu();
  }, [selectedObjectId, primarySelectedObject, closeContextMenu, currentFloorId, undockModuleCompletely]);

  const handleContextMenuAction = useCallback(
    (event, objectId, objectType, meta) => {
      event.preventDefault();
      mainContainerRef.current?.focus();
      setElementTypeToPlace(null);
      const tempSelectedObject = objectId ? getObjectById(objectId) : (objectType === "canvas" ? null : primarySelectedObject);
      if (objectId && (!primarySelectedObject || objectId !== primarySelectedObject.id)) {
         setSelectedObjectId(objectId);
      } else if (!objectId && objectType === 'canvas') {
         setSelectedObjectId(null);
      }
      const targetObjectForMenu = tempSelectedObject || primarySelectedObject;
      let options = [];
      if (targetObjectForMenu) {
        const obj = targetObjectForMenu;
        options.push({ label: `Свойства (${obj.type.replace("_", " ")})`, onClick: () => setSelectedObjectId(obj.id), });
        options.push({ isSeparator: true });
        if (obj.type === OBJECT_TYPES.WALL_SEGMENT) {
            const segment = obj;
            if (!segment.isDocked) {
                const [coords, orientation] = segment.segmentKey.split("_");
                const cellX = parseInt(coords.split(",")[0]); const cellY = parseInt(coords.split(",")[1]);
                let isPerimeter = false;
                if (segment.parentModule) { if (orientation === "h" && (cellY === 0 || cellY === segment.parentModule.cellsLong)) isPerimeter = true; if (orientation === "v" && (cellX === 0 || cellX === segment.parentModule.cellsWide)) isPerimeter = true; }
                if (!isPerimeter && (!segment.elements || segment.elements.length === 0)) { options.push({ label: "Удалить стену", onClick: () => deleteWallSegment(segment.parentModule.id, segment.segmentKey) });
                } else if (isPerimeter) { options.push({ label: "Периметральная стена", disabled: true });
                } else if (segment.elements && segment.elements.length > 0) { options.push({ label: "Стена с элементами", disabled: true }); }
            } else {
                if (obj.isFullyOpenPassage) options.push({ label: "Восстановить стены на стыке", onClick: () => setDockedWallsDeletedState(obj, false)});
                else { options.push({ label: obj.isPassageWithPartner ? "Разделить на две стены" : "Объединить в одну стену", onClick: () => setDockedLinePassageState(obj, !obj.isPassageWithPartner) }); options.push({label: "Удалить стены (создать проем)", onClick: () => setDockedWallsDeletedState(obj, true)}); }
                 options.push({ isSeparator: true }); options.push({ label: "Стыковочная стена", disabled: true });
            }
        } else if (obj.type === OBJECT_TYPES.MODULE) {
          options.push({ label: "Повернуть модуль на 90°", onClick: () => handleRotateModule(obj.id) });
          options.push({ label: "Отзеркалить модуль (горизонтально)", onClick: () => handleMirrorModule(obj.id, 'horizontal') });
          options.push({ isSeparator: true });
          options.push({ label: "Удалить модуль", onClick: () => { if (selectedObjectId !== obj.id) setSelectedObjectId(obj.id); deleteSelectedObject(); }, });
        } else { options.push({ label: `Удалить (${obj.type.replace("_", " ")})`, onClick: () => { if (selectedObjectId !== obj.id) setSelectedObjectId(obj.id); deleteSelectedObject(); }, }); }
      } else if (objectType === "canvas" && meta?.worldX !== undefined) {
        if (activeMode === MODES.MODULAR) options.push({ label: "Добавить модуль здесь", onClick: () => addNewModuleViaContextMenu(meta.worldX, meta.worldY) });
      }
      if (options.length > 0) setContextMenu({ x: event.clientX, y: event.clientY, options });
      else setContextMenu(null);
    },
    [selectedObjectId, primarySelectedObject, getObjectById, deleteSelectedObject, deleteWallSegment, addNewModuleViaContextMenu, handleRotateModule, handleMirrorModule, activeMode, setDockedLinePassageState, setDockedWallsDeletedState]
  );

  useKeyboardShortcuts({
    mainContainerRef,
    deleteSelectedObject: primarySelectedObject && (primarySelectedObject.type === OBJECT_TYPES.MODULE || (primarySelectedObject.type !== OBJECT_TYPES.WALL_SEGMENT)) ? deleteSelectedObject : null,
    deselectAll: () => { setSelectedObjectId(null); setElementTypeToPlace(null); closeContextMenu(); },
  });

  useEffect(() => { mainContainerRef.current?.focus(); }, []);

  const mouseInteractions = useMouseInteractions({
    viewTransform, modifierKeys, mainContainerRef, svgRef, setViewTransform, activeMode,
    setSelectedObjectId, screenToWorld, updateModulePosition, snapAndFinalizeModulePosition,
    isDraggingElement: false, onWallSegmentClick: handleWallSegmentClickForPlacement, elementTypeToPlace: elementTypeToPlace,
  });

  const panelVariants = {
    hidden: (isRightPanel = false) => ({ opacity: 0, x: isRightPanel ? 50 : -50, }),
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.2 } },
    exit: (isRightPanel = false) => ({ opacity: 0, x: isRightPanel ? 50 : -50, transition: { duration: 0.15 } }),
  };

  const addFloor = () => {
    const newFloorNumber = floors.length + 1; const newFloorId = generateId("floor_"); const newFloor = { id: newFloorId, name: `Этаж ${newFloorNumber}` };
    setFloors(prev => [...prev, newFloor]); setProjectObjects(prev => ({ ...prev, [newFloorId]: [] })); setCurrentFloorId(newFloorId); setSelectedObjectId(null); setElementTypeToPlace(null);
  };
  const deleteFloor = (floorIdToDelete) => {
    if (floors.length <= 1) { toast.warn("Нельзя удалить единственный этаж."); return; }
    if (!window.confirm(`Вы уверены, что хотите удалить этаж "${floors.find(f => f.id === floorIdToDelete)?.name}" и все его содержимое?`)) return;
    const floorName = floors.find(f => f.id === floorIdToDelete)?.name;
    setFloors(prev => prev.filter(f => f.id !== floorIdToDelete));
    setProjectObjects(prev => { const updated = { ...prev }; delete updated[floorIdToDelete]; return updated; });
    if (currentFloorId === floorIdToDelete) { setCurrentFloorId(floors.find(f => f.id !== floorIdToDelete)?.id || ""); setSelectedObjectId(null); setElementTypeToPlace(null); }
     toast.success(`Этаж "${floorName}" удален.`);
  };
  const switchToFloor = (floorId) => { if (floors.find(f => f.id === floorId)) { setCurrentFloorId(floorId); setSelectedObjectId(null); setElementTypeToPlace(null); } };
  const handleSaveProject = () => { try { const projectData = { version: "1.0", floors, projectObjects, currentFloorId, activeMode, viewTransform }; const jsonString = JSON.stringify(projectData, null, 2); const blob = new Blob([jsonString], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `configurator_project_${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); toast.success("Проект успешно сохранен!"); } catch (error) { console.error("Error saving project:", error); toast.error("Ошибка сохранения проекта."); } };
  const handleLoadProject = (event) => { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { try { const projectData = JSON.parse(e.target.result); if (projectData.version === "1.0" && projectData.floors && projectData.projectObjects && projectData.currentFloorId) { setFloors(projectData.floors); setProjectObjects(projectData.projectObjects); setCurrentFloorId(projectData.currentFloorId); setActiveMode(projectData.activeMode || MODES.MODULAR); if (projectData.viewTransform) setViewTransform(projectData.viewTransform); setSelectedObjectId(null); setElementTypeToPlace(null); toast.success("Проект успешно загружен!"); } else { toast.error("Ошибка: Некорректный формат файла проекта."); } } catch (error) { console.error("Error loading project:", error); toast.error("Ошибка загрузки проекта. Файл поврежден или имеет неверный формат."); } }; reader.readAsText(file); event.target.value = null; } };
  const triggerLoadFile = () => { loadFileInputRef.current?.click(); };

  return (
    <div ref={mainContainerRef} className="w-full h-full flex flex-col select-none outline-none bg-dark-bg" tabIndex={-1}
      onClick={(e) => { if (elementTypeToPlace) { if (svgRef.current && svgRef.current.contains(e.target)) { if (e.target === svgRef.current || e.target.id === "grid" || e.target.closest("g#grid")) { setElementTypeToPlace(null); } } else if (!e.target.closest('#element-selection-panel') && !e.target.closest('#properties-panel') && !e.target.closest('#module-template-selection-panel')) { setElementTypeToPlace(null); } } }} >
      <input type="file" ref={loadFileInputRef} onChange={handleLoadProject} accept=".json" style={{ display: 'none' }} />
      <ConfiguratorToolbar activeMode={activeMode} setActiveMode={setActiveMode} onAddModuleFromToolbar={addModuleFromToolbar} floors={floors} currentFloorId={currentFloorId} addFloor={addFloor} deleteFloor={deleteFloor} switchToFloor={switchToFloor} onSaveProject={handleSaveProject} onLoadProject={triggerLoadFile} onAiGenerateModules={handleAiGeneratedModules} />
      <div className="flex flex-grow overflow-hidden">
        {activeMode === MODES.MODULAR && (
          <>
            <AnimatePresence custom={false}> {isTemplatePanelOpen && ( <motion.div key="template-panel" custom={false} variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex-shrink-0"> <ModuleTemplateSelectionPanel templates={MODULE_TEMPLATES} onSelectTemplate={addModuleFromTemplate} onClose={() => { setIsTemplatePanelOpen(false); setModulePlacementCoords(null); }} /> </motion.div> )} </AnimatePresence>
            <AnimatePresence custom={false}> {!isTemplatePanelOpen && !canShowInitialModuleButton && ( <motion.div key="element-panel" custom={false} variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex-shrink-0"> <ElementSelectionPanel onSelectElementType={handleElementSelectionFromPanel} selectedElementType={elementTypeToPlace} /> </motion.div> )} </AnimatePresence>
          </>
        )}
        <div className="flex-grow flex items-center justify-center p-1 sm:p-2 md:p-4 bg-dark-bg relative">
          <div className="relative bg-card-bg shadow-2xl w-full h-full max-w-[1920px] max-h-[1080px] aspect-[16/9] overflow-hidden rounded-md border border-gray-700">
            <SvgCanvas svgRef={svgRef} viewTransform={viewTransform} modifierKeys={modifierKeys} isPanningWithSpace={mouseInteractions.isPanningWithSpace} isDraggingModule={mouseInteractions.isDraggingModule} handleMouseMove={mouseInteractions.handleMouseMove} handleMouseUp={mouseInteractions.handleMouseUp} handleMouseLeave={mouseInteractions.handleMouseLeave} handleMouseDownOnCanvas={mouseInteractions.handleMouseDownOnCanvas} onContextMenu={handleContextMenuAction} objects={objectsOnCurrentFloor} activeMode={activeMode} selectedObjectId={selectedObjectId} setSelectedObjectId={setSelectedObjectId} scale={viewTransform.scale} canAddInitialModule={canShowInitialModuleButton} onAddModule={() => openTemplateSelectionPanel({ worldX: 0, worldY: 0 })} onToggleWallSegment={handleToggleWallSegment} primarySelectedObject={primarySelectedObject} elementTypeToPlace={elementTypeToPlace} onWallSegmentClick={handleWallSegmentClickForPlacement} />
          </div>
        </div>
        {activeMode === MODES.MODULAR && ( <AnimatePresence custom={true}> {primarySelectedObject && !elementTypeToPlace && !isTemplatePanelOpen && ( <motion.div key="properties-panel" custom={true} variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex-shrink-0"> <PropertiesPanel primarySelectedObject={primarySelectedObject} lockedObjectIds={[]} modifierKeys={modifierKeys} updateSelectedObjectProperty={updateSelectedObjectProperty} deleteSelectedObject={deleteSelectedObject} onSetDockedLinePassage={setDockedLinePassageState} onSetDockedWallsDeleted={setDockedWallsDeletedState} /> </motion.div> )} </AnimatePresence> )}
      </div>
      <AnimatePresence> {contextMenu && ( <ContextMenu x={contextMenu.x} y={contextMenu.y} options={contextMenu.options} onClose={closeContextMenu} /> )} </AnimatePresence>
      <StatusBar zoomLevel={viewTransform.scale / INITIAL_PPM} selectedObjectName={ elementTypeToPlace ? `Размещение: ${elementTypeToPlace.replace("_", " ")}` : (primarySelectedObject?.label || primarySelectedObject?.type?.replace("_", " ") || "") } selectedObjectId={elementTypeToPlace ? '' : selectedObjectId} currentFloorName={floors.find(f => f.id === currentFloorId)?.name || ""} />
    </div>
  );
};
export default Configurator;