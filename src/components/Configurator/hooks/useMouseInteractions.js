import { useState, useCallback, useRef } from "react";
import { getAABB, checkAABBIntersection } from "../configuratorUtils";
import {
  MIN_DRAG_FOR_MARQUEE_PAN,
  MAX_HISTORY_SIZE,
} from "../configuratorConstants";

const useMouseInteractions = ({
  objectsRef,
  selectedObjectIds,
  setSelectedObjectIds,
  lockedObjectIds, 
  setHistory, 
  viewTransform,
  screenToWorld,
  screenToWorldRect,
  modifierKeys,
  addingObjectType,
  setAddingObjectType,
  addAndSelectObject,
  mainContainerRef,
  svgRef,
  activeMode,
}) => {
  const [draggingState, setDraggingState] = useState(null); 
  const [resizingState, setResizingState] = useState(null); 
  const [marqueeRect, setMarqueeRect] = useState({ active: false }); 
  const [isPanningWithSpace, setIsPanningWithSpace] = useState(false);
  const [activeSnapLines, setActiveSnapLines] = useState([]); 
  const mouseDownStartPosRef = useRef(null);

  const handleMouseDownOnObject = useCallback(
    (e, clickedObjectId) => {
      e.stopPropagation();
      // console.log('handleMouseDownOnObject called with ID:', clickedObjectId); 
      if (addingObjectType) return;

      mainContainerRef.current?.focus();
      const objectIsLocked = lockedObjectIds.includes(clickedObjectId);
      if (objectIsLocked && !modifierKeys.shift) {
        if (!selectedObjectIds.includes(clickedObjectId)) {
            // console.log('Selecting single locked object:', clickedObjectId);
            setSelectedObjectIds([clickedObjectId]);
        }
        return;
      }

      const newSelectedIds = modifierKeys.shift
        ? selectedObjectIds.includes(clickedObjectId)
          ? selectedObjectIds.filter((id) => id !== clickedObjectId)
          : [...selectedObjectIds, clickedObjectId]
        : selectedObjectIds.includes(clickedObjectId) && selectedObjectIds.length === 1 && selectedObjectIds[0] === clickedObjectId
          ? selectedObjectIds 
          : [clickedObjectId]; 
      // console.log('Setting selectedObjectIds to:', newSelectedIds);
      setSelectedObjectIds(newSelectedIds);
      setDraggingState(null); 
      setResizingState(null); 
    },
    [
      addingObjectType,
      lockedObjectIds,
      modifierKeys.shift,
      selectedObjectIds,
      setSelectedObjectIds,
      mainContainerRef,
    ],
  );

  const handleMouseDownOnResizeHandle = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleMouseDownOnCanvas = useCallback(
    (e) => {
      mainContainerRef.current?.focus();
      if (e.button !== 0) return;

      if (addingObjectType) {
        const { x: worldX, y: worldY } = screenToWorld(e.clientX, e.clientY);
        const newId = addAndSelectObject(addingObjectType, worldX, worldY);
        setSelectedObjectIds([newId]);
        setAddingObjectType(null);
      } else if (modifierKeys.spacebar) {
        setIsPanningWithSpace(true);
        setDraggingState({
          isPanning: true,
          startScreenX: e.clientX,
          startScreenY: e.clientY,
          initialViewX: viewTransform.x,
          initialViewY: viewTransform.y,
        });
      } else {
        if (!modifierKeys.shift) {
          // console.log('Deselecting all on canvas click');
          setSelectedObjectIds([]);
        }
      }
      setMarqueeRect({ active: false }); 
      setActiveSnapLines([]);
    },
    [
      addingObjectType,
      setAddingObjectType,
      modifierKeys,
      screenToWorld,
      addAndSelectObject,
      setSelectedObjectIds,
      viewTransform.x,
      viewTransform.y,
      mainContainerRef,
      setHistory, 
    ],
  );

  const handleMouseMove = useCallback(
    (_e) => {
      if (isPanningWithSpace && draggingState?.isPanning) {
        return;
      }
    },
    [isPanningWithSpace, draggingState],
  );

  const handleMouseUp = useCallback(
    (_e) => {
      if (isPanningWithSpace) setIsPanningWithSpace(false);
      
      setDraggingState(null);
      setResizingState(null);
      setMarqueeRect({ active: false });
      setActiveSnapLines([]);
      mouseDownStartPosRef.current = null;
    },
    [
      isPanningWithSpace,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    if (isPanningWithSpace) setIsPanningWithSpace(false);
    if (draggingState || resizingState) {
      handleMouseUp({});
    }
  }, [isPanningWithSpace, draggingState, resizingState, handleMouseUp]);

  return {
    draggingState, 
    resizingState: null, 
    marqueeRect: { active: false }, 
    isPanningWithSpace,
    activeSnapLines: [], 
    handleMouseDownOnObject,
    handleMouseDownOnResizeHandle, 
    handleMouseDownOnCanvas,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};

export default useMouseInteractions;