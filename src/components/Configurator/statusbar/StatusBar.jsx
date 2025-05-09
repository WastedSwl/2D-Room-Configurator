// src/components/Configurator/statusbar/StatusBar.jsx
import React from "react";
import PropTypes from "prop-types";

const StatusBar = ({ zoomLevel, selectedObjectName, selectedObjectId }) => {
  const formattedZoom = zoomLevel ? (zoomLevel * 100).toFixed(0) : "N/A";
  return (
    <div className="p-1.5 bg-gray-900 border-t border-gray-700 text-xs text-gray-400 flex justify-between items-center px-3">
      <span className="truncate max-w-[60%]">
        {selectedObjectId
          ? `Выбрано: ${selectedObjectName || "Элемент"} (ID: ${selectedObjectId.substring(0, 15)}...)`
          : "Готов"}
      </span>
      <span className="whitespace-nowrap">Масштаб: {formattedZoom}%</span>
    </div>
  );
};

StatusBar.propTypes = {
  zoomLevel: PropTypes.number,
  selectedObjectName: PropTypes.string,
  selectedObjectId: PropTypes.string,
};

export default StatusBar;
