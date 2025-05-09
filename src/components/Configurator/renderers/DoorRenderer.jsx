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
  const doorThicknessPx = Math.max(1, 0.05 * scale); // Thickness of the door slab itself
  const wallThicknessPx = wallThickness * scale; // Thickness of the wall it's in

  let doorRotation = 0;
  // hingeXLocal is the x-coordinate of the hinge within the door's own local space (0 to doorWidthPx).
  // If hinge is left, pivot is at x=0. If hinge is right, pivot is at x=doorWidthPx.
  const hingeXLocal = hingeSide === "left" ? 0 : doorWidthPx;
  const doorGroupTransformOrigin = `${hingeXLocal}px 0px`; // Pivot around the hinge point on the wall centerline

  const openDirFactor = openingDirection === "inward" ? 1 : -1;
  const rotationDirFactor = hingeSide === "left" ? 1 : -1; // For left hinge, positive rotation opens counter-clockwise. For right, positive rotation opens clockwise.

  if (isOpen) {
    doorRotation = openingAngle * openDirFactor * rotationDirFactor;
  }

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(element.id);
  };

  return (
    <g onClick={handleClick} className="cursor-pointer">
      {/* Door Frame/Gap lines at the edges of the door opening */}
      <line
        x1={0} // Start of door opening
        y1={-wallThicknessPx / 2}
        x2={0}
        y2={wallThicknessPx / 2}
        stroke={ELEMENT_STROKE_COLOR}
        strokeWidth={Math.max(1, 0.02 * scale)}
      />
      <line
        x1={doorWidthPx} // End of door opening
        y1={-wallThicknessPx / 2}
        x2={doorWidthPx}
        y2={wallThicknessPx / 2}
        stroke={ELEMENT_STROKE_COLOR}
        strokeWidth={Math.max(1, 0.02 * scale)}
      />

      {/* Door Slab Group - this group is rotated */}
      <g
        style={{
          transform: `rotate(${doorRotation}deg)`,
          transformOrigin: doorGroupTransformOrigin,
          transition: "transform 0.3s ease",
        }}
      >
        <rect
          // The door slab is always drawn from x=0 to x=doorWidthPx within this rotating group.
          // The `transformOrigin` handles whether it pivots on its left (0) or right (doorWidthPx) edge.
          x={0}
          y={-doorThicknessPx / 2} // Centered on its local Y axis (center of wall thickness)
          width={doorWidthPx}
          height={doorThicknessPx}
          fill={isSelected ? "lightblue" : DOOR_COLOR}
          stroke={ELEMENT_STROKE_COLOR}
          strokeWidth={Math.max(0.5, 0.01 * scale)}
        />
      </g>

      {/* Swing Arc (only if open) */}
      {isOpen && (
        <path
          // Arc starts at hingeXLocal (0 for left, doorWidthPx for right).
          // rx and ry are doorWidthPx.
          // large-arc-flag is 0 (we want the shorter arc for angles <= 180).
          // sweep-flag determines arc direction:
          //   - For inward left (positive rotation): sweep 1
          //   - For inward right (negative rotation): sweep 0
          //   - For outward left (negative rotation): sweep 0
          //   - For outward right (positive rotation): sweep 1
          //   This matches `rotationDirFactor * openDirFactor > 0 ? 1 : 0`
          d={`M ${hingeXLocal} 0 A ${doorWidthPx} ${doorWidthPx} 0 0 ${
            rotationDirFactor * openDirFactor > 0 ? 1 : 0
          } ${
            hingeXLocal + doorWidthPx * Math.cos((doorRotation * Math.PI) / 180)
          } ${doorWidthPx * Math.sin((doorRotation * Math.PI) / 180)}`}
          stroke={ELEMENT_STROKE_COLOR}
          strokeWidth={Math.max(0.5, 0.005 * scale)}
          fill="none"
          strokeDasharray="2,2"
        />
      )}
    </g>
  );
};

export default DoorRenderer;
