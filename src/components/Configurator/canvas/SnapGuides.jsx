import React from "react";
import { SNAP_LINE_COLOR, INITIAL_PPM } from "../configuratorConstants";

const SnapGuides = ({ activeSnapLines, viewTransform }) => {
  if (!activeSnapLines || activeSnapLines.length === 0) {
    return null;
  }

  const { scale } = viewTransform;

  return (
    <g id="snap-guides">
      {activeSnapLines.map((line, index) => {
        const scaledVal = line.val * scale;
        const scaledStart = line.start * scale;
        const scaledEnd = line.end * scale;

        const strokeWidth = Math.max(1, 1 / (scale / INITIAL_PPM));
        const dashArray = `${3 / (scale / INITIAL_PPM)},${2 / (scale / INITIAL_PPM)}`;

        if (line.type === "x") {
          return (
            <line
              key={`snap-x-${index}`}
              x1={scaledVal} 
              y1={scaledStart}
              x2={scaledVal}
              y2={scaledEnd}
              stroke={SNAP_LINE_COLOR}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              pointerEvents="none" 
            />
          );
        } else {
          return (
            <line
              key={`snap-y-${index}`}
              x1={scaledStart}
              y1={scaledVal}
              x2={scaledEnd}
              y2={scaledVal}
              stroke={SNAP_LINE_COLOR}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              pointerEvents="none"
            />
          );
        }
      })}
    </g>
  );
};

export default React.memo(SnapGuides);