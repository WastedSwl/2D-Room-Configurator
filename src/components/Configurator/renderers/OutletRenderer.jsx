import React from "react";
import { SELECTED_ELEMENT_COLOR, defaultObjectSizes, OBJECT_TYPES } from "../configuratorConstants";
import { ReactComponent as SocketX1Svg } from '../../Assets/socketx1.svg';

const OutletRenderer = ({
  element,
  scale,
  isSelected,
  wallThickness,
}) => {
  const outletDefaults = defaultObjectSizes[OBJECT_TYPES.OUTLET];
  const elementVisualWidthM = element.width || outletDefaults.width;
  const elementVisualHeightM = element.height || outletDefaults.height;
  const elementDepthM = element.depth || outletDefaults.depth;

  const elementVisualWidthPx = elementVisualWidthM * scale;
  const elementVisualHeightPx = elementVisualHeightM * scale;
  const elementDepthPx = elementDepthM * scale;
  const wallThicknessPx = wallThickness * scale;

  const yPositionOfElementCenterByDepth = -(wallThicknessPx / 2) - (elementDepthPx / 2);

  const svgStyle = {
    fill: isSelected ? "rgba(0, 123, 255, 0.2)" : "rgba(240, 240, 245, 0.95)", // Более светлый, почти белый, но не чисто белый
    stroke: isSelected ? SELECTED_ELEMENT_COLOR : "rgba(120, 120, 120, 0.8)",
    strokeWidth: isSelected ? 1.2 / (scale / 50) : 0.6 / (scale / 50),
    transition: "fill 0.1s ease-out, stroke 0.1s ease-out",
  };

  return (
    <g transform={`translate(0, ${yPositionOfElementCenterByDepth})`}>
      <SocketX1Svg
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

export default React.memo(OutletRenderer);