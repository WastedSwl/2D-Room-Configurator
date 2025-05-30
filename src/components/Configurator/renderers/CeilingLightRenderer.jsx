import React from "react";
import { SELECTED_ELEMENT_COLOR, defaultObjectSizes, OBJECT_TYPES } from "../configuratorConstants";
import { ReactComponent as LedSvg } from '../../Assets/led.svg';

const CeilingLightRenderer = ({
  element,
  scale,
  isSelected,
}) => {
  const lightDefaults = defaultObjectSizes[OBJECT_TYPES.LIGHT_CEILING];
  const elementWidthM = element.width || lightDefaults.width;
  const elementDepthM = element.height || lightDefaults.width;

  const elementWidthPx = elementWidthM * scale;
  const elementDepthPx = elementDepthM * scale;

  const svgStyle = {
    fill: isSelected ? "rgba(0, 123, 255, 0.25)" : "rgba(255, 253, 235, 0.85)", // Очень светлый желтоватый
    stroke: isSelected ? SELECTED_ELEMENT_COLOR : "rgba(250, 170, 20, 0.65)", // Обводка для контраста
    strokeWidth: isSelected ? 1.5 / (scale / 50) : 0.5 / (scale / 50),
    transition: "fill 0.15s ease-in-out, stroke 0.15s ease-in-out",
  };

  return (
    <g transform={`translate(${-elementWidthPx / 2}, ${-elementDepthPx / 2})`}>
      <LedSvg
        width={elementWidthPx}
        height={elementDepthPx}
        preserveAspectRatio="xMidYMid meet"
        style={svgStyle}
      />
    </g>
  );
};

export default React.memo(CeilingLightRenderer);