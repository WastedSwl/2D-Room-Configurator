import React from "react";
import WallSegmentRenderer from "./WallSegmentRenderer";
import {
  GRID_CELL_SIZE_M,
  POTENTIAL_WALL_SLOT_COLOR,
  OBJECT_TYPES,
} from "../configuratorConstants";

const ModuleRenderer = ({
  module,
  scale,
  selectedObjectId,
  setSelectedObjectId,
  onToggleWallSegment,
  primarySelectedObject,
  onContextMenu,
  selectedPortalInterfaceKey,
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
    let isPerimeter = false;
    if (orientation === "h" && (cellY === 0 || cellY === cellsLong)) isPerimeter = true;
    if (orientation === "v" && (cellX === 0 || cellX === cellsWide)) isPerimeter = true;
    if (!isPerimeter) {
       onToggleWallSegment(moduleId, cellX, cellY, orientation);
    }
  };

  const handleModuleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(e, moduleId, OBJECT_TYPES.MODULE);
    }
  };

  const potentialWallSlots = [];
  const showSlotsThreshold = 15;
  if (cellSizePx > showSlotsThreshold) {
    for (let cy = 1; cy < cellsLong; cy++) {
      for (let cx = 0; cx < cellsWide; cx++) {
        const segmentKey = `${cx},${cy}_h`;
        const segmentData = wallSegments[segmentKey];
        const isExistingWall = !!segmentData;
         const isClickableSlot = !isExistingWall;
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
            className={isClickableSlot ? "cursor-pointer hover:stroke-blue-500" : "cursor-default"}
            strokeDasharray={isExistingWall ? "" : "2,2"}
             pointerEvents={isClickableSlot ? "all" : "none"}
          />,
        );
      }
    }
    for (let cx = 1; cx < cellsWide; cx++) {
      for (let cy = 0; cy < cellsLong; cy++) {
        const segmentKey = `${cx},${cy}_v`;
         const segmentData = wallSegments[segmentKey];
        const isExistingWall = !!segmentData;
         const isClickableSlot = !isExistingWall;
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
            className={isClickableSlot ? "cursor-pointer hover:stroke-blue-500" : "cursor-default"}
            strokeDasharray={isExistingWall ? "" : "2,2"}
            pointerEvents={isClickableSlot ? "all" : "none"}
          />,
        );
      }
    }
  }

  return (
    <g
      transform={moduleTransform}
      onContextMenu={handleModuleContextMenu}
      data-object-id={moduleId}
      data-object-type={OBJECT_TYPES.MODULE}
      data-module-x={x}
      data-module-y={y}
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
         pointerEvents="all"
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
           if (primarySelectedObject.type !== OBJECT_TYPES.WALL_SEGMENT) {
               selectedElementIdOnThisWall = primarySelectedObject.id;
           }
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
            onSelectWallSegment={(id) => setSelectedObjectId(id)}
            onSelectElement={(id) => setSelectedObjectId(id)}
            onContextMenu={onContextMenu}
            selectedPortalInterfaceKey={selectedPortalInterfaceKey}
          />
        );
      })}
      {label &&
        cellSizePx * Math.min(cellsWide, cellsLong) > 40 && (
          <text
            x={(cellsWide * cellSizePx) / 2}
            y={(cellsLong * cellSizePx) / 2}
            fill="#E0E0E0"
            fontSize={Math.max(8, Math.min(20, 0.2 * scale))}
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