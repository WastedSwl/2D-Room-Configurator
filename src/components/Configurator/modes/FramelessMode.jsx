// src/components/Configurator/modes/FramelessMode.jsx
import React from "react";
import PropTypes from 'prop-types';
import { FaCube, FaPlusSquare } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DEFAULT_PANEL_WIDTH_M, DEFAULT_MODULE_WIDTH_M, DEFAULT_MODULE_HEIGHT_M, WALL_THICKNESS_M } from '../appConstants';


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

    const existingObjects = getObjects ? getObjects() : [];
    let newX = 1; 
    let newY = 1; 

    if (existingObjects.length > 0) {
      const lastObject = existingObjects[existingObjects.length - 1];
      newX = lastObject.x + lastObject.width + 1; 
      newY = lastObject.y;
    }

    const moduleObj = addObject(
      "panel", 
      newX,
      newY,
      DEFAULT_MODULE_WIDTH_M,
      DEFAULT_MODULE_HEIGHT_M,
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
      "wall", 
      worldMouseX - DEFAULT_PANEL_WIDTH_M / 2, 
      worldMouseY - WALL_THICKNESS_M / 2,
      DEFAULT_PANEL_WIDTH_M, 
      WALL_THICKNESS_M, 
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
          title={`Добавить стандартный модуль (${DEFAULT_MODULE_WIDTH_M}x${DEFAULT_MODULE_HEIGHT_M}м)`}
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