import React from "react";
import { SELECTED_ELEMENT_COLOR, defaultObjectSizes, OBJECT_TYPES, DRAWING_KITCHEN_ELEMENT_FILL_COLOR, DRAWING_KITCHEN_ELEMENT_STROKE_COLOR } from "../configuratorConstants";
// import { ReactComponent as KitchenSvg } from '../../Assets/kitchen_element.svg'; // Если есть SVG

const KitchenElementRenderer = ({
  element,
  scale,
  isSelected,
  wallThickness, // полная толщина стены сегмента
}) => {
  const kitchenDefaults = defaultObjectSizes[OBJECT_TYPES.KITCHEN_ELEMENT];
  const elementVisualWidthM = element.width || kitchenDefaults.width;
  // "Высота" кухонного элемента в контексте плана - это его размер вдоль стены.
  // "Глубина" кухонного элемента - это element.depth, выступающий от стены.
  // "Визуальная высота на стене" (если бы мы смотрели сбоку) - это kitchenDefaults.height, но на плане это не видно.
  const elementVisualHeightOnPlanM = element.height || kitchenDefaults.height; // Это может быть высота, если элемент стоит боком, или другой размер. Для консистентности с другими, пусть это будет высота, как она задана.
  const elementDepthM = element.depth || kitchenDefaults.depth;


  const elementVisualWidthPx = elementVisualWidthM * scale; // Размер вдоль стены
  const elementVisualHeightPx = elementVisualHeightOnPlanM * scale; // Размер, используемый как "высота" в 2D рендере
  const elementDepthPx = elementDepthM * scale; // Реальная глубина от стены
  const wallThicknessPx = wallThickness * scale;

  const yPositionOfElementCenterByDepth = -(wallThicknessPx / 2) - (elementDepthPx / 2);

  // const hasSvg = false; // Поставьте true, если используете KitchenSvg

  const rectStyle = {
    fill: isSelected ? "rgba(0, 123, 255, 0.2)" : DRAWING_KITCHEN_ELEMENT_FILL_COLOR,
    stroke: isSelected ? SELECTED_ELEMENT_COLOR : DRAWING_KITCHEN_ELEMENT_STROKE_COLOR,
    strokeWidth: isSelected ? 1.5 / (scale / 50) : 1 / (scale / 50),
  };

  // Для кухонного элемента, width - это вдоль стены, а вот "height" SVG должен соответствовать elementDepthPx,
  // если мы смотрим на план сверху и SVG изображает вид сверху.
  // Но если SVG - это "фасад", то используем elementVisualHeightPx.
  // Давайте предположим, что SVG (или rect) рисует вид сверху, где elementVisualWidthPx это ширина,
  // а то, что мы передаем как "height" в SVG, должно быть elementDepthPx (глубина от стены).
  // Однако, для консистентности с другими, если мы передаем `elementVisualHeightPx` и `elementVisualWidthPx`,
  // это размеры "фасада".
  // Позиционирование yPositionOfElementCenterByDepth корректно для центра ГЛУБИНЫ.
  // SVG будет отображать фасад.

  return (
    <g transform={`translate(0, ${yPositionOfElementCenterByDepth})`}>
      {/* {hasSvg ? (
        <KitchenSvg
          width={elementVisualWidthPx}
          height={elementVisualHeightPx} // Используем визуальную высоту фасада
          x={-elementVisualWidthPx / 2}
          y={-elementVisualHeightPx / 2}
          preserveAspectRatio="xMidYMid meet"
          style={rectStyle}
        />
      ) : ( */}
      <rect
        x={-elementVisualWidthPx / 2}
        y={-elementVisualHeightPx / 2} // Центрируем визуальную высоту
        width={elementVisualWidthPx}
        height={elementVisualHeightPx} // Рисуем визуальную высоту
        style={rectStyle}
      />
      {/* )} */}
    </g>
  );
};

export default React.memo(KitchenElementRenderer);