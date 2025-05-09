
import React from "react";
import {
  GRID_LINE_COLOR,
  GRID_BOLD_LINE_COLOR,
  ORIGIN_POINT_COLOR,
  INITIAL_PPM,
} from "../configuratorConstants";

const Grid = ({ viewTransform, svgWidth, svgHeight }) => {
  if (svgWidth === 0 || svgHeight === 0) return null; 

  const { x: viewX, y: viewY, scale } = viewTransform;
  const finalGridLines = [];

  const majorGridSizeWorld = 1;
  const minorGridDivisions = 10;

  const majorGridSizeScaled = majorGridSizeWorld * scale;
  const minorGridSizeScaled = (majorGridSizeWorld / minorGridDivisions) * scale;

  const majorLineThreshold = 25; // Increased for less clutter at low zoom
  const minorLineThreshold = 8; // Increased for less clutter at low zoom

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
          strokeWidth={viewTransform.scale > INITIAL_PPM * 0.5 ? 0.5 : 0.3} // Thinner if zoomed out
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
              strokeWidth={viewTransform.scale > INITIAL_PPM * 0.5 ? 0.25 : 0.15} // Thinner if zoomed out
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
          strokeWidth={viewTransform.scale > INITIAL_PPM * 0.5 ? 0.5 : 0.3} // Thinner if zoomed out
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
              strokeWidth={viewTransform.scale > INITIAL_PPM * 0.5 ? 0.25 : 0.15} // Thinner if zoomed out
            />,
          );
        }
      }
    }
  }

  return <g id="grid">{finalGridLines}</g>;
};

export default React.memo(Grid);