// ========= src/components/Configurator/renderers/WallSegmentRenderer.jsx =========
import React from "react";
import DoorRenderer from "./DoorRenderer";
import WindowRenderer from "./WindowRenderer";
import {
  WALL_COLOR,
  SELECTED_WALL_SEGMENT_COLOR,
  GRID_CELL_SIZE_M,
  ELEMENT_STROKE_COLOR,
  POTENTIAL_WALL_SLOT_COLOR, // Ensure this is imported or defined
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
  // onSolidifyPortalSide, // New callback for making empty portal side solid - this will be handled via context menu for now
}) => {
  const {
    id: segmentId,
    elements,
    thickness,
    isPortalWall,
    hasPortalDoor,
  } = segmentData;
  const cellSizePx = GRID_CELL_SIZE_M * scale;
  const wallThicknessPx = thickness * scale;

  let rectX, rectY, rectWidth, rectHeight;
  let elementGroupTx, elementGroupTy, elementGroupAngle;

  // Common positioning logic
  if (orientation === "h") {
    rectX = cellX * cellSizePx;
    rectY = cellY * cellSizePx - wallThicknessPx / 2;
    rectWidth = cellSizePx;
    rectHeight = wallThicknessPx;
    elementGroupTx = cellX * cellSizePx;
    elementGroupTy = cellY * cellSizePx;
    elementGroupAngle = 0;
  } else {
    // 'v'
    rectX = cellX * cellSizePx - wallThicknessPx / 2;
    rectY = cellY * cellSizePx;
    rectWidth = wallThicknessPx;
    rectHeight = cellSizePx;
    elementGroupTx = cellX * cellSizePx;
    elementGroupTy = cellY * cellSizePx;
    elementGroupAngle = 90;
  }

  const wallFillColor = isSelected ? SELECTED_WALL_SEGMENT_COLOR : WALL_COLOR;

  const handleWallLeftClick = (e) => {
    if (
      e.target === e.currentTarget ||
      e.target.dataset.role === "portalSidePlaceholder"
    ) {
      // If it's the placeholder, selecting it might bring up context menu options for it.
      onSelectWallSegment(segmentId);
    }
  };

  const handleWallContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(e, segmentId, "wall_segment");
    }
  };

  // If this wall segment is part of a portal BUT does NOT have the door:
  // Render a placeholder that can be interacted with (e.g., via context menu)
  if (isPortalWall && !hasPortalDoor) {
    return (
      <g onClick={handleWallLeftClick} onContextMenu={handleWallContextMenu}>
        <rect
          data-role="portalSidePlaceholder" // Identifier for testing/styling if needed
          x={rectX}
          y={rectY}
          width={rectWidth}
          height={rectHeight}
          fill="transparent" // Make it transparent but clickable
          stroke={POTENTIAL_WALL_SLOT_COLOR}
          strokeWidth={Math.max(1, cellSizePx * 0.02)}
          strokeDasharray="3,3"
          className="cursor-pointer hover:opacity-70"
          pointerEvents="all"
        />
      </g>
    );
  }

  // Normal rendering for walls or the side of the portal that HAS the door
  return (
    <g onContextMenu={handleWallContextMenu}>
      <rect
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        fill={wallFillColor}
        stroke={ELEMENT_STROKE_COLOR}
        strokeWidth={Math.max(0.5, 0.005 * scale)}
        onClick={handleWallLeftClick}
        className="cursor-pointer hover:opacity-80"
        pointerEvents="all"
      />
      <g
        transform={`translate(${elementGroupTx}, ${elementGroupTy}) rotate(${elementGroupAngle})`}
      >
        {elements.map((element) => {
          const elementOffsetXPx =
            cellSizePx * element.positionOnSegment -
            (element.width * scale) / 2;

          const handleElementContextMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onContextMenu) {
              onContextMenu(e, element.id, element.type);
            }
          };

          const commonElementProps = {
            key: element.id,
            element,
            scale,
            wallThickness: thickness,
            isSelected: selectedElementId === element.id,
            onSelect: (elId) => {
              onSelectElement(elId);
            },
          };

          return (
            <g
              key={element.id}
              transform={`translate(${elementOffsetXPx}, 0)`}
              onContextMenu={handleElementContextMenu}
              onClick={(e) => {
                // Ensure clicks on elements are handled by them for selection
                e.stopPropagation(); // Stop propagation to wall segment
                commonElementProps.onSelect(element.id);
              }}
              className="cursor-pointer"
            >
              {element.type === "door" && (
                <DoorRenderer {...commonElementProps} />
              )}
              {element.type === "window" && (
                <WindowRenderer {...commonElementProps} />
              )}
            </g>
          );
        })}
      </g>
    </g>
  );
};

export default React.memo(WallSegmentRenderer);
