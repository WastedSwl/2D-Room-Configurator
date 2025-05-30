// src/components/Configurator/renderers/DoorRenderer.jsx
import React from "react";
import { SELECTED_ELEMENT_COLOR } from "../configuratorConstants";
import { ReactComponent as DoorSvg } from '../../Assets/door.svg'; // Убедитесь, что SVG УПРОЩЕН!

const DoorRenderer = ({
  element,
  scale,
  isSelected,
  wallThickness,
}) => {
  const {
    width: doorSegmentWidthM, // Ширина всего дверного проема (сегмента стены)
    hingeSide = "left",
  } = element;

  // РАЗМЕРЫ ИЗ VIEWBOX ВАШЕГО SVG ФАЙЛА ДВЕРИ
  const SVG_VIEWBOX_WIDTH_UNITS = 80.924862;
  const SVG_VIEWBOX_HEIGHT_UNITS = 83.359993;

  // --- Начало секции для возможной подстройки ---
  // Эти значения - смещения в *оригинальных единицах SVG* (до масштабирования в DoorRenderer).
  // Если (0,0) viewBox вашего SVG не точно совпадает с визуальной точкой петли,
  // или визуальный центр косяка смещен, попробуйте изменить эти значения.
  // Положительные значения сдвинут символ двери:
  // FUDGE_TRANSLATE_X_SVG: вправо по оси X SVG (вдоль направления открывания до поворота)
  // FUDGE_TRANSLATE_Y_SVG: вниз по оси Y SVG (вдоль косяка до поворота)
  const FUDGE_TRANSLATE_X_SVG = 0; // Пример: попробуйте -5 или 5
  const FUDGE_TRANSLATE_Y_SVG = 0; // Пример: попробуйте -5 или 5
  // --- Конец секции для возможной подстройки ---

  // Рассчитываем размеры SVG на экране
  const screenJambLengthPx = doorSegmentWidthM * scale;
  // Масштабный коэффициент, чтобы высота SVG (косяк) соответствовала длине косяка на экране
  const svgInternalScaleFactor = screenJambLengthPx / SVG_VIEWBOX_HEIGHT_UNITS;

  // Итоговые размеры SVG на экране
  const screenSvgWidthPx = SVG_VIEWBOX_WIDTH_UNITS * svgInternalScaleFactor;
  const screenSvgHeightPx = SVG_VIEWBOX_HEIGHT_UNITS * svgInternalScaleFactor; // Должно быть равно screenJambLengthPx

  const wallThicknessPx = wallThickness * scale;

  // Координаты для позиционирования:
  // translateX: центрирует косяк (высоту SVG после поворота) вдоль стены
  // translateY: размещает линию петель на одной из граней стены
  const translateX = -screenSvgHeightPx / 2;
  const translateY = -wallThicknessPx / 2;

  // Базовая трансформация: сдвиг на рассчитанные координаты, затем поворот
  let doorSymbolTransform = `translate(${translateX}, ${translateY}) rotate(-90) `;

  // Применяем корректирующие смещения (fudge factors) *после* основного поворота.
  // На этом этапе система координат уже повернута:
  //   +X группы DoorRenderer идет вдоль стены (бывшая +Y SVG)
  //   +Y группы DoorRenderer идет в комнату (бывшая +X SVG)
  // Поэтому FUDGE_TRANSLATE_Y_SVG (смещение вдоль косяка) повлияет на X-трансляцию,
  // а FUDGE_TRANSLATE_X_SVG (смещение по ширине открывания) повлияет на Y-трансляцию.
  if (FUDGE_TRANSLATE_X_SVG !== 0 || FUDGE_TRANSLATE_Y_SVG !== 0) {
    const fudgeScreenX = FUDGE_TRANSLATE_Y_SVG * svgInternalScaleFactor; // Смещение вдоль косяка (теперь по X)
    const fudgeScreenY = FUDGE_TRANSLATE_X_SVG * svgInternalScaleFactor; // Смещение по ширине (теперь по Y)
    doorSymbolTransform += `translate(${fudgeScreenX}, ${fudgeScreenY}) `;
  }

  if (hingeSide === "right") {
    // Отражаем по оси X текущей системы координат (которая сейчас идет вдоль косяка).
    // Это меняет направление оси Y (направление открывания).
    doorSymbolTransform += `scale(1, -1) `;
  }

  const svgStyle = {
    fill: isSelected ? "rgba(0, 123, 255, 0.15)" : "rgba(220, 220, 225, 0.85)",
    stroke: isSelected ? SELECTED_ELEMENT_COLOR : "rgba(60, 70, 80, 0.95)",
    strokeWidth: Math.max(0.5, 1 / svgInternalScaleFactor),
  };

  return (
    <g transform={doorSymbolTransform}>
      <DoorSvg
        width={screenSvgWidthPx}
        height={screenSvgHeightPx}
        preserveAspectRatio="none"
        style={svgStyle}
      />
    </g>
  );
};

export default React.memo(DoorRenderer);