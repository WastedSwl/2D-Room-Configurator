import React, { useState, useEffect, useCallback } from "react";
import Grid from "./Grid";
import ModuleRenderer from "../renderers/ModuleRenderer";
import AddModuleButtonRenderer from "../renderers/AddModuleButtonRenderer";
import { MODES, OBJECT_TYPES } from "../configuratorConstants";

const SvgCanvas = ({
  svgRef,
  viewTransform,
  modifierKeys,
  isPanningWithSpace,
  isDraggingModule,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  handleMouseDownOnCanvas,
  onContextMenu,
  objects,
  activeMode,
  selectedObjectId,
  setSelectedObjectId,
  scale,
  canAddInitialModule,
  onAddModule,
  onToggleWallSegment,
  primarySelectedObject,
  elementTypeToPlace,
  onWallSegmentClick,
  suitableWallSegmentIds, // Added
}) => {
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const currentSvg = svgRef.current;
    if (!currentSvg) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSvgDimensions({ width, height });
      }
    });
    resizeObserver.observe(currentSvg);
    const rect = currentSvg.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setSvgDimensions({ width: rect.width, height: rect.height });
    }
    return () => {
      if (currentSvg) resizeObserver.unobserve(currentSvg);
    };
  }, [svgRef]);

  const localHandleMouseMoveForCanvas = useCallback(
    (e) => {
      if ((isPanningWithSpace || isDraggingModule) && handleMouseMove) {
        handleMouseMove(e);
      }
    },
    [isPanningWithSpace, isDraggingModule, handleMouseMove],
  );

  let cursorClass = "cursor-default";
  if (isDraggingModule)
    cursorClass = "cursor-grabbing";
  else if (isPanningWithSpace) cursorClass = "cursor-grabbing";
  else if (modifierKeys?.spacebar) cursorClass = "cursor-grab";
  else if (elementTypeToPlace) cursorClass = "cursor-crosshair";

  const handleSvgContextMenu = (e) => {
    const targetIsCanvas =
      e.target === svgRef.current || e.target.closest("g#grid");
    if (targetIsCanvas && onContextMenu) {
      e.preventDefault();
      onContextMenu(e, null, "canvas", {});
    }
  };

  const existingModulesCount = objects.filter(
    (obj) => obj.type === OBJECT_TYPES.MODULE,
  ).length;


  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      onMouseMove={localHandleMouseMoveForCanvas}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDownOnCanvas}
      onContextMenu={handleSvgContextMenu}
      className={`block ${cursorClass} bg-card-bg`}
    >
      {svgDimensions.width > 0 && svgDimensions.height > 0 && (
        <Grid
          viewTransform={viewTransform}
          svgWidth={svgDimensions.width}
          svgHeight={svgDimensions.height}
        />
      )}
      <g transform={`translate(${viewTransform.x}, ${viewTransform.y})`}>
        {activeMode === MODES.MODULAR && canAddInitialModule && (
          <AddModuleButtonRenderer
            scale={scale}
            onClick={onAddModule}
            hasModules={existingModulesCount > 0}
          />
        )}
        {objects.map((obj) => {
          if (
            obj.type === OBJECT_TYPES.MODULE &&
            activeMode === MODES.MODULAR
          ) {
            return (
              <ModuleRenderer
                key={obj.id}
                module={obj}
                scale={scale}
                selectedObjectId={selectedObjectId}
                setSelectedObjectId={setSelectedObjectId}
                onToggleWallSegment={onToggleWallSegment}
                primarySelectedObject={primarySelectedObject}
                onContextMenu={onContextMenu}
                elementTypeToPlace={elementTypeToPlace}
                onWallSegmentClick={onWallSegmentClick}
                suitableWallSegmentIds={suitableWallSegmentIds} // Pass down
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};
export default SvgCanvas;