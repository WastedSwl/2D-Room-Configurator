import React from "react";
import { SELECTED_ELEMENT_COLOR } from "../configuratorConstants";
import { ReactComponent as WindowSvg } from '../../Assets/window.svg';
// FrameSvg может не понадобиться, если window.svg уже включает раму.
// import { ReactComponent as FrameSvg } from '../../Assets/frame.svg';

const WindowRenderer = ({
  element,
  scale,
  wallThickness,
  isSelected,
}) => {
  const { width: windowElementWidthM } = element;

  const windowElementWidthPx = windowElementWidthM * scale;
  const wallThicknessPx = wallThickness * scale; // Глубина стены, в которой окно

  // Предполагаем, что window.svg уже содержит раму и стекло.
  // viewBox window.svg нужен для корректного масштабирования.
  // Пример: если window.svg имеет viewBox="0 0 120 80"
  const SVG_VIEWBOX_WIDTH = 120; // Замените на актуальную ширину viewBox вашего window.svg
  const SVG_VIEWBOX_HEIGHT = 80;  // Замените на актуальную высоту viewBox вашего window.svg

  // Масштабируем "глубину" SVG (его высоту в данном контексте) пропорционально толщине стены.
  // Ширина SVG будет равна windowElementWidthPx.
  // Это простой подход; возможно, понадобится более сложная логика для идеального вида.
  // Либо, window.svg должен быть спроектирован так, чтобы его высота (в SVG координатах) соответствовала "глубине".
  // Здесь мы растянем SVG по глубине стены.
  const svgRenderHeightPx = wallThicknessPx;

  // Стиль для SVG
  const svgStyle = {
    fill: isSelected ? "rgba(0, 123, 255, 0.2)" : "rgba(173, 216, 230, 0.5)", // Голубоватая полупрозрачная заливка для стекла
    stroke: isSelected ? SELECTED_ELEMENT_COLOR : "rgba(100, 100, 100, 0.7)", // Темная обводка для рамы
    strokeWidth: isSelected ? 1.5 / (scale / 50) : 1 / (scale / 50),
    transition: "fill 0.15s ease-in-out, stroke 0.15s ease-in-out",
  };

  return (
    <g transform={`translate(0, ${-svgRenderHeightPx / 2})`}>
      <WindowSvg
        width={windowElementWidthPx}
        height={svgRenderHeightPx} // Окно занимает всю "глубину" стены
        preserveAspectRatio="none" // Позволяет растягивать, если нужно
        // preserveAspectRatio="xMidYMid meet" // Если SVG должен сохранять пропорции
        style={svgStyle}
      />
    </g>
  );
};

export default React.memo(WindowRenderer);