import React from "react";
import { SELECTED_ELEMENT_COLOR, defaultObjectSizes, OBJECT_TYPES } from "../configuratorConstants";
import { ReactComponent as SwitchX2Svg } from '../../Assets/switchx2.svg';

const SwitchDoubleRenderer = ({
  element,
  scale,
  isSelected,
  wallThickness,
}) => {
  const switchDefaults = defaultObjectSizes[OBJECT_TYPES.SWITCH_DOUBLE];
  const elementVisualWidthM = element.width || switchDefaults.width;
  const elementVisualHeightM = element.height || switchDefaults.height;
  const elementDepthM = element.depth || switchDefaults.depth;

  const elementVisualWidthPx = elementVisualWidthM * scale;
  const elementVisualHeightPx = elementVisualHeightM * scale;
  const elementDepthPx = elementDepthM * scale;
  const wallThicknessPx = wallThickness * scale;

  const yPositionOfElementCenterByDepth = -(wallThicknessPx / 2) - (elementDepthPx / 2);

  const svgStyle = {
    fill: isSelected ? "rgba(0, 123, 255, 0.2)" : "rgba(240, 240, 245, 0.95)", // Светлее
    stroke: isSelected ? SELECTED_ELEMENT_COLOR : "rgba(110, 110, 110, 0.8)",
    strokeWidth: isSelected ? 1.2 / (scale / 50) : 0.6 / (scale / 50),
    transition: "fill 0.1s ease-out, stroke 0.1s ease-out",
  };

  return (
    <g transform={`translate(0, ${yPositionOfElementCenterByDepth})`}>
      <SwitchX2Svg
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

export default React.memo(SwitchDoubleRenderer);