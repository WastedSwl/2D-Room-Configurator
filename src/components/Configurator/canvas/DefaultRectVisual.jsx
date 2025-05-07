// src/components/Configurator/canvas/DefaultRectVisual.jsx
import React from "react";
import { objectColors } from "../configuratorConstants";

const DefaultRectVisual = ({ obj, scale, commonProps }) => {
  const widthScaled = Math.max(1, obj.width * scale);
  const heightScaled = Math.max(1, obj.height * scale);

  return (
    <rect
      x="0"
      y="0"
      width={widthScaled}
      height={heightScaled}
      fill={objectColors[obj.type] || objectColors.default}
      {...commonProps}
    />
  );
};

export default React.memo(DefaultRectVisual);
