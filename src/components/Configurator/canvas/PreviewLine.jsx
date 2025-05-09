// src/components/Configurator/canvas/PreviewLine.jsx
import React from "react";
import { PREVIEW_LINE_COLOR, PREVIEW_LINE_STROKE_WIDTH } from "../configuratorConstants";

const PreviewLine = ({ drawingLineState, viewTransform }) => {
  if (!drawingLineState || !drawingLineState.startWorldX_s || !viewTransform) {
    return null;
  }

  const { startWorldX_s, startWorldY_s, currentWorldX_s, currentWorldY_s } = drawingLineState;

  return (
    <line
      x1={startWorldX_s}
      y1={startWorldY_s}
      x2={currentWorldX_s}
      y2={currentWorldY_s}
      stroke={PREVIEW_LINE_COLOR}
      strokeWidth={PREVIEW_LINE_STROKE_WIDTH / viewTransform.scale} // Adjust stroke width based on zoom
      strokeDasharray={`${5 / viewTransform.scale},${3 / viewTransform.scale}`}
      pointerEvents="none"
    />
  );
};

export default PreviewLine;