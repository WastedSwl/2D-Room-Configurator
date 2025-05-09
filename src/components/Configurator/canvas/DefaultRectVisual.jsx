import React from "react";
import {
    ARCH_BLACK,
    ARCH_WHITE,
    ARCH_SELECT_BLUE,
    ARCH_STROKE_MEDIUM,
    ARCH_STROKE_THIN,
    ARCH_DARK_GRAY,
    ARCH_VERY_LIGHT_GRAY, // Для заливки не-стенных объектов
    ARCH_LIGHT_GRAY,    // Для текста на темной заливке или для границ
    ARCH_STROKE_VERY_THIN,
} from "../configuratorConstants";

const DefaultRectVisual = ({ obj, scale, commonProps }) => {
  const widthScaled = Math.max(1, obj.width * scale);
  const heightScaled = Math.max(1, obj.height * scale);
  const isSelected = commonProps.stroke === ARCH_SELECT_BLUE;

  let fill = ARCH_VERY_LIGHT_GRAY; // Светло-серая заливка по умолчанию для мебели и т.д.
  let stroke = ARCH_DARK_GRAY;
  let strokeWidth = isSelected ? ARCH_STROKE_MEDIUM : ARCH_STROKE_THIN;
  let textColor = ARCH_DARK_GRAY;

  // Специфичные стили для типов, которые не имеют своего Visual компонента
  switch (obj.type) {
    case "wall": // Стены теперь должны иметь свой Visual или обрабатываться в ObjectVisual
      // Этот DefaultRectVisual не должен напрямую рисовать стены в новом стиле.
      // Но если он все же используется для стены, сделаем ее просто контуром.
      fill = "none"; 
      stroke = ARCH_BLACK;
      strokeWidth = isSelected ? ARCH_STROKE_MEDIUM : ARCH_STROKE_MEDIUM;
      break;
    case "light_led":
      fill = ARCH_WHITE;
      strokeWidth = isSelected ? ARCH_STROKE_THIN : ARCH_STROKE_VERY_THIN;
      textColor = isSelected ? ARCH_SELECT_BLUE : ARCH_BLACK;
      break;
    case "sofa":
    case "table":
    case "cabinet":
    case "bed":
      // Мебель - только контур
      fill = "none";
      stroke = ARCH_DARK_GRAY;
      strokeWidth = isSelected ? ARCH_STROKE_MEDIUM : ARCH_STROKE_THIN;
      break;
    case "toilet":
      // Туалет может иметь легкую заливку
      fill = ARCH_VERY_LIGHT_GRAY;
      stroke = ARCH_DARK_GRAY;
      strokeWidth = isSelected ? ARCH_STROKE_MEDIUM : ARCH_STROKE_THIN;
      break;
    // Добавьте другие типы по необходимости
    default:
      // Для неизвестных типов оставляем базовые стили
      break;
  }

  if (isSelected) {
    stroke = ARCH_SELECT_BLUE;
  }

  return (
    <>
      <rect
        x={0}
        y={0}
        width={widthScaled}
        height={heightScaled}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        style={commonProps.style}
        data-object-id={commonProps['data-object-id']}
      />
      {obj.label && (obj.type === 'light_led' || obj.type === 'radiator' || obj.type === 'kitchen_unit') && (
          <text
            x={widthScaled / 2}
            y={heightScaled / 2}
            fontSize={`${Math.min(12, Math.max(6, heightScaled * 0.6))}px`}
            textAnchor="middle"
            dominantBaseline="central"
            fill={textColor}
            style={{ pointerEvents: "none", fontVariantNumeric: "tabular-nums" }}
            stroke="none"
          >
              {obj.label}
          </text>
      )}
     </>
  );
};

export default React.memo(DefaultRectVisual);