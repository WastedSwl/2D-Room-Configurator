// src/components/Configurator/sidebar/PropertiesPanel.jsx
import React from "react";
import PropertyInput from "../common/PropertyInput"; // Use the moved component

const PropertiesPanel = ({
  primarySelectedObject,
  selectedObjectIds, // For count
  lockedObjectIds,
  modifierKeys,
  updateSelectedObjectProperty,
  deleteSelectedObject, // Assumes a function to delete the primary selected object
  activeMode, // новый проп
}) => {
  if (!primarySelectedObject && selectedObjectIds.length === 0) {
    return (
      <div className="w-64 bg-gray-50 border-l border-gray-300 p-3 overflow-y-auto flex-shrink-0">
        <h2 className="text-md font-semibold mb-3 border-b pb-2">Свойства</h2>
        <p className="text-sm text-gray-500">Ничего не выбрано.</p>
      </div>
    );
  }

  if (selectedObjectIds.length > 1) {
    return (
      <div className="w-64 bg-gray-50 border-l border-gray-300 p-3 overflow-y-auto flex-shrink-0">
        <h2 className="text-md font-semibold mb-3 border-b pb-2">Свойства</h2>
        <p className="text-sm text-gray-500">
          Выбрано несколько объектов ({selectedObjectIds.length} шт).
          {selectedObjectIds.some((id) => lockedObjectIds.includes(id)) && (
            <span className="ml-1 text-xs text-orange-500">
              (есть заблокированные)
            </span>
          )}
        </p>
      </div>
    );
  }

  const isLockedAndCantEdit =
    lockedObjectIds.includes(primarySelectedObject.id) && !modifierKeys.shift;

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-300 p-3 overflow-y-auto flex-shrink-0">
      <h2 className="text-md font-semibold mb-3 border-b pb-2">Свойства</h2>
      {primarySelectedObject && (
        <div>
          <p className="text-xs text-gray-500 mb-1">
            ID: {primarySelectedObject.id}{" "}
            {primarySelectedObject.label
              ? `(${primarySelectedObject.label})`
              : ""}
          </p>
          <p className="text-sm font-medium mb-2 capitalize">
            Тип: {primarySelectedObject.type}
            {lockedObjectIds.includes(primarySelectedObject.id) && (
              <span className="ml-2 text-orange-500 text-xs font-normal">
                (Locked)
              </span>
            )}
          </p>
          {!(activeMode === "modular" && primarySelectedObject.type === "module") && (
            <PropertyInput
              label="X (м):"
              value={primarySelectedObject.x.toFixed(3)}
              onChange={(e) => updateSelectedObjectProperty("x", e.target.value)}
              disabled={isLockedAndCantEdit}
            />
          )}
          {!(activeMode === "modular" && primarySelectedObject.type === "module") && (
            <PropertyInput
              label="Y (м):"
              value={primarySelectedObject.y.toFixed(3)}
              onChange={(e) => updateSelectedObjectProperty("y", e.target.value)}
              disabled={isLockedAndCantEdit}
            />
          )}
          {!(activeMode === "modular" && primarySelectedObject.type === "module") && (
            <PropertyInput
              label={
                primarySelectedObject.type === "door" ||
                primarySelectedObject.type === "window"
                  ? "Длина (м):"
                  : "Ширина (м):"
              }
              value={primarySelectedObject.width.toFixed(3)}
              min="0.01"
              onChange={(e) =>
                updateSelectedObjectProperty("width", e.target.value)
              }
              disabled={isLockedAndCantEdit}
            />
          )}
          {!(activeMode === "modular" && primarySelectedObject.type === "module") && (
            <PropertyInput
              label={
                primarySelectedObject.type === "door" ||
                primarySelectedObject.type === "window" ||
                primarySelectedObject.type === "wall"
                  ? "Толщина (м):"
                  : "Высота (м):"
              }
              value={primarySelectedObject.height.toFixed(3)}
              min="0.01"
              onChange={(e) =>
                updateSelectedObjectProperty("height", e.target.value)
              }
              disabled={isLockedAndCantEdit}
            />
          )}
          <PropertyInput
            label="Вращение (°):"
            type="number"
            value={primarySelectedObject.rotation || 0}
            step="1"
            min="-360"
            max="360"
            onChange={(e) =>
              updateSelectedObjectProperty("rotation", e.target.value)
            }
            disabled={isLockedAndCantEdit}
          />
          {primarySelectedObject.type === "door" && (
            <>
              <PropertyInput label="Открыта:">
                <button
                  onClick={() =>
                    updateSelectedObjectProperty(
                      "isOpen",
                      !primarySelectedObject.isOpen,
                    )
                  }
                  className={`w-full p-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${isLockedAndCantEdit ? "cursor-not-allowed opacity-50" : ""}`}
                  disabled={isLockedAndCantEdit}
                >
                  {primarySelectedObject.isOpen
                    ? "Да (Закрыть)"
                    : "Нет (Открыть)"}
                </button>
              </PropertyInput>
              <PropertyInput
                label="Угол откр. (°):"
                type="number"
                value={primarySelectedObject.openingAngle || 90}
                step="1"
                min="0"
                max="170"
                onChange={(e) =>
                  updateSelectedObjectProperty("openingAngle", e.target.value)
                }
                disabled={isLockedAndCantEdit || !primarySelectedObject.isOpen}
                title={
                  !primarySelectedObject.isOpen ? "Сначала откройте дверь" : ""
                }
              />
              <PropertyInput label="Петли:">
                <select
                  value={primarySelectedObject.hingeSide || "left"}
                  onChange={(e) =>
                    updateSelectedObjectProperty("hingeSide", e.target.value)
                  }
                  className={`w-full p-1 border border-gray-300 rounded text-sm ${isLockedAndCantEdit ? "bg-gray-100 cursor-not-allowed" : "bg-white focus:ring-1 focus:ring-blue-500 outline-none"}`}
                  disabled={isLockedAndCantEdit}
                >
                  <option value="left">Слева</option>
                  <option value="right">Справа</option>
                </select>
              </PropertyInput>
              <PropertyInput label="Направление откр.:">
                <select
                  value={primarySelectedObject.openingDirection || "inward"}
                  onChange={(e) =>
                    updateSelectedObjectProperty(
                      "openingDirection",
                      e.target.value,
                    )
                  }
                  className={`w-full p-1 border border-gray-300 rounded text-sm ${isLockedAndCantEdit ? "bg-gray-100 cursor-not-allowed" : "bg-white focus:ring-1 focus:ring-blue-500 outline-none"}`}
                  disabled={isLockedAndCantEdit}
                >
                  <option value="inward">Внутрь</option>
                  <option value="outward">Наружу</option>
                </select>
              </PropertyInput>
            </>
          )}
          <button
            onClick={deleteSelectedObject}
            className={`mt-4 w-full text-white text-sm py-1.5 rounded ${isLockedAndCantEdit ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
            disabled={isLockedAndCantEdit && primarySelectedObject}
          >
            Удалить выбранный
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
