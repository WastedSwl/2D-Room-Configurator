import React, { useState, useEffect, useCallback } from "react"; 
import Grid from "./Grid";
import ObjectRendererGroup from "./ObjectRendererGroup";
import SnapGuides from "./SnapGuides";
import MarqueeSelection from "./MarqueeSelection";
import PreviewLine from "./PreviewLine"; 

const SvgCanvas = ({
  svgRef,
  viewTransform,
  setViewTransform,
  objects,
  selectedObjectIds,
  setSelectedObjectIds, // Добавлено для ObjectRendererGroup
  updateObject, // Добавлено для ObjectRendererGroup
  lockedObjectIds,
  overlappingObjectIds,
  activeSnapLines,
  marqueeRect,
  modifierKeys,
  addingObjectType,
  isPanningWithSpace,
  draggingState,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  handleMouseDownOnCanvas,
  handleMouseDownOnObject,
  handleMouseDownOnResizeHandle,
  onAddObject,
  onAddCorridor, 
  addingCorridorMode, 
  onExpansionPlatformClick, 
  activeMode,
  drawingLineState, 
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

  let cursorClass = "cursor-default";
  if (addingObjectType || (drawingLineState && drawingLineState.type) ) {
      cursorClass = "cursor-crosshair";
  } else if (isPanningWithSpace) {
      cursorClass = "cursor-grabbing";
  } else if (modifierKeys.spacebar) {
      cursorClass = "cursor-grab";
  }


  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      onMouseMove={localHandleMouseMove} 
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDownOnCanvas}
      className={`block ${cursorClass}`} 
    >
      {svgDimensions.width > 0 &&
        svgDimensions.height > 0 && (
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
          onAddObject={onAddObject}
          onAddCorridor={onAddCorridor} 
          svgRef={svgRef}
          activeMode={activeMode}
          setSelectedObjectIds={setSelectedObjectIds}
          updateObject={updateObject}
        />
        <SnapGuides
          activeSnapLines={activeSnapLines} 
          viewTransform={viewTransform}
        />
        <PreviewLine drawingLineState={drawingLineState} viewTransform={viewTransform} />
      </g>
      <MarqueeSelection marqueeRect={marqueeRect} svgRef={svgRef} /> 
    </svg>
  );
};

export default SvgCanvas; 