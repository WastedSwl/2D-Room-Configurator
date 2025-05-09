import React from "react";
import {
    ARCH_BLACK,
    ARCH_STROKE_MEDIUM,
    ARCH_STROKE_THIN,
    ARCH_WHITE,
    ARCH_SELECT_BLUE,
    ARCH_OUTLET_FILL,
    ARCH_OUTLET_STROKE,
} from "../configuratorConstants";

const OutletVisual = ({
  obj,
  scale,
  commonProps,
  rotationCenterXScaled,
  rotationCenterYScaled,
  isSelected
}) => {

  const baseSize = Math.max(1, obj.width * scale);
  const baseStroke = ARCH_OUTLET_STROKE || ARCH_BLACK;
  const strokeWidth = isSelected ? ARCH_STROKE_MEDIUM : ARCH_STROKE_THIN;
  const size = Math.max(0.5, baseSize - strokeWidth);

  const x = rotationCenterXScaled - size / 2;
  const y = rotationCenterYScaled - size / 2;

  return (
    <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill={ARCH_OUTLET_FILL}
        stroke={isSelected ? ARCH_SELECT_BLUE : baseStroke}
        strokeWidth={strokeWidth}
        style={commonProps.style}
        data-object-id={commonProps['data-object-id']}
    />
  );
};

export default React.memo(OutletVisual);