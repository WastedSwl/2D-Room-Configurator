// src/components/Configurator/statusbar/StatusBar.jsx
import React from "react";

const StatusBar = ({
  selectedObjectIds = [],
  primarySelectedObject,
  lockedObjectIds = [],
  history = { undo: [], redo: [] },
}) => {
  return (
    <div className="p-1 bg-gray-100 border-t text-xs text-gray-700 flex justify-between">
      <span>
        {selectedObjectIds.length === 1 && primarySelectedObject
          ? `Выбран: ${primarySelectedObject.type} ${primarySelectedObject.label ? `(${primarySelectedObject.label})` : `(ID: ${primarySelectedObject.id})`}${lockedObjectIds.includes(primarySelectedObject.id) ? " [Locked]" : ""}`
          : selectedObjectIds.length > 1
            ? `${selectedObjectIds.length} объектов выбрано`
            : "Ничего не выбрано"}
      </span>
      <span>
        Undo: {history?.undo?.length || 0}, Redo: {history?.redo?.length || 0}
      </span>
    </div>
  );
};

export default StatusBar;
