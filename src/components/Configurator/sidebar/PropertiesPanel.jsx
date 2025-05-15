import React from "react";
import PropertyInput from "../common/PropertyInput";
import { TrashIcon } from "@heroicons/react/24/outline";
import { OBJECT_TYPES, GRID_CELL_SIZE_M } from "../configuratorConstants";

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
  const isEditingAllowed = !isLocked || (modifierKeys && modifierKeys.shift);
  const objType = primarySelectedObject.type || "unknown";
  const objectData = primarySelectedObject;

  const commonProperties = (
    <>
      <PropertyInput
        label="ID:"
        value={
          objectData.id.substring(0, 15) +
          (objectData.id.length > 15 ? "..." : "")
        }
        disabled
      />
      <PropertyInput label="Тип:" value={objType.replace("_", " ")} disabled />
    </>
  );

  let typeSpecificProperties = null;
  let showDeleteButton = true;
  let deleteButtonText = "Удалить элемент";
  let deleteButtonDisabled = !isEditingAllowed;

  if (objType === OBJECT_TYPES.MODULE) {
    deleteButtonText = "Удалить модуль";
    typeSpecificProperties = (
      <>
        <PropertyInput
          label="Label:"
          value={objectData.label || ""}
          onChange={(e) => updateSelectedObjectProperty("label", e.target.value)}
          disabled={!isEditingAllowed}
        />
        <PropertyInput label="Ячеек в ширину:" value={objectData.cellsWide || 0} disabled />
        <PropertyInput label="Ячеек в длину:" value={objectData.cellsLong || 0} disabled />
        <PropertyInput label="Размер (м):" value={`${(objectData.width || 0).toFixed(2)} x ${(objectData.height || 0).toFixed(2)}`} disabled />
        <PropertyInput
          label="Позиция X (м):" type="number" step="0.01"
          value={(objectData.x || 0).toFixed(2)}
          onChange={(e) => updateSelectedObjectProperty("x", e.target.value)}
          disabled={!isEditingAllowed}
        />
        <PropertyInput
          label="Позиция Y (м):" type="number" step="0.01"
          value={(objectData.y || 0).toFixed(2)}
          onChange={(e) => updateSelectedObjectProperty("y", e.target.value)}
          disabled={!isEditingAllowed}
        />
        <PropertyInput
          label="Поворот (°):" type="number" step="1"
          value={objectData.rotation || 0}
          onChange={(e) => updateSelectedObjectProperty("rotation", e.target.value)}
          disabled={!isEditingAllowed}
        />
      </>
    );
  } else if (objType === OBJECT_TYPES.WALL_SEGMENT) {
    deleteButtonText = "Удалить стену (см. меню)";
    const isPerimeter = (() => {
        if (!objectData.parentModule || !objectData.segmentKey) return false;
        const [coords, orientation] = objectData.segmentKey.split("_");
        const cellX = parseInt(coords.split(",")[0]);
        const cellY = parseInt(coords.split(",")[1]);
        if (orientation === "h" && (cellY === 0 || cellY === objectData.parentModule.cellsLong)) return true;
        if (orientation === "v" && (cellX === 0 || cellX === objectData.parentModule.cellsWide)) return true;
        return false;
    })();
    const hasElements = objectData.elements && objectData.elements.length > 0;
    if (isPerimeter || (hasElements && !objectData.isPortalWall) ) {
        showDeleteButton = true;
        deleteButtonDisabled = true;
        deleteButtonText = isPerimeter ? "Периметр (нельзя удалить)" : "Есть элементы (см. меню)";
    } else if (objectData.isPortalWall && hasElements) {
        showDeleteButton = true;
        deleteButtonDisabled = true;
        deleteButtonText = "Элементы в проеме (см. меню)";
    }
     else {
        showDeleteButton = true;
        deleteButtonText = objectData.isPortalWall ? "Удалить сторону проема" : "Удалить стену";
    }
    typeSpecificProperties = (
      <>
        <PropertyInput label="Ключ сегмента:" value={objectData.segmentKey} disabled />
        {objectData.isPortalWall ? (
          hasElements ? (
            <PropertyInput label="Тип стены:" value="Стена в проеме" disabled />
          ) : (
            <PropertyInput label="Тип стены:" value="Сторона проема (пустая)" disabled />
          )
        ) : (
          <PropertyInput label="Тип стены:" value="Обычная стена" disabled />
        )}
        {objectData.portalInterfaceKey && (
          <PropertyInput label="Ключ проема:" value={objectData.portalInterfaceKey.substring(0, 15) + '...'} disabled />
        )}
        <PropertyInput
          label="Толщина (м):" type="number"
          value={(objectData.thickness || 0).toFixed(3)}
          step="0.001"
          onChange={(e) => updateSelectedObjectProperty("thickness", e.target.value)}
          disabled={!isEditingAllowed || objectData.isPortalWall}
          title={objectData.isPortalWall ? "Толщина стен проема управляется автоматически" : ""}
        />
        {objectData.parentModule && (
          <PropertyInput label="Родительский модуль:" value={objectData.parentModule.label || objectData.parentModule.id.substring(0, 10) + "..."} disabled />
        )}
      </>
    );
  } else if (objType === OBJECT_TYPES.DOOR) {
    deleteButtonText = objectData.isPortalDoor ? "Закрыть проем" : "Удалить дверь";
    typeSpecificProperties = (
      <>
        {objectData.isPortalDoor ? (
          <PropertyInput label="Размещение:" value="В межмодульном проеме" disabled />
        ) : (
          <PropertyInput label="Размещение:" value="На обычной стене" disabled />
        )}
         {objectData.portalInterfaceKey && (
            <PropertyInput label="Ключ проема:" value={objectData.portalInterfaceKey.substring(0,15) + '...'} disabled />
        )}
        <PropertyInput
          label="Ширина двери (м):" type="number"
          value={(objectData.width || 0).toFixed(3)}
          step="0.01" min="0.1" max={(GRID_CELL_SIZE_M + 0.001).toFixed(3)}
          onChange={(e) => updateSelectedObjectProperty("width", e.target.value)}
          disabled={!isEditingAllowed || objectData.isPortalDoor}
          title={objectData.isPortalDoor ? "Ширина портальной двери фиксирована" : ""}
        />
        <PropertyInput
          label="Позиция на сегменте (0-1):" type="number"
          value={(objectData.positionOnSegment || 0.5).toFixed(2)}
          step="0.01" min="0" max="1"
          onChange={(e) => updateSelectedObjectProperty("positionOnSegment", e.target.value)}
          disabled={!isEditingAllowed || objectData.isPortalDoor}
          title={objectData.isPortalDoor ? "Позиция портальной двери фиксирована" : ""}
        />
        <PropertyInput label="Открыта:">
          <button
            onClick={() => updateSelectedObjectProperty("isOpen", !objectData.isOpen)}
            className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200 transition-colors ${(!isEditingAllowed) ? "bg-gray-800 opacity-60 cursor-not-allowed" : "hover:bg-gray-600"}`}
            disabled={!isEditingAllowed}
          >
            {objectData.isOpen ? "Да (Закрыть)" : "Нет (Открыть)"}
          </button>
        </PropertyInput>
        <PropertyInput
          label="Угол откр. (°):" type="number"
          value={objectData.openingAngle || 0}
          step="1" min="0" max="170"
          onChange={(e) => updateSelectedObjectProperty("openingAngle", e.target.value)}
          disabled={!isEditingAllowed || !objectData.isOpen}
          title={(!objectData.isOpen ? "Сначала откройте дверь" : "")}
        />
        <PropertyInput label="Петли:">
          <select
            value={objectData.hingeSide || "left"}
            onChange={(e) => updateSelectedObjectProperty("hingeSide", e.target.value)}
            className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200 ${(!isEditingAllowed) ? "bg-gray-800 cursor-not-allowed" : ""}`}
            disabled={!isEditingAllowed}
          >
            <option value="left">Слева</option>
            <option value="right">Справа</option>
          </select>
        </PropertyInput>
        <PropertyInput label="Направление откр.:">
          <select
            value={objectData.openingDirection || "inward"}
            onChange={(e) => updateSelectedObjectProperty("openingDirection", e.target.value)}
            className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200 ${(!isEditingAllowed) ? "bg-gray-800 cursor-not-allowed" : ""}`}
            disabled={!isEditingAllowed}
          >
            <option value="inward">Внутрь</option>
            <option value="outward">Наружу</option>
          </select>
        </PropertyInput>
      </>
    );
  } else if (objType === OBJECT_TYPES.WINDOW) {
    deleteButtonText = "Удалить окно";
    typeSpecificProperties = (
      <>
        {objectData.isPortalDoor ? (
          <PropertyInput label="Размещение:" value="В межмодульном проеме" disabled />
        ) : (
          <PropertyInput label="Размещение:" value="На обычной стене" disabled />
        )}
         {objectData.portalInterfaceKey && (
            <PropertyInput label="Ключ проема:" value={objectData.portalInterfaceKey.substring(0,15) + '...'} disabled />
        )}
        <PropertyInput
          label="Ширина окна (м):" type="number"
          value={(objectData.width || 0).toFixed(3)}
          step="0.01" min="0.1" max={(GRID_CELL_SIZE_M + 0.001).toFixed(3)}
          onChange={(e) => updateSelectedObjectProperty("width", e.target.value)}
          disabled={!isEditingAllowed}
        />
        <PropertyInput
          label="Позиция на сегменте (0-1):" type="number"
          value={(objectData.positionOnSegment || 0.5).toFixed(2)}
          step="0.01" min="0" max="1"
          onChange={(e) => updateSelectedObjectProperty("positionOnSegment", e.target.value)}
          disabled={!isEditingAllowed}
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
        <p className="text-sm font-medium mb-4 capitalize text-gray-200">
          {objType.replace("_", " ")}
          {objectData.isPortalDoor && <span className="ml-1 text-xs text-sky-400">(Портальная)</span>}
          {isLocked && <span className="ml-2 text-orange-400 text-xs font-normal">(Заблокирован)</span>}
        </p>
        {commonProperties}
        {typeSpecificProperties}
        {showDeleteButton && deleteSelectedObject && (
          <button
            onClick={deleteSelectedObject}
            className={`mt-6 w-full text-white text-sm py-2 px-4 rounded flex items-center justify-center transition-colors ${deleteButtonDisabled ? "bg-red-700/50 cursor-not-allowed" : "bg-red-600 hover:bg-red-500"}`}
            disabled={deleteButtonDisabled}
            title={deleteButtonDisabled ? "Это действие недоступно или должно выполняться через контекстное меню" : ""}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            {deleteButtonText}
          </button>
        )}
      </div>
    </div>
  );
};
export default PropertiesPanel;