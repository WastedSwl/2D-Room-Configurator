// src/components/Configurator/hooks/useObjectManagement.js
import { useCallback } from "react";
import {
  WALL_THICKNESS_M,
  DOOR_WIDTH_M as APP_DOOR_WIDTH_M,
  WINDOW_WIDTH_M as APP_WINDOW_WIDTH_M,
} from "../appConstants";
import { defaultObjectSizes } from "../configuratorConstants";

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
  objectIdCounter = 0;
  const initialObjects = [];
  const WT = WALL_THICKNESS_M;

  const houseWidthOuter = 6;
  const houseDepthOuter = 3.5;

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

  const mainDoorWidth = APP_DOOR_WIDTH_M;
  initialObjects.push(
    createObject("door", 1.0, houseDepthOuter - WT, mainDoorWidth, WT, {
      hingeSide: "left",
      openingDirection: "inward",
      isOpen: false,
      label: "Входная дверь",
    }),
  );

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

  const gap = 0.1;
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
        label: "Дверь в ванную",
      },
    ),
  );
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
) => {
  const addObject = useCallback(
    (type, x, y, width, height, data) => {
      const newObject = createObject(type, x, y, width, height, data);
      setObjects((prev) => [...prev, newObject], true);
      return newObject; // Return for potential immediate selection
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
      setObjects((prev) => prev.filter((obj) => obj.id !== id), true);
    },
    [setObjects],
  );

  const updateSelectedObjectProperty = useCallback(
    (property, value) => {
      if (selectedObjectIds.length !== 1) return;
      const targetId = selectedObjectIds[0];

      const objectIsLocked = lockedObjectIds.includes(targetId);
      if (objectIsLocked && !modifierKeys.shift) {
        return;
      }

      const numValue = parseFloat(value);
      let parsedValue = isNaN(numValue) ? value : numValue;
      if (property === "isOpen") {
        parsedValue = value === "true" || value === true;
      }

      setObjects(
        (prev) =>
          prev.map((obj) =>
            obj.id === targetId ? { ...obj, [property]: parsedValue } : obj,
          ),
        true,
      );
    },
    [selectedObjectIds, lockedObjectIds, modifierKeys.shift, setObjects],
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
      return newObject.id; // Return ID for selection
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
    defaultObjectSizes, // Export for use in addingObjectType logic
  };
};

export default useObjectManagement;
