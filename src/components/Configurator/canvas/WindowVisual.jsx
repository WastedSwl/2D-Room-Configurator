// src/components/Configurator/canvas/WindowVisual.jsx
import React from "react";
import {
    ARCH_BLACK,
    ARCH_MID_GRAY,
    ARCH_STROKE_MEDIUM,
    ARCH_STROKE_THICK,
    ARCH_STROKE_THIN,
    ARCH_STROKE_VERY_THIN,
    ARCH_SELECT_BLUE,
    ARCH_WINDOW_FRAME_STROKE,
    ARCH_WINDOW_GLAZING_STROKE,
    INITIAL_PPM
} from "../configuratorConstants";

const WindowVisual = ({ obj, scale, commonProps, isSelected }) => {
  const widthScaled = obj.width * scale;
  const heightScaled = obj.height * scale;

  const baseFrameStrokeWidth = Math.max(0.2, ARCH_STROKE_THICK / (scale / INITIAL_PPM));
  const baseGlazingStrokeWidth = Math.max(0.1, ARCH_STROKE_THIN / (scale / INITIAL_PPM));
  const baseMullionStrokeWidth = Math.max(0.15, ARCH_STROKE_MEDIUM / (scale / INITIAL_PPM));

  const frameStrokeWidth = isSelected ? ARCH_STROKE_MEDIUM : baseFrameStrokeWidth;
  const glazingStrokeWidth = isSelected ? ARCH_STROKE_THIN : baseGlazingStrokeWidth;
  const mullionStrokeWidth = isSelected ? ARCH_STROKE_MEDIUM : baseMullionStrokeWidth;

  const numGlazingLines = 3;
  const glazingLines = [];
  const spacing = heightScaled / (numGlazingLines + 1);
  for(let i=1; i <= numGlazingLines; i++){
       glazingLines.push(
         <line key={`glaze${i}`} x1={0} y1={spacing * i} x2={widthScaled} y2={spacing * i} stroke={ARCH_WINDOW_GLAZING_STROKE} strokeWidth={glazingStrokeWidth} />
       );
  }

  return (
    <>
      <rect
        x="0"
        y="0"
        width={widthScaled}
        height={heightScaled}
        fill="none"
        stroke={isSelected ? ARCH_SELECT_BLUE : ARCH_WINDOW_FRAME_STROKE}
        strokeWidth={frameStrokeWidth}
        style={commonProps.style}
        data-object-id={commonProps['data-object-id']}
      />
      {glazingLines}
      <line
         x1={widthScaled / 2}
         y1={0}
         x2={widthScaled / 2}
         y2={heightScaled}
         stroke={isSelected ? ARCH_SELECT_BLUE : ARCH_WINDOW_FRAME_STROKE}
         strokeWidth={mullionStrokeWidth}
       />
    </>
  );
};

export default React.memo(WindowVisual);