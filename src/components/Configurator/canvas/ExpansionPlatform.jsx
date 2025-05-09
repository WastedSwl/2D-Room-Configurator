// src/components/Configurator/canvas/ExpansionPlatform.jsx
import React from "react";
import { ARCH_SELECT_BLUE, ARCH_STROKE_THIN, INITIAL_PPM } from "../configuratorConstants";

const ExpansionPlatform = ({ x, y, width, height, scale, side, onClick }) => {
  const platformWidth = width * scale;
  const platformHeight = height * scale;

  const rectStyle = {
    fill: "rgba(0, 123, 255, 0.05)",
    stroke: ARCH_SELECT_BLUE,
    strokeWidth: Math.max(0.2, ARCH_STROKE_THIN / (scale/INITIAL_PPM)),
    strokeDasharray: "3,2",
    cursor: "pointer",
  };

  const textStyle = {
    fill: ARCH_SELECT_BLUE,
    fontSize: Math.max(8, 10 / (scale/INITIAL_PPM)) + "px",
    textAnchor: "middle",
    dominantBaseline: "central",
    pointerEvents: "none",
    fontWeight: 500,
  };

  return (
    <g transform={`translate(${x * scale}, ${y * scale})`} onClick={onClick}>
      <rect
        x={0}
        y={0}
        width={platformWidth}
        height={platformHeight}
        style={rectStyle}
      />
      <text x={platformWidth / 2} y={platformHeight / 2} style={textStyle}>
        +
      </text>
    </g>
  );
};

export default React.memo(ExpansionPlatform);