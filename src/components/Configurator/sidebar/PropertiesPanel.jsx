// src/components/Configurator/sidebar/PropertiesPanel.jsx
import React from "react";
import PropertyInput from "../common/PropertyInput";
import { TrashIcon } from "@heroicons/react/24/outline";
import { OBJECT_TYPES } from "../configuratorConstants";

const PropertiesPanel = ({
  primarySelectedObject,
  lockedObjectIds = [],
  modifierKeys,
  updateSelectedObjectProperty,
  deleteSelectedObject,
}) => {
  if (
    !primarySelectedObject ||
    typeof primarySelectedObject.id === "undefined"
  ) {
    return (
      <div className="w-64 bg-card-bg border-l border-gray-700 p-4 overflow-y-auto flex-shrink-0 text-gray-400">
        <h2 className="text-md font-semibold mb-3 border-b border-gray-700 pb-2 text-gray-200">
          Свойства
        </h2>
        <p className="text-sm">Ничего не выбрано.</p>
      </div>
    );
  }

  const isLocked = lockedObjectIds.includes(primarySelectedObject.id);
  const isLockedAndCantEdit = isLocked && !(modifierKeys && modifierKeys.shift);

  const objType = primarySelectedObject.type || "unknown";

  const commonProperties = (
    <>
      <PropertyInput
        label="ID:"
        value={
          primarySelectedObject.id.substring(0, 15) +
          (primarySelectedObject.id.length > 15 ? "..." : "")
        }
        disabled
      />
      <PropertyInput label="Тип:" value={objType.replace("_", " ")} disabled />
    </>
  );

  let typeSpecificProperties = null;

  if (objType === OBJECT_TYPES.MODULE) {
    typeSpecificProperties = (
      <>
        <PropertyInput
          label="Label:"
          value={primarySelectedObject.label || ""}
          onChange={(e) =>
            updateSelectedObjectProperty("label", e.target.value)
          }
          disabled={isLockedAndCantEdit}
        />
        <PropertyInput
          label="Ячеек в ширину:"
          value={primarySelectedObject.cellsWide || 0}
          disabled
        />
        <PropertyInput
          label="Ячеек в длину:"
          value={primarySelectedObject.cellsLong || 0}
          disabled
        />
        <PropertyInput
          label="Размер (м):"
          value={`${(primarySelectedObject.width || 0).toFixed(2)} x ${(primarySelectedObject.height || 0).toFixed(2)}`}
          disabled
        />
        <PropertyInput
          label="Позиция X (м):"
          type="number"
          step="0.01"
          value={(primarySelectedObject.x || 0).toFixed(2)}
          onChange={(e) => updateSelectedObjectProperty("x", e.target.value)}
          disabled={isLockedAndCantEdit}
        />
        <PropertyInput
          label="Позиция Y (м):"
          type="number"
          step="0.01"
          value={(primarySelectedObject.y || 0).toFixed(2)}
          onChange={(e) => updateSelectedObjectProperty("y", e.target.value)}
          disabled={isLockedAndCantEdit}
        />
        <PropertyInput
          label="Поворот (°):"
          type="number"
          step="1"
          value={primarySelectedObject.rotation || 0}
          onChange={(e) =>
            updateSelectedObjectProperty("rotation", e.target.value)
          }
          disabled={isLockedAndCantEdit}
        />
      </>
    );
  } else if (objType === OBJECT_TYPES.WALL_SEGMENT) {
    typeSpecificProperties = (
      <>
        <PropertyInput
          label="Ключ сегмента:"
          value={primarySelectedObject.segmentKey}
          disabled
        />
        <PropertyInput
          label="Толщина (м):"
          value={(primarySelectedObject.thickness || 0).toFixed(2)}
          disabled
        />
        {primarySelectedObject.parentModule && (
          <PropertyInput
            label="Родительский модуль:"
            value={
              primarySelectedObject.parentModule.label ||
              primarySelectedObject.parentModule.id.substring(0, 10) + "..."
            }
            disabled
          />
        )}
      </>
    );
  } else if (objType === OBJECT_TYPES.DOOR) {
    typeSpecificProperties = (
      <>
        <PropertyInput
          label="Ширина двери (м):"
          type="number"
          value={(primarySelectedObject.width || 0).toFixed(3)}
          step="0.01"
          min="0.1"
          onChange={(e) =>
            updateSelectedObjectProperty("width", e.target.value)
          }
          disabled={isLockedAndCantEdit}
        />
        <PropertyInput
          label="Позиция на сегменте (0-1):"
          type="number"
          value={(primarySelectedObject.positionOnSegment || 0.5).toFixed(2)}
          step="0.01"
          min="0"
          max="1"
          onChange={(e) =>
            updateSelectedObjectProperty("positionOnSegment", e.target.value)
          }
          disabled={isLockedAndCantEdit}
        />
        <PropertyInput label="Открыта:">
          <button
            onClick={() =>
              updateSelectedObjectProperty(
                "isOpen",
                !primarySelectedObject.isOpen,
              )
            }
            className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 hover:bg-gray-600 ${isLockedAndCantEdit ? "cursor-not-allowed opacity-50" : ""}`}
            disabled={isLockedAndCantEdit}
          >
            {primarySelectedObject.isOpen ? "Да (Закрыть)" : "Нет (Открыть)"}
          </button>
        </PropertyInput>
        <PropertyInput
          label="Угол откр. (°):"
          type="number"
          value={primarySelectedObject.openingAngle || 0}
          step="1"
          min="0"
          max="170"
          onChange={(e) =>
            updateSelectedObjectProperty("openingAngle", e.target.value)
          }
          disabled={isLockedAndCantEdit || !primarySelectedObject.isOpen}
          title={!primarySelectedObject.isOpen ? "Сначала откройте дверь" : ""}
        />
        <PropertyInput label="Петли:">
          <select
            value={primarySelectedObject.hingeSide || "left"}
            onChange={(e) =>
              updateSelectedObjectProperty("hingeSide", e.target.value)
            }
            className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200 ${isLockedAndCantEdit ? "bg-gray-800 cursor-not-allowed" : ""}`}
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
              updateSelectedObjectProperty("openingDirection", e.target.value)
            }
            className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200 ${isLockedAndCantEdit ? "bg-gray-800 cursor-not-allowed" : ""}`}
            disabled={isLockedAndCantEdit}
          >
            <option value="inward">Внутрь</option>,
            <option value="outward">Наружу</option>
          </select>
        </PropertyInput>
      </>
    );
  } else if (objType === OBJECT_TYPES.WINDOW) {
    typeSpecificProperties = (
      <>
        <PropertyInput
          label="Ширина окна (м):"
          type="number"
          value={(primarySelectedObject.width || 0).toFixed(3)}
          step="0.01"
          min="0.1"
          onChange={(e) =>
            updateSelectedObjectProperty("width", e.target.value)
          }
          disabled={isLockedAndCantEdit}
        />
        <PropertyInput
          label="Позиция на сегменте (0-1):"
          type="number"
          value={(primarySelectedObject.positionOnSegment || 0.5).toFixed(2)}
          step="0.01"
          min="0"
          max="1"
          onChange={(e) =>
            updateSelectedObjectProperty("positionOnSegment", e.target.value)
          }
          disabled={isLockedAndCantEdit}
        />
      </>
    );
  }

  return (
    <div className="w-64 bg-card-bg border-l border-gray-700 p-4 overflow-y-auto flex-shrink-0 text-gray-300">
      <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
        <h2 className="text-md font-semibold text-gray-200">Свойства</h2>
      </div>
      <div>
        <p className="text-sm font-medium mb-1 capitalize text-gray-200">
          {/* Тип: {objType.replace("_", " ")} */}
          {isLocked && (
            <span className="ml-2 text-orange-400 text-xs font-normal">
              (Заблокирован)
            </span>
          )}
        </p>

        {commonProperties}
        {typeSpecificProperties}

        {deleteSelectedObject && (
          <button
            onClick={deleteSelectedObject}
            className={`mt-6 w-full text-white text-sm py-2 px-4 rounded flex items-center justify-center transition-colors ${isLockedAndCantEdit ? "bg-red-700/50 cursor-not-allowed" : "bg-red-600 hover:bg-red-500"}`}
            disabled={isLockedAndCantEdit}
            title={
              objType === OBJECT_TYPES.WALL_SEGMENT
                ? "Для удаления стены используйте контекстное меню на стене"
                : ""
            }
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            {objType === OBJECT_TYPES.MODULE
              ? "Удалить модуль"
              : objType === OBJECT_TYPES.WALL_SEGMENT
                ? "Удалить (см. меню)"
                : "Удалить элемент"}
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
