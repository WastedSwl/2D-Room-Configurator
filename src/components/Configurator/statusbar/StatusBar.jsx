import React from "react";
import PropTypes from "prop-types";

const StatusBar = ({ zoomLevel, selectedObjectName, selectedObjectId, currentFloorName }) => {
  const formattedZoom = zoomLevel ? (zoomLevel * 100).toFixed(0) : "N/A";
  return (
    <div className="p-2 bg-gray-900 border-t border-gray-700 text-sm text-gray-400 flex justify-between items-center px-4 flex-shrink-0">
      <span className="truncate max-w-[50%] min-w-[100px]">
        {selectedObjectId
          ? `Выбрано: ${selectedObjectName || "Элемент"}`
          : (currentFloorName ? `${currentFloorName} | Готов` : "Готов")}
      </span>
      <span className="whitespace-nowrap ml-2">
        {currentFloorName && <span className="mr-3 pr-3 border-r border-gray-600 hidden sm:inline">Этаж: {currentFloorName}</span>}
        <span className="hidden sm:inline">Масштаб: </span>{formattedZoom}%
      </span>
    </div>
  );
};

StatusBar.propTypes = {
  zoomLevel: PropTypes.number,
  selectedObjectName: PropTypes.string,
  selectedObjectId: PropTypes.string,
  currentFloorName: PropTypes.string,
};

export default StatusBar;