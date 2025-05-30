import React from "react";
import PropertyInput from "../common/PropertyInput";
import { TrashIcon, ArrowsRightLeftIcon, EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline"; 
import { OBJECT_TYPES, GRID_CELL_SIZE_M, defaultObjectSizes } from "../configuratorConstants";

const PropertiesPanel = ({
  primarySelectedObject,
  lockedObjectIds = [],
  modifierKeys,
  updateSelectedObjectProperty,
  deleteSelectedObject,
  onSetDockedLinePassage,
  onSetDockedWallsDeleted,
}) => {
  if (!primarySelectedObject || typeof primarySelectedObject.id === "undefined") {
    return (
      <div id="properties-panel" className="w-64 bg-card-bg border-l border-gray-700 p-4 overflow-y-auto flex-shrink-0 text-gray-400">
        <h2 className="text-md font-semibold mb-3 border-b border-gray-700 pb-2 text-gray-200">Свойства</h2>
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
      <PropertyInput label="ID:" value={objectData.id.substring(0, 15) + (objectData.id.length > 15 ? "..." : "")} disabled />
      <PropertyInput label="Тип:" value={objType.replace("_", " ")} disabled />
    </>
  );

  let typeSpecificProperties = null;
  let dockManagementUI = null; 
  let showDeleteButton = true;
  let deleteButtonText = "Удалить элемент";
  let deleteButtonDisabled = !isEditingAllowed;

  if (objType === OBJECT_TYPES.MODULE) {
    deleteButtonText = "Удалить модуль";
    typeSpecificProperties = (
      <>
        <PropertyInput label="Label:" value={objectData.label || ""} onChange={(e) => updateSelectedObjectProperty("label", e.target.value)} disabled={!isEditingAllowed} />
        <PropertyInput label="Ячеек в ширину:" value={objectData.cellsWide || 0} disabled />
        <PropertyInput label="Ячеек в длину:" value={objectData.cellsLong || 0} disabled />
        <PropertyInput label="Размер (м):" value={`${(objectData.width || 0).toFixed(2)} x ${(objectData.height || 0).toFixed(2)}`} disabled />
        <PropertyInput label="Позиция X (м):" type="number" step="0.01" value={(objectData.x || 0).toFixed(2)} onChange={(e) => updateSelectedObjectProperty("x", e.target.value)} disabled={!isEditingAllowed} />
        <PropertyInput label="Позиция Y (м):" type="number" step="0.01" value={(objectData.y || 0).toFixed(2)} onChange={(e) => updateSelectedObjectProperty("y", e.target.value)} disabled={!isEditingAllowed} />
        <PropertyInput label="Поворот (°):" type="number" step="1" value={objectData.rotation || 0} onChange={(e) => updateSelectedObjectProperty("rotation", e.target.value)} disabled={!isEditingAllowed} />
        <PropertyInput label="Отзеркален (X):" value={objectData.mirroredX ? "Да" : "Нет"} disabled />
      </>
    );
  } else if (objType === OBJECT_TYPES.WALL_SEGMENT) {
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

    if (objectData.isDocked) {
        deleteButtonText = "Стыковочная стена";
        deleteButtonDisabled = true; 
        showDeleteButton = false; 
        dockManagementUI = (
            <div className="mt-4 pt-3 border-t border-gray-600">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Управление стыком</h3>
                {objectData.isFullyOpenPassage ? (
                     <button
                        onClick={() => onSetDockedWallsDeleted(objectData, false)}
                        className="w-full text-white text-sm py-2 px-3 rounded flex items-center justify-center bg-blue-600 hover:bg-blue-500 transition-colors mb-2"
                        title="Восстановить разделенные стены на линии стыка"
                    >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Восстановить стены
                    </button>
                ) : (
                    <>
                        {objectData.isPassageWithPartner ? (
                            <button
                                onClick={() => onSetDockedLinePassage(objectData, false)} 
                                className="w-full text-white text-sm py-2 px-3 rounded flex items-center justify-center bg-orange-600 hover:bg-orange-500 transition-colors mb-2"
                                title="Разделить на две тонкие стены на линии стыка"
                            >
                                <ArrowsRightLeftIcon className="w-4 h-4 mr-2 transform rotate-90" /> 
                                Разделить стены
                            </button>
                        ) : ( 
                            <button
                                onClick={() => onSetDockedLinePassage(objectData, true)} 
                                className="w-full text-white text-sm py-2 px-3 rounded flex items-center justify-center bg-green-600 hover:bg-green-500 transition-colors mb-2"
                                title="Объединить в одну стандартную стену на линии стыка"
                            >
                                <ArrowsRightLeftIcon className="w-4 h-4 mr-2" />
                                Объединить стены
                            </button>
                        )}
                        <button
                            onClick={() => onSetDockedWallsDeleted(objectData, true)}
                            className="w-full text-white text-sm py-2 px-3 rounded flex items-center justify-center bg-red-600 hover:bg-red-500 transition-colors"
                            title="Полностью удалить стены на линии стыка (создать проем)"
                        >
                           <EyeSlashIcon className="w-4 h-4 mr-2" />
                           Удалить стены (проем)
                        </button>
                    </>
                )}
            </div>
        );

    } else { 
        deleteButtonText = "Удалить стену (меню)";
        if (isPerimeter) {
            deleteButtonDisabled = true; deleteButtonText = "Периметр (нельзя удалить)";
        } else if (hasElements) {
            deleteButtonDisabled = true; deleteButtonText = "Есть элементы (см. меню)";
        }
    }
    
    let wallTypeDisplay = "Обычная стена";
    if (objectData.isDocked) {
        if(objectData.isFullyOpenPassage){
            wallTypeDisplay = "Стыковочная (проем)";
        } else if (objectData.isPassageWithPartner) {
            wallTypeDisplay = "Стыковочная (объединенная)";
        } else {
            wallTypeDisplay = "Стыковочная (разделенная)";
        }
    }

    typeSpecificProperties = (
      <>
        <PropertyInput label="Ключ сегмента:" value={objectData.segmentKey} disabled />
        <PropertyInput label="Тип стены:" value={wallTypeDisplay} disabled />
        <PropertyInput
          label="Толщина (м):" type="number" value={(objectData.thickness || 0).toFixed(3)} step="0.001"
          onChange={(e) => updateSelectedObjectProperty("thickness", e.target.value)}
          disabled={!isEditingAllowed || objectData.isDocked || objectData.isFullyOpenPassage} 
        />
         <PropertyInput
          label="Смещение (м):" type="number" value={(objectData.renderOffset || 0).toFixed(3)} step="0.001"
          onChange={(e) => updateSelectedObjectProperty("renderOffset", e.target.value)}
          disabled={!isEditingAllowed || objectData.isDocked || objectData.isFullyOpenPassage} 
        />
        {objectData.parentModule && (
          <PropertyInput label="Родительский модуль:" value={objectData.parentModule.label || objectData.parentModule.id.substring(0, 10) + "..."} disabled />
        )}
        {objectData.isDocked && (objectData.partnerModuleId || objectData.wasPartnerModuleId) && (
             <PropertyInput label="Партнерский модуль:" value={(objectData.partnerModuleId || objectData.wasPartnerModuleId).substring(0,10)+"..."} disabled />
        )}
      </>
    );
  } else if (objType === OBJECT_TYPES.DOOR) {
    deleteButtonText = "Удалить дверь";
    typeSpecificProperties = (
      <>
        <PropertyInput
          label="Ширина двери (м):" value={(objectData.width || GRID_CELL_SIZE_M).toFixed(3)} 
          disabled title="Ширина двери равна ширине сегмента стены."
        />
        <PropertyInput
          label="Позиция на сегменте (0-1):" value={(objectData.positionOnSegment || 0.5).toFixed(2)} 
          disabled title="Дверь всегда размещается по центру сегмента."
        />
        <PropertyInput label="Петли:">
          <select value={objectData.hingeSide || "left"} onChange={(e) => updateSelectedObjectProperty("hingeSide", e.target.value)}
            className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200 ${(!isEditingAllowed) ? "bg-gray-800 cursor-not-allowed" : ""}`} disabled={!isEditingAllowed}
          >
            <option value="left">Слева (Петли слева)</option>
            <option value="right">Справа (Петли справа)</option>
          </select>
        </PropertyInput>
        {/* isOpen, openingAngle, openingDirection - убраны, так как SVG двери всегда открыт */}
      </>
    );
  } else if (objType === OBJECT_TYPES.WINDOW || objType === OBJECT_TYPES.PANORAMIC_WINDOW) {
    deleteButtonText = `Удалить ${objType === OBJECT_TYPES.WINDOW ? "окно" : "панорамное окно"}`;
    const isStandardWindow = objType === OBJECT_TYPES.WINDOW;
    typeSpecificProperties = (
      <>
        <PropertyInput 
            label="Ширина окна (м):" 
            type="number"
            value={(objectData.width || (isStandardWindow ? GRID_CELL_SIZE_M : defaultObjectSizes[objType].width)).toFixed(3)} 
            step="0.01"
            min={isStandardWindow ? GRID_CELL_SIZE_M.toFixed(3) : "0.1"}
            max={isStandardWindow ? GRID_CELL_SIZE_M.toFixed(3) : (GRID_CELL_SIZE_M * (objectData.parentModule?.cellsWide || 3)).toFixed(3) } // Примерный макс для панорамного
            onChange={(e) => updateSelectedObjectProperty("width", e.target.value)}
            disabled={!isEditingAllowed || isStandardWindow} 
            title={isStandardWindow ? "Ширина окна равна ширине сегмента стены." : "Укажите ширину панорамного окна"} 
        />
        <PropertyInput 
            label="Позиция на сегменте (0-1):" 
            type="number" value={(objectData.positionOnSegment || 0.5).toFixed(2)} 
            step="0.01" min="0" max="1"
            onChange={(e) => updateSelectedObjectProperty("positionOnSegment", e.target.value)}
            disabled={!isEditingAllowed || isStandardWindow} 
            title={isStandardWindow ? "Окно всегда размещается по центру сегмента." : "Укажите позицию центра панорамного окна"}
        />
        <PropertyInput
          label="Высота окна (м):" type="number" value={(objectData.height || defaultObjectSizes[objType].height).toFixed(2)} step="0.05" min="0.3"
          onChange={(e) => updateSelectedObjectProperty("height", e.target.value)} disabled={!isEditingAllowed}
        />
      </>
    );
  } else if (objType === OBJECT_TYPES.RADIATOR) {
    deleteButtonText = "Удалить радиатор";
    typeSpecificProperties = (
      <>
        <PropertyInput
            label="Ширина радиатора (м):" type="number" value={(objectData.width || defaultObjectSizes[OBJECT_TYPES.RADIATOR].width).toFixed(2)} step="0.1" min="0.3" max="2.0"
            onChange={(e) => updateSelectedObjectProperty("width", e.target.value)} disabled={!isEditingAllowed}
        />
         <PropertyInput
          label="Позиция на сегменте (0-1):" type="number" value={(objectData.positionOnSegment || 0.5).toFixed(2)} step="0.01" min="0" max="1"
          onChange={(e) => updateSelectedObjectProperty("positionOnSegment", e.target.value)} disabled={!isEditingAllowed}
        />
      </>
    );
  } else if (objType === OBJECT_TYPES.OUTLET || objType === OBJECT_TYPES.LIGHT_WALL) { // LIGHT_LED заменено на LIGHT_WALL
    deleteButtonText = `Удалить ${objType === OBJECT_TYPES.OUTLET ? "розетку" : "настенный светильник"}`;
     typeSpecificProperties = (
      <>
         <PropertyInput
          label="Позиция на сегменте (0-1):" type="number" value={(objectData.positionOnSegment || 0.5).toFixed(2)} step="0.01" min="0" max="1"
          onChange={(e) => updateSelectedObjectProperty("positionOnSegment", e.target.value)} disabled={!isEditingAllowed}
        />
      </>
    );
  } else if (objType === OBJECT_TYPES.KITCHEN_ELEMENT) {
    deleteButtonText = "Удалить кух. элемент";
    typeSpecificProperties = (
      <>
        <PropertyInput
            label="Ширина (м):" type="number" value={(objectData.width || defaultObjectSizes[OBJECT_TYPES.KITCHEN_ELEMENT].width).toFixed(2)} step="0.1" min="0.3" max="3.0"
            onChange={(e) => updateSelectedObjectProperty("width", e.target.value)} disabled={!isEditingAllowed}
        />
         <PropertyInput
          label="Позиция на сегменте (0-1):" type="number" value={(objectData.positionOnSegment || 0.5).toFixed(2)} step="0.01" min="0" max="1"
          onChange={(e) => updateSelectedObjectProperty("positionOnSegment", e.target.value)} disabled={!isEditingAllowed}
        />
        <PropertyInput
          label="Глубина (м):" type="number" value={(objectData.depth || defaultObjectSizes[OBJECT_TYPES.KITCHEN_ELEMENT].depth).toFixed(2)} step="0.05" min="0.3" max="1.0"
          onChange={(e) => updateSelectedObjectProperty("depth", e.target.value)} disabled={!isEditingAllowed}
        />
      </>
    );
  }

  return (
    <div id="properties-panel" className="w-64 bg-card-bg border-l border-gray-700 p-4 overflow-y-auto flex-shrink-0 text-gray-300">
      <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
        <h2 className="text-md font-semibold text-gray-200">Свойства</h2>
      </div>
      <div>
        <p className="text-sm font-medium mb-4 capitalize text-gray-200">
          {objType.replace("_", " ")}
          {isLocked && <span className="ml-2 text-orange-400 text-xs font-normal">(Заблокирован)</span>}
        </p>
        {commonProperties}
        {typeSpecificProperties}
        {dockManagementUI}
        {showDeleteButton && deleteSelectedObject && (
          <button
            onClick={() => {
                if (objType === OBJECT_TYPES.WALL_SEGMENT && (objectData.isDocked || isPerimeter || hasElements)) {
                    return; 
                }
                deleteSelectedObject();
            }}
            className={`mt-6 w-full text-white text-sm py-2 px-4 rounded flex items-center justify-center transition-colors ${deleteButtonDisabled ? "bg-red-700/50 cursor-not-allowed" : "bg-red-600 hover:bg-red-500"}`}
            disabled={deleteButtonDisabled}
            title={deleteButtonDisabled ? (objectData.isDocked ? "Управляйте через 'Управление стыком' или контекстное меню" : "Это действие недоступно или используйте контекстное меню") : ""}
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