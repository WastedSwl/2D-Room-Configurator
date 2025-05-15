// src/components/Configurator/toolbar/ConfiguratorToolbar.jsx
import React from "react";
import { MODES } from "../configuratorConstants";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

const ConfiguratorToolbar = ({
  activeMode,
  setActiveMode,
  onAddModuleFromToolbar,
}) => {
  const modsArray = [
    { key: MODES.MODULAR, label: "Модульный" },
    { key: MODES.FRAME, label: "Каркасный" },
    { key: MODES.FRAMELESS, label: "Бескаркасный" },
  ];

  return (
    <div className="p-2 bg-gray-900 text-gray-200 border-b border-gray-700 flex justify-between items-center flex-shrink-0 shadow-md h-12 sm:h-14">
      <div className="flex items-center min-w-[200px] sm:min-w-[250px]">
        <h1 className="text-lg font-semibold tracking-tight mr-4">
          Grid<span className="text-primary-blue">Viewer</span>
        </h1>
        <div className="flex items-center space-x-1 bg-gray-800 p-0.5 rounded-md">
          {modsArray.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setActiveMode(mode.key)}
              className={`px-2.5 py-1 text-xs sm:text-sm rounded-md transition-colors
                ${
                  activeMode === mode.key
                    ? "bg-primary-blue text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                }`}
              title={`Переключить в режим "${mode.label}"`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow flex justify-center items-center space-x-1 sm:space-x-2">
        {activeMode === MODES.MODULAR && (
          <button
            onClick={onAddModuleFromToolbar}
            className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs sm:text-sm rounded-md transition-colors"
            title="Добавить новый модуль"
          >
            <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
            Добавить модуль
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3 min-w-[50px]">
      </div>
    </div>
  );
};

export default ConfiguratorToolbar;