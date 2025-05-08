// src/components/Configurator/canvas/ObjectVisual.jsx
import React from "react";
import SelectionExtras from "./SelectionExtras";
import DoorVisual from "./DoorVisual";
import WindowVisual from "./WindowVisual"; // <--- Добавить импорт
import OutletVisual from "./OutletVisual"; // <--- Добавить импорт
import DefaultRectVisual from "./DefaultRectVisual"; // <--- Добавить импорт
import MB20KVisual from "../moduleVisuals/MB20KVisual";
import MB20Visual from "../moduleVisuals/MB20Visual";
import MB20_25Visual from "../moduleVisuals/MB20_25Visual";

import {
  objectColors,
  OVERLAP_HIGHLIGHT_COLOR,
  LOCKED_OBJECT_STROKE_COLOR,
  INITIAL_PPM,
} from "../configuratorConstants";

const ObjectVisual = ({
  obj,
  scale,
  isSelected,
  isLocked,
  isOverlapping,
  modifierKeys,
  onMouseDown,
  onResizeHandleMouseDown,
  draggingState,
  resizingState,
}) => {
  const rotationCenterXScaled = (obj.width * scale) / 2;
  const rotationCenterYScaled = (obj.height * scale) / 2;

  let strokeColor = objectColors[obj.type]
    ? objectColors[obj.type] === "lightgray"
      ? "#555"
      : "black"
    : "black";
  if (obj.type === "wall") strokeColor = "#666";
  if (isLocked) strokeColor = LOCKED_OBJECT_STROKE_COLOR;
  else if (isSelected) strokeColor = "blue";

  const baseStrokeWidthUnscaled = 1;
  const selectedStrokeWidthUnscaled = 2;
  const baseStrokeWidth = Math.max(
    0.2,
    baseStrokeWidthUnscaled / (scale / INITIAL_PPM),
  );
  const selectedStrokeWidth = Math.max(
    0.5,
    selectedStrokeWidthUnscaled / (scale / INITIAL_PPM),
  );

  const commonProps = {
    stroke: strokeColor,
    strokeWidth:
      isSelected && !isLocked ? selectedStrokeWidth : baseStrokeWidth,
    style: {
      cursor:
        isLocked && !modifierKeys.shift && !isSelected
          ? "default"
          : draggingState?.initialPositions?.find((p) => p.id === obj.id) ||
              resizingState?.objectId === obj.id
            ? "grabbing"
            : "grab",
    },
    "data-object-id": obj.id,
  };

  const groupTransform = `translate(${obj.x * scale}, ${obj.y * scale}) rotate(${obj.rotation || 0}, ${rotationCenterXScaled}, ${rotationCenterYScaled})`;

  let specificVisual;
  if (obj.type === "door") {
    specificVisual = (
      <DoorVisual
        obj={obj}
        scale={scale}
        commonProps={commonProps}
        isSelected={isSelected}
        isLocked={isLocked}
      />
    );
  } else if (obj.type === "window") {
    specificVisual = (
      <WindowVisual obj={obj} scale={scale} commonProps={commonProps} />
    );
  } else if (obj.type === "outlet") {
    // rotationCenterXScaled и rotationCenterYScaled передаются, так как outlet рисуется от центра группы
    specificVisual = (
      <OutletVisual
        obj={obj}
        scale={scale}
        commonProps={commonProps}
        rotationCenterXScaled={rotationCenterXScaled}
        rotationCenterYScaled={rotationCenterYScaled}
      />
    );
  } else if (obj.type === "module" && obj.corridor) {
    specificVisual = (
      <MB20KVisual width={obj.width} height={obj.height} label={obj.label || "Nr 1 MB20K"} />
    );
  } else if (obj.type === "module" && obj.bathroom && obj.shower) {
    // specificVisual = <MB20_26Visual width={obj.width} height={obj.height} label={obj.label || "Nr 1 MB20-26"} />;
    specificVisual = (
      <MB20_25Visual width={obj.width} height={obj.height} label={obj.label || "Nr 1 MB20-26"} />
    ); // временно, если нет отдельного SVG
  } else if (obj.type === "module" && obj.bathroom) {
    specificVisual = (
      <MB20_25Visual width={obj.width} height={obj.height} label={obj.label || "Nr 1 MB20-25"} />
    );
  } else if (obj.type === "module" && !obj.corridor && !obj.bathroom && !obj.shower) {
    // Если это стандартный модуль без особенностей — просто прямоугольник
    specificVisual = (
      <rect
        x={0}
        y={0}
        width={obj.width * scale}
        height={obj.height * scale}
        fill="#e0e0e0"
        stroke="#888"
        strokeWidth={2 / scale}
        rx={scale * 0.1}
      />
    );
  } else if (obj.type === "module") {
    specificVisual = (
      <MB20Visual width={obj.width} height={obj.height} label={obj.label || "Nr 1 MB20"} />
    );
  } else {
    specificVisual = (
      <DefaultRectVisual obj={obj} scale={scale} commonProps={commonProps} />
    );
  }

  const canInteractWithHandles = !isLocked || modifierKeys.shift;

  return (
    <g transform={groupTransform} onMouseDown={(e) => onMouseDown(e, obj.id)}>
      {specificVisual}
      {isOverlapping && !isLocked && (
        <rect
          x="0"
          y="0"
          width={Math.max(1, obj.width * scale)}
          height={Math.max(1, obj.height * scale)}
          fill={OVERLAP_HIGHLIGHT_COLOR}
          stroke="red"
          strokeWidth={commonProps.strokeWidth * 0.5}
          pointerEvents="none"
        />
      )}
      {isSelected && !isLocked && (
        <SelectionExtras
          obj={obj}
          scale={scale}
          canInteractWithHandles={canInteractWithHandles}
          onResizeHandleMouseDown={onResizeHandleMouseDown}
        />
      )}
      {obj.label && isSelected && !isLocked && (
        <text
          x={(obj.width * scale) / 2}
          y={obj.height * scale + 12 / (scale / INITIAL_PPM)}
          fontSize={`${10 / (scale / INITIAL_PPM)}px`}
          textAnchor="middle"
          fill="#333"
          style={{ pointerEvents: "none" }}
        >
          {obj.label}
        </text>
      )}
    </g>
  );
};
export default React.memo(ObjectVisual);
