// src/components/Configurator/renderers/DoorRenderer.jsx
import React from "react";
import { DOOR_COLOR, ELEMENT_STROKE_COLOR } from "../configuratorConstants";

const DoorRenderer = ({
  element,
  scale,
  wallThickness,
  isSelected,
  onSelect,
}) => {
  const {
    width,
    isOpen,
    openingAngle = 90,
    hingeSide = "left",
    openingDirection = "inward",
  } = element;

  const doorWidthPx = width * scale;
  const doorThicknessPx = Math.max(1, 0.05 * scale);
  const wallThicknessPx = wallThickness * scale;

  let doorRotation = 0;
  const hingeXLocal = hingeSide === "left" ? 0 : doorWidthPx;
  const doorSlabTransformOrigin = `${hingeXLocal}px ${doorThicknessPx / 2}px`;

  const openDirFactor = openingDirection === "inward" ? 1 : -1;
  const rotationDirFactor = hingeSide === "left" ? 1 : -1;

  if (isOpen) {
     doorRotation = openingAngle * openDirFactor * rotationDirFactor;
  } else {
      doorRotation = 0;
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
        onSelect(element.id);
    }
  };

   const doorFillColor = isSelected ? "lightblue" : DOOR_COLOR;


  return (
    <g onClick={handleClick} className="cursor-pointer">
      <line
        x1={0}
        y1={-wallThicknessPx / 2}
        x2={0}
        y2={wallThicknessPx / 2}
        stroke={ELEMENT_STROKE_COLOR}
        strokeWidth={Math.max(0.5, 0.02 * scale)}
      />
      <line
        x1={doorWidthPx}
        y1={-wallThicknessPx / 2}
        x2={doorWidthPx}
        y2={wallThicknessPx / 2}
        stroke={ELEMENT_STROKE_COLOR}
        strokeWidth={Math.max(0.5, 0.02 * scale)}
      />

      <g
        style={{
          transform: `rotate(${doorRotation}deg)`,
          transformOrigin: doorSlabTransformOrigin,
          transition: "transform 0.3s ease",
        }}
      >
        <rect
          x={0}
          y={-doorThicknessPx / 2}
          width={doorWidthPx}
          height={doorThicknessPx}
          fill={doorFillColor}
          stroke={ELEMENT_STROKE_COLOR}
          strokeWidth={Math.max(0.5, 0.01 * scale)}
        />
      </g>

      {isOpen && (
        <path
          d={`M ${hingeXLocal} 0 A ${doorWidthPx} ${doorWidthPx} 0 0 ${
            rotationDirFactor * openDirFactor > 0 ? 1 : 0
          } ${
            hingeXLocal + doorWidthPx * Math.cos((doorRotation * Math.PI) / 180)
          } ${doorWidthPx * Math.sin((doorRotation * Math.PI) / 180)}`}
          stroke={ELEMENT_STROKE_COLOR}
          strokeWidth={Math.max(0.5, 0.005 * scale)}
          fill="none"
          strokeDasharray="2,2"
          opacity="1"
        />
      )}
    </g>
  );
};

export default React.memo(DoorRenderer);