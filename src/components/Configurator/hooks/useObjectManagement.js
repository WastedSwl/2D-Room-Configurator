import { useCallback } from "react";
import { toast } from 'react-toastify'; 
import {
  WALL_THICKNESS_M,
  DOOR_WIDTH_M as APP_DOOR_WIDTH_M,
  WINDOW_WIDTH_M as APP_WINDOW_WIDTH_M,
} from "../appConstants";
import { defaultObjectSizes } from "../configuratorConstants";
import {
    getAABB,
    checkAABBIntersection,
    getDoorLeafCorners,
    isDoorLeafColliding
} from "../configuratorUtils";

let objectIdCounter = 0;
const getNextId = () => `obj-${objectIdCounter++}`;

export const createObject = (type, x, y, width, height, data = {}) => {
  const baseObj = {
    id: getNextId(),
    type,
    x,
    y,
    width,
    height,
    rotation: data.rotation || 0,
    label: data.label || "",
    ...data,
  };
  if (type === "door") {
    baseObj.isOpen = data.isOpen === undefined ? false : data.isOpen;
    baseObj.openingAngle =
      data.openingAngle === undefined ? 90 : data.openingAngle;
    baseObj.hingeSide = data.hingeSide || "left";
    baseObj.openingDirection = data.openingDirection || "inward";
  }
  return baseObj;
};

export const getInitialObjects = () => {
  objectIdCounter = 0; // Reset counter when generating initial objects
  const initialObjects = [];
  const WT = WALL_THICKNESS_M;
  const houseWidthOuter = 6;
  const houseDepthOuter = 3.5;
  const gap = 0.1;

  // --- Outer Walls ---
  initialObjects.push(
    createObject("wall", 0, 0, houseWidthOuter, WT, { label: "Верхняя стена" }),
  );
  initialObjects.push(
    createObject("wall", 0, houseDepthOuter - WT, houseWidthOuter, WT, {
      label: "Нижняя стена",
    }),
  );
  initialObjects.push(
    createObject("wall", 0, WT, WT, houseDepthOuter - 2 * WT, {
      label: "Левая стена",
    }),
  );
  initialObjects.push(
    createObject(
      "wall",
      houseWidthOuter - WT,
      WT,
      WT,
      houseDepthOuter - 2 * WT,
      { label: "Правая стена" },
    ),
  );

  // --- Main Door ---
  const mainDoorWidth = APP_DOOR_WIDTH_M;
  initialObjects.push(
    createObject("door", 1.0, houseDepthOuter - WT, mainDoorWidth, WT, {
      hingeSide: "left",
      openingDirection: "inward",
      isOpen: false,
      openingAngle: 0,
      label: "Входная дверь",
    }),
  );

  // --- Main Window ---
  const mainWindowWidth = APP_WINDOW_WIDTH_M;
  initialObjects.push(
    createObject(
      "window",
      houseWidthOuter / 2 - mainWindowWidth / 2,
      0,
      mainWindowWidth,
      WT,
      { label: "Окно гостиной" },
    ),
  );

  // --- Living Room Furniture ---
  const sofaWidth = 1.8;
  const sofaDepth = 0.8;
  initialObjects.push(
    createObject("sofa", WT + gap, WT + gap, sofaWidth, sofaDepth, {
      label: "Диван",
    }),
  );
  const coffeeTableWidth = 1.0;
  const coffeeTableDepth = 0.5;
  initialObjects.push(
    createObject(
      "table",
      WT + gap + (sofaWidth - coffeeTableWidth) / 2,
      WT + gap + sofaDepth + 0.3,
      coffeeTableWidth,
      coffeeTableDepth,
      { label: "Кофейный столик" },
    ),
  );

  // --- Bedroom Furniture ---
  const bedWidth = 1.5;
  const bedDepth = 2.0;
  const bedX = houseWidthOuter - WT - gap - bedWidth;
  const bedY = WT + gap;
  initialObjects.push(
    createObject("bed", bedX, bedY, bedWidth, bedDepth, { label: "Кровать" }),
  );
  const wardrobeWidth = 0.8;
  const wardrobeDepth = 0.5;
  initialObjects.push(
    createObject(
      "cabinet",
      bedX - gap - wardrobeWidth,
      bedY,
      wardrobeWidth,
      wardrobeDepth,
      { label: "Шкаф" },
    ),
  );

  // --- Bathroom Walls & Door ---
  const bathroomWidthInner = 1.5;
  const bathroomDepthInner = 1.8;
  const bathroomOuterWallX =
    houseWidthOuter - WT - gap - bathroomWidthInner - WT;
  const bathroomOuterWallY = WT + gap;
  initialObjects.push(
    createObject(
      "wall",
      bathroomOuterWallX,
      bathroomOuterWallY,
      bathroomWidthInner + WT,
      WT,
      { label: "Стена ванной (верх)" },
    ),
  );
  initialObjects.push(
    createObject(
      "wall",
      bathroomOuterWallX,
      bathroomOuterWallY + WT,
      WT,
      bathroomDepthInner,
      { label: "Стена ванной (лево)" },
    ),
  );
  const bathroomBottomWallDoorOpening = 0.75;
  const bathroomBottomWallSegment1Length =
    (bathroomWidthInner + WT - bathroomBottomWallDoorOpening) / 2;
  initialObjects.push(
    createObject(
      "wall",
      bathroomOuterWallX,
      bathroomOuterWallY + WT + bathroomDepthInner,
      bathroomBottomWallSegment1Length,
      WT,
      { label: "Стена ванной (низ1)" },
    ),
  );
  initialObjects.push(
    createObject(
      "wall",
      bathroomOuterWallX +
        bathroomBottomWallSegment1Length +
        bathroomBottomWallDoorOpening,
      bathroomOuterWallY + WT + bathroomDepthInner,
      bathroomBottomWallSegment1Length,
      WT,
      { label: "Стена ванной (низ2)" },
    ),
  );
  const bathroomDoorWidth = 0.7;
  initialObjects.push(
    createObject(
      "door",
      bathroomOuterWallX + bathroomBottomWallSegment1Length,
      bathroomOuterWallY + WT + bathroomDepthInner,
      bathroomDoorWidth,
      WT,
      {
        hingeSide: "right",
        openingDirection: "inward",
        isOpen: false,
        openingAngle: 0,
        label: "Дверь в ванную",
      },
    ),
  );
  // --- Bathroom Fixtures ---
  // <<<--- ИСПРАВЛЕННОЕ МЕСТОПОЛОЖЕНИЕ const ---<<<
  const toiletWidth = 0.4;
  const toiletDepth = 0.7;
  initialObjects.push(
    createObject(
      "toilet",
      bathroomOuterWallX + WT + gap,
      bathroomOuterWallY + WT + gap,
      toiletWidth,
      toiletDepth,
      { label: "Туалет" },
    ),
  );

  return initialObjects;
};


