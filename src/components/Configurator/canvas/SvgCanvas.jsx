// src/components/Configurator/canvas/SvgCanvas.jsx
import React, { useState, useEffect, useCallback } from "react"; // Добавлен useState, useEffect, useCallback
import Grid from "./Grid";
import ObjectRendererGroup from "./ObjectRendererGroup";
import SnapGuides from "./SnapGuides";
import MarqueeSelection from "./MarqueeSelection";

const SvgCanvas = ({
  svgRef,
  viewTransform,
  setViewTransform,
  objects,
  selectedObjectIds,
  lockedObjectIds,
  overlappingObjectIds,
  activeSnapLines,
  marqueeRect,
  modifierKeys,
  addingObjectType,
  isPanningWithSpace,
  draggingState,
  resizingState,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  handleMouseDownOnCanvas,
  handleMouseDownOnObject,
  handleMouseDownOnResizeHandle,
  onAddObject,
  onAddCorridor,
  addingCorridorMode,
}) => {
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Обновление размеров SVG при изменении размера окна или контейнера
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

    // Первоначальная установка размеров
    const rect = currentSvg.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setSvgDimensions({ width: rect.width, height: rect.height });
    }

    return () => {
      resizeObserver.unobserve(currentSvg);
    };
  }, [svgRef]);

  const localHandleMouseMove = useCallback(
    (e) => {
      if (isPanningWithSpace && draggingState?.isPanning) {
        const dxScreen = e.clientX - draggingState.startScreenX;
        const dyScreen = e.clientY - draggingState.startScreenY;
        setViewTransform((prev) => ({
          ...prev,
          x: draggingState.initialViewX + dxScreen,
          y: draggingState.initialViewY + dyScreen,
        }));
      } else {
        handleMouseMove(e);
      }
    },
    [isPanningWithSpace, draggingState, setViewTransform, handleMouseMove],
  );

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      onMouseMove={localHandleMouseMove} // Используем localHandleMouseMove
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDownOnCanvas}
      className={`block bg-white ${
        addingObjectType
          ? "cursor-crosshair"
          : isPanningWithSpace
            ? "cursor-grabbing"
            : modifierKeys.spacebar
              ? "cursor-grab"
              : "cursor-default"
      }`}
    >
      {svgDimensions.width > 0 &&
        svgDimensions.height >
          0 /* Рендерим Grid только если есть размеры */ && (
          <Grid
            viewTransform={viewTransform}
            svgWidth={svgDimensions.width}
            svgHeight={svgDimensions.height}
          />
        )}
      <g transform={`translate(${viewTransform.x}, ${viewTransform.y})`}>
        <ObjectRendererGroup
          objects={objects}
          viewTransform={viewTransform}
          selectedObjectIds={selectedObjectIds}
          lockedObjectIds={lockedObjectIds}
          overlappingObjectIds={overlappingObjectIds}
          modifierKeys={modifierKeys}
          handleMouseDownOnObject={handleMouseDownOnObject}
          handleMouseDownOnResizeHandle={handleMouseDownOnResizeHandle}
          draggingState={draggingState}
          resizingState={resizingState}
          onAddObject={onAddObject}
          onAddCorridor={onAddCorridor}
          addingCorridorMode={addingCorridorMode}
        />
        <SnapGuides
          activeSnapLines={activeSnapLines}
          viewTransform={viewTransform}
        />
      </g>
      <MarqueeSelection marqueeRect={marqueeRect} svgRef={svgRef} />
    </svg>
  );
};

export default SvgCanvas; // Не оборачиваем в React.memo, т.к. он принимает много колбэков и состояний
