// src/components/Configurator/canvas/Grid.jsx
import React from "react";
import {
  GRID_LINE_COLOR,
  GRID_BOLD_LINE_COLOR,
  ORIGIN_POINT_COLOR,
  INITIAL_PPM,
} from "../configuratorConstants";

const Grid = ({ viewTransform, svgWidth, svgHeight }) => {
  // Принимаем svgWidth, svgHeight
  if (svgWidth === 0 || svgHeight === 0) return null; // Проверка здесь

  const { x: viewX, y: viewY, scale } = viewTransform;
  const finalGridLines = [];

  const majorGridSizeWorld = 1;
  const minorGridDivisions = 10;

  const majorGridSizeScaled = majorGridSizeWorld * scale;
  const minorGridSizeScaled = (majorGridSizeWorld / minorGridDivisions) * scale;

  const majorLineThreshold = 20;
  const minorLineThreshold = 5;

  if (majorGridSizeScaled > majorLineThreshold) {
    const startOffsetX = viewX % majorGridSizeScaled;
    for (let x = startOffsetX; x < svgWidth; x += majorGridSizeScaled) {
      finalGridLines.push(
        <line
          key={`major-gv-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={svgHeight}
          stroke={GRID_BOLD_LINE_COLOR}
          strokeWidth={0.5}
        />,
      );
    }
    if (
      minorGridSizeScaled > minorLineThreshold &&
      majorGridSizeScaled / minorGridSizeScaled > 1.5
    ) {
      const minorStartOffsetX = viewX % minorGridSizeScaled;
      for (let x = minorStartOffsetX; x < svgWidth; x += minorGridSizeScaled) {
        if (
          Math.abs(
            (x - (viewX % majorGridSizeScaled) + majorGridSizeScaled) %
              majorGridSizeScaled,
          ) >
          minorGridSizeScaled * 0.1
        ) {
          finalGridLines.push(
            <line
              key={`minor-gv-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={svgHeight}
              stroke={GRID_LINE_COLOR}
              strokeWidth={0.25}
            />,
          );
        }
      }
    }
  }

  if (majorGridSizeScaled > majorLineThreshold) {
    const startOffsetY = viewY % majorGridSizeScaled;
    for (let y = startOffsetY; y < svgHeight; y += majorGridSizeScaled) {
      finalGridLines.push(
        <line
          key={`major-gh-${y}`}
          x1={0}
          y1={y}
          x2={svgWidth}
          y2={y}
          stroke={GRID_BOLD_LINE_COLOR}
          strokeWidth={0.5}
        />,
      );
    }
    if (
      minorGridSizeScaled > minorLineThreshold &&
      majorGridSizeScaled / minorGridSizeScaled > 1.5
    ) {
      const minorStartOffsetY = viewY % minorGridSizeScaled;
      for (let y = minorStartOffsetY; y < svgHeight; y += minorGridSizeScaled) {
        if (
          Math.abs(
            (y - (viewY % majorGridSizeScaled) + majorGridSizeScaled) %
              majorGridSizeScaled,
          ) >
          minorGridSizeScaled * 0.1
        ) {
          finalGridLines.push(
            <line
              key={`minor-gh-${y}`}
              x1={0}
              y1={y}
              x2={svgWidth}
              y2={y}
              stroke={GRID_LINE_COLOR}
              strokeWidth={0.25}
            />,
          );
        }
      }
    }
  }

  finalGridLines.push(
    <circle
      key="origin"
      cx={viewX}
      cy={viewY}
      r={Math.max(1, 3 / (scale / INITIAL_PPM))}
      fill={ORIGIN_POINT_COLOR}
      stroke="black"
      strokeWidth={Math.max(0.1, 0.5 / (scale / INITIAL_PPM))}
    />,
  );

  return <g id="grid">{finalGridLines}</g>;
};

export default React.memo(Grid);
