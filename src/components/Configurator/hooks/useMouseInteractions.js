// src/components/Configurator/hooks/useMouseInteractions.js
import { useState, useCallback, useRef } from "react";
import { MODES, OBJECT_TYPES } from "../configuratorConstants"; // GRID_CELL_SIZE_M здесь не нужен

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
  snapAndFinalizeModulePosition, // Новая функция для привязки
}) => {
  const [draggingState, setDraggingState] = useState(null);
  const [isPanningWithSpace, setIsPanningWithSpace] = useState(false);
  const mouseDownStartPosRef = useRef(null);

  const handleMouseDownOnCanvas = useCallback(
    (e) => {
      mainContainerRef.current?.focus();
      if (e.button !== 0 && e.button !== 2) return;

      const worldCoords = screenToWorld(e.clientX, e.clientY);

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

      if (e.button === 0 && activeMode === MODES.MODULAR) {
        const clickedElement = e.target.closest('[data-object-type="module"]');
        if (clickedElement) {
          const moduleId = clickedElement.getAttribute("data-object-id");
          const moduleInitialX = parseFloat(
            clickedElement.getAttribute("data-module-x") || "0",
          );
          const moduleInitialY = parseFloat(
            clickedElement.getAttribute("data-module-y") || "0",
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
            });
            e.stopPropagation();
            return;
          }
        }
      }

      if (e.button === 0) {
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

        updateModulePosition(moduleId, newModuleX, newModuleY); // Плавное обновление
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
        // Вызываем функцию привязки и финализации из Configurator.jsx
        snapAndFinalizeModulePosition(draggingState.moduleId);
      }
      setDraggingState(null);
      mouseDownStartPosRef.current = null;
    },
    [isPanningWithSpace, draggingState, snapAndFinalizeModulePosition], // Добавили snapAndFinalizeModulePosition
  );

  const handleMouseLeave = useCallback(() => {
    if (isPanningWithSpace || draggingState?.isDraggingModule) {
      // Также проверяем isDraggingModule
      if (draggingState?.isDraggingModule) {
        // Если перетаскивали модуль и мышь ушла, привязываем его
        snapAndFinalizeModulePosition(draggingState.moduleId);
      }
      setIsPanningWithSpace(false);
      setDraggingState(null);
      mouseDownStartPosRef.current = null;
    }
  }, [isPanningWithSpace, draggingState, snapAndFinalizeModulePosition]); // Добавили snapAndFinalizeModulePosition

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
