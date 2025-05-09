// src/components/Configurator/canvas/Grid.jsx
import React from "react";
import {
  GRID_LINE_COLOR,
  GRID_BOLD_LINE_COLOR,
  GRID_CELL_SIZE_M, // Use this for main grid
  INITIAL_PPM,
} from "../configuratorConstants";

const Grid = ({ viewTransform, svgWidth, svgHeight }) => {
  if (svgWidth === 0 || svgHeight === 0) return null;

  const { x: viewX, y: viewY, scale } = viewTransform;
  const finalGridLines = [];

  const cellSizeWorld = GRID_CELL_SIZE_M; // 1.15 meters
  const cellSizeScaled = cellSizeWorld * scale;

  // Thresholds for showing lines
  const cellLineThreshold = 10; // Show cell lines if they are at least 10px apart
  const boldLineDivisor = 5; // Make every 5th cell line bold

  // Vertical Lines
  if (cellSizeScaled > cellLineThreshold) {
    const startOffsetX = viewX % cellSizeScaled;
    let counter = Math.floor((0 - viewX) / cellSizeScaled); // To keep track for bold lines

    for (let x = startOffsetX; x < svgWidth; x += cellSizeScaled) {
      const isBold = counter % boldLineDivisor === 0;
      finalGridLines.push(
        <line
          key={`grid-v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={svgHeight}
          stroke={isBold ? GRID_BOLD_LINE_COLOR : GRID_LINE_COLOR}
          strokeWidth={
            isBold
              ? scale > INITIAL_PPM * 0.5
                ? 0.5
                : 0.3
              : scale > INITIAL_PPM * 0.5
                ? 0.25
                : 0.15
          }
        />,
      );
      counter++;
    }
  }

  // Horizontal Lines
  if (cellSizeScaled > cellLineThreshold) {
    const startOffsetY = viewY % cellSizeScaled;
    let counter = Math.floor((0 - viewY) / cellSizeScaled); // To keep track for bold lines

    for (let y = startOffsetY; y < svgHeight; y += cellSizeScaled) {
      const isBold = counter % boldLineDivisor === 0;
      finalGridLines.push(
        <line
          key={`grid-h-${y}`}
          x1={0}
          y1={y}
          x2={svgWidth}
          y2={y}
          stroke={isBold ? GRID_BOLD_LINE_COLOR : GRID_LINE_COLOR}
          strokeWidth={
            isBold
              ? scale > INITIAL_PPM * 0.5
                ? 0.5
                : 0.3
              : scale > INITIAL_PPM * 0.5
                ? 0.25
                : 0.15
          }
        />,
      );
      counter++;
    }
  }
  return <g id="grid">{finalGridLines}</g>;
};

export default React.memo(Grid);
