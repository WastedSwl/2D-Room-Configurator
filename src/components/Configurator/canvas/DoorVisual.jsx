import React from "react";
import {
  objectColors,
  DOOR_LEAF_VISUAL_THICKNESS_M,
} from "../configuratorConstants";

const DoorVisual = ({ obj, scale, commonProps, isSelected, isLocked }) => {
  const frameW_s = obj.width * scale;
  const frameT_s = obj.height * scale; // Wall thickness
  const leafT_s = DOOR_LEAF_VISUAL_THICKNESS_M * scale;

  const pivotX_s = obj.hingeSide === "left" ? 0 : frameW_s;
  const pivotY_s = frameT_s / 2;

  let finalRotationForSVG = 0;
  if (obj.isOpen && obj.openingAngle !== 0) {
    let angle = obj.openingAngle;
    if (obj.openingDirection === "outward") angle *= -1;
    finalRotationForSVG = obj.hingeSide === "left" ? angle : -angle;
  }

  const arcRadius = frameW_s;
  const arcAngleRad = finalRotationForSVG * (Math.PI / 180);
  const arcStartX = pivotX_s;
  const arcStartY = pivotY_s;
  const arcEndX = pivotX_s + arcRadius * Math.cos(arcAngleRad);
  const arcEndY = pivotY_s + arcRadius * Math.sin(arcAngleRad);
  const arcSweepFlag = finalRotationForSVG >= 0 ? 1 : 0;

  return (
    <>
      <rect
        x="0"
        y="0"
        width={frameW_s}
        height={frameT_s}
        fill={objectColors.door}
        {...commonProps}
      />
      <g transform={`rotate(${finalRotationForSVG}, ${pivotX_s}, ${pivotY_s})`}>
        <rect
          x="0"
          y={pivotY_s - leafT_s / 2}
          width={frameW_s}
          height={leafT_s}
          fill={
            isSelected && !isLocked ? "#B59460" : objectColors.door || "#A07D50"
          }
          stroke={commonProps.stroke}
          strokeWidth={commonProps.strokeWidth * 0.7}
        />
      </g>
      {obj.isOpen && obj.openingAngle > 0 && (
        <path
          d={`M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 ${arcSweepFlag} ${arcEndX} ${arcEndY}`}
          fill="none"
          stroke={commonProps.stroke}
          strokeWidth={commonProps.strokeWidth * 0.4}
          strokeDasharray="3,2"
        />
      )}
    </>
  );
};
export default React.memo(DoorVisual);
