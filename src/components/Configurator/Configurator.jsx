// ========= src/components/Configurator/Configurator.jsx =========
import React, { useRef, useEffect, useState, useCallback } from "react";
import useViewTransform from "./hooks/useViewTransform";
import useModifierKeys from "./hooks/useModifierKeys";
import useMouseInteractions from "./hooks/useMouseInteractions";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";

import ConfiguratorToolbar from "./toolbar/ConfiguratorToolbar";
import SvgCanvas from "./canvas/SvgCanvas";
import StatusBar from "./statusbar/StatusBar";
import PropertiesPanel from "./sidebar/PropertiesPanel";
import ElementPlacementPanel from "./sidebar/ElementPlacementPanel";
import ContextMenu from "./common/ContextMenu";

import {
  MODES,
  OBJECT_TYPES,
  MODULE_DEFAULT_CELLS_LONG,
  MODULE_DEFAULT_CELLS_WIDE,
  GRID_CELL_SIZE_M,
  defaultObjectSizes,
  WALL_THICKNESS_M_RENDER,
  INITIAL_PPM,
} from "./configuratorConstants";

const generateId = (prefix = "id_") =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;

const EPSILON = 0.01;

const getInterfaceKey = (id1, id2, orientationPrefix) => {
  // Sort IDs to ensure key is consistent regardless of m1/m2 order in loop
  const sortedIds = [id1, id2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}_${orientationPrefix}`;
};

const Configurator = () => {
  const svgRef = useRef(null);
  const mainContainerRef = useRef(null);

  const [activeMode, setActiveMode] = useState(MODES.MODULAR);
  const [objects, setObjects] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [selectedWallSegmentData, setSelectedWallSegmentData] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showElementPlacementModal, setShowElementPlacementModal] =
    useState(false);
  const [manuallyClosedPortals, setManuallyClosedPortals] = useState(new Set());

  const modifierKeys = useModifierKeys(mainContainerRef, svgRef);
  const { viewTransform, setViewTransform, screenToWorld } =
    useViewTransform(svgRef);

  const getObjectById = useCallback(
    (id) => {
      if (!id) return null;
      const module = objects.find(
        (obj) => obj.id === id && obj.type === OBJECT_TYPES.MODULE,
      );
      if (module) return module;

      for (const mod of objects.filter((o) => o.type === OBJECT_TYPES.MODULE)) {
        for (const segmentKey in mod.wallSegments) {
          const segment = mod.wallSegments[segmentKey];
          if (segment.id === id)
            return {
              ...segment,
              type: OBJECT_TYPES.WALL_SEGMENT,
              parentModule: mod,
              segmentKey,
            };
          // Check for elements, including portal doors
          if (segment.elements) {
            for (const element of segment.elements) {
              if (element.id === id)
                return {
                  ...element, // Element properties (like isOpen, isPortalDoor, portalInterfaceKey)
                  type: element.type, // Ensure type is correctly passed
                  parentWallSegment: segment,
                  parentModule: mod,
                  segmentKey, // segmentKey of the wall it's on
                };
            }
          }
        }
      }
      return null;
    },
    [objects],
  );

  const primarySelectedObject = getObjectById(selectedObjectId);
  const canShowInitialModuleButton =
    activeMode === MODES.MODULAR &&
    !objects.some((obj) => obj.type === OBJECT_TYPES.MODULE);
  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const managePortals = useCallback(
    (currentObjects, currentManuallyClosedPortals) => {
      let newObjects = JSON.parse(JSON.stringify(currentObjects));
      const modules = newObjects.filter(
        (obj) => obj.type === OBJECT_TYPES.MODULE,
      );
      const portalDoorType = OBJECT_TYPES.DOOR;
      const portalDoorPlacedOnInterface = new Set();

      modules.forEach((module) => {
        for (const segmentKey in module.wallSegments) {
          const segment = module.wallSegments[segmentKey];
          delete segment.isPortalWall;
          delete segment.hasPortalDoor;
          delete segment.portalInterfaceKey; // Clear old key from segment
          if (segment.elements) {
            segment.elements = segment.elements.filter(
              (el) => !el.isPortalDoor,
            );
          }
        }
      });

      for (let i = 0; i < modules.length; i++) {
        for (let j = i + 1; j < modules.length; j++) {
          const m1 = modules[i]; // Primary module for placing door in this iteration
          const m2 = modules[j]; // Secondary module

          if (m1.rotation !== 0 || m2.rotation !== 0) continue;

          // --- Check Vertical Interface (e.g., m1's right wall vs m2's left wall) ---
          const verticalInterfaceKey = getInterfaceKey(m1.id, m2.id, "V");
          let doorPlacedForThisVInterface =
            portalDoorPlacedOnInterface.has(verticalInterfaceKey);

          if (!currentManuallyClosedPortals.has(verticalInterfaceKey)) {
            // Check m1 right vs m2 left
            if (Math.abs(m1.x + m1.width - m2.x) < EPSILON) {
              for (let c1 = 0; c1 < m1.cellsLong; c1++) {
                // Iterate M1's wall segments
                const m1WallYWorld = m1.y + c1 * GRID_CELL_SIZE_M;
                const m1SegmentKey = `${m1.cellsWide},${c1}_v`;
                const m1Wall = m1.wallSegments[m1SegmentKey];
                if (!m1Wall) continue;

                for (let c2 = 0; c2 < m2.cellsLong; c2++) {
                  // Iterate M2's wall segments
                  const m2WallYWorld = m2.y + c2 * GRID_CELL_SIZE_M;
                  if (Math.abs(m1WallYWorld - m2WallYWorld) < EPSILON) {
                    // Segments align
                    const m2SegmentKey = `0,${c2}_v`;
                    const m2Wall = m2.wallSegments[m2SegmentKey];
                    if (!m2Wall) continue;

                    m1Wall.isPortalWall = true;
                    m1Wall.portalInterfaceKey = verticalInterfaceKey;
                    m2Wall.isPortalWall = true;
                    m2Wall.portalInterfaceKey = verticalInterfaceKey;

                    if (!doorPlacedForThisVInterface) {
                      const doorDefaults = defaultObjectSizes[portalDoorType];
                      m1Wall.elements.push({
                        id: generateId(`${portalDoorType}_portal_`),
                        type: portalDoorType,
                        positionOnSegment: 0.5,
                        width: doorDefaults.width,
                        isOpen: false,
                        isPortalDoor: true,
                        hingeSide: "left",
                        openingDirection: "inward",
                        portalInterfaceKey: verticalInterfaceKey,
                      });
                      m1Wall.hasPortalDoor = true;
                      portalDoorPlacedOnInterface.add(verticalInterfaceKey);
                      doorPlacedForThisVInterface = true;
                    }
                    break; // Found aligned segment on m2 for this m1 segment
                  }
                }
              }
            }
            // Add check for m2 right vs m1 left if you want door placement to be on the module with smaller ID always
            // For now, door is on M1 if m1 is left of m2.
          }

          // --- Check Horizontal Interface (e.g., m1's bottom wall vs m2's top wall) ---
          const horizontalInterfaceKey = getInterfaceKey(m1.id, m2.id, "H");
          let doorPlacedForThisHInterface = portalDoorPlacedOnInterface.has(
            horizontalInterfaceKey,
          );

          if (!currentManuallyClosedPortals.has(horizontalInterfaceKey)) {
            // Check m1 bottom vs m2 top
            if (Math.abs(m1.y + m1.height - m2.y) < EPSILON) {
              for (let c1 = 0; c1 < m1.cellsWide; c1++) {
                // Iterate M1's wall segments
                const m1WallXWorld = m1.x + c1 * GRID_CELL_SIZE_M;
                const m1SegmentKey = `${c1},${m1.cellsLong}_h`;
                const m1Wall = m1.wallSegments[m1SegmentKey];
                if (!m1Wall) continue;

                for (let c2 = 0; c2 < m2.cellsWide; c2++) {
                  // Iterate M2's wall segments
                  const m2WallXWorld = m2.x + c2 * GRID_CELL_SIZE_M;
                  if (Math.abs(m1WallXWorld - m2WallXWorld) < EPSILON) {
                    // Segments align
                    const m2SegmentKey = `${c2},0_h`;
                    const m2Wall = m2.wallSegments[m2SegmentKey];
                    if (!m2Wall) continue;

                    m1Wall.isPortalWall = true;
                    m1Wall.portalInterfaceKey = horizontalInterfaceKey;
                    m2Wall.isPortalWall = true;
                    m2Wall.portalInterfaceKey = horizontalInterfaceKey;

                    if (!doorPlacedForThisHInterface) {
                      const doorDefaults = defaultObjectSizes[portalDoorType];
                      m1Wall.elements.push({
                        id: generateId(`${portalDoorType}_portal_`),
                        type: portalDoorType,
                        positionOnSegment: 0.5,
                        width: doorDefaults.width,
                        isOpen: false,
                        isPortalDoor: true,
                        hingeSide: "left",
                        openingDirection: "inward",
                        portalInterfaceKey: horizontalInterfaceKey,
                      });
                      m1Wall.hasPortalDoor = true;
                      portalDoorPlacedOnInterface.add(horizontalInterfaceKey);
                      doorPlacedForThisHInterface = true;
                    }
                    break; // Found aligned segment on m2 for this m1 segment
                  }
                }
              }
            }
          }
        }
      }
      return newObjects;
    },
    [defaultObjectSizes],
  );

  const createNewModule = (posX = 0, posY = 0) => {
    /* ... (без изменений) ... */
    const moduleId = generateId("module_");
    const cellsWide = MODULE_DEFAULT_CELLS_WIDE;
    const cellsLong = MODULE_DEFAULT_CELLS_LONG;
    const wallSegments = {};
    for (let i = 0; i < cellsWide; i++) {
      wallSegments[`${i},0_h`] = {
        id: generateId("wall_"),
        elements: [],
        thickness: WALL_THICKNESS_M_RENDER,
      };
      wallSegments[`${i},${cellsLong}_h`] = {
        id: generateId("wall_"),
        elements: [],
        thickness: WALL_THICKNESS_M_RENDER,
      };
    }
    for (let j = 0; j < cellsLong; j++) {
      wallSegments[`0,${j}_v`] = {
        id: generateId("wall_"),
        elements: [],
        thickness: WALL_THICKNESS_M_RENDER,
      };
      wallSegments[`${cellsWide},${j}_v`] = {
        id: generateId("wall_"),
        elements: [],
        thickness: WALL_THICKNESS_M_RENDER,
      };
    }
    return {
      id: moduleId,
      type: OBJECT_TYPES.MODULE,
      x: posX,
      y: posY,
      cellsWide,
      cellsLong,
      width: cellsWide * GRID_CELL_SIZE_M,
      height: cellsLong * GRID_CELL_SIZE_M,
      rotation: 0,
      label: `Модуль ${cellsWide}x${cellsLong}`,
      wallSegments,
    };
  };

  // All functions like addModuleAtZeroZero, addModuleFromToolbar, addNewModule,
  // handleToggleWallSegment, deleteWallSegment, handlePlaceElementOnWall,
  // updateSelectedObjectProperty (for module move/rotate), snapAndFinalizeModulePosition,
  // handleRotateModule, deleteSelectedObject (for module)
  // should now call managePortals with manuallyClosedPortals:
  // e.g., setObjects((prev) => managePortals(prev, manuallyClosedPortals));

  const addModuleAtZeroZero = useCallback(() => {
    if (!canShowInitialModuleButton) return;
    const newModule = createNewModule(0, 0);
    setObjects((prevObjects) =>
      managePortals([...prevObjects, newModule], manuallyClosedPortals),
    );
    setSelectedObjectId(newModule.id);
    closeContextMenu();
  }, [
    canShowInitialModuleButton,
    closeContextMenu,
    managePortals,
    manuallyClosedPortals,
  ]);

  const addModuleFromToolbar = useCallback(() => {
    let newX = 0;
    let newY = 0;
    const modulesOnly = objects.filter((o) => o.type === OBJECT_TYPES.MODULE);
    if (modulesOnly.length > 0) {
      const lastModuleWithPosition =
        modulesOnly
          .filter(
            (obj) => typeof obj.x === "number" && typeof obj.y === "number",
          )
          .sort((a, b) => b.x + (b.width || 0) - (a.x + (a.width || 0)))[0] ||
        modulesOnly[modulesOnly.length - 1];
      if (lastModuleWithPosition) {
        newX =
          (lastModuleWithPosition.x || 0) +
          (lastModuleWithPosition.width ||
            MODULE_DEFAULT_CELLS_WIDE * GRID_CELL_SIZE_M) +
          GRID_CELL_SIZE_M * 2;
        newY = lastModuleWithPosition.y || 0;
      } else {
        newX =
          (MODULE_DEFAULT_CELLS_WIDE * GRID_CELL_SIZE_M +
            GRID_CELL_SIZE_M * 2) *
          modulesOnly.length;
      }
    }
    const newModule = createNewModule(newX, newY);
    setObjects((prevObjects) =>
      managePortals([...prevObjects, newModule], manuallyClosedPortals),
    );
    setSelectedObjectId(newModule.id);
    closeContextMenu();
  }, [objects, closeContextMenu, managePortals, manuallyClosedPortals]);

  const addNewModule = useCallback(
    (worldX, worldY) => {
      if (activeMode !== MODES.MODULAR) return;
      const snappedX = Math.round(worldX / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M;
      const snappedY = Math.round(worldY / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M;
      const newModule = createNewModule(snappedX, snappedY);
      setObjects((prevObjects) =>
        managePortals([...prevObjects, newModule], manuallyClosedPortals),
      );
      setSelectedObjectId(newModule.id);
      closeContextMenu();
    },
    [activeMode, closeContextMenu, managePortals, manuallyClosedPortals],
  );

  const handleToggleWallSegment = useCallback(
    (moduleId, cellX, cellY, orientation, segmentIdToToggle) => {
      const segmentObject = getObjectById(segmentIdToToggle);
      if (segmentObject && segmentObject.isPortalWall) {
        alert(
          "Для управления портальным проемом используйте контекстное меню на двери или на самом проеме.",
        );
        return;
      }
      setObjects((prevObjects) => {
        const newObjects = prevObjects.map((obj) => {
          if (obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE) {
            const newModule = { ...obj, wallSegments: { ...obj.wallSegments } };
            const segmentKey = `${cellX},${cellY}_${orientation}`;
            if (newModule.wallSegments[segmentKey]?.isPortalWall) {
              return obj;
            }
            let isPerimeter = false;
            if (
              orientation === "h" &&
              (cellY === 0 || cellY === newModule.cellsLong)
            )
              isPerimeter = true;
            if (
              orientation === "v" &&
              (cellX === 0 || cellX === newModule.cellsWide)
            )
              isPerimeter = true;
            if (newModule.wallSegments[segmentKey]) {
              if (isPerimeter) return obj;
              if (
                newModule.wallSegments[segmentKey].elements &&
                newModule.wallSegments[segmentKey].elements.length > 0
              ) {
                alert(
                  "Нельзя удалить стену с элементами. Сначала удалите элементы.",
                );
                return obj;
              }
              const wallIdToDelete = newModule.wallSegments[segmentKey].id;
              delete newModule.wallSegments[segmentKey];
              if (selectedObjectId === wallIdToDelete)
                setSelectedObjectId(null);
            } else if (!isPerimeter) {
              newModule.wallSegments[segmentKey] = {
                id: generateId("wall_"),
                elements: [],
                thickness: WALL_THICKNESS_M_RENDER,
              };
            }
            return newModule;
          }
          return obj;
        });
        return managePortals(newObjects, manuallyClosedPortals);
      });
      closeContextMenu();
    },
    [
      selectedObjectId,
      closeContextMenu,
      managePortals,
      manuallyClosedPortals,
      getObjectById,
      objects,
    ],
  );

  const deleteWallSegment = useCallback(
    (moduleId, segmentKey) => {
      const module = objects.find((m) => m.id === moduleId);
      if (module && module.wallSegments[segmentKey]?.isPortalWall) {
        alert(
          "Для управления портальным проемом используйте контекстное меню на двери или на самом проеме.",
        );
        closeContextMenu();
        return;
      }
      setObjects((prevObjects) => {
        const newObjects = prevObjects.map((obj) => {
          if (obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE) {
            const newModule = { ...obj, wallSegments: { ...obj.wallSegments } };
            const segment = newModule.wallSegments[segmentKey];
            if (!segment || segment.isPortalWall) return obj;
            const [coords, orientation] = segmentKey.split("_");
            const cellX = parseInt(coords.split(",")[0]);
            const cellY = parseInt(coords.split(",")[1]);
            let isPerimeter = false;
            if (
              orientation === "h" &&
              (cellY === 0 || cellY === newModule.cellsLong)
            )
              isPerimeter = true;
            if (
              orientation === "v" &&
              (cellX === 0 || cellX === newModule.cellsWide)
            )
              isPerimeter = true;
            if (isPerimeter) {
              alert(
                "Периметральные стены модуля не могут быть удалены этим способом.",
              );
              return obj;
            }
            if (segment.elements && segment.elements.length > 0) {
              alert(
                "Нельзя удалить стену с элементами. Сначала удалите элементы.",
              );
              return obj;
            }
            const wallIdToDelete = segment.id;
            delete newModule.wallSegments[segmentKey];
            if (selectedObjectId === wallIdToDelete) setSelectedObjectId(null);
            return newModule;
          }
          return obj;
        });
        return managePortals(newObjects, manuallyClosedPortals);
      });
      closeContextMenu();
    },
    [
      selectedObjectId,
      closeContextMenu,
      managePortals,
      manuallyClosedPortals,
      objects,
    ],
  );

  useEffect(() => {
    const objDetails = getObjectById(selectedObjectId);
    if (objDetails && objDetails.type === OBJECT_TYPES.WALL_SEGMENT) {
      setSelectedWallSegmentData({
        id: objDetails.id,
        moduleId: objDetails.parentModule.id,
        segmentKey: objDetails.segmentKey,
        moduleLabel: objDetails.parentModule.label,
        elements: objDetails.elements,
        cellsWide: objDetails.parentModule.cellsWide,
        cellsLong: objDetails.parentModule.cellsLong,
        isPortalWall: objDetails.isPortalWall,
        hasPortalDoor: objDetails.hasPortalDoor,
        portalInterfaceKey: objDetails.portalInterfaceKey, // Pass the key from segment
      });
    } else {
      setSelectedWallSegmentData(null);
    }
  }, [selectedObjectId, getObjectById, objects]);

  const handlePlaceElementOnWall = useCallback(
    (elementType, defaultWidth) => {
      if (!selectedWallSegmentData || !selectedWallSegmentData.id) return;
      const {
        moduleId,
        segmentKey,
        elements: wallElements,
        isPortalWall,
      } = selectedWallSegmentData;
      if (isPortalWall) {
        alert(
          "Нельзя добавлять элементы на стену, являющуюся частью межмодульного прохода.",
        );
        if (showElementPlacementModal) setShowElementPlacementModal(false);
        closeContextMenu();
        return;
      }
      if (wallElements && wallElements.length > 0) {
        alert(
          "На этом сегменте стены уже есть элемент. Удалите его, чтобы добавить новый.",
        );
        if (showElementPlacementModal) setShowElementPlacementModal(false);
        closeContextMenu();
        return;
      }
      setObjects((prevObjects) => {
        const newObjects = prevObjects.map((obj) => {
          if (obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE) {
            const newModule = { ...obj, wallSegments: { ...obj.wallSegments } };
            if (newModule.wallSegments[segmentKey]) {
              if (
                newModule.wallSegments[segmentKey].elements &&
                newModule.wallSegments[segmentKey].elements.length > 0
              )
                return obj;
              const elementDefaults = defaultObjectSizes[elementType];
              const newElement = {
                id: generateId(`${elementType}_`),
                type: elementType,
                positionOnSegment: 0.5,
                width: elementDefaults.width,
                ...(elementType === OBJECT_TYPES.DOOR && {
                  isOpen: false,
                  openingAngle: 90,
                  hingeSide: "left",
                  openingDirection: "inward",
                }),
              };
              newModule.wallSegments[segmentKey] = {
                ...newModule.wallSegments[segmentKey],
                elements: [newElement],
              };
              setSelectedObjectId(newElement.id);
              return newModule;
            }
          }
          return obj;
        });
        // No managePortals needed here, as adding a normal element should not affect portals.
        // However, if a wall was previously a portal and now is not, managePortals SHOULD run.
        // This is complex. For now, assume adding normal elements doesn't auto-close portals.
        return newObjects;
      });
      setShowElementPlacementModal(false);
      closeContextMenu();
    },
    [
      selectedWallSegmentData,
      closeContextMenu,
      showElementPlacementModal,
      defaultObjectSizes,
    ],
  );

  const updateSelectedObjectProperty = useCallback(
    (key, value) => {
      if (!selectedObjectId || !primarySelectedObject) return;
      const numericProps = [
        "x",
        "y",
        "width",
        "height",
        "rotation",
        "openingAngle",
        "positionOnSegment",
      ];
      let processedValue = value;
      if (numericProps.includes(key)) {
        processedValue = parseFloat(value);
        if (isNaN(processedValue)) {
          if (
            value === "" &&
            (key === "x" || key === "y" || key === "rotation")
          )
            processedValue = 0;
          else return;
        }
      } else if (
        typeof value === "string" &&
        (value.toLowerCase() === "true" || value.toLowerCase() === "false")
      ) {
        processedValue = value.toLowerCase() === "true";
      }

      let needsPortalUpdate = false;
      setObjects((prevObjects) =>
        prevObjects.map((obj) => {
          if (obj.id === selectedObjectId && obj.type === OBJECT_TYPES.MODULE) {
            // If module is selected
            if ((key === "x" || key === "y") && GRID_CELL_SIZE_M > 0)
              needsPortalUpdate = true;
            else if (key === "rotation") {
              processedValue = (Math.round(processedValue / 90) * 90) % 360;
              if (processedValue < 0) processedValue += 360;
              needsPortalUpdate = true;
            }
            return { ...obj, [key]: processedValue };
          }
          // If an element (like a door) on a wall is selected
          if (
            primarySelectedObject.parentModule?.id &&
            obj.id === primarySelectedObject.parentModule.id &&
            obj.type === OBJECT_TYPES.MODULE
          ) {
            const newModule = { ...obj, wallSegments: { ...obj.wallSegments } };
            let changed = false;
            if (
              primarySelectedObject.segmentKey &&
              newModule.wallSegments[primarySelectedObject.segmentKey]
            ) {
              const segment =
                newModule.wallSegments[primarySelectedObject.segmentKey];
              if (
                primarySelectedObject.type === OBJECT_TYPES.WALL_SEGMENT &&
                segment.id === selectedObjectId
              ) {
                /* No direct edit */
              } else {
                // Element is selected
                const newElements = segment.elements.map((el) => {
                  if (el.id === selectedObjectId) {
                    changed = true;
                    if (
                      el.isPortalDoor &&
                      (key === "width" || key === "positionOnSegment")
                    ) {
                      alert(
                        "Свойства портальной двери (ширина, позиция) не могут быть изменены.",
                      );
                      return el;
                    }
                    return { ...el, [key]: processedValue }; // Update isOpen here
                  }
                  return el;
                });
                if (changed)
                  newModule.wallSegments[primarySelectedObject.segmentKey] = {
                    ...segment,
                    elements: newElements,
                  };
              }
            }
            return changed ? newModule : obj;
          }
          return obj;
        }),
      );
      if (needsPortalUpdate)
        setObjects((prev) => managePortals(prev, manuallyClosedPortals));
    },
    [
      selectedObjectId,
      primarySelectedObject,
      GRID_CELL_SIZE_M,
      managePortals,
      manuallyClosedPortals,
    ],
  );

  const updateModulePosition = useCallback((moduleId, newX, newY) => {
    setObjects((prevObjects) =>
      prevObjects.map((obj) =>
        obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE
          ? { ...obj, x: newX, y: newY }
          : obj,
      ),
    );
  }, []);

  const snapAndFinalizeModulePosition = useCallback(
    (moduleId) => {
      setObjects((prevObjects) => {
        const objectsWithSnappedModule = prevObjects.map((obj) => {
          if (obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE) {
            const snappedX =
              GRID_CELL_SIZE_M > 0
                ? Math.round(obj.x / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M
                : obj.x;
            const snappedY =
              GRID_CELL_SIZE_M > 0
                ? Math.round(obj.y / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M
                : obj.y;
            return { ...obj, x: snappedX, y: snappedY };
          }
          return obj;
        });
        return managePortals(objectsWithSnappedModule, manuallyClosedPortals);
      });
    },
    [GRID_CELL_SIZE_M, managePortals, manuallyClosedPortals],
  );

  const handleRotateModule = useCallback(
    (moduleId) => {
      setObjects((prevObjects) => {
        const rotatedObjects = prevObjects.map((obj) => {
          if (obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE) {
            if (obj.rotation !== 0 || (obj.rotation + 90) % 360 !== 0) {
              alert(
                "Вращение модуля (кроме 0 градусов) пока не поддерживается с автоматическими межмодульными дверьми. Двери могут исчезнуть или отображаться некорректно.",
              );
            }
            return { ...obj, rotation: (obj.rotation + 90) % 360 };
          }
          return obj;
        });
        return managePortals(rotatedObjects, manuallyClosedPortals);
      });
      closeContextMenu();
    },
    [closeContextMenu, managePortals, manuallyClosedPortals],
  );

  const deleteSelectedObject = useCallback(() => {
    if (!selectedObjectId || !primarySelectedObject) return;
    if (primarySelectedObject.isPortalDoor) {
      alert(
        "Портальные двери не могут быть удалены вручную. Используйте опцию 'Закрыть проем'.",
      );
      closeContextMenu();
      return;
    }
    let newObjectsList = objects;
    if (primarySelectedObject.type === OBJECT_TYPES.MODULE) {
      newObjectsList = objects.filter((obj) => obj.id !== selectedObjectId);
      setSelectedObjectId(null);
    } else {
      // Element or Wall Segment
      const { parentModule, segmentKey, type: objType } = primarySelectedObject;
      if (parentModule) {
        // Should always be true for elements/walls
        if (objType === OBJECT_TYPES.WALL_SEGMENT) {
          // Deleting a wall segment (non-portal)
          // Logic for deleting a non-portal wall segment is already in deleteWallSegment
          // This path in deleteSelectedObject should primarily handle elements.
          // For consistency, call deleteWallSegment if it's a wall.
          // However, deleteWallSegment is called from context menu usually.
          // If delete key is pressed on a wall, we might need to route it.
          // For now, this primarily handles deleting elements.
          alert(
            "Для удаления сегмента стены используйте контекстное меню на стене.",
          );
          closeContextMenu();
          return;
        } else {
          // Deleting an element
          newObjectsList = objects.map((obj) => {
            if (
              obj.id === parentModule.id &&
              obj.type === OBJECT_TYPES.MODULE
            ) {
              const newModule = {
                ...obj,
                wallSegments: { ...obj.wallSegments },
              };
              if (segmentKey && newModule.wallSegments[segmentKey]) {
                const segment = newModule.wallSegments[segmentKey];
                newModule.wallSegments[segmentKey] = {
                  ...segment,
                  elements: segment.elements.filter(
                    (el) => el.id !== selectedObjectId,
                  ),
                };
                setSelectedObjectId(null);
                return newModule;
              }
            }
            return obj;
          });
        }
      }
    }
    setObjects(managePortals(newObjectsList, manuallyClosedPortals));
    closeContextMenu();
  }, [
    selectedObjectId,
    primarySelectedObject,
    objects,
    closeContextMenu,
    managePortals,
    manuallyClosedPortals,
  ]);

  const handleTogglePortalState = useCallback(
    (portalInterfaceKey, makeClosed) => {
      const newManuallyClosedPortals = new Set(manuallyClosedPortals);
      if (makeClosed) {
        newManuallyClosedPortals.add(portalInterfaceKey);
      } else {
        newManuallyClosedPortals.delete(portalInterfaceKey);
      }
      setManuallyClosedPortals(newManuallyClosedPortals);
      // No need to call managePortals here, the useEffect will pick it up.
      closeContextMenu();
    },
    [manuallyClosedPortals],
  ); // Removed managePortals from deps, rely on useEffect

  useEffect(() => {
    setObjects((prevObs) => managePortals(prevObs, manuallyClosedPortals));
  }, [manuallyClosedPortals, managePortals]); // managePortals itself depends on defaultObjectSizes

  const handleContextMenuAction = useCallback(
    (event, objectId, objectType, worldCoords) => {
      event.preventDefault();
      mainContainerRef.current?.focus();
      if (objectId && objectId !== selectedObjectId)
        setSelectedObjectId(objectId);

      const targetObjectForMenu = objectId
        ? getObjectById(objectId)
        : objectType === "canvas"
          ? null
          : getObjectById(selectedObjectId);
      let options = [];

      if (targetObjectForMenu) {
        const obj = targetObjectForMenu;
        if (obj.type === OBJECT_TYPES.WALL_SEGMENT) {
          if (
            obj.isPortalWall &&
            !obj.hasPortalDoor &&
            obj.portalInterfaceKey
          ) {
            options.push({
              label: "Сделать сплошной стеной",
              onClick: () =>
                handleTogglePortalState(obj.portalInterfaceKey, true),
            });
          } else if (obj.isPortalWall && obj.hasPortalDoor) {
            // Wall segment with the portal door
            options.push({
              label: "Стена с портальной дверью",
              disabled: true,
            });
          } else if (manuallyClosedPortals.has(obj.portalInterfaceKey)) {
            // A normal wall that was part of a manually closed portal
            options.push({
              label: "Восстановить авто-проем",
              onClick: () =>
                handleTogglePortalState(obj.portalInterfaceKey, false),
            });
          } else {
            // Normal, non-portal wall
            options.push({
              label: "Добавить элемент...",
              onClick: () => {
                if (selectedObjectId !== obj.id) setSelectedObjectId(obj.id);
                setShowElementPlacementModal(true);
              },
              disabled: obj.elements && obj.elements.length > 0,
            });
          }
          options.push({
            label: "Свойства стены",
            onClick: () => setSelectedObjectId(obj.id),
          });
          const [coords, orientation] = obj.segmentKey.split("_");
          const cellX = parseInt(coords.split(",")[0]);
          const cellY = parseInt(coords.split(",")[1]);
          let isInternal = !(
            (orientation === "h" &&
              (cellY === 0 || cellY === obj.parentModule.cellsLong)) ||
            (orientation === "v" &&
              (cellX === 0 || cellX === obj.parentModule.cellsWide))
          );
          if (
            isInternal &&
            (!obj.elements || obj.elements.length === 0) &&
            !obj.isPortalWall &&
            !manuallyClosedPortals.has(obj.portalInterfaceKey)
          ) {
            options.push({ isSeparator: true });
            options.push({
              label: "Удалить стену",
              onClick: () =>
                deleteWallSegment(obj.parentModule.id, obj.segmentKey),
            });
          }
        } else if (
          obj.type === OBJECT_TYPES.DOOR ||
          obj.type === OBJECT_TYPES.WINDOW
        ) {
          options.push({
            label: `Свойства (${obj.type === OBJECT_TYPES.DOOR ? "дверь" : "окно"})`,
            onClick: () => setSelectedObjectId(obj.id),
          });
          if (obj.isPortalDoor && obj.portalInterfaceKey) {
            options.push({ isSeparator: true });
            options.push({
              label: "Закрыть проем (удалить дверь)",
              onClick: () =>
                handleTogglePortalState(obj.portalInterfaceKey, true),
            });
          } else if (!obj.isPortalDoor) {
            options.push({ isSeparator: true });
            options.push({
              label: `Удалить (${obj.type === OBJECT_TYPES.DOOR ? "дверь" : "окно"})`,
              onClick: () => {
                if (selectedObjectId !== obj.id) setSelectedObjectId(obj.id);
                deleteSelectedObject();
              },
            });
          }
        } else if (obj.type === OBJECT_TYPES.MODULE) {
          options.push({
            label: "Свойства модуля",
            onClick: () => setSelectedObjectId(obj.id),
          });
          options.push({
            label: "Повернуть модуль",
            onClick: () => handleRotateModule(obj.id),
          });
          options.push({ isSeparator: true });
          options.push({
            label: "Удалить модуль",
            onClick: () => {
              if (selectedObjectId !== obj.id) setSelectedObjectId(obj.id);
              deleteSelectedObject();
            },
          });
        }
      } else if (objectType === "canvas" && worldCoords) {
        let reEnableOptions = [];
        manuallyClosedPortals.forEach((key) => {
          reEnableOptions.push({
            label: `Открыть проем: ${key.substring(0, 15)}...`,
            onClick: () => handleTogglePortalState(key, false),
          });
        });
        if (reEnableOptions.length > 0) {
          options.push(...reEnableOptions);
          if (activeMode === MODES.MODULAR) options.push({ isSeparator: true });
        }
        if (activeMode === MODES.MODULAR) {
          options.push({
            label: "Добавить модуль здесь",
            onClick: () => addNewModule(worldCoords.worldX, worldCoords.worldY),
          });
        }
      }
      if (options.length > 0)
        setContextMenu({ x: event.clientX, y: event.clientY, options });
      else setContextMenu(null);
    },
    [
      selectedObjectId,
      objects,
      getObjectById,
      deleteSelectedObject,
      deleteWallSegment,
      addNewModule,
      handleRotateModule,
      activeMode,
      setSelectedObjectId,
      manuallyClosedPortals,
      handleTogglePortalState,
    ],
  );

  useKeyboardShortcuts({
    mainContainerRef,
    deleteSelectedObject:
      primarySelectedObject &&
      !primarySelectedObject.isPortalDoor &&
      (primarySelectedObject.type === OBJECT_TYPES.DOOR ||
        primarySelectedObject.type === OBJECT_TYPES.WINDOW ||
        primarySelectedObject.type === OBJECT_TYPES.MODULE)
        ? deleteSelectedObject
        : null,
    deselectAll: () => {
      setSelectedObjectId(null);
      closeContextMenu();
    },
  });

  useEffect(() => {
    mainContainerRef.current?.focus();
  }, []);

  const mouseInteractions = useMouseInteractions({
    viewTransform,
    modifierKeys,
    mainContainerRef,
    svgRef,
    setViewTransform,
    activeMode,
    setSelectedObjectId,
    screenToWorld,
    updateModulePosition,
    snapAndFinalizeModulePosition,
  });

  return (
    <div
      ref={mainContainerRef}
      className="w-full h-full flex flex-col select-none outline-none"
      tabIndex={-1}
    >
      <ConfiguratorToolbar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        onAddModuleFromToolbar={addModuleFromToolbar}
      />
      <div className="flex flex-grow overflow-hidden">
        <div className="flex-grow flex items-center justify-center p-1 sm:p-2 md:p-4 bg-dark-bg relative">
          <div className="relative bg-card-bg shadow-2xl w-full h-full max-w-[1920px] max-h-[1080px] aspect-[16/9] overflow-hidden rounded-md border border-gray-700">
            <SvgCanvas
              svgRef={svgRef}
              viewTransform={viewTransform}
              modifierKeys={modifierKeys}
              isPanningWithSpace={mouseInteractions.isPanningWithSpace}
              isDraggingModule={mouseInteractions.isDraggingModule}
              handleMouseMove={mouseInteractions.handleMouseMove}
              handleMouseUp={mouseInteractions.handleMouseUp}
              handleMouseLeave={mouseInteractions.handleMouseLeave}
              handleMouseDownOnCanvas={
                mouseInteractions.handleMouseDownOnCanvas
              }
              onContextMenu={handleContextMenuAction}
              objects={objects}
              activeMode={activeMode}
              selectedObjectId={selectedObjectId}
              setSelectedObjectId={setSelectedObjectId}
              scale={viewTransform.scale}
              canAddInitialModule={canShowInitialModuleButton}
              onAddModule={addModuleAtZeroZero}
              // Pass segmentId to onToggleWallSegment, which needs to come from renderer
              onToggleWallSegment={(
                moduleId,
                cellX,
                cellY,
                orientation,
                segmentId,
              ) =>
                handleToggleWallSegment(
                  moduleId,
                  cellX,
                  cellY,
                  orientation,
                  segmentId,
                )
              }
              primarySelectedObject={primarySelectedObject}
            />
          </div>
        </div>
        {activeMode === MODES.MODULAR &&
          primarySelectedObject &&
          !showElementPlacementModal && (
            <PropertiesPanel
              primarySelectedObject={primarySelectedObject}
              lockedObjectIds={[]}
              modifierKeys={modifierKeys}
              updateSelectedObjectProperty={updateSelectedObjectProperty}
              deleteSelectedObject={deleteSelectedObject}
            />
          )}
        {activeMode === MODES.MODULAR &&
          showElementPlacementModal &&
          selectedWallSegmentData && (
            <ElementPlacementPanel
              selectedWallSegment={selectedWallSegmentData}
              onPlaceElement={handlePlaceElementOnWall}
              onClose={() => setShowElementPlacementModal(false)}
              isModal
            />
          )}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={contextMenu.options}
          onClose={closeContextMenu}
        />
      )}
      <StatusBar
        zoomLevel={viewTransform.scale / INITIAL_PPM}
        selectedObjectName={
          primarySelectedObject?.label ||
          (primarySelectedObject?.isPortalDoor
            ? "Портальная дверь"
            : primarySelectedObject?.type) ||
          ""
        }
        selectedObjectId={selectedObjectId}
      />
    </div>
  );
};
export default Configurator;
