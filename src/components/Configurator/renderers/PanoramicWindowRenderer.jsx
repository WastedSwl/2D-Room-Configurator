import React from "react";
import { SELECTED_ELEMENT_COLOR } from "../configuratorConstants";
import { ReactComponent as WindowSvg } from '../../Assets/window.svg'; // Используем тот же window.svg

const PanoramicWindowRenderer = ({
  element,
  scale,
  wallThickness,
  isSelected,
}) => {
  const { width: windowElementWidthM } = element;

  const windowElementWidthPx = windowElementWidthM * scale;
  const wallThicknessPx = wallThickness * scale;

  const SVG_VIEWBOX_WIDTH = 120; // Предполагаем такой же viewBox, как у window.svg
  const SVG_VIEWBOX_HEIGHT = 80;

  const svgRenderHeightPx = wallThicknessPx;

  const svgStyle = {
    fill: isSelected ? "rgba(0, 123, 255, 0.25)" : "rgba(173, 216, 230, 0.6)",
    stroke: isSelected ? SELECTED_ELEMENT_COLOR : "rgba(80, 80, 80, 0.8)",
    strokeWidth: isSelected ? 1.5 / (scale / 50) : 1 / (scale / 50),
    transition: "fill 0.15s ease-in-out, stroke 0.15s ease-in-out",
  };

  return (
    <g transform={`translate(0, ${-svgRenderHeightPx / 2})`}>
      <WindowSvg
        width={windowElementWidthPx}
        height={svgRenderHeightPx}
        preserveAspectRatio="none"
        style={svgStyle}
      />
    </g>
  );
};

export default React.memo(PanoramicWindowRenderer);