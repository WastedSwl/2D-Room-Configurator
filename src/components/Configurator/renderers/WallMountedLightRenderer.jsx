import React from "react";
import { SELECTED_ELEMENT_COLOR, defaultObjectSizes, OBJECT_TYPES } from "../configuratorConstants";
import { ReactComponent as LedSvg } from '../../Assets/led.svg';

const WallMountedLightRenderer = ({
  element,
  scale,
  isSelected,
  wallThickness,
}) => {
  const lightDefaults = defaultObjectSizes[OBJECT_TYPES.LIGHT_WALL];
  const elementVisualWidthM = element.width || lightDefaults.width;
  const elementVisualHeightM = element.height || lightDefaults.height;
  const elementDepthM = element.depth || lightDefaults.depth;

  const elementVisualWidthPx = elementVisualWidthM * scale;
  const elementVisualHeightPx = elementVisualHeightM * scale;
  const elementDepthPx = elementDepthM * scale;
  const wallThicknessPx = wallThickness * scale;

  const yPositionOfElementCenterByDepth = -(wallThicknessPx / 2) - (elementDepthPx / 2);

  const svgStyle = {
    // Для светильников оставим немного желтоватый оттенок, но сделаем его светлее
    fill: isSelected ? "rgba(0, 123, 255, 0.25)" : "rgba(255, 253, 235, 0.9)", // Очень светлый желтоватый
    stroke: isSelected ? SELECTED_ELEMENT_COLOR : "rgba(245, 158, 11, 0.7)", // Обводка может остаться для контраста
    strokeWidth: isSelected ? 1.2 / (scale / 50) : 0.6 / (scale / 50),
    transition: "fill 0.1s ease-out, stroke 0.1s ease-out",
  };

  return (
    <g transform={`translate(0, ${yPositionOfElementCenterByDepth})`}>
      <LedSvg
        width={elementVisualWidthPx}
        height={elementVisualHeightPx}
        x={-elementVisualWidthPx / 2}
        y={-elementVisualHeightPx / 2}
        preserveAspectRatio="xMidYMid meet"
        style={svgStyle}
      />
    </g>
  );
};

export default React.memo(WallMountedLightRenderer);