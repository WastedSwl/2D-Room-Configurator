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
  manuallyClosedPortals,
  primarySelectedObject,
  selectedPortalInterfaceKey,
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

  const localHandleMouseMove = useCallback(
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

  const handleSvgContextMenu = (e) => {
    const targetIsCanvas =
      e.target === svgRef.current || e.target.closest("g#grid");
    if (targetIsCanvas && onContextMenu) {
      e.preventDefault();
      const svgRect = svgRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;
      const worldX = (clientX - svgRect.left - viewTransform.x) / scale;
      const worldY = (clientY - svgRect.top - viewTransform.y) / scale;
      onContextMenu(e, null, "canvas", { worldX, worldY });
    }
  };

  const existingModulesCount = objects.filter(
    (obj) => obj.type === OBJECT_TYPES.MODULE,
  ).length;

  const getPortalWallSegmentMeta = (segment, segmentModule, allObjects, currentManuallyClosedPortals) => {
    if (!segment.isPortalWall || !segment.portalInterfaceKey) {
      return { isSingleSidePortal: false, isManuallyClosed: false };
    }
    let partnerExists = false;
    for (const otherModule of allObjects) {
      if (otherModule.type === OBJECT_TYPES.MODULE && otherModule.id !== segmentModule.id) {
        for (const otherSegmentKey in otherModule.wallSegments) {
          const otherSeg = otherModule.wallSegments[otherSegmentKey];
          if (otherSeg.isPortalWall && otherSeg.portalInterfaceKey === segment.portalInterfaceKey) {
            partnerExists = true;
            break;
          }
        }
      }
      if (partnerExists) break;
    }
    const isManuallyClosed = currentManuallyClosedPortals.has(segment.portalInterfaceKey);
    return { isSingleSidePortal: !partnerExists, isManuallyClosed, portalInterfaceKey: segment.portalInterfaceKey };
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      onMouseMove={localHandleMouseMove}
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
            const enrichedWallSegments = {};
            if (obj.wallSegments) {
                for (const key in obj.wallSegments) {
                    const segment = obj.wallSegments[key];
                    const meta = getPortalWallSegmentMeta(segment, obj, objects, manuallyClosedPortals);
                    enrichedWallSegments[key] = { ...segment, ...meta };
                }
            }
            const enrichedModule = {...obj, wallSegments: enrichedWallSegments};
            return (
              <ModuleRenderer
                key={obj.id}
                module={enrichedModule}
                scale={scale}
                selectedObjectId={selectedObjectId}
                setSelectedObjectId={setSelectedObjectId}
                onToggleWallSegment={onToggleWallSegment}
                primarySelectedObject={primarySelectedObject}
                onContextMenu={onContextMenu}
                selectedPortalInterfaceKey={selectedPortalInterfaceKey}
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