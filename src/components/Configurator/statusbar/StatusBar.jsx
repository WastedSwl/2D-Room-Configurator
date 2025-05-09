import React from "react";

const StatusBar = ({
  selectedObjectIds = [],
  primarySelectedObject,
  lockedObjectIds = [],
  history = { undo: [], redo: [] },
}) => {
  return (
    <div className="p-1.5 bg-gray-900 border-t border-gray-700 text-xs text-gray-400 flex justify-between items-center px-3">
      <span className="truncate max-w-[70%]">
        {selectedObjectIds.length === 1 && primarySelectedObject
          ? `Выбран: ${primarySelectedObject.type} ${primarySelectedObject.label ? `(${primarySelectedObject.label})` : `(ID: ${primarySelectedObject.id.substring(0,8)}...)`}${lockedObjectIds.includes(primarySelectedObject.id) ? " [🔒]" : ""}`
          : selectedObjectIds.length > 1
            ? `${selectedObjectIds.length} объектов выбрано`
            : "Ничего не выбрано"}
      </span>
      <span className="whitespace-nowrap">
        Undo: {history?.undo?.length || 0} | Redo: {history?.redo?.length || 0}
      </span>
    </div>
  );
};

export default StatusBar;