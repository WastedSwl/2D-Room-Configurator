import React from "react";
import DoorRenderer from "./DoorRenderer";
import WindowRenderer from "./WindowRenderer";
import {
  WALL_COLOR,
  SELECTED_WALL_SEGMENT_COLOR,
  GRID_CELL_SIZE_M,
  ELEMENT_STROKE_COLOR,
  OBJECT_TYPES,
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
  selectedPortalInterfaceKey,
}) => {
  const {
    id: segmentId,
    elements = [],
    thickness,
    isPortalWall,
    isSingleSidePortal,
    isManuallyClosed,
    portalInterfaceKey,
  } = segmentData;

  const cellSizePx = GRID_CELL_SIZE_M * scale;
  const originalWallThicknessPx = thickness * scale;
  const portalRectThickness = Math.max(2, originalWallThicknessPx * 0.2);
  const portalRectOffsetFromCenter = Math.max(1, originalWallThicknessPx * 0.1);

  let mainBoundingRectX, mainBoundingRectY, mainBoundingRectWidth, mainBoundingRectHeight;
  let wallRect1X, wallRect1Y, wallRect1Width, wallRect1Height;
  let wallRect2X, wallRect2Y, wallRect2Width, wallRect2Height;
  let elementGroupTx, elementGroupTy, elementGroupAngle;

  if (orientation === "h") {
    mainBoundingRectX = cellX * cellSizePx;
    mainBoundingRectY = cellY * cellSizePx - originalWallThicknessPx / 2;
    mainBoundingRectWidth = cellSizePx;
    mainBoundingRectHeight = originalWallThicknessPx;
    wallRect1X = cellX * cellSizePx;
    wallRect1Y = cellY * cellSizePx - portalRectOffsetFromCenter - portalRectThickness;
    wallRect1Width = cellSizePx;
    wallRect1Height = portalRectThickness;
    wallRect2X = cellX * cellSizePx;
    wallRect2Y = cellY * cellSizePx + portalRectOffsetFromCenter;
    wallRect2Width = cellSizePx;
    wallRect2Height = portalRectThickness;
    elementGroupTx = cellX * cellSizePx;
    elementGroupTy = cellY * cellSizePx;
    elementGroupAngle = 0;
  } else {
    mainBoundingRectX = cellX * cellSizePx - originalWallThicknessPx / 2;
    mainBoundingRectY = cellY * cellSizePx;
    mainBoundingRectWidth = originalWallThicknessPx;
    mainBoundingRectHeight = cellSizePx;
    wallRect1X = cellX * cellSizePx - portalRectOffsetFromCenter - portalRectThickness;
    wallRect1Y = cellY * cellSizePx;
    wallRect1Width = portalRectThickness;
    wallRect1Height = cellSizePx;
    wallRect2X = cellX * cellSizePx + portalRectOffsetFromCenter;
    wallRect2Y = cellY * cellSizePx;
    wallRect2Width = portalRectThickness;
    wallRect2Height = cellSizePx;
    elementGroupTx = cellX * cellSizePx;
    elementGroupTy = cellY * cellSizePx;
    elementGroupAngle = 90;
  }

  const isVisuallySelected = isSelected ||
                           (isPortalWall &&
                            portalInterfaceKey &&
                            portalInterfaceKey === selectedPortalInterfaceKey &&
                            selectedPortalInterfaceKey !== null);

  const defaultWallFillColor = isVisuallySelected ? SELECTED_WALL_SEGMENT_COLOR : WALL_COLOR;
  const portalJambFillColor = isVisuallySelected ? SELECTED_WALL_SEGMENT_COLOR : WALL_COLOR;
  const portalJambStrokeColor = isVisuallySelected ? SELECTED_WALL_SEGMENT_COLOR : ELEMENT_STROKE_COLOR;
  const portalJambStrokeWidth = Math.max(0.5, 0.005 * scale);
  const singleSidePortalFillColor = isVisuallySelected ? SELECTED_WALL_SEGMENT_COLOR : "rgba(160, 160, 160, 0.3)";
  const singleSidePortalStrokeColor = isVisuallySelected ? SELECTED_WALL_SEGMENT_COLOR : "rgba(51, 51, 51, 0.5)";


  const handleWallLeftClick = (e) => {
    if (e.target === e.currentTarget || e.target.closest(`[data-segment-id="${segmentId}"]`)) {
      e.stopPropagation();
      onSelectWallSegment(segmentId);
    }
  };

  const handleWallContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(e, segmentId, OBJECT_TYPES.WALL_SEGMENT, { isSingleSidePortal, isManuallyClosed });
    }
  };

  const wallHasPortalDoorElement = elements.some(el => el.isPortalDoor);

  if (isPortalWall) {
    if (wallHasPortalDoorElement) {
      return (
        <g
          onContextMenu={handleWallContextMenu}
          data-object-id={segmentId}
          data-object-type={OBJECT_TYPES.WALL_SEGMENT}
          data-segment-id={segmentId}
        >
          <rect
            x={mainBoundingRectX} y={mainBoundingRectY}
            width={mainBoundingRectWidth} height={mainBoundingRectHeight}
            fill="transparent"
            onClick={handleWallLeftClick}
            pointerEvents="all"
            className="cursor-pointer"
          />
          {!isSingleSidePortal && (
             <>
              <rect x={wallRect1X} y={wallRect1Y} width={wallRect1Width} height={wallRect1Height} fill={portalJambFillColor} stroke={portalJambStrokeColor} strokeWidth={portalJambStrokeWidth} className="group-hover:opacity-80" pointerEvents="none" />
              <rect x={wallRect2X} y={wallRect2Y} width={wallRect2Width} height={wallRect2Height} fill={portalJambFillColor} stroke={portalJambStrokeColor} strokeWidth={portalJambStrokeWidth} className="group-hover:opacity-80" pointerEvents="none" />
            </>
          )}
          <g transform={`translate(${elementGroupTx}, ${elementGroupTy}) rotate(${elementGroupAngle})`}>
            {elements.map((element) => {
              const elementOffsetPx = cellSizePx * element.positionOnSegment - (element.width * scale) / 2;
              const handleElementContextMenu = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onContextMenu) {
                  onContextMenu(e, element.id, element.type, {});
                }
              };
              const commonElementProps = {
                element,
                scale,
                wallThickness: thickness,
                isSelected: selectedElementId === element.id,
                onSelect: (elId) => onSelectElement(elId),
              };
              return (
                <g
                  key={element.id}
                  transform={`translate(${elementOffsetPx}, 0)`}
                  onContextMenu={handleElementContextMenu}
                  onClick={(e) => { e.stopPropagation(); commonElementProps.onSelect(element.id); }}
                  className="cursor-pointer"
                  data-object-id={element.id}
                  data-object-type={element.type}
                >
                  {element.type === OBJECT_TYPES.DOOR && <DoorRenderer {...commonElementProps} />}
                  {element.type === OBJECT_TYPES.WINDOW && <WindowRenderer {...commonElementProps} />}
                </g>
              );
            })}
          </g>
        </g>
      );
    }
    else {
      if (isManuallyClosed && !isSingleSidePortal) {
        return (
          <g
            onClick={handleWallLeftClick}
            onContextMenu={handleWallContextMenu}
            data-object-id={segmentId}
            data-object-type={OBJECT_TYPES.WALL_SEGMENT}
            data-segment-id={segmentId}
            className={`cursor-pointer group`}
          >
            <rect
              x={mainBoundingRectX} y={mainBoundingRectY}
              width={mainBoundingRectWidth} height={mainBoundingRectHeight}
              fill={defaultWallFillColor}
              stroke={ELEMENT_STROKE_COLOR}
              strokeWidth={Math.max(0.5, 0.005 * scale)}
              className="group-hover:opacity-80"
              pointerEvents="all"
            />
          </g>
        );
      } else if (!isManuallyClosed && !isSingleSidePortal) {
        return (
          <g
            onClick={handleWallLeftClick}
            onContextMenu={handleWallContextMenu}
            data-object-id={segmentId}
            data-object-type={OBJECT_TYPES.WALL_SEGMENT}
            data-segment-id={segmentId}
            className={`cursor-pointer group`}
          >
            <rect x={mainBoundingRectX} y={mainBoundingRectY} width={mainBoundingRectWidth} height={mainBoundingRectHeight} fill="transparent" pointerEvents="all" />
            <rect x={wallRect1X} y={wallRect1Y} width={wallRect1Width} height={wallRect1Height} fill={portalJambFillColor} stroke={portalJambStrokeColor} strokeWidth={portalJambStrokeWidth} className="group-hover:opacity-80" />
            <rect x={wallRect2X} y={wallRect2Y} width={wallRect2Width} height={wallRect2Height} fill={portalJambFillColor} stroke={portalJambStrokeColor} strokeWidth={portalJambStrokeWidth} className="group-hover:opacity-80" />
          </g>
        );
      } else {
        return (
          <g
            onClick={handleWallLeftClick}
            onContextMenu={handleWallContextMenu}
            data-object-id={segmentId}
            data-object-type={OBJECT_TYPES.WALL_SEGMENT}
            data-segment-id={segmentId}
            className={`cursor-pointer group`}
          >
            <rect x={mainBoundingRectX} y={mainBoundingRectY} width={mainBoundingRectWidth} height={mainBoundingRectHeight} fill="transparent" pointerEvents="all" />
            <rect x={wallRect1X} y={wallRect1Y} width={wallRect1Width} height={wallRect1Height} fill={singleSidePortalFillColor} stroke={singleSidePortalStrokeColor} strokeWidth={portalJambStrokeWidth} strokeDasharray="3,3" className="group-hover:opacity-70" />
          </g>
        );
      }
    }
  }
  else {
    return (
      <g
        onContextMenu={handleWallContextMenu}
        data-object-id={segmentId}
        data-object-type={OBJECT_TYPES.WALL_SEGMENT}
        data-segment-id={segmentId}
      >
        <rect
          x={mainBoundingRectX} y={mainBoundingRectY}
          width={mainBoundingRectWidth} height={mainBoundingRectHeight}
          fill={defaultWallFillColor}
          stroke={ELEMENT_STROKE_COLOR}
          strokeWidth={Math.max(0.5, 0.005 * scale)}
          onClick={handleWallLeftClick}
          className="cursor-pointer hover:opacity-80"
          pointerEvents="all"
        />
        <g transform={`translate(${elementGroupTx}, ${elementGroupTy}) rotate(${elementGroupAngle})`}>
          {elements.map((element) => {
            const elementOffsetPx = cellSizePx * element.positionOnSegment - (element.width * scale) / 2;
            const handleElementContextMenu = (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onContextMenu) {
                onContextMenu(e, element.id, element.type, {});
              }
            };
            const commonElementProps = {
              element,
              scale,
              wallThickness: thickness,
              isSelected: selectedElementId === element.id,
              onSelect: (elId) => onSelectElement(elId),
            };
            return (
              <g
                key={element.id}
                transform={`translate(${elementOffsetPx}, 0)`}
                onContextMenu={handleElementContextMenu}
                onClick={(e) => { e.stopPropagation(); commonElementProps.onSelect(element.id); }}
                className="cursor-pointer"
                data-object-id={element.id}
                data-object-type={element.type}
              >
                {element.type === OBJECT_TYPES.DOOR && <DoorRenderer {...commonElementProps} />}
                {element.type === OBJECT_TYPES.WINDOW && <WindowRenderer {...commonElementProps} />}
              </g>
            );
          })}
        </g>
      </g>
    );
  }
};
export default React.memo(WallSegmentRenderer);