// src/components/Configurator/canvas/DoorVisual.jsx
import React from "react";
import {
  ARCH_BLACK,
  ARCH_MID_GRAY,
  ARCH_WHITE,
  ARCH_STROKE_MEDIUM,
  ARCH_STROKE_THIN,
  ARCH_STROKE_VERY_THIN,
  ARCH_SELECT_BLUE,
  DOOR_LEAF_VISUAL_THICKNESS_M,
} from "../configuratorConstants";

const DoorVisual = ({ obj, scale, commonProps, isSelected }) => {
  const frameW_s = obj.width * scale;
  const frameT_s = obj.height * scale;
  const leafT_m = DOOR_LEAF_VISUAL_THICKNESS_M;
  const leafT_s = Math.max(1, leafT_m * scale);

  // Pivot point X within the local coordinate system (0 to frameW_s)
  const pivotX_s = obj.hingeSide === "left" ? 0 : frameW_s;
  // Pivot point Y is always the middle of the frame thickness
  const pivotY_s = frameT_s / 2;

  // Calculate rotation angle for SVG based on properties
  let finalRotationForSVG = 0;
  if (obj.isOpen && obj.openingAngle !== 0) {
    let angle = obj.openingAngle;
    if (obj.openingDirection === "outward") angle *= -1;
    // If hinge is right, rotation direction is reversed for the same visual effect
    finalRotationForSVG = (obj.hingeSide === "left" ? angle : -angle);
  }

  // Arc parameters calculation (dependent on pivot and rotation)
  const arcRadius = frameW_s;
  const arcAngleRad = finalRotationForSVG * (Math.PI / 180);
  // Adjust start point based on hinge side for correct arc start
  const arcStartX = pivotX_s; // Arc starts at the hinge
  const arcStartY = pivotY_s;
  // Arc end depends on pivot, angle, and hinge side
  const arcEndX = pivotX_s + (obj.hingeSide === 'left' ? arcRadius * Math.cos(arcAngleRad) : -arcRadius * Math.cos(arcAngleRad));
  const arcEndY = pivotY_s + (obj.hingeSide === 'left' ? arcRadius * Math.sin(arcAngleRad) : -arcRadius * Math.sin(arcAngleRad));
  // Sweep flag depends on rotation direction
  const arcSweepFlag = finalRotationForSVG >= 0 ? 1 : 0;

  // Define stroke widths based on selection
  const leafStrokeWidth = isSelected ? ARCH_STROKE_MEDIUM : ARCH_STROKE_THIN;
  const arcStrokeWidth = isSelected ? ARCH_STROKE_THIN : ARCH_STROKE_VERY_THIN;
  const handleStrokeWidth = ARCH_STROKE_VERY_THIN;

  // --- Handle Drawing Logic ---
  const handleSize = Math.max(3, 0.05 * scale); // Smaller handle
  const handleOffset = handleSize * 0.5; // Offset from the leaf edge

  // Position handle relative to the leaf rectangle (which always starts at x=0)
  // Handle needs to be on the opposite side from the hinge
  const handleLocalX = (obj.hingeSide === 'left') 
                       ? frameW_s - handleOffset - handleSize/2 // Near right edge of the rect
                       : handleOffset + handleSize/2;          // Near left edge of the rect
  const handleLocalY = pivotY_s; // Center of thickness

  // Simple L-shape handle path relative to handleLocalX, handleLocalY
  // Adjusted path to be centered around handleLocalX/Y
  const handlePath = `M ${handleLocalX - handleSize/2} ${handleLocalY - handleSize/2} L ${handleLocalX + handleSize/2} ${handleLocalY - handleSize/2} L ${handleLocalX + handleSize/2} ${handleLocalY + handleSize/2}`;
  // --- End Handle Drawing Logic ---

  return (
    <>
      {/* Group for the door leaf and handle, rotated around the pivot */}
      <g transform={`rotate(${finalRotationForSVG}, ${pivotX_s}, ${pivotY_s})`}>
        {/* Door Leaf Rectangle - ALWAYS drawn from x=0 */}
        <rect
          x={0} // Always start drawing rect at x=0
          y={pivotY_s - leafT_s / 2} // Center vertically
          width={frameW_s} // Full width
          height={leafT_s} // Thickness
          fill={ARCH_WHITE} 
          stroke={isSelected ? ARCH_SELECT_BLUE : ARCH_BLACK}
          strokeWidth={leafStrokeWidth}
        />
        {/* Handle Path - drawn inside the rotated group */}
         <path 
             d={handlePath}
             stroke={isSelected ? ARCH_SELECT_BLUE : ARCH_MID_GRAY}
             strokeWidth={handleStrokeWidth}
             fill="none"
         />
      </g>

      {/* Swing Arc - drawn outside the rotated group */}
      {obj.isOpen && obj.openingAngle > 0 && (
        <path
          d={`M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 ${arcSweepFlag} ${arcEndX} ${arcEndY}`}
          fill="none"
          stroke={isSelected ? ARCH_SELECT_BLUE : ARCH_MID_GRAY} 
          strokeWidth={arcStrokeWidth}
          strokeDasharray="4,2" 
          opacity={0.8} 
        />
      )}

      {/* Optional: Draw frame jambs if needed (thin lines at x=0 and x=frameW_s) */}
       {/* <line x1={0} y1={0} x2={0} y2={frameT_s} stroke={ARCH_BLACK} strokeWidth={ARCH_STROKE_THIN} /> */}
       {/* <line x1={frameW_s} y1={0} x2={frameW_s} y2={frameT_s} stroke={ARCH_BLACK} strokeWidth={ARCH_STROKE_THIN} /> */}
    </>
  );
};
export default React.memo(DoorVisual);