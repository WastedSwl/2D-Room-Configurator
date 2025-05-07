// src/components/Configurator/canvas/MarqueeSelection.jsx
import React from "react";
import {
  MARQUEE_FILL_COLOR,
  MARQUEE_STROKE_COLOR,
} from "../configuratorConstants";

const MarqueeSelection = ({ marqueeRect, svgRef }) => {
  if (!marqueeRect || !marqueeRect.active || !svgRef || !svgRef.current) {
    return null;
  }

  const svgDomRect = svgRef.current.getBoundingClientRect();
  // Если SVG еще не отрендерился с размерами, не рисовать
  if (svgDomRect.width === 0 || svgDomRect.height === 0) {
    return null;
  }

  // marqueeRect содержит startScreenX/Y и currentScreenX/Y в экранных координатах
  // Их нужно преобразовать в координаты относительно SVG элемента
  const x =
    Math.min(marqueeRect.startScreenX, marqueeRect.currentScreenX) -
    svgDomRect.left;
  const y =
    Math.min(marqueeRect.startScreenY, marqueeRect.currentScreenY) -
    svgDomRect.top;
  const width = Math.abs(marqueeRect.startScreenX - marqueeRect.currentScreenX);
  const height = Math.abs(
    marqueeRect.startScreenY - marqueeRect.currentScreenY,
  );

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={MARQUEE_FILL_COLOR}
      stroke={MARQUEE_STROKE_COLOR}
      strokeWidth="1" // Обычно фиксированная ширина для рамки выделения
      pointerEvents="none" // Не должна перехватывать события
    />
  );
};

export default React.memo(MarqueeSelection);