const useObjectManagement = (
  setObjects,
  selectedObjectIds,
  lockedObjectIds,
  modifierKeys,
  objectsRef // Используем objectsRef напрямую
) => {
  const addObject = useCallback(
    (type, x, y, width, height, data) => {
      const newObject = createObject(type, x, y, width, height, data);
      setObjects((prev) => [...prev, newObject], true);
      return newObject;
    },
    [setObjects],
  );

  const updateObject = useCallback(
    (id, updates) => {
      setObjects(
        (prev) =>
          prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)),
        true,
      );
    },
    [setObjects],
  );

  const deleteObjectById = useCallback(
    (id) => {
      setObjects((prev) =>
        prev.filter(
          (obj) => obj.id !== id && obj.parentId !== id
        ), true);
    },
    [setObjects],
  );

  const updateSelectedObjectProperty = useCallback(
    (property, value) => {
      if (selectedObjectIds.length !== 1) return;
      const targetId = selectedObjectIds[0];
      
      if (!objectsRef || !objectsRef.current) {
        console.error("useObjectManagement: objectsRef or objectsRef.current is undefined.");
        return;
      }
      const currentObjects = objectsRef.current; 

      const objToUpdate = currentObjects.find(obj => obj.id === targetId);

      if (!objToUpdate) return;

      const objectIsLocked = lockedObjectIds.includes(targetId);
      if (objectIsLocked && !modifierKeys.shift) {
        toast.warn(`Объект ${objToUpdate.label || objToUpdate.id} заблокирован.`);
        return;
      }

      let parsedValue = value;
      if (typeof objToUpdate[property] === 'number' && property !== 'rotation') { 
          const numVal = parseFloat(value);
          if (isNaN(numVal)) {
              toast.error(`Неверный формат числа для ${property}: ${value}`);
              return;
          }
          parsedValue = numVal;
      } else if (typeof objToUpdate[property] === 'boolean') {
          parsedValue = typeof value === 'string' ? value.toLowerCase() === "true" : Boolean(value);
      }


      if (objToUpdate.type === "door" && (property === "isOpen" || property === "openingAngle")) {
        let newIsOpen = objToUpdate.isOpen;
        let newOpeningAngle = objToUpdate.openingAngle; 

        if (property === "isOpen") {
          newIsOpen = parsedValue;
          if (newIsOpen) { 
            newOpeningAngle = (objToUpdate.openingAngle > 0) ? objToUpdate.openingAngle : 90; 
          } else { 
            newOpeningAngle = 0;
          }
        } else { 
          const potentialAngle = parseFloat(parsedValue); // Убедимся, что это число
          if (isNaN(potentialAngle)) {
              toast.error(`Неверный угол: ${value}`);
              return;
          }
          newOpeningAngle = potentialAngle;
          if (newOpeningAngle <= 0) {
            newIsOpen = false;
            newOpeningAngle = 0; 
          } else {
            newIsOpen = true;
          }
        }
        
        let finalAngle = newOpeningAngle;
        let finalIsOpen = newIsOpen;

        if (finalIsOpen && finalAngle > 0) {
          const MAX_DOOR_ANGLE = 170; 
          const MIN_DOOR_ANGLE_STEP = 1; 
          let targetAngle = Math.min(Math.max(finalAngle, 0), MAX_DOOR_ANGLE);
          
          let resolvedAngle = 0; 
          let canOpenAtAll = false;

          for (let angleCheck = targetAngle; angleCheck >= MIN_DOOR_ANGLE_STEP; angleCheck -= 1) { 
            if (!isDoorLeafColliding(objToUpdate, angleCheck, currentObjects)) {
              resolvedAngle = angleCheck;
              canOpenAtAll = true;
              break;
            }
          }
          
          if (canOpenAtAll) {
            finalAngle = resolvedAngle;
             if (targetAngle > finalAngle && property === "openingAngle") {
                 toast.info(`Дверь '${objToUpdate.label || targetId}' открыта до ${finalAngle.toFixed(0)}° из-за препятствия.`); 
             } else if (targetAngle > finalAngle && property === "isOpen") {
                 toast.info(`Дверь '${objToUpdate.label || targetId}' открыта до ${finalAngle.toFixed(0)}° из-за препятствия.`);
             }
          } else { 
            const msg = `Дверь '${objToUpdate.label || targetId}' не может открыться (${targetAngle.toFixed(0)}°) из-за столкновения.`;
            console.warn(msg);
            toast.warn(msg); 
            finalAngle = 0;
            finalIsOpen = false;
          }
        } else { 
            finalAngle = 0;
            finalIsOpen = false;
        }
        
        if (objToUpdate.isOpen !== finalIsOpen || objToUpdate.openingAngle !== finalAngle) {
            setObjects(
              (prev) =>
                prev.map((obj) =>
                  obj.id === targetId ? { ...obj, isOpen: finalIsOpen, openingAngle: finalAngle } : obj,
                ),
              true,
            );
        }
        return; 
      }

      if (objToUpdate[property] !== parsedValue) {
          setObjects(
            (prev) =>
              prev.map((obj) =>
                obj.id === targetId ? { ...obj, [property]: parsedValue } : obj,
              ),
            true,
          );
      }
    },
    [selectedObjectIds, objectsRef, lockedObjectIds, modifierKeys.shift, setObjects], 
  );

  const addAndSelectObject = useCallback(
    (type, worldX, worldY) => {
      const defaultSize = defaultObjectSizes[type] || { width: 1, height: 1 };
      const newObject = createObject(
        type,
        worldX - defaultSize.width / 2,
        worldY - defaultSize.height / 2,
        defaultSize.width,
        defaultSize.height,
      );
      setObjects((prev) => [...prev, newObject], true);
      return newObject.id;
    },
    [setObjects],
  );

  return {
    createObject,
    getInitialObjects,
    addObject,
    updateObject,
    deleteObjectById,
    updateSelectedObjectProperty,
    addAndSelectObject,
    defaultObjectSizes,
  };
};

export default useObjectManagement;