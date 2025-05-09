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

  const pivotX_s = obj.hingeSide === "left" ? 0 : frameW_s;
  const pivotY_s = frameT_s / 2;

  let finalRotationForSVG = 0;
  if (obj.isOpen && obj.openingAngle !== 0) {
    let angle = obj.openingAngle;
    if (obj.openingDirection === "outward") angle *= -1;
    finalRotationForSVG = (obj.hingeSide === "left" ? angle : -angle);
  }

  const arcRadius = frameW_s;
  const arcAngleRad = finalRotationForSVG * (Math.PI / 180);
  const arcStartX = pivotX_s; 
  const arcStartY = pivotY_s;
  const arcEndX = pivotX_s + (obj.hingeSide === 'left' ? arcRadius * Math.cos(arcAngleRad) : -arcRadius * Math.cos(arcAngleRad));
  const arcEndY = pivotY_s + (obj.hingeSide === 'left' ? arcRadius * Math.sin(arcAngleRad) : -arcRadius * Math.sin(arcAngleRad));
  const arcSweepFlag = finalRotationForSVG >= 0 ? 1 : 0;

  const leafStrokeWidth = isSelected ? ARCH_STROKE_MEDIUM : ARCH_STROKE_THIN;
  const arcStrokeWidth = isSelected ? ARCH_STROKE_THIN : ARCH_STROKE_VERY_THIN;
  const handleStrokeWidth = ARCH_STROKE_VERY_THIN;

  const handleSize = Math.max(3, 0.05 * scale); 
  const handleOffset = handleSize * 0.5; 

  const handleLocalX = (obj.hingeSide === 'left') 
                       ? frameW_s - handleOffset - handleSize/2 
                       : handleOffset + handleSize/2;          
  const handleLocalY = pivotY_s; 

  const handlePath = `M ${handleLocalX - handleSize/2} ${handleLocalY - handleSize/2} L ${handleLocalX + handleSize/2} ${handleLocalY - handleSize/2} L ${handleLocalX + handleSize/2} ${handleLocalY + handleSize/2}`;

  return (
    <>
      <g transform={`rotate(${finalRotationForSVG}, ${pivotX_s}, ${pivotY_s})`}>
        <rect
          x={0} 
          y={pivotY_s - leafT_s / 2} 
          width={frameW_s} 
          height={leafT_s}
          fill={ARCH_WHITE} 
          stroke={isSelected ? ARCH_SELECT_BLUE : ARCH_BLACK}
          strokeWidth={leafStrokeWidth}
        />
         <path 
             d={handlePath}
             stroke={isSelected ? ARCH_SELECT_BLUE : ARCH_MID_GRAY}
             strokeWidth={handleStrokeWidth}
             fill="none"
         />
      </g>

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
    </>
  );
};
export default React.memo(DoorVisual);