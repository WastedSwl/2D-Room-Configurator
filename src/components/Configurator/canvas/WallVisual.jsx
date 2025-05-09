import React from "react";
import {
    ARCH_SELECT_BLUE,
    ARCH_WALL_FILL_COLOR,
    ARCH_WALL_OUTLINE_COLOR,
    ARCH_HATCH_COLOR,    
    WALL_THICKNESS_M,    
    INITIAL_PPM,
    ARCH_STROKE_MEDIUM, // Для масштабируемой толщины обводки
    ARCH_SELECT_BLUE_TRANSPARENT_FILL
} from "../configuratorConstants";

const WallVisual = ({ obj, scale, commonProps, isSelected }) => {
  const widthScaled = obj.width * scale;
  const heightScaled = obj.height * scale;

  const wallStrokeColor = isSelected ? ARCH_SELECT_BLUE : ARCH_WALL_OUTLINE_COLOR;
  const wallFillColor = isSelected ? ARCH_SELECT_BLUE_TRANSPARENT_FILL : ARCH_WALL_FILL_COLOR;
  
  const baseStrokeWidth = ARCH_STROKE_MEDIUM; // Используем среднюю толщину для стен
  const wallStrokeWidth = Math.max(0.3, baseStrokeWidth * (scale > INITIAL_PPM * 0.5 ? 1 : 0.7) / (scale / INITIAL_PPM) );
  
  // Визуальная толщина "слоя" стены для эффекта двойной линии.
  // Это не толщина самой SVG-линии, а отступ для внутренней линии.
  // Сделаем ее зависимой от масштаба, но с минимумом и максимумом.
  const visualLayerThicknessFactor = 0.1; // 10% от меньшей стороны объекта, но не больше чем...
  let visualLayerThickness = Math.min(widthScaled, heightScaled) * visualLayerThicknessFactor;
  const minVisualLayerThicknessPx = 1.5 * (INITIAL_PPM / scale); // мин 1.5px в реальных пикселях
  const maxVisualLayerThicknessPx = 5 * (INITIAL_PPM / scale);  // макс 5px в реальных пикселях
  visualLayerThickness = Math.max(minVisualLayerThicknessPx * scale, Math.min(visualLayerThickness, maxVisualLayerThicknessPx * scale));
  visualLayerThickness = Math.min(visualLayerThickness, widthScaled / 2.1, heightScaled / 2.1); // Не больше половины размера

  // Если стена слишком тонкая для двойной линии, рисуем как простой прямоугольник
  if (widthScaled < visualLayerThickness * 2.2 || heightScaled < visualLayerThickness * 2.2) {
    return (
        <rect
            x={0}
            y={0}
            width={widthScaled}
            height={heightScaled}
            fill={wallFillColor}
            stroke={wallStrokeColor}
            strokeWidth={wallStrokeWidth}
            style={commonProps.style}
            data-object-id={commonProps['data-object-id']}
        />
    );
  }

  const outerPath = `M 0 0 L ${widthScaled} 0 L ${widthScaled} ${heightScaled} L 0 ${heightScaled} Z`;
  const innerPath = `M ${visualLayerThickness} ${visualLayerThickness} L ${widthScaled - visualLayerThickness} ${visualLayerThickness} L ${widthScaled - visualLayerThickness} ${heightScaled - visualLayerThickness} L ${visualLayerThickness} ${heightScaled - visualLayerThickness} Z`;
  
  const hatchId = `hatch-wall-${obj.id.replace(/[^a-zA-Z0-9]/g, '')}`; // ID должен быть валидным
  const showHatch = false; // Поставьте true для штриховки (например, для несущих стен)

  return (
    <g data-object-id={commonProps['data-object-id']} style={commonProps.style}>
      {showHatch && (
        <defs>
          <pattern id={hatchId} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke={ARCH_HATCH_COLOR} strokeWidth={Math.max(0.2, 0.5 / (scale / INITIAL_PPM))} />
          </pattern>
        </defs>
      )}
      <path
        d={`${outerPath} ${innerPath}`}
        fill={showHatch ? `url(#${hatchId})` : wallFillColor}
        stroke={wallStrokeColor}
        strokeWidth={wallStrokeWidth}
        fillRule="evenodd"
      />
    </g>
  );
};

export default React.memo(WallVisual);