// src/components/Configurator/canvas/ObjectRendererGroup.jsx
import React from "react";
import ObjectVisual from "./ObjectVisual";

const ObjectRendererGroup = ({
  objects,
  viewTransform,
  selectedObjectIds,
  lockedObjectIds,
  overlappingObjectIds,
  modifierKeys,
  handleMouseDownOnObject,
  handleMouseDownOnResizeHandle,
  draggingState,
  resizingState,
  onAddObject,
  addingCorridorMode,
  onAddCorridor,
}) => {
  return (
    <>
      {objects.map((obj) => {
        if (!obj) return null;
        return (
          <ObjectVisual
            key={obj.id}
            obj={obj}
            scale={viewTransform.scale}
            isSelected={selectedObjectIds.includes(obj.id)}
            isLocked={lockedObjectIds.includes(obj.id)}
            isOverlapping={overlappingObjectIds.includes(obj.id)}
            modifierKeys={modifierKeys}
            onMouseDown={handleMouseDownOnObject}
            onResizeHandleMouseDown={handleMouseDownOnResizeHandle}
            draggingState={draggingState}
            resizingState={resizingState}
            onAddObject={onAddObject}
            addingCorridorMode={addingCorridorMode}
            onAddCorridor={onAddCorridor}
            objects={objects}
          />
        );
      })}
    </>
  );
};
export default React.memo(ObjectRendererGroup);
