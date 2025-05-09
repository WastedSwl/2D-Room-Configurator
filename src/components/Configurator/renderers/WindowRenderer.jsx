// src/components/Configurator/renderers/WindowRenderer.jsx
import React from "react";
import { WINDOW_COLOR, ELEMENT_STROKE_COLOR } from "../configuratorConstants";

const WindowRenderer = ({
  element,
  scale,
  wallThickness,
  isSelected,
  onSelect,
}) => {
  const { width } = element;

  const windowWidthPx = width * scale;
  const wallThicknessPx = wallThickness * scale;
  const frameThicknessPx = Math.max(1, 0.02 * scale);
  const glassOffset = wallThicknessPx * 0.15;
  const glassLineWidth = Math.max(0.5, 0.01 * scale);

  const handleClick = (e) => {
    e.stopPropagation(); // Important to prevent wall selection
    onSelect(element.id);
  };

  return (
    <g onClick={handleClick} className="cursor-pointer">
      <line
        x1={0}
        y1={-wallThicknessPx / 2}
        x2={0}
        y2={wallThicknessPx / 2}
        stroke={ELEMENT_STROKE_COLOR}
        strokeWidth={frameThicknessPx}
      />
      <line
        x1={windowWidthPx}
        y1={-wallThicknessPx / 2}
        x2={windowWidthPx}
        y2={wallThicknessPx / 2}
        stroke={ELEMENT_STROKE_COLOR}
        strokeWidth={frameThicknessPx}
      />
      <line
        x1={0}
        y1={-glassOffset}
        x2={windowWidthPx}
        y2={-glassOffset}
        stroke={isSelected ? "lightblue" : WINDOW_COLOR}
        strokeWidth={glassLineWidth}
      />
      <line
        x1={0}
        y1={glassOffset}
        x2={windowWidthPx}
        y2={glassOffset}
        stroke={isSelected ? "lightblue" : WINDOW_COLOR}
        strokeWidth={glassLineWidth}
      />
      <line
        x1={0}
        y1={0}
        x2={windowWidthPx}
        y2={0}
        stroke={ELEMENT_STROKE_COLOR}
        strokeWidth={Math.max(0.5, 0.005 * scale)}
        opacity="0.4"
      />
    </g>
  );
};

export default WindowRenderer;
