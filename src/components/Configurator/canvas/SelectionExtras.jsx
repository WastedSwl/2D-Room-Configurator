// src/components/Configurator/canvas/SelectionExtras.jsx
import React from "react";
import {
  RESIZE_HANDLE_SIZE_PX,
  RESIZE_HANDLE_COLOR,
  INITIAL_PPM,
  DIMENSION_TEXT_COLOR,
  DIMENSION_TEXT_BG_COLOR,
} from "../configuratorConstants";
import { getResizeCursorForHandle } from "../configuratorUtils";

const SelectionExtras = ({
  obj,
  scale,
  canInteractWithHandles,
  onResizeHandleMouseDown,
}) => {
  const handles = [];
  const dimensionTexts = [];

  // Коэффициент, который помогает сохранить визуальный размер элементов интерфейса
  // относительно начального масштаба. Когда scale увеличивается (приближение),
  // 1 / (scale / INITIAL_PPM) уменьшается, компенсируя увеличение scale.
  const uiScaleFactor = INITIAL_PPM / scale;

  const OBBHandlesDef = [
    { type: "tl", x: 0, y: 0 },
    { type: "t", x: obj.width / 2, y: 0 },
    { type: "tr", x: obj.width, y: 0 },
    { type: "l", x: 0, y: obj.height / 2 },
    { type: "r", x: obj.width, y: obj.height / 2 },
    { type: "bl", x: 0, y: obj.height },
    { type: "b", x: obj.width / 2, y: obj.height },
    { type: "br", x: obj.width, y: obj.height },
  ];

  const handleSizeBase = RESIZE_HANDLE_SIZE_PX; // Базовый размер в пикселях
  // Размер маркера в SVG единицах, который будет выглядеть как handleSizeBase пикселей на экране
  const handleSizeSVG = Math.max(
    4 * uiScaleFactor,
    handleSizeBase * uiScaleFactor,
  );
  const handleStrokeWidthSVG = Math.max(
    0.2 * uiScaleFactor,
    0.5 * uiScaleFactor,
  );

  OBBHandlesDef.forEach((h) => {
    handles.push(
      <rect
        key={`handle-${h.type}`}
        data-resize-handle="true"
        // Позиционируем маркеры в координатах объекта (которые уже умножены на scale)
        // а их размер задаем в SVG единицах, которые компенсируют scale
        x={h.x * scale - handleSizeSVG / 2}
        y={h.y * scale - handleSizeSVG / 2}
        width={handleSizeSVG}
        height={handleSizeSVG}
        fill={RESIZE_HANDLE_COLOR}
        stroke="white"
        strokeWidth={handleStrokeWidthSVG}
        style={{
          cursor: canInteractWithHandles
            ? getResizeCursorForHandle(h.type, obj.rotation || 0)
            : "default",
        }}
        onMouseDown={(e) => {
          if (canInteractWithHandles)
            onResizeHandleMouseDown(e, obj.id, h.type);
          else e.stopPropagation();
        }}
      />,
    );
  });

  const midPointXObjScaled = (obj.width / 2) * scale; // Центральная точка объекта в экранных SVG координатах (относительно группы объекта)
  const midPointYObjScaled = (obj.height / 2) * scale;

  const textOffsetBase = 15; // Базовый отступ в пикселях
  const textOffsetSVG = textOffsetBase * uiScaleFactor; // Отступ в SVG единицах

  const fontSizeBase = 10; // Базовый размер шрифта в пикселях
  const fontSizeSVG = Math.max(6 * uiScaleFactor, fontSizeBase * uiScaleFactor); // Размер шрифта в SVG единицах

  const strokeBgWidthBase = 3; // Базовая толщина обводки фона
  const strokeBgWidthSVG = Math.max(
    1 * uiScaleFactor,
    strokeBgWidthBase * uiScaleFactor,
  );

  // Позиционируем текст относительно центра объекта, но с отступом в SVG единицах, компенсирующих scale
  dimensionTexts.push(
    <text
      key="dim-width"
      x={midPointXObjScaled} // Центр по X объекта
      y={0 - textOffsetSVG} // Выше объекта с отступом
      fontSize={`${fontSizeSVG}px`}
      textAnchor="middle"
      fill={DIMENSION_TEXT_COLOR}
      style={{
        paintOrder: "stroke",
        stroke: DIMENSION_TEXT_BG_COLOR,
        strokeWidth: `${strokeBgWidthSVG}px`,
        strokeLinejoin: "round",
        pointerEvents: "none",
      }}
    >
      {obj.width.toFixed(2)} м
    </text>,
  );
  dimensionTexts.push(
    <text
      key="dim-height"
      x={0 - textOffsetSVG} // Левее объекта с отступом
      y={midPointYObjScaled} // Центр по Y объекта
      fontSize={`${fontSizeSVG}px`}
      textAnchor="middle"
      dominantBaseline="middle"
      transform={`rotate(-90, ${0 - textOffsetSVG}, ${midPointYObjScaled})`} // Поворачиваем вокруг точки позиционирования
      fill={DIMENSION_TEXT_COLOR}
      style={{
        paintOrder: "stroke",
        stroke: DIMENSION_TEXT_BG_COLOR,
        strokeWidth: `${strokeBgWidthSVG}px`,
        strokeLinejoin: "round",
        pointerEvents: "none",
      }}
    >
      {obj.height.toFixed(2)} м
    </text>,
  );

  return (
    <>
      {handles}
      {dimensionTexts}
    </>
  );
};

export default React.memo(SelectionExtras);
