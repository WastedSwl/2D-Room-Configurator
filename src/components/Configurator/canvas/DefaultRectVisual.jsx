import React from "react";
import {
    ARCH_BLACK,
    ARCH_WHITE,
    ARCH_SELECT_BLUE,
    ARCH_STROKE_MEDIUM, // <-- Импорт
    ARCH_STROKE_THIN, // <-- Импорт
    ARCH_DARK_GRAY, // for text on white
    ARCH_STROKE_VERY_THIN, // <-- Импорт
} from "../configuratorConstants";

const DefaultRectVisual = ({ obj, scale, commonProps }) => {
  const widthScaled = Math.max(1, obj.width * scale);
  const heightScaled = Math.max(1, obj.height * scale);
  const isSelected = commonProps.stroke === ARCH_SELECT_BLUE;

  let fill = ARCH_WHITE;
  let stroke = ARCH_DARK_GRAY; // Use darker gray for better contrast on white fill than pure black
  // Use defined weights for stroke width based on selection and type
  let strokeWidth = isSelected ? ARCH_STROKE_MEDIUM : ARCH_STROKE_THIN;

  if (obj.type === "wall") {
    fill = "rgba(200, 200, 200, 0.1)"; // Slightly visible fill for walls
    strokeWidth = isSelected ? ARCH_STROKE_MEDIUM : ARCH_STROKE_THIN; 
  } else if (obj.type === 'light_led') {
      fill = ARCH_WHITE;
      strokeWidth = isSelected ? ARCH_STROKE_THIN : ARCH_STROKE_VERY_THIN;
  }

  // Selection color override
  stroke = isSelected ? ARCH_SELECT_BLUE : stroke;

  return (
    <>
      <rect
        x={0}
        y={0}
        width={widthScaled}
        height={heightScaled}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth} // Use calculated width
        style={commonProps.style}
        data-object-id={commonProps['data-object-id']}
      />
      {/* Text rendering for light_led */}
      {obj.type === 'light_led' && obj.label && (
          <text
            x={widthScaled / 2}
            y={heightScaled / 2}
            fontSize={`${Math.min(12, Math.max(6, heightScaled * 0.6))}px`}
            textAnchor="middle"
            dominantBaseline="central" // Using dominant-baseline
            fill={isSelected ? ARCH_SELECT_BLUE : ARCH_DARK_GRAY}
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