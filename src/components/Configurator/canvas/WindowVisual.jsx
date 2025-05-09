import React from "react";
import {
    ARCH_BLACK,
    ARCH_MID_GRAY,
    ARCH_STROKE_MEDIUM,
    ARCH_STROKE_THIN,
    ARCH_STROKE_VERY_THIN,
    ARCH_SELECT_BLUE,
    ARCH_WINDOW_FRAME_STROKE, // Используем для основной рамы
    ARCH_WINDOW_GLAZING_STROKE, // Используем для линий стекла
    INITIAL_PPM,
    ARCH_WHITE, // Для заливки пространства между рамами (если есть)
} from "../configuratorConstants";

const WindowVisual = ({ obj, scale, commonProps, isSelected }) => {
  // obj.width - ширина окна
  // obj.height - толщина стены, в которую вставлено окно
  const windowWidth_s = obj.width * scale;
  const wallThickness_s = obj.height * scale;

  const frameColor = isSelected ? ARCH_SELECT_BLUE : ARCH_WINDOW_FRAME_STROKE;
  const glazingColor = isSelected ? ARCH_SELECT_BLUE : ARCH_WINDOW_GLAZING_STROKE;

  // Толщина линий рамы и стекла (масштабируемая)
  const outerFrameStrokeWidth = Math.max(0.3, ARCH_STROKE_MEDIUM / (scale / INITIAL_PPM));
  const innerFrameStrokeWidth = Math.max(0.2, ARCH_STROKE_THIN / (scale / INITIAL_PPM));
  const glazingLineStrokeWidth = Math.max(0.1, ARCH_STROKE_VERY_THIN / (scale / INITIAL_PPM));

  // Визуальная толщина рамы (отступ для внутренней линии рамы)
  // const frameVisualThickness = Math.max(1, 4 / (scale / INITIAL_PPM)); // 4px в базовом масштабе
  const frameVisualThickness = wallThickness_s * 0.2; // 20% от толщины стены

  return (
    <g data-object-id={commonProps['data-object-id']}>
      {/* Внешняя рама (прямоугольник по всей толщине стены) */}
      <rect
        x="0"
        y="0"
        width={windowWidth_s}
        height={wallThickness_s}
        fill={isSelected ? ARCH_SELECT_BLUE + '11' : ARCH_WHITE} // Легкая заливка для области окна
        stroke={frameColor}
        strokeWidth={outerFrameStrokeWidth}
        style={commonProps.style} // Стиль курсора и т.д.
      />

      {/* Внутренние линии рамы, если толщина стены позволяет */}
      {wallThickness_s > frameVisualThickness * 2.5 && (
        <>
            <line
                x1={0} y1={frameVisualThickness}
                x2={windowWidth_s} y2={frameVisualThickness}
                stroke={frameColor}
                strokeWidth={innerFrameStrokeWidth}
            />
            <line
                x1={0} y1={wallThickness_s - frameVisualThickness}
                x2={windowWidth_s} y2={wallThickness_s - frameVisualThickness}
                stroke={frameColor}
                strokeWidth={innerFrameStrokeWidth}
            />
        </>
      )}
      
      {/* Центральная линия стекла (импост) */}
      <line
         x1={windowWidth_s / 2}
         y1={0} // От края до края стены
         x2={windowWidth_s / 2}
         y2={wallThickness_s}
         stroke={glazingColor}
         strokeWidth={glazingLineStrokeWidth}
       />
        {/* Линии, символизирующие стекло (между внутренними рамами) */}
       <line
         x1={0}
         y1={wallThickness_s / 2}
         x2={windowWidth_s}
         y2={wallThickness_s / 2}
         stroke={glazingColor}
         strokeWidth={glazingLineStrokeWidth}
       />
    </g>
  );
};

export default React.memo(WindowVisual);