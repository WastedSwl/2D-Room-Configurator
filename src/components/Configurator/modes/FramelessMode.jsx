import React from "react";
import PropTypes from 'prop-types';
import { FaCube, FaPlusSquare } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DEFAULT_PANEL_WIDTH_M } from '../appConstants';

// Constants for construction
const MODULE_WIDTH_METERS = 6;
const MODULE_DEPTH_METERS = 2.4;
const WALL_THICKNESS_M = 0.15;
const PANEL_SIZE_M = 1.15;

const FramelessMode = ({ 
  addObject, 
  getObjects,
  screenToWorld,
  viewTransform 
}) => {
  const handleAddModule = () => {
    if (!addObject) {
      toast.error("Add object function not available.");
      return;
    }

    // Attempt to place the new module not overlapping existing ones
    const existingObjects = getObjects ? getObjects() : [];
    let newX = 1; // Start at 1m
    let newY = 1; // Start at 1m

    if (existingObjects.length > 0) {
      const lastObject = existingObjects[existingObjects.length - 1];
      newX = lastObject.x + lastObject.width + 1; // Place 1m to the right of the last object
      newY = lastObject.y;
    }

    const moduleObj = addObject(
      "panel", // Or a new 'module' type if defined with special rendering
      newX,
      newY,
      MODULE_WIDTH_METERS,
      MODULE_DEPTH_METERS,
      { name: "Standard Module" },
    );
    if (moduleObj) {
      toast.success(`Модуль ${moduleObj.id} добавлен!`);
    }
  };

  const handleAddInternalWall = () => {
    if (!addObject) {
      toast.error("Add object function not available.");
      return;
    }

    const { x: worldMouseX, y: worldMouseY } = screenToWorld
      ? screenToWorld(window.innerWidth / 2, window.innerHeight / 2)
      : { x: 2, y: 2 };

    const wallObj = addObject(
      "wall", // Assuming 'wall' type has distinct rendering
      worldMouseX - PANEL_SIZE_M / 2, // Center the wall
      worldMouseY - WALL_THICKNESS_M / 2,
      PANEL_SIZE_M, // Wall length of one panel
      WALL_THICKNESS_M, // Wall thickness
      { name: "Internal Wall" },
    );
    if (wallObj) {
      toast.success(`Внутренняя стена ${wallObj.id} добавлена!`);
    }
  };

  return (
    <div className="bg-gray-100 p-2 rounded shadow-md">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">
        Инструменты строительства
      </h3>
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleAddModule}
          className="flex items-center justify-center px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          title="Добавить стандартный модуль (6x2.4м)"
        >
          <FaCube className="mr-2" /> Добавить Модуль
        </button>
        <button
          onClick={handleAddInternalWall}
          className="flex items-center justify-center px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
          title="Добавить внутреннюю стену"
        >
          <FaPlusSquare className="mr-2" /> Добавить Стену
        </button>
      </div>
    </div>
  );
};

FramelessMode.propTypes = {
  addObject: PropTypes.func.isRequired,
  getObjects: PropTypes.func.isRequired,
  screenToWorld: PropTypes.func,
  viewTransform: PropTypes.object,
};

export default FramelessMode;
