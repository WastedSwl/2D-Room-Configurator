// src/components/Configurator/renderers/WallSegmentRenderer.jsx
import React from "react";
import DoorRenderer from "./DoorRenderer";
import WindowRenderer from "./WindowRenderer";
import PanoramicWindowRenderer from "./PanoramicWindowRenderer";
import OutletRenderer from "./OutletRenderer";
import WallMountedLightRenderer from "./WallMountedLightRenderer";
import RadiatorRenderer from "./RadiatorRenderer"; // Оставляем для совместимости
import KitchenElementRenderer from "./KitchenElementRenderer"; // Оставляем для совместимости
import SwitchRenderer from "./SwitchRenderer"; // Новый
import SwitchDoubleRenderer from "./SwitchDoubleRenderer"; // Новый
import {
  OBJECT_TYPES,
  GRID_CELL_SIZE_M,
  SELECTED_ELEMENT_COLOR,
  PLACEMENT_HIGHLIGHT_FILL_COLOR,
  PLACEMENT_NOT_ALLOWED_FILL_COLOR,
  INITIAL_PPM,
  WALL_THICKNESS_M_RENDER,
  DOCKED_SPLIT_WALL_THICKNESS_M, // Убедимся, что этот импорт есть
  EPSILON,
  defaultObjectSizes
} from "../configuratorConstants";

const WallSegmentRenderer = ({
  segmentData,
  cellX,
  cellY,
  orientation,
  scale,
  isSelected,
  selectedElementId,
  onSelectWallSegment,
  onSelectElement,
  onContextMenu,
  highlightForPlacement,
  isInPlacementMode,
}) => {
  const {
    id: segmentId,
    elements,
    thickness = WALL_THICKNESS_M_RENDER,
    renderOffset = 0,
    isFullyOpenPassage,
    isDocked,
    isPassageWithPartner
  } = segmentData;

  const currentElements = Array.isArray(elements) ? elements : [];
  const cellSizePx = GRID_CELL_SIZE_M * scale;
  const visualThicknessPx = isFullyOpenPassage ? Math.max(1, 0.005 * scale) : thickness * scale;

  const baseStrokeWidth = 0.5 / (scale > INITIAL_PPM ? Math.sqrt(scale / INITIAL_PPM) : 1);
  const offsetPx = renderOffset * scale; // Смещение визуальной части стены в пикселях

  // Определяем, является ли этот сегмент частью "сэндвич" стены (не объединенной и не полностью открытой)
  const isSandwichPart = isDocked && !isPassageWithPartner && !isFullyOpenPassage;

  // Определяем толщину стены, которую нужно передать элементам (дверям, окнам)
  // для расчета их глубины/положения относительно грани.
  // Для "сэндвич" частей это будет их собственная тонкая толщина.
  // Для обычных или объединенных стен - полная толщина.
  const actualWallThicknessForElementDepth = isSandwichPart
    ? DOCKED_SPLIT_WALL_THICKNESS_M
    : WALL_THICKNESS_M_RENDER;

  let rectX, rectY, rectWidth, rectHeight;
  let elementsContainerTransform;

  // Смещение для контейнера элементов, если это "сэндвич" стена.
  // Контейнер элементов должен быть отцентрирован относительно *визуальной* части "сэндвич" стены.
  const elementContainerOffsetPx = isSandwichPart ? offsetPx : 0;

  if (orientation === "h") {
    // Позиция визуального прямоугольника стены (с учетом offsetPx)
    rectX = cellX * cellSizePx;
    rectY = (cellY * cellSizePx + offsetPx) - visualThicknessPx / 2;
    rectWidth = cellSizePx;
    rectHeight = visualThicknessPx;

    // Трансформация для контейнера элементов:
    // Он должен быть на той же Y-координате, что и центр визуальной "сэндвич" стены
    elementsContainerTransform = `translate(${cellX * cellSizePx}, ${cellY * cellSizePx + elementContainerOffsetPx})`;
  } else { // orientation === "v"
    // Позиция визуального прямоугольника стены (с учетом offsetPx)
    rectX = (cellX * cellSizePx + offsetPx) - visualThicknessPx / 2;
    rectY = cellY * cellSizePx;
    rectWidth = visualThicknessPx;
    rectHeight = cellSizePx;

    // Трансформация для контейнера элементов:
    // Он должен быть на той же X-координате, что и центр визуальной "сэндвич" стены, затем повернут
    const translateXForElements = cellX * cellSizePx + elementContainerOffsetPx;
    const translateYForElements = cellY * cellSizePx;
    elementsContainerTransform = `translate(${translateXForElements}, ${translateYForElements}) rotate(90)`;
  }

  let currentWallFill = "rgba(75, 85, 99, 0.3)";
  let currentWallStroke = "rgba(156, 163, 175, 0.7)";
  let currentFinalStrokeWidth = baseStrokeWidth;

  if (isInPlacementMode) {
    if (highlightForPlacement) {
      currentWallFill = PLACEMENT_HIGHLIGHT_FILL_COLOR;
      currentWallStroke = "rgba(52, 211, 153, 0.9)";
      currentFinalStrokeWidth = baseStrokeWidth * 1.5;
    } else if (!isFullyOpenPassage) {
      currentWallFill = PLACEMENT_NOT_ALLOWED_FILL_COLOR;
      currentWallStroke = "rgba(239, 68, 68, 0.7)";
      currentFinalStrokeWidth = baseStrokeWidth * 1.3;
    } else {
      currentWallFill = "rgba(100, 116, 139, 0.05)";
      currentWallStroke = "rgba(100, 116, 139, 0.15)";
      currentFinalStrokeWidth = Math.max(0.3, baseStrokeWidth * 0.5);
    }
  } else {
    if (isFullyOpenPassage) {
      currentWallFill = "rgba(59, 130, 246, 0.05)";
      currentWallStroke = "rgba(59, 130, 246, 0.2)";
      currentFinalStrokeWidth = Math.max(0.3, baseStrokeWidth * 0.5);
      if (isSelected) {
          currentWallFill = "rgba(59, 130, 246, 0.15)";
          currentWallStroke = SELECTED_ELEMENT_COLOR;
      }
    } else if (isSelected) {
      currentWallFill = "rgba(59, 130, 246, 0.3)";
      currentWallStroke = SELECTED_ELEMENT_COLOR;
      currentFinalStrokeWidth = baseStrokeWidth * 2;
    }
  }

  const handleWallContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(e, segmentId, OBJECT_TYPES.WALL_SEGMENT, {});
    }
  };

  const renderElements = () => {
    if (!currentElements || currentElements.length === 0) return null;
    return (
      <>
        <g transform={elementsContainerTransform}>
          {currentElements.map((element) => {
            if(!element || !element.type) return null;
            let elementRenderWidthM = element.width || GRID_CELL_SIZE_M;
            let currentPositionOnSegment = element.positionOnSegment || 0.5;

            if (element.type === OBJECT_TYPES.DOOR || element.type === OBJECT_TYPES.WINDOW) {
              elementRenderWidthM = GRID_CELL_SIZE_M;
              currentPositionOnSegment = 0.5;
            } else {
                 const defaultSize = defaultObjectSizes[element.type];
                 elementRenderWidthM = element.width || (defaultSize ? defaultSize.width : GRID_CELL_SIZE_M) ;
            }

            const elementRenderWidthPx = elementRenderWidthM * scale;
            const elementOffsetXPx = cellSizePx * currentPositionOnSegment - (elementRenderWidthPx / 2);

            const handleElementContextMenu = (eInner) => {
              eInner.preventDefault(); eInner.stopPropagation();
              if (onContextMenu) onContextMenu(eInner, element.id, element.type, {});
            };
            return (
              <g
                key={element.id}
                transform={`translate(${elementOffsetXPx}, 0)`}
                onContextMenu={handleElementContextMenu}
                onClick={(eInner) => { eInner.stopPropagation(); onSelectElement(element.id); }}
                className="cursor-pointer"
                data-object-id={element.id}
                data-object-type={element.type}
              >
                {/* Передаем actualWallThicknessForElementDepth во все элементы, которые зависят от толщины стены */}
                {element.type === OBJECT_TYPES.DOOR && <DoorRenderer element={{...element, width: elementRenderWidthM}} scale={scale} wallThickness={actualWallThicknessForElementDepth} isSelected={selectedElementId === element.id} />}
                {element.type === OBJECT_TYPES.WINDOW && <WindowRenderer element={{...element, width: elementRenderWidthM}} scale={scale} wallThickness={actualWallThicknessForElementDepth} isSelected={selectedElementId === element.id} />}
                {element.type === OBJECT_TYPES.PANORAMIC_WINDOW && <PanoramicWindowRenderer element={{...element, width: elementRenderWidthM}} scale={scale} wallThickness={actualWallThicknessForElementDepth} isSelected={selectedElementId === element.id} />}
                
                {/* Для элементов, которые просто "накладываются" на стену, толщина может быть менее критична, но для консистентности можно передавать */}
                {element.type === OBJECT_TYPES.OUTLET && <OutletRenderer element={{...element, width: elementRenderWidthM}} scale={scale} isSelected={selectedElementId === element.id} wallThickness={actualWallThicknessForElementDepth}/>}
                {element.type === OBJECT_TYPES.LIGHT_WALL && <WallMountedLightRenderer element={{...element, width: elementRenderWidthM}} scale={scale} isSelected={selectedElementId === element.id} wallThickness={actualWallThicknessForElementDepth}/>}
                {element.type === OBJECT_TYPES.SWITCH && <SwitchRenderer element={{...element, width: elementRenderWidthM}} scale={scale} isSelected={selectedElementId === element.id} wallThickness={actualWallThicknessForElementDepth}/>}
                {element.type === OBJECT_TYPES.SWITCH_DOUBLE && <SwitchDoubleRenderer element={{...element, width: elementRenderWidthM}} scale={scale} isSelected={selectedElementId === element.id} wallThickness={actualWallThicknessForElementDepth}/>}
                {element.type === OBJECT_TYPES.RADIATOR && <RadiatorRenderer element={{...element, width: elementRenderWidthM}} scale={scale} isSelected={selectedElementId === element.id} wallThickness={actualWallThicknessForElementDepth}/>}
                {element.type === OBJECT_TYPES.KITCHEN_ELEMENT && <KitchenElementRenderer element={{...element, width: elementRenderWidthM}} scale={scale} isSelected={selectedElementId === element.id} wallThickness={actualWallThicknessForElementDepth}/>}
              </g>
            );
          })}
        </g>
      </>
    );
  };

  const shouldRenderElements = !(isFullyOpenPassage);

  return (
    <g onContextMenu={handleWallContextMenu} data-segment-id={segmentId}>
      <rect
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        fill={currentWallFill}
        stroke={currentWallStroke}
        strokeWidth={currentFinalStrokeWidth}
        onClick={(e) => { e.stopPropagation(); onSelectWallSegment(segmentId); }}
        style={{
          cursor: isInPlacementMode && !isFullyOpenPassage
              ? (highlightForPlacement ? 'copy' : 'not-allowed')
              : (isSelected && !isInPlacementMode ? 'move' : 'pointer')
        }}
        data-object-id={segmentId}
        data-object-type={OBJECT_TYPES.WALL_SEGMENT}
        pointerEvents="all"
      />
      {shouldRenderElements && renderElements()}
    </g>
  );
};

export default React.memo(WallSegmentRenderer);