import React from "react";
import {
    ARCH_BLACK,
    ARCH_STROKE_MEDIUM,
    ARCH_STROKE_THIN,
    ARCH_WHITE,
    ARCH_SELECT_BLUE,
    ARCH_OUTLET_FILL, // Можно использовать ARCH_WHITE
    ARCH_OUTLET_STROKE, // Можно использовать ARCH_BLACK или ARCH_DARK_GRAY
    INITIAL_PPM,
} from "../configuratorConstants";

const OutletVisual = ({
  obj,
  scale,
  commonProps, // Содержит data-object-id и style
  // rotationCenterXScaled, // Не нужен, если рисуем символ в центре объекта
  // rotationCenterYScaled, // Не нужен, если рисуем символ в центре объекта
  isSelected
}) => {
  // Размеры объекта в пикселях
  const width_s = obj.width * scale;
  const height_s = obj.height * scale; // Розетка обычно квадратная, но используем оба

  // Базовый размер символа розетки (например, 80% от меньшей стороны объекта)
  const symbolSizeBase = Math.min(width_s, height_s) * 0.7;
  const symbolRadius = symbolSizeBase / 2;

  // Центр объекта
  const cx = width_s / 2;
  const cy = height_s / 2;

  const strokeColor = isSelected ? ARCH_SELECT_BLUE : ARCH_OUTLET_STROKE;
  const baseStrokeWidth = ARCH_STROKE_THIN / (scale / INITIAL_PPM); // Масштабируемая толщина
  const strokeWidth = isSelected ? ARCH_STROKE_MEDIUM / (scale / INITIAL_PPM) : baseStrokeWidth;

  // Параметры для "штырьков" розетки
  const pinLength = symbolRadius * 0.6;
  const pinOffsetY = symbolRadius * 0.35;
  const pinStrokeWidth = Math.max(0.5, 1 / (scale / INITIAL_PPM));


  return (
    <g data-object-id={commonProps['data-object-id']} style={commonProps.style}>
      {/* Фоновый прямоугольник (если нужен, например, для области клика или фона) */}
      {/* <rect
        x={0}
        y={0}
        width={width_s}
        height={height_s}
        fill="rgba(0,0,0,0.02)" // Очень прозрачный фон для кликабельности
      /> */}

      {/* Круг розетки */}
      <circle
        cx={cx}
        cy={cy}
        r={symbolRadius}
        fill={isSelected ? ARCH_SELECT_BLUE + '1A' : ARCH_OUTLET_FILL}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* "Штырьки" розетки */}
      <line
        x1={cx - pinLength / 2} y1={cy - pinOffsetY}
        x2={cx + pinLength / 2} y2={cy - pinOffsetY}
        stroke={strokeColor}
        strokeWidth={pinStrokeWidth}
      />
      <line
        x1={cx - pinLength / 2} y1={cy + pinOffsetY}
        x2={cx + pinLength / 2} y2={cy + pinOffsetY}
        stroke={strokeColor}
        strokeWidth={pinStrokeWidth}
      />
    </g>
  );
};

export default React.memo(OutletVisual);