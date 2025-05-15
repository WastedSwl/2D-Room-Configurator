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
          if (segment.id === id) {
            let enrichedSegmentData = { ...segment };
            if (segment.isPortalWall && segment.portalInterfaceKey) {
              let partnerExists = false;
              for (const otherModule of objects) {
                if (otherModule.type === OBJECT_TYPES.MODULE && otherModule.id !== mod.id) {
                  for (const otherSegmentKeyInPartner in otherModule.wallSegments) {
                    const otherSeg = otherModule.wallSegments[otherSegmentKeyInPartner];
                    if (otherSeg.isPortalWall && otherSeg.portalInterfaceKey === segment.portalInterfaceKey) {
                      partnerExists = true;
                      break;
                    }
                  }
                }
                if (partnerExists) break;
              }
              enrichedSegmentData.isSingleSidePortal = !partnerExists;
              enrichedSegmentData.isManuallyClosed = manuallyClosedPortals.has(segment.portalInterfaceKey);
            } else {
              enrichedSegmentData.isSingleSidePortal = false;
              enrichedSegmentData.isManuallyClosed = false;
            }
            return {
              ...enrichedSegmentData,
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
    [objects, manuallyClosedPortals],
  );

  const primarySelectedObject = getObjectById(selectedObjectId);
  let currentSelectedPortalInterfaceKey = null;
  if (primarySelectedObject &&
      primarySelectedObject.type === OBJECT_TYPES.WALL_SEGMENT &&
      primarySelectedObject.isPortalWall &&
      primarySelectedObject.portalInterfaceKey) {
    currentSelectedPortalInterfaceKey = primarySelectedObject.portalInterfaceKey;
  }

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
      modules.forEach((module) => {
        for (const segmentKey in module.wallSegments) {
          const segment = module.wallSegments[segmentKey];
          delete segment.isPortalWall;
          delete segment.hasPortalDoor;
          delete segment.portalInterfaceKey;
          if (segment.elements) {
            segment.elements = segment.elements.filter(
              (el) => !el.isPortalDoor,
            );
          }
        }
      });
      for (let i = 0; i < modules.length; i++) {
        for (let j = i + 1; j < modules.length; j++) {
          const m1 = modules[i];
          const m2 = modules[j];
          if (m1.rotation !== 0 || m2.rotation !== 0) continue;
          if (Math.abs(m1.x + m1.width - m2.x) < EPSILON) {
            const verticalInterfaceKey = getInterfaceKey(m1.id, m2.id, "V_RL");
            if (!currentManuallyClosedPortals.has(verticalInterfaceKey)) {
              let doorAddedThisPair = false;
              for (let c1 = 0; c1 < m1.cellsLong; c1++) {
                const m1WallYWorld = m1.y + c1 * GRID_CELL_SIZE_M;
                const m1SegmentKey = `${m1.cellsWide},${c1}_v`;
                const m1Wall = m1.wallSegments[m1SegmentKey];
                if (!m1Wall) continue;
                for (let c2 = 0; c2 < m2.cellsLong; c2++) {
                  const m2WallYWorld = m2.y + c2 * GRID_CELL_SIZE_M;
                  if (Math.abs(m1WallYWorld - m2WallYWorld) < EPSILON) {
                    const m2SegmentKey = `0,${c2}_v`;
                    const m2Wall = m2.wallSegments[m2SegmentKey];
                    if (!m2Wall) continue;
                    m1Wall.isPortalWall = true;
                    m1Wall.portalInterfaceKey = verticalInterfaceKey;
                    m2Wall.isPortalWall = true;
                    m2Wall.portalInterfaceKey = verticalInterfaceKey;
                    if (!doorAddedThisPair) {
                      const doorDefaults = defaultObjectSizes[portalDoorType];
                       if (m1.id.localeCompare(m2.id) < 0) {
                          m1Wall.elements.push({
                            id: generateId(`${portalDoorType}_portal_`),
                            type: portalDoorType,
                            positionOnSegment: 0.5,
                            width: doorDefaults.width,
                            isOpen: true,
                            isPortalDoor: true,
                            hingeSide: "left",
                            openingDirection: "inward",
                            portalInterfaceKey: verticalInterfaceKey,
                          });
                          m1Wall.hasPortalDoor = true;
                       } else {
                           m2Wall.elements.push({
                            id: generateId(`${portalDoorType}_portal_`),
                            type: portalDoorType,
                            positionOnSegment: 0.5,
                            width: doorDefaults.width,
                            isOpen: true,
                            isPortalDoor: true,
                            hingeSide: "left",
                            openingDirection: "inward",
                            portalInterfaceKey: verticalInterfaceKey,
                          });
                           m2Wall.hasPortalDoor = true;
                       }
                      doorAddedThisPair = true;
                    }
                  }
                }
              }
            }
          }
            if (Math.abs(m2.x + m2.width - m1.x) < EPSILON) {
              const verticalInterfaceKey = getInterfaceKey(m1.id, m2.id, "V_LR");
               if (!currentManuallyClosedPortals.has(verticalInterfaceKey)) {
                  let doorAddedThisPair = false;
                   for (let c1 = 0; c1 < m1.cellsLong; c1++) {
                    const m1WallYWorld = m1.y + c1 * GRID_CELL_SIZE_M;
                    const m1SegmentKey = `0,${c1}_v`;
                    const m1Wall = m1.wallSegments[m1SegmentKey];
                    if (!m1Wall) continue;
                    for (let c2 = 0; c2 < m2.cellsLong; c2++) {
                      const m2WallYWorld = m2.y + c2 * GRID_CELL_SIZE_M;
                      if (Math.abs(m1WallYWorld - m2WallYWorld) < EPSILON) {
                        const m2SegmentKey = `${m2.cellsWide},${c2}_v`;
                        const m2Wall = m2.wallSegments[m2SegmentKey];
                        if (!m2Wall) continue;
                        m1Wall.isPortalWall = true;
                        m1Wall.portalInterfaceKey = verticalInterfaceKey;
                        m2Wall.isPortalWall = true;
                        m2Wall.portalInterfaceKey = verticalInterfaceKey;
                         if (!doorAddedThisPair) {
                          const doorDefaults = defaultObjectSizes[portalDoorType];
                           if (m1.id.localeCompare(m2.id) < 0) {
                              m1Wall.elements.push({
                                id: generateId(`${portalDoorType}_portal_`),
                                type: portalDoorType,
                                positionOnSegment: 0.5,
                                width: doorDefaults.width,
                                isOpen: true,
                                isPortalDoor: true,
                                hingeSide: "left",
                                openingDirection: "inward",
                                portalInterfaceKey: verticalInterfaceKey,
                              });
                              m1Wall.hasPortalDoor = true;
                           } else {
                               m2Wall.elements.push({
                                id: generateId(`${portalDoorType}_portal_`),
                                type: portalDoorType,
                                positionOnSegment: 0.5,
                                width: doorDefaults.width,
                                isOpen: true,
                                isPortalDoor: true,
                                hingeSide: "left",
                                openingDirection: "inward",
                                portalInterfaceKey: verticalInterfaceKey,
                              });
                               m2Wall.hasPortalDoor = true;
                           }
                          doorAddedThisPair = true;
                        }
                      }
                    }
                  }
               }
            }
          if (Math.abs(m1.y + m1.height - m2.y) < EPSILON) {
            const horizontalInterfaceKey = getInterfaceKey(m1.id, m2.id, "H_BT");
            if (!currentManuallyClosedPortals.has(horizontalInterfaceKey)) {
               let doorAddedThisPair = false;
              for (let c1 = 0; c1 < m1.cellsWide; c1++) {
                const m1WallXWorld = m1.x + c1 * GRID_CELL_SIZE_M;
                const m1SegmentKey = `${c1},${m1.cellsLong}_h`;
                const m1Wall = m1.wallSegments[m1SegmentKey];
                if (!m1Wall) continue;
                for (let c2 = 0; c2 < m2.cellsWide; c2++) {
                  const m2WallXWorld = m2.x + c2 * GRID_CELL_SIZE_M;
                  if (Math.abs(m1WallXWorld - m2WallXWorld) < EPSILON) {
                    const m2SegmentKey = `${c2},0_h`;
                    const m2Wall = m2.wallSegments[m2SegmentKey];
                    if (!m2Wall) continue;
                    m1Wall.isPortalWall = true;
                    m1Wall.portalInterfaceKey = horizontalInterfaceKey;
                    m2Wall.isPortalWall = true;
                    m2Wall.portalInterfaceKey = horizontalInterfaceKey;
                     if (!doorAddedThisPair) {
                      const doorDefaults = defaultObjectSizes[portalDoorType];
                       if (m1.id.localeCompare(m2.id) < 0) {
                           m1Wall.elements.push({
                            id: generateId(`${portalDoorType}_portal_`),
                            type: portalDoorType,
                            positionOnSegment: 0.5,
                            width: doorDefaults.width,
                            isOpen: true,
                            isPortalDoor: true,
                            hingeSide: "left",
                            openingDirection: "inward",
                            portalInterfaceKey: horizontalInterfaceKey,
                          });
                          m1Wall.hasPortalDoor = true;
                       } else {
                           m2Wall.elements.push({
                            id: generateId(`${portalDoorType}_portal_`),
                            type: portalDoorType,
                            positionOnSegment: 0.5,
                            width: doorDefaults.width,
                            isOpen: true,
                            isPortalDoor: true,
                            hingeSide: "left",
                            openingDirection: "inward",
                            portalInterfaceKey: horizontalInterfaceKey,
                          });
                           m2Wall.hasPortalDoor = true;
                       }
                       doorAddedThisPair = true;
                    }
                  }
                }
              }
            }
          }
            if (Math.abs(m2.y + m2.height - m1.y) < EPSILON) {
               const horizontalInterfaceKey = getInterfaceKey(m1.id, m2.id, "H_TB");
                if (!currentManuallyClosedPortals.has(horizontalInterfaceKey)) {
                   let doorAddedThisPair = false;
                   for (let c1 = 0; c1 < m1.cellsWide; c1++) {
                    const m1WallXWorld = m1.x + c1 * GRID_CELL_SIZE_M;
                    const m1SegmentKey = `${c1},0_h`;
                    const m1Wall = m1.wallSegments[m1SegmentKey];
                    if (!m1Wall) continue;
                    for (let c2 = 0; c2 < m2.cellsWide; c2++) {
                      const m2WallXWorld = m2.x + c2 * GRID_CELL_SIZE_M;
                      if (Math.abs(m1WallXWorld - m2WallXWorld) < EPSILON) {
                        const m2SegmentKey = `${c2},${m2.cellsLong}_h`;
                        const m2Wall = m2.wallSegments[m2SegmentKey];
                        if (!m2Wall) continue;
                        m1Wall.isPortalWall = true;
                        m1Wall.portalInterfaceKey = horizontalInterfaceKey;
                        m2Wall.isPortalWall = true;
                        m2Wall.portalInterfaceKey = horizontalInterfaceKey;
                        if (!doorAddedThisPair) {
                           const doorDefaults = defaultObjectSizes[portalDoorType];
                            if (m1.id.localeCompare(m2.id) < 0) {
                                m1Wall.elements.push({
                                 id: generateId(`${portalDoorType}_portal_`),
                                 type: portalDoorType,
                                 positionOnSegment: 0.5,
                                 width: doorDefaults.width,
                                 isOpen: true,
                                 isPortalDoor: true,
                                 hingeSide: "left",
                                 openingDirection: "inward",
                                 portalInterfaceKey: horizontalInterfaceKey,
                               });
                                m1Wall.hasPortalDoor = true;
                            } else {
                                m2Wall.elements.push({
                                 id: generateId(`${portalDoorType}_portal_`),
                                 type: portalDoorType,
                                 positionOnSegment: 0.5,
                                 width: doorDefaults.width,
                                 isOpen: true,
                                 isPortalDoor: true,
                                 hingeSide: "left",
                                 openingDirection: "inward",
                                 portalInterfaceKey: horizontalInterfaceKey,
                               });
                                m2Wall.hasPortalDoor = true;
                            }
                           doorAddedThisPair = true;
                         }
                       }
                     }
                   }
                }
             }
        }
      }
        const activePortalInterfaceKeys = new Set();
        for (let i = 0; i < modules.length; i++) {
             for (let j = i + 1; j < modules.length; j++) {
                 const m1 = modules[i];
                 const m2 = modules[j];
                 if (m1.rotation !== 0 || m2.rotation !== 0) continue;
                 if (Math.abs(m1.x + m1.width - m2.x) < EPSILON) activePortalInterfaceKeys.add(getInterfaceKey(m1.id, m2.id, "V_RL"));
                 if (Math.abs(m2.x + m2.width - m1.x) < EPSILON) activePortalInterfaceKeys.add(getInterfaceKey(m1.id, m2.id, "V_LR"));
                 if (Math.abs(m1.y + m1.height - m2.y) < EPSILON) activePortalInterfaceKeys.add(getInterfaceKey(m1.id, m2.id, "H_BT"));
                 if (Math.abs(m2.y + m2.height - m1.y) < EPSILON) activePortalInterfaceKeys.add(getInterfaceKey(m1.id, m2.id, "H_TB"));
             }
        }
       const newManuallyClosedPortals = new Set(
           [...currentManuallyClosedPortals].filter(key => activePortalInterfaceKeys.has(key))
       );
        if ([...newManuallyClosedPortals].join(',') !== [...currentManuallyClosedPortals].join(',')) {
            setManuallyClosedPortals(newManuallyClosedPortals);
        }
      return newObjects;
    },
    [defaultObjectSizes, GRID_CELL_SIZE_M, setManuallyClosedPortals],
  );

  const createNewModule = useCallback((posX = 0, posY = 0) => {
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
  }, [GRID_CELL_SIZE_M, MODULE_DEFAULT_CELLS_LONG, MODULE_DEFAULT_CELLS_WIDE, WALL_THICKNESS_M_RENDER]);

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
    createNewModule,
  ]);

  const addModuleFromToolbar = useCallback(() => {
    let newX = 0;
    let newY = 0;
    const modulesOnly = objects.filter((o) => o.type === OBJECT_TYPES.MODULE);
    if (modulesOnly.length > 0) {
      const rightmostModule =
        modulesOnly
          .filter(
            (obj) => typeof obj.x === "number" && typeof obj.y === "number",
          )
          .sort((a, b) => (b.x || 0) + (b.width || 0) - ((a.x || 0) + (a.width || 0)))[0] ||
        modulesOnly[modulesOnly.length - 1];
      if (rightmostModule) {
        newX =
          (rightmostModule.x || 0) +
          (rightmostModule.width ||
            MODULE_DEFAULT_CELLS_WIDE * GRID_CELL_SIZE_M) +
          GRID_CELL_SIZE_M * 2;
        newY = rightmostModule.y || 0;
      } else {
        newX = (MODULE_DEFAULT_CELLS_WIDE * GRID_CELL_SIZE_M + GRID_CELL_SIZE_M * 2) * modulesOnly.length;
      }
    }
    const newModule = createNewModule(newX, newY);
    setObjects((prevObjects) =>
      managePortals([...prevObjects, newModule], manuallyClosedPortals),
    );
    setSelectedObjectId(newModule.id);
    closeContextMenu();
  }, [objects, closeContextMenu, managePortals, manuallyClosedPortals, GRID_CELL_SIZE_M, MODULE_DEFAULT_CELLS_WIDE, createNewModule]);

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
    [activeMode, closeContextMenu, managePortals, manuallyClosedPortals, GRID_CELL_SIZE_M, createNewModule],
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
              if (isPerimeter) {
                 alert("Периметральные стены не могут быть удалены.");
                 return obj;
              }
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
      WALL_THICKNESS_M_RENDER,
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
        portalInterfaceKey: objDetails.portalInterfaceKey,
        isManuallyClosed: objDetails.isManuallyClosed,
        isSingleSidePortal: objDetails.isSingleSidePortal,
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
               if (newModule.wallSegments[segmentKey].elements && newModule.wallSegments[segmentKey].elements.length > 0) {
                  return obj;
               }
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
      setSelectedObjectId,
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
        "thickness",
      ];
      let processedValue = value;
      if (numericProps.includes(key)) {
        processedValue = parseFloat(value);
        if (isNaN(processedValue)) {
          if (
            value === "" &&
            (key === "x" || key === "y" || key === "rotation" || key === "thickness")
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
            if (key === "label") {
               return { ...obj, [key]: processedValue };
            }
            const currentVal = obj[key] !== undefined ? parseFloat(obj[key]) : NaN;
            const newVal = parseFloat(processedValue);
            if (key === "rotation") {
              processedValue = (Math.round(processedValue / 90) * 90) % 360;
              if (processedValue < 0) processedValue += 360;
               if (Math.abs(currentVal - processedValue) > EPSILON) {
                   if (processedValue !== 0) {
                     console.warn(
                       "Вращение модуля (кроме 0 градусов) пока не поддерживается с автоматическими межмодульными дверьми. Двери могут исчезнуть или отображаться некорректно.",
                     );
                   }
                   needsPortalUpdate = true;
               }
            } else if ((key === "x" || key === "y")) {
                 if (Math.abs(currentVal - newVal) > EPSILON) {
                    needsPortalUpdate = true;
                 }
            }
            return { ...obj, [key]: processedValue };
          }
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
                 if (key === "thickness" && !segment.isPortalWall) {
                     changed = true;
                     newModule.wallSegments[primarySelectedObject.segmentKey] = {
                         ...segment,
                         [key]: processedValue,
                     };
                 }
              } else {
                const newElements = segment.elements.map((el) => {
                  if (el.id === selectedObjectId) {
                    if (el.isPortalDoor) {
                      const allowedPortalDoorProps = ["isOpen", "openingAngle", "hingeSide", "openingDirection"];
                      if (!allowedPortalDoorProps.includes(key)) {
                        alert(
                          `Свойство '${key}' портальной двери не может быть изменено вручную. Ширина и позиция фиксированы. Для удаления используйте "Закрыть проем".`,
                        );
                        return el;
                      }
                    }
                    changed = true;
                    return { ...el, [key]: processedValue };
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
      if (needsPortalUpdate) {
          setObjects((prev) => managePortals(prev, manuallyClosedPortals));
      }
    },
    [
      selectedObjectId,
      primarySelectedObject,
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
        let moduleToSnap = null;
        const objectsWithSnappedModule = prevObjects.map((obj) => {
          if (obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE) {
             moduleToSnap = obj;
            const snappedX =
              GRID_CELL_SIZE_M > 0
                ? Math.round(obj.x / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M
                : obj.x;
            const snappedY =
              GRID_CELL_SIZE_M > 0
                ? Math.round(obj.y / GRID_CELL_SIZE_M) * GRID_CELL_SIZE_M
                : obj.y;
             if (Math.abs(obj.x - snappedX) > EPSILON || Math.abs(obj.y - snappedY) > EPSILON) {
                 return { ...obj, x: snappedX, y: snappedY };
             }
          }
          return obj;
        }).filter(Boolean);
        const moduleAfterSnap = objectsWithSnappedModule.find(obj => obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE);
        if (moduleToSnap && moduleAfterSnap && (Math.abs(moduleToSnap.x - moduleAfterSnap.x) > EPSILON || Math.abs(moduleToSnap.y - moduleAfterSnap.y) > EPSILON)) {
             return managePortals(objectsWithSnappedModule, manuallyClosedPortals);
        }
        return prevObjects;
      });
    },
    [GRID_CELL_SIZE_M, managePortals, manuallyClosedPortals],
  );

  const handleRotateModule = useCallback(
    (moduleId) => {
      setObjects((prevObjects) => {
        const rotatedObjects = prevObjects.map((obj) => {
          if (obj.id === moduleId && obj.type === OBJECT_TYPES.MODULE) {
             const currentRotation = obj.rotation || 0;
             const newRotation = (currentRotation + 90) % 360;
             if (newRotation < 0) newRotation += 360;
             if (newRotation !== 0) {
               console.warn(
                 "Вращение модуля (кроме 0 градусов) пока не поддерживается с автоматическими межмодульными дверьми. Двери могут исчезнуть или отображаться некорректно.",
               );
            }
            return { ...obj, rotation: newRotation };
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
    if (primarySelectedObject.isPortalDoor && primarySelectedObject.portalInterfaceKey) {
      handleTogglePortalState(primarySelectedObject.portalInterfaceKey, true);
      closeContextMenu();
      return;
    }
    let newObjectsList = objects;
    let shouldUpdatePortals = false;
    if (primarySelectedObject.type === OBJECT_TYPES.MODULE) {
      newObjectsList = objects.filter((obj) => obj.id !== selectedObjectId);
      setSelectedObjectId(null);
      shouldUpdatePortals = true;
    } else {
      const { parentModule, segmentKey, type: objType } = primarySelectedObject;
      if (parentModule) {
        if (objType === OBJECT_TYPES.WALL_SEGMENT) {
           alert(
            "Для удаления сегмента стены используйте контекстное меню на стене.",
          );
           closeContextMenu();
           return;
        } else {
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
                 const elementExists = segment.elements.some(el => el.id === selectedObjectId);
                 if (!elementExists) return obj;
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
          shouldUpdatePortals = false;
        }
      }
    }
    if (shouldUpdatePortals) {
       setObjects(managePortals(newObjectsList, manuallyClosedPortals));
    } else {
       setObjects(newObjectsList);
    }
    closeContextMenu();
  }, [
    selectedObjectId,
    primarySelectedObject,
    objects,
    closeContextMenu,
    managePortals,
    manuallyClosedPortals,
    handleTogglePortalState,
  ]);

  const handleTogglePortalState = useCallback(
    (portalInterfaceKey, makeClosed) => {
      setManuallyClosedPortals((prev) => {
         const newSet = new Set(prev);
         if (makeClosed) {
            newSet.add(portalInterfaceKey);
         } else {
            newSet.delete(portalInterfaceKey);
         }
         return newSet;
      });
      closeContextMenu();
      const currentSelected = getObjectById(selectedObjectId);
      if (currentSelected && currentSelected.portalInterfaceKey === portalInterfaceKey) {
          setSelectedObjectId(null);
      }
    },
    [closeContextMenu, selectedObjectId, getObjectById],
  );

   useEffect(() => {
       setObjects((prevObs) => managePortals(prevObs, manuallyClosedPortals));
   }, [manuallyClosedPortals, managePortals]);

  const handleContextMenuAction = useCallback(
    (event, objectId, objectType, meta) => {
      event.preventDefault();
      mainContainerRef.current?.focus();
      if (objectId && objectId !== selectedObjectId) {
          setSelectedObjectId(objectId);
      } else if (!objectId && objectType === 'canvas') {
           setSelectedObjectId(null);
      }
      const targetObjectForMenu = objectId
        ? getObjectById(objectId)
        : objectType === "canvas"
          ? null
          : getObjectById(selectedObjectId);
      let options = [];
      if (targetObjectForMenu) {
        const obj = targetObjectForMenu;
         options.push({
            label: `Свойства (${obj.type === OBJECT_TYPES.WALL_SEGMENT ? 'стена' : obj.type === OBJECT_TYPES.DOOR ? 'дверь' : obj.type === OBJECT_TYPES.WINDOW ? 'окно' : 'модуль'})`,
            onClick: () => setSelectedObjectId(obj.id),
         });
         options.push({ isSeparator: true });
        if (obj.type === OBJECT_TYPES.WALL_SEGMENT) {
          const segment = obj;
          const [coords, orientation] = segment.segmentKey.split("_");
          const cellX = parseInt(coords.split(",")[0]);
          const cellY = parseInt(coords.split(",")[1]);
          let isPerimeter = false;
          if (segment.parentModule) {
              if (orientation === "h" && (cellY === 0 || cellY === segment.parentModule.cellsLong)) isPerimeter = true;
              if (orientation === "v" && (cellX === 0 || cellX === segment.parentModule.cellsWide)) isPerimeter = true;
          }
          if (segment.isPortalWall && segment.portalInterfaceKey) {
            options.push({ label: "--- Проем ---", disabled: true });
            const interfaceKey = segment.portalInterfaceKey;
            const isInterfaceManuallyClosed = manuallyClosedPortals.has(interfaceKey);
            let partnerExists = false;
            if (segment.parentModule) {
                for (const otherModule of objects.filter(o => o.type === OBJECT_TYPES.MODULE && o.id !== segment.parentModule.id)) {
                    if (otherModule.wallSegments) {
                        for (const otherSegmentKey in otherModule.wallSegments) {
                            const otherSeg = otherModule.wallSegments[otherSegmentKey];
                            if (otherSeg.isPortalWall && otherSeg.portalInterfaceKey === interfaceKey) {
                                partnerExists = true;
                                break;
                            }
                        }
                    }
                    if (partnerExists) break;
                }
            }
            const isSingleSide = !partnerExists;
            if (isSingleSide) {
                options.push({ label: "Незавершенный проем", disabled: true });
            } else {
                if (segment.hasPortalDoor || (segment.elements && segment.elements.some(el => el.isPortalDoor && el.portalInterfaceKey === interfaceKey))) {
                     options.push({
                        label: isInterfaceManuallyClosed ? "Проем закрыт (ошибка состояния)" : "Автоматическая дверь",
                        disabled: true,
                     });
                      if (!isInterfaceManuallyClosed) {
                           options.push({
                             label: "Закрыть проем (сплошная стена)",
                             onClick: () => handleTogglePortalState(interfaceKey, true),
                           });
                      } else {
                          options.push({
                             label: "Восстановить авто-проем (с дверью)",
                              onClick: () => handleTogglePortalState(interfaceKey, false),
                          });
                      }
                } else if (!isInterfaceManuallyClosed) {
                    options.push({ label: "Сторона открытого проема", disabled: true });
                    options.push({
                        label: "Закрыть проем (сплошная стена)",
                        onClick: () => handleTogglePortalState(interfaceKey, true),
                    });
                } else {
                    options.push({ label: "Проем закрыт вручную", disabled: true });
                    options.push({
                        label: "Открыть проем (восстановить дверь)",
                        onClick: () => handleTogglePortalState(interfaceKey, false),
                    });
                }
            }
          } else {
            options.push({
              label: "Добавить элемент...",
              onClick: () => {
                if (selectedObjectId !== segment.id) setSelectedObjectId(segment.id);
                setShowElementPlacementModal(true);
              },
              disabled: segment.elements && segment.elements.length > 0,
            });
             if (!isPerimeter && (!segment.elements || segment.elements.length === 0)) {
               options.push({ isSeparator: true });
               options.push({
                 label: "Удалить стену",
                 onClick: () => deleteWallSegment(segment.parentModule.id, segment.segmentKey),
               });
             }
          }
        } else if (
          obj.type === OBJECT_TYPES.DOOR ||
          obj.type === OBJECT_TYPES.WINDOW
        ) {
          if (obj.isPortalDoor && obj.portalInterfaceKey) {
             options.push({ label: "--- Портальная Дверь ---", disabled: true });
             const interfaceKey = obj.portalInterfaceKey;
             const isInterfaceManuallyClosed = manuallyClosedPortals.has(interfaceKey);
             if (!isInterfaceManuallyClosed) {
                options.push({
                  label: "Закрыть проем (сплошная стена)",
                  onClick: () => handleTogglePortalState(interfaceKey, true),
                });
             } else {
                 options.push({
                    label: "Восстановить авто-проем (с дверью)",
                    onClick: () => handleTogglePortalState(interfaceKey, false),
                 });
             }
          } else {
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
             label: "Повернуть модуль на 90°",
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
      } else if (objectType === "canvas" && meta?.worldX !== undefined) {
        let reEnableOptions = [];
         const activePortalInterfaceKeys = new Set(
            objects.flatMap(obj => {
                 if (obj.type === OBJECT_TYPES.MODULE && obj.wallSegments) {
                     return Object.values(obj.wallSegments)
                         .filter(seg => seg.isPortalWall && seg.portalInterfaceKey)
                         .map(seg => seg.portalInterfaceKey);
                 }
                 return [];
             })
         );
         manuallyClosedPortals.forEach((key) => {
            if (activePortalInterfaceKeys.has(key)) {
              reEnableOptions.push({
                label: `Открыть проем: ${key.substring(0, 15)}...`,
                onClick: () => handleTogglePortalState(key, false),
              });
            }
         });
        if (reEnableOptions.length > 0) {
          options.push({ label: "Восстановить проемы:", disabled: true });
          options.push(...reEnableOptions);
          if (activeMode === MODES.MODULAR) options.push({ isSeparator: true });
        }
        if (activeMode === MODES.MODULAR) {
          options.push({
            label: "Добавить модуль здесь",
            onClick: () => addNewModule(meta.worldX, meta.worldY),
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
      setShowElementPlacementModal,
    ],
  );

  useKeyboardShortcuts({
    mainContainerRef,
    deleteSelectedObject:
      primarySelectedObject &&
      ( primarySelectedObject.type === OBJECT_TYPES.MODULE ||
        ( (primarySelectedObject.type === OBJECT_TYPES.DOOR || primarySelectedObject.type === OBJECT_TYPES.WINDOW) && !primarySelectedObject.isPortalDoor)
      )
        ? deleteSelectedObject
        : (primarySelectedObject && primarySelectedObject.isPortalDoor && primarySelectedObject.portalInterfaceKey) // Allow Del/Backspace for portal doors to close portal
          ? () => handleTogglePortalState(primarySelectedObject.portalInterfaceKey, true)
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
              manuallyClosedPortals={manuallyClosedPortals}
              primarySelectedObject={primarySelectedObject}
              selectedPortalInterfaceKey={currentSelectedPortalInterfaceKey}
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