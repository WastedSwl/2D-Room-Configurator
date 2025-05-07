// src/components/Configurator/canvas/OutletVisual.jsx
import React from "react";
import { objectColors } from "../configuratorConstants";

const OutletVisual = ({
  obj,
  scale,
  commonProps,
  rotationCenterXScaled,
  rotationCenterYScaled,
}) => {
  // For outlets, width and height are typically the same (diameter of the circle)
  // The object's width is used for the radius.
  // rotationCenterXScaled and rotationCenterYScaled are already (obj.width * scale) / 2 etc.
  // so the cx and cy should be these values if the <g> transform handles the obj.x, obj.y

  const radius = Math.max(
    1,
    (obj.width * scale) / 2 - parseFloat(commonProps.strokeWidth || 0) / 2,
  );

  return (
    <circle
      cx={rotationCenterXScaled} // Center of the group, which is (width/2, height/2)
      cy={rotationCenterYScaled}
      r={radius}
      fill={objectColors[obj.type] || objectColors.default}
      {...commonProps}
    />
  );
};

export default React.memo(OutletVisual);
