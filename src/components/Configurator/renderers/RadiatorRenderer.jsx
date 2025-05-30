import React from "react";
import { SELECTED_ELEMENT_COLOR, defaultObjectSizes, OBJECT_TYPES, DRAWING_RADIATOR_FILL_COLOR, DRAWING_RADIATOR_STROKE_COLOR } from "../configuratorConstants";
// import { ReactComponent as RadiatorSvg } from '../../Assets/radiator.svg'; // Если есть SVG

const RadiatorRenderer = ({
  element,
  scale,
  isSelected,
  wallThickness, // полная толщина стены сегмента
}) => {
  const radiatorDefaults = defaultObjectSizes[OBJECT_TYPES.RADIATOR];
  const elementVisualWidthM = element.width || radiatorDefaults.width;
  const elementVisualHeightM = element.height || radiatorDefaults.height;
  const elementDepthM = element.depth || radiatorDefaults.depth;

  const elementVisualWidthPx = elementVisualWidthM * scale;
  const elementVisualHeightPx = elementVisualHeightM * scale;
  const elementDepthPx = elementDepthM * scale;
  const wallThicknessPx = wallThickness * scale;

  const yPositionOfElementCenterByDepth = -(wallThicknessPx / 2) - (elementDepthPx / 2);

  // Если нет SVG, рисуем прямоугольник как заглушку
  // const hasSvg = false; // Поставьте true, если используете RadiatorSvg

  const rectStyle = {
    fill: isSelected ? "rgba(0, 123, 255, 0.2)" : DRAWING_RADIATOR_FILL_COLOR,
    stroke: isSelected ? SELECTED_ELEMENT_COLOR : DRAWING_RADIATOR_STROKE_COLOR,
    strokeWidth: isSelected ? 1.5 / (scale / 50) : 1 / (scale / 50),
  };

  return (
    <g transform={`translate(0, ${yPositionOfElementCenterByDepth})`}>
      {/* {hasSvg ? (
        <RadiatorSvg
          width={elementVisualWidthPx}
          height={elementVisualHeightPx}
          x={-elementVisualWidthPx / 2}
          y={-elementVisualHeightPx / 2}
          preserveAspectRatio="xMidYMid meet"
          style={rectStyle} // или свои стили для SVG
        />
      ) : ( */}
      <rect
        x={-elementVisualWidthPx / 2}
        y={-elementVisualHeightPx / 2}
        width={elementVisualWidthPx}
        height={elementVisualHeightPx}
        style={rectStyle}
      />
      {/* )} */}
    </g>
  );
};

export default React.memo(RadiatorRenderer);