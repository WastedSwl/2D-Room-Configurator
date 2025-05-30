import React from "react";
import {
  GRID_CELL_SIZE_M,
  OBJECT_TYPES,
  WALL_THICKNESS_M_RENDER,
  DRAWING_WALL_FILL_COLOR,
  DRAWING_WALL_STROKE_COLOR,
  DRAWING_DOOR_FILL_COLOR,
  DRAWING_WINDOW_FRAME_COLOR,
  DRAWING_PANORAMIC_WINDOW_FILL_COLOR,
  // Добавьте другие цвета элементов, если они есть в predefinedElements
} from "../configuratorConstants";

const PREVIEW_SCALE_FACTOR = 15; // Насколько уменьшить превью относительно реального размера
const PREVIEW_PADDING = 10;      // Отступы вокруг превью

const ModulePreviewRenderer = ({ template }) => {
  if (!template) return null;

  const { cellsWide, cellsLong, internalWallSegments = {}, predefinedElements = [] } = template;

  const moduleWidthM = cellsWide * GRID_CELL_SIZE_M;
  const moduleHeightM = cellsLong * GRID_CELL_SIZE_M;

  const scaledModuleWidth = moduleWidthM * PREVIEW_SCALE_FACTOR;
  const scaledModuleHeight = moduleHeightM * PREVIEW_SCALE_FACTOR;

  const svgWidth = scaledModuleWidth + PREVIEW_PADDING * 2;
  const svgHeight = scaledModuleHeight + PREVIEW_PADDING * 2;

  const wallThicknessPx = WALL_THICKNESS_M_RENDER * PREVIEW_SCALE_FACTOR;
  const cellSizePx = GRID_CELL_SIZE_M * PREVIEW_SCALE_FACTOR;

  const renderWallSegment = (key, segmentData, isInternal) => {
    const [coords, orientation] = key.split("_");
    const [cxStr, cyStr] = coords.split(",");
    const cellX = parseInt(cxStr, 10);
    const cellY = parseInt(cyStr, 10);

    let x, y, w, h;
    const thickness = (segmentData?.thickness || WALL_THICKNESS_M_RENDER) * PREVIEW_SCALE_FACTOR;

    if (orientation === "h") {
      x = cellX * cellSizePx;
      y = cellY * cellSizePx - thickness / 2;
      w = cellSizePx;
      h = thickness;
    } else { // 'v'
      x = cellX * cellSizePx - thickness / 2;
      y = cellY * cellSizePx;
      w = thickness;
      h = cellSizePx;
    }
    return (
      <rect
        key={`wall-${key}`}
        x={x}
        y={y}
        width={w}
        height={h}
        fill={DRAWING_WALL_FILL_COLOR}
        stroke={DRAWING_WALL_STROKE_COLOR}
        strokeWidth={0.5}
      />
    );
  };

  const renderElement = (elementConfig, parentSegmentKey, parentOrientation) => {
    const { type, properties = {} } = elementConfig;
    const elementWidthM = properties.width || (type === OBJECT_TYPES.WINDOW || type === OBJECT_TYPES.PANORAMIC_WINDOW ? GRID_CELL_SIZE_M : 0.9); // Упрощенная ширина
    const elementWidthPx = elementWidthM * PREVIEW_SCALE_FACTOR;
    const positionOnSegment = properties.positionOnSegment || 0.5;
    
    let elX, elY, elW, elH;
    const segmentLengthPx = cellSizePx;
    const elementOffsetPx = segmentLengthPx * positionOnSegment - elementWidthPx / 2;

    // Упрощенные размеры для превью
    const doorHeightPx = wallThicknessPx * 0.6;
    const windowHeightPx = wallThicknessPx * 0.5;

    let fill = "#888";
    switch (type) {
      case OBJECT_TYPES.DOOR:
        fill = DRAWING_DOOR_FILL_COLOR;
        elW = elementWidthPx;
        elH = doorHeightPx;
        break;
      case OBJECT_TYPES.WINDOW:
        fill = DRAWING_WINDOW_FRAME_COLOR;
        elW = elementWidthPx;
        elH = windowHeightPx;
        break;
      case OBJECT_TYPES.PANORAMIC_WINDOW:
        fill = DRAWING_PANORAMIC_WINDOW_FILL_COLOR;
        elW = elementWidthPx;
        elH = windowHeightPx * 1.5;
        break;
      default: // Розетки, светильники и т.д. - рисуем маленькими квадратами
        fill = "#aaa";
        elW = cellSizePx * 0.1;
        elH = cellSizePx * 0.1;
        break;
    }
    
    // Позиционирование элемента относительно начала сегмента стены
    // Сегмент стены рисуется от (0,0) до (segmentLengthPx, 0) в своей локальной системе координат
    elX = elementOffsetPx;
    elY = -elH / 2; // Центрируем по толщине стены

    return (
      <rect
        key={elementConfig.type + "_" + parentSegmentKey + "_" + Math.random()}
        x={elX}
        y={elY}
        width={elW}
        height={elH}
        fill={fill}
        stroke="#555"
        strokeWidth={0.3}
      />
    );
  };


  const perimeterWallSegments = [];
  for (let i = 0; i < cellsWide; i++) {
    perimeterWallSegments.push(renderWallSegment(`${i},0_h`, {}, false));
    perimeterWallSegments.push(renderWallSegment(`${i},${cellsLong}_h`, {}, false));
  }
  for (let j = 0; j < cellsLong; j++) {
    perimeterWallSegments.push(renderWallSegment(`0,${j}_v`, {}, false));
    perimeterWallSegments.push(renderWallSegment(`${cellsWide},${j}_v`, {}, false));
  }

  const internalWallsRendered = Object.entries(internalWallSegments).map(
    ([key, data]) => renderWallSegment(key, data, true)
  );
  
  const elementsRendered = [];
  predefinedElements.forEach(elConfig => {
    const [coords, orientation] = elConfig.segmentKey.split("_");
    const [cxStr, cyStr] = coords.split(",");
    const cellX = parseInt(cxStr, 10);
    const cellY = parseInt(cyStr, 10);

    let groupTx, groupTy, groupAngle;
    if (orientation === "h") {
      groupTx = cellX * cellSizePx;
      groupTy = cellY * cellSizePx;
      groupAngle = 0;
    } else { // 'v'
      groupTx = cellX * cellSizePx;
      groupTy = cellY * cellSizePx;
      groupAngle = 90;
    }
    elementsRendered.push(
      <g key={`elgroup-${elConfig.segmentKey}-${Math.random()}`} transform={`translate(${groupTx}, ${groupTy}) rotate(${groupAngle})`}>
        {renderElement(elConfig, elConfig.segmentKey, orientation)}
      </g>
    );
  });


  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className="bg-gray-700 rounded"
    >
      <g transform={`translate(${PREVIEW_PADDING}, ${PREVIEW_PADDING})`}>
        <rect
            x={-1} y={-1} // небольшой запас для обводки
            width={scaledModuleWidth+2}
            height={scaledModuleHeight+2}
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.5}
        />
        {perimeterWallSegments}
        {internalWallsRendered}
        {elementsRendered}
      </g>
    </svg>
  );
};

export default ModulePreviewRenderer;