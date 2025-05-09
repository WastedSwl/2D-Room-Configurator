import React, { useState } from "react";
import { MODES } from "../appConstants";
import { ChevronDownIcon, Bars3Icon } from "@heroicons/react/20/solid"; // For dropdown
import { Squares2X2Icon, ViewfinderCircleIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';


const ConfiguratorToolbar = ({
  activeModeName,
  // addingObjectType, // Not used anymore on toolbar
  // onStartAddObject, // Not used anymore on toolbar
  onModeChange,
  // selectedObjectIds, // Not used anymore on toolbar
  // primarySelectedObject, // Not used anymore on toolbar
  // onDuplicateAndConnectModule, // Functionality removed from toolbar
}) => {
  const [floor, setFloor] = useState(1);
  const totalFloors = 5; // Example total floors

  const handleFloorChange = (event) => {
    setFloor(parseInt(event.target.value, 10));
    // Add logic to handle floor change, e.g., load different data
  };

  const modes = [
    { id: MODES.MODULAR, label: "Модульный", icon: <Squares2X2Icon className="w-4 h-4 mr-1.5" /> },
    { id: MODES.FRAMELESS, label: "Безкаркасный", icon: <ViewfinderCircleIcon className="w-4 h-4 mr-1.5" /> },
    { id: MODES.FRAMED, label: "Каркасный", icon: <CubeTransparentIcon className="w-4 h-4 mr-1.5" /> },
  ];

  return (
    <div className="p-2 bg-gray-900 text-gray-200 border-b border-gray-700 flex justify-between items-center flex-shrink-0 shadow-md">
      {/* Left side: App Title / Logo (Optional) */}
      <div className="flex items-center">
        {/* <img src="/logo.svg" alt="App Logo" className="h-8 w-auto mr-3" /> */}
        <h1 className="text-lg font-semibold tracking-tight">
          Configurator<span className="text-primary-blue">Pro</span>
        </h1>
      </div>

      {/* Center: Mode Selection */}
      <div className="flex-grow flex justify-center items-center space-x-1 sm:space-x-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            title={mode.label}
            className={`px-2.5 py-1.5 text-xs sm:text-sm rounded-md flex items-center font-medium transition-all duration-150 ease-in-out
                        ${
                          activeModeName === mode.id
                            ? "bg-primary-blue text-white shadow-sm"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                        }`}
          >
            {mode.icon}
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Right side: Floor Selector & User/Menu (Optional) */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <label htmlFor="floor-select" className="sr-only">
            Этаж
          </label>
          <select
            id="floor-select"
            value={floor}
            onChange={handleFloorChange}
            className="appearance-none bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
          >
            {[...Array(totalFloors).keys()].map((i) => (
              <option key={i + 1} value={i + 1} className="bg-gray-800 text-gray-200">
                Этаж {i + 1}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className="w-5 h-5 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
        </div>
        
        {/* Placeholder for User Avatar or Menu */}
        {/* <button className="p-1.5 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-blue">
          <Bars3Icon className="h-6 w-6 text-gray-400" />
        </button> */}
      </div>
    </div>
  );
};

export default ConfiguratorToolbar;