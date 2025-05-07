// src/components/Configurator/toolbar/ConfiguratorToolbar.jsx
import React from "react";
import { OBJECT_TYPES_TO_ADD } from "../configuratorConstants";
import { MODES } from "../appConstants";

const ConfiguratorToolbar = ({
  activeModeName,
  addingObjectType,
  onStartAddObject,
  onModeChange,
}) => {
  return (
    <div className="p-2 bg-gray-800 text-white border-b border-gray-700 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-lg font-semibold">
            Конфигуратор
          </h1>
          <p className="text-xs text-gray-400">
            Space+Drag:Pan. Drag:Marquee. Shift+Click:Multi-select.
            Ctrl/Cmd+C/V/Z/Y. Alt:Grid Snap. Ctrl:Object Snap. Del/Esc.
            L:Lock/Unlock (Shift+Click locked item to select).
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onModeChange(MODES.MODULAR)}
            className={`px-3 py-1.5 rounded ${
              activeModeName === MODES.MODULAR
                ? "bg-blue-700 ring-2 ring-blue-400"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Модульный
          </button>
          <button
            onClick={() => onModeChange(MODES.FRAMELESS)}
            className={`px-3 py-1.5 rounded ${
              activeModeName === MODES.FRAMELESS
                ? "bg-blue-700 ring-2 ring-blue-400"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Безкаркасный
          </button>
          <button
            onClick={() => onModeChange(MODES.FRAMED)}
            className={`px-3 py-1.5 rounded ${
              activeModeName === MODES.FRAMED
                ? "bg-blue-700 ring-2 ring-blue-400"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Каркасный
          </button>
        </div>
      </div>
      <div className="flex space-x-1 overflow-x-auto pb-1">
        {OBJECT_TYPES_TO_ADD.map((item) => (
          <button
            key={item.type}
            onClick={() => onStartAddObject(item.type)}
            title={`Добавить ${item.label}`}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm rounded whitespace-nowrap hover:bg-blue-600 transition-colors ${
              addingObjectType === item.type
                ? "bg-blue-700 ring-2 ring-blue-400"
                : "bg-blue-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConfiguratorToolbar;
