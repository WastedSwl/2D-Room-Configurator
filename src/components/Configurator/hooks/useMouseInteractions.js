// src/components/Configurator/hooks/useMouseInteractions.js
import { useState, useCallback, useRef } from "react";
import { MODES, OBJECT_TYPES } from "../configuratorConstants";

const useMouseInteractions = ({
  viewTransform,
  modifierKeys,
  mainContainerRef,
  svgRef,
  setViewTransform,
  activeMode,
  setSelectedObjectId,
  screenToWorld,
  updateModulePosition,
  snapAndFinalizeModulePosition,
  isDraggingElement, 
  onWallSegmentClick, 
  elementTypeToPlace, 
}) => {
  const [draggingState, setDraggingState] = useState(null);
  const [isPanningWithSpace, setIsPanningWithSpace] = useState(false);
  const mouseDownStartPosRef = useRef(null);

  const handleMouseDownOnCanvas = useCallback(
    (e) => {
      mainContainerRef.current?.focus();
      if (e.button !== 0 && e.button !== 2) return;
      const worldCoords = screenToWorld(e.clientX, e.clientY);
      if (elementTypeToPlace && e.button === 0) {
        const clickedSegmentElement = e.target.closest('[data-object-type="wall_segment"]');
        if (clickedSegmentElement) {
          const segmentId = clickedSegmentElement.getAttribute("data-object-id");
          if (segmentId && onWallSegmentClick) {
            e.stopPropagation(); 
            onWallSegmentClick(segmentId);
            return; 
          }
        }
      }
      if (modifierKeys.spacebar || e.button === 1) { 
        setIsPanningWithSpace(true);
        setDraggingState({
          isPanning: true,
          startScreenX: e.clientX,
          startScreenY: e.clientY,
          initialViewX: viewTransform.x,
          initialViewY: viewTransform.y,
        });
        mouseDownStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
        return;
      }
      if (e.button === 0 && activeMode === MODES.MODULAR && !elementTypeToPlace) {
        const clickedModuleElement = e.target.closest('[data-object-type="module"]');
        if (clickedModuleElement) {
          const moduleId = clickedModuleElement.getAttribute("data-object-id");
          const moduleInitialX = parseFloat(
            clickedModuleElement.getAttribute("data-module-x") || "0",
          );
          const moduleInitialY = parseFloat(
            clickedModuleElement.getAttribute("data-module-y") || "0",
          );
          const moduleInitialRotation = parseFloat(
            clickedModuleElement.getAttribute("data-module-rotation") || "0" 
          );
          if (moduleId) {
            setSelectedObjectId(moduleId); 
            setDraggingState({
              isDraggingModule: true,
              moduleId: moduleId,
              dragStartWorldX: worldCoords.x,
              dragStartWorldY: worldCoords.y,
              initialModuleX: moduleInitialX,
              initialModuleY: moduleInitialY,
              initialModuleRotation: moduleInitialRotation,
            });
            e.stopPropagation();
            return;
          }
        }
        const clickedObjectElement = e.target.closest('[data-object-id]');
        if (clickedObjectElement && !clickedModuleElement) { 
            const objectId = clickedObjectElement.getAttribute('data-object-id');
            const objectType = clickedObjectElement.getAttribute('data-object-type');
            if (objectId && objectType !== OBJECT_TYPES.MODULE && setSelectedObjectId) {
                setSelectedObjectId(objectId);
                e.stopPropagation();
                return;
            }
        }
      }
      if (e.button === 0 && !elementTypeToPlace) {
        if (
          e.target === svgRef.current ||
          e.target.id === "grid" ||
          e.target.closest("g#grid")
        ) {
          setSelectedObjectId(null);
        }
      }
    },
    [
      modifierKeys,
      viewTransform.x,
      viewTransform.y,
      mainContainerRef,
      activeMode,
      setSelectedObjectId,
      screenToWorld,
      svgRef,
      elementTypeToPlace, 
      onWallSegmentClick, 
    ],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (draggingState?.isPanning) {
        if (!mouseDownStartPosRef.current) return;
        const dxScreen = e.clientX - mouseDownStartPosRef.current.x;
        const dyScreen = e.clientY - mouseDownStartPosRef.current.y;
        setViewTransform((prev) => ({
          ...prev,
          x: draggingState.initialViewX + dxScreen,
          y: draggingState.initialViewY + dyScreen,
        }));
      } else if (draggingState?.isDraggingModule) {
        const {
          moduleId,
          dragStartWorldX,
          dragStartWorldY,
          initialModuleX,
          initialModuleY,
        } = draggingState;
        const currentMouseWorld = screenToWorld(e.clientX, e.clientY);
        const deltaWorldX = currentMouseWorld.x - dragStartWorldX;
        const deltaWorldY = currentMouseWorld.y - dragStartWorldY;
        const newModuleX = initialModuleX + deltaWorldX;
        const newModuleY = initialModuleY + deltaWorldY;
        updateModulePosition(moduleId, newModuleX, newModuleY);
      }
    },
    [draggingState, setViewTransform, screenToWorld, updateModulePosition],
  );

  const handleMouseUp = useCallback(
    (_e) => {
      if (isPanningWithSpace) {
        setIsPanningWithSpace(false);
      }
      if (draggingState?.isDraggingModule) {
        snapAndFinalizeModulePosition(
          draggingState.moduleId,
          draggingState.initialModuleX, 
          draggingState.initialModuleY,
          draggingState.initialModuleRotation
        );
      }
      setDraggingState(null);
      mouseDownStartPosRef.current = null;
    },
    [isPanningWithSpace, draggingState, snapAndFinalizeModulePosition], 
  );

  const handleMouseLeave = useCallback(() => {
    if (isPanningWithSpace || draggingState?.isDraggingModule) {
      if (draggingState?.isDraggingModule) {
        snapAndFinalizeModulePosition(
          draggingState.moduleId,
          draggingState.initialModuleX,
          draggingState.initialModuleY,
          draggingState.initialModuleRotation
        );
      }
      setIsPanningWithSpace(false);
      setDraggingState(null);
      mouseDownStartPosRef.current = null;
    }
  }, [isPanningWithSpace, draggingState, snapAndFinalizeModulePosition]); 

  return {
    isPanningWithSpace,
    isDraggingModule: !!draggingState?.isDraggingModule,
    handleMouseDownOnCanvas,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};

export default useMouseInteractions;