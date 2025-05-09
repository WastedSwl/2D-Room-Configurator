// src/components/Configurator/renderers/ModuleRenderer.jsx
import React from "react";
import WallSegmentRenderer from "./WallSegmentRenderer";
import {
  GRID_CELL_SIZE_M,
  POTENTIAL_WALL_SLOT_COLOR,
  OBJECT_TYPES, // Import OBJECT_TYPES
} from "../configuratorConstants";

const ModuleRenderer = ({
  module,
  scale,
  selectedObjectId,
  setSelectedObjectId,
  onToggleWallSegment,
  primarySelectedObject,
  onContextMenu,
  // onModuleMouseDown, // Removed, handled by useMouseInteractions via data attributes
}) => {
  const {
    x,
    y,
    cellsWide,
    cellsLong,
    rotation,
    wallSegments,
    label,
    id: moduleId,
  } = module;

  const moduleTransform = `translate(${x * scale}, ${y * scale}) rotate(${rotation || 0})`;
  const cellSizePx = GRID_CELL_SIZE_M * scale;

  const handleSlotClick = (cellX, cellY, orientation) => {
    onToggleWallSegment(moduleId, cellX, cellY, orientation);
  };

  const handleModuleLeftClick = (e) => {
    // e.stopPropagation(); // Stop propagation if module itself is clicked.
    // This might interfere with deselection if not handled carefully in useMouseInteractions.
    // For now, let useMouseInteractions handle selection/deselection based on target.
    setSelectedObjectId(moduleId);
  };

  const handleModuleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(e, moduleId, OBJECT_TYPES.MODULE); // Pass OBJECT_TYPES.MODULE
    }
  };

  const potentialWallSlots = [];
  if (cellSizePx > 15) {
    // Only show slots if cells are reasonably large
    for (let cy = 1; cy < cellsLong; cy++) {
      for (let cx = 0; cx < cellsWide; cx++) {
        const segmentKey = `${cx},${cy}_h`;
        const isExistingWall = !!wallSegments[segmentKey];
        potentialWallSlots.push(
          <line
            key={`slot-h-${cx}-${cy}`}
            x1={cx * cellSizePx}
            y1={cy * cellSizePx}
            x2={(cx + 1) * cellSizePx}
            y2={cy * cellSizePx}
            stroke={isExistingWall ? "transparent" : POTENTIAL_WALL_SLOT_COLOR}
            strokeWidth={Math.max(1, cellSizePx * 0.05)}
            onClick={() => handleSlotClick(cx, cy, "h")}
            className="cursor-pointer hover:stroke-blue-500"
            strokeDasharray={isExistingWall ? "" : "2,2"}
          />,
        );
      }
    }
    for (let cx = 1; cx < cellsWide; cx++) {
      for (let cy = 0; cy < cellsLong; cy++) {
        const segmentKey = `${cx},${cy}_v`;
        const isExistingWall = !!wallSegments[segmentKey];
        potentialWallSlots.push(
          <line
            key={`slot-v-${cx}-${cy}`}
            x1={cx * cellSizePx}
            y1={cy * cellSizePx}
            x2={cx * cellSizePx}
            y2={(cy + 1) * cellSizePx}
            stroke={isExistingWall ? "transparent" : POTENTIAL_WALL_SLOT_COLOR}
            strokeWidth={Math.max(1, cellSizePx * 0.05)}
            onClick={() => handleSlotClick(cx, cy, "v")}
            className="cursor-pointer hover:stroke-blue-500"
            strokeDasharray={isExistingWall ? "" : "2,2"}
          />,
        );
      }
    }
  }

  return (
    <g
      transform={moduleTransform}
      onContextMenu={handleModuleContextMenu}
      // onClick={handleModuleLeftClick} // Let SvgCanvas handle click for deselection, module selection is via mousedown for drag.
      // onMouseDown prop for specific module dragging start can be added if needed,
      // but current approach uses data attributes on the rect below.
      data-object-id={moduleId} // For useMouseInteractions to identify module
      data-object-type={OBJECT_TYPES.MODULE} // For useMouseInteractions
      data-module-x={x} // Pass current X for drag calculation
      data-module-y={y} // Pass current Y for drag calculation
      className={
        selectedObjectId === moduleId ? "cursor-move" : "cursor-pointer"
      }
    >
      <rect
        x={0}
        y={0}
        width={cellsWide * cellSizePx}
        height={cellsLong * cellSizePx}
        fill={
          selectedObjectId === moduleId
            ? "rgba(0, 123, 255, 0.1)"
            : "rgba(50,50,60,0.05)"
        }
        stroke={
          selectedObjectId === moduleId
            ? "rgba(0, 123, 255, 0.7)"
            : "rgba(100,100,120,0.3)"
        }
        strokeWidth={selectedObjectId === moduleId ? 1.5 : 1}
        // pointerEvents="all" // Make sure rect is clickable for dragging
        // No specific onClick needed here if selection is handled by mousedown for drag
        // or if context menu sets selection.
      />
      {potentialWallSlots}
      {Object.entries(wallSegments).map(([segmentKey, segmentData]) => {
        const [coords, orientation] = segmentKey.split("_");
        const [cxStr, cyStr] = coords.split(",");
        const cellX = parseInt(cxStr, 10);
        const cellY = parseInt(cyStr, 10);

        let selectedElementIdOnThisWall = null;
        if (
          primarySelectedObject &&
          primarySelectedObject.parentWallSegment &&
          primarySelectedObject.parentWallSegment.id === segmentData.id
        ) {
          selectedElementIdOnThisWall = primarySelectedObject.id;
        }

        return (
          <WallSegmentRenderer
            key={segmentData.id}
            segmentData={segmentData}
            cellX={cellX}
            cellY={cellY}
            orientation={orientation}
            scale={scale}
            isSelected={selectedObjectId === segmentData.id}
            selectedElementId={selectedElementIdOnThisWall}
            onSelectWallSegment={() => setSelectedObjectId(segmentData.id)}
            onSelectElement={(elementId) => setSelectedObjectId(elementId)}
            onContextMenu={onContextMenu}
          />
        );
      })}
      {label &&
        cellSizePx * Math.min(cellsWide, cellsLong) > 40 && ( // Show label if module is reasonably sized
          <text
            x={(cellsWide * cellSizePx) / 2}
            y={(cellsLong * cellSizePx) / 2}
            fill="#E0E0E0"
            fontSize={Math.max(8, Math.min(20, 0.2 * scale))} // Adjusted size
            textAnchor="middle"
            dominantBaseline="middle"
            pointerEvents="none"
            className="select-none"
          >
            {label}
          </text>
        )}
    </g>
  );
};

export default React.memo(ModuleRenderer);
