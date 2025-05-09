// src/components/Configurator/canvas/SvgCanvas.jsx
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
  isDraggingModule, // New prop from useMouseInteractions
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  handleMouseDownOnCanvas,
  onContextMenu,
  objects,
  activeMode,
  selectedObjectId,
  setSelectedObjectId, // Pass down for renderers if they need to set selection
  scale,
  canAddInitialModule,
  onAddModule, // This is addModuleAtZeroZero from Configurator
  onToggleWallSegment,
  primarySelectedObject,
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
      // Allow mouse move for both panning and module dragging
      if ((isPanningWithSpace || isDraggingModule) && handleMouseMove) {
        handleMouseMove(e);
      }
    },
    [isPanningWithSpace, isDraggingModule, handleMouseMove],
  );

  let cursorClass = "cursor-default";
  if (isDraggingModule)
    cursorClass = "cursor-grabbing"; // Or "cursor-move"
  else if (isPanningWithSpace) cursorClass = "cursor-grabbing";
  else if (modifierKeys?.spacebar) cursorClass = "cursor-grab";

  const handleSvgContextMenu = (e) => {
    // Only trigger canvas context menu if not clicking on an existing object
    // This check might be complex. For now, assume object renderers stop propagation.
    // A more robust way is to check e.target here.
    const targetIsCanvas =
      e.target === svgRef.current || e.target.closest("g#grid");
    const targetIsModuleBg = e.target.closest(
      'rect[data-object-type="module"]',
    ); // Check specific rect

    if ((targetIsCanvas || targetIsModuleBg) && onContextMenu) {
      // Allow context on module bg too
      const svgRect = svgRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;
      const worldX = (clientX - svgRect.left - viewTransform.x) / scale;
      const worldY = (clientY - svgRect.top - viewTransform.y) / scale;

      // If context menu on a module background, pass module's ID
      let objectIdForContext = null;
      let objectTypeForContext = "canvas";

      const moduleElement = e.target.closest(
        '[data-object-id][data-object-type="module"]',
      );
      if (moduleElement) {
        objectIdForContext = moduleElement.getAttribute("data-object-id");
        objectTypeForContext = OBJECT_TYPES.MODULE;
      }
      onContextMenu(e, objectIdForContext, objectTypeForContext, {
        worldX,
        worldY,
      });
    } else if (!targetIsCanvas && !targetIsModuleBg) {
      // If not on canvas or module bg, it's likely on an element whose renderer should handle context.
      // If it bubbles up here, do nothing to allow element context menus.
    } else {
      e.preventDefault(); // Default prevent if no specific handler
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
      onMouseMove={localHandleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDownOnCanvas} // Centralized mouse down handler
      onContextMenu={handleSvgContextMenu} // Centralized context menu for canvas/module bg
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
            onClick={onAddModule} // This is addModuleAtZeroZero
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
                setSelectedObjectId={setSelectedObjectId} // Pass down for internal elements
                onToggleWallSegment={onToggleWallSegment}
                primarySelectedObject={primarySelectedObject} // For wall/element selection state
                onContextMenu={onContextMenu} // Pass down for elements/walls context menu
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
