// src/components/Configurator/canvas/WindowVisual.jsx
import React from "react";
import { objectColors } from "../configuratorConstants";

const WindowVisual = ({ obj, scale, commonProps }) => {
  const widthScaled = obj.width * scale;
  const heightScaled = obj.height * scale; // This is usually wall thickness for windows

  return (
    <>
      <rect
        x="0"
        y="0"
        width={widthScaled}
        height={heightScaled}
        fill={objectColors.window}
        {...commonProps}
      />
      {/* Central cross lines for window symbol */}
      <line
        x1={0}
        y1={heightScaled / 2}
        x2={widthScaled}
        y2={heightScaled / 2}
        stroke="#60a5fa" // A slightly darker shade for the lines
        strokeWidth={commonProps.strokeWidth * 0.7}
      />
      <line
        x1={widthScaled / 2}
        y1={0}
        x2={widthScaled / 2}
        y2={heightScaled}
        stroke="#60a5fa"
        strokeWidth={commonProps.strokeWidth * 0.7}
      />
    </>
  );
};

export default React.memo(WindowVisual);
