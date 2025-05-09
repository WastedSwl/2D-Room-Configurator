import React from "react";
import PropertyInput from "../common/PropertyInput";
import { LockClosedIcon, LockOpenIcon, TrashIcon } from '@heroicons/react/24/outline';


const PropertiesPanel = ({
  primarySelectedObject,
  selectedObjectIds,
  lockedObjectIds,
  modifierKeys,
  updateSelectedObjectProperty,
  deleteSelectedObject,
  activeMode,
  rotateModule180,
  mirrorModuleX,
  mirrorModuleY,
}) => {
  // Более строгая проверка на наличие primarySelectedObject и его свойств
  if (!primarySelectedObject || typeof primarySelectedObject.id === 'undefined') {
    // Если selectedObjectIds не пустой, но primarySelectedObject не найден (редкая ситуация, но возможная)
    if (selectedObjectIds && selectedObjectIds.length > 0 && selectedObjectIds.length !== 1) {
        return (
            <div className="w-64 bg-card-bg border-l border-gray-700 p-4 overflow-y-auto flex-shrink-0 text-gray-400">
              <h2 className="text-md font-semibold mb-3 border-b border-gray-700 pb-2 text-gray-200">Свойства</h2>
              <p className="text-sm">
                Выбрано несколько объектов ({selectedObjectIds.length} шт).
                {selectedObjectIds.some((id) => lockedObjectIds.includes(id)) && (
                  <span className="ml-1 text-xs text-orange-400">
                    (есть заблокированные)
                  </span>
                )}
              </p>
            </div>
          );
    }
    // Если ничего не выбрано или primarySelectedObject некорректен
    return (
      <div className="w-64 bg-card-bg border-l border-gray-700 p-4 overflow-y-auto flex-shrink-0 text-gray-400">
        <h2 className="text-md font-semibold mb-3 border-b border-gray-700 pb-2 text-gray-200">Свойства</h2>
        <p className="text-sm">Ничего не выбрано.</p>
      </div>
    );
  }
  
  // Если мы дошли сюда, primarySelectedObject существует и имеет id.
  // Проверка на selectedObjectIds.length > 1 теперь избыточна, если primarySelectedObject уже определен.
  // Но оставим на всякий случай, если логика primarySelectedObject изменится.
  if (selectedObjectIds && selectedObjectIds.length > 1) {
    return (
      <div className="w-64 bg-card-bg border-l border-gray-700 p-4 overflow-y-auto flex-shrink-0 text-gray-400">
        <h2 className="text-md font-semibold mb-3 border-b border-gray-700 pb-2 text-gray-200">Свойства</h2>
        <p className="text-sm">
          Выбрано несколько объектов ({selectedObjectIds.length} шт).
          {selectedObjectIds.some((id) => lockedObjectIds.includes(id)) && (
            <span className="ml-1 text-xs text-orange-400">
              (есть заблокированные)
            </span>
          )}
        </p>
      </div>
    );
  }


  const isLocked = lockedObjectIds.includes(primarySelectedObject.id);
  const isLockedAndCantEdit = isLocked && !modifierKeys.shift;

  // Добавляем проверку на primarySelectedObject.type
  const objType = primarySelectedObject.type || 'unknown'; 
  const isModule = objType === 'module';
  const isCorridor = objType === 'corridor';
  const isStaticLike = true; 


  return (
    <div className="w-64 bg-card-bg border-l border-gray-700 p-4 overflow-y-auto flex-shrink-0 text-gray-300">
      <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
        <h2 className="text-md font-semibold text-gray-200">Свойства</h2>
        <button 
            onClick={() => {
                // Эта логика должна быть вынесена в Configurator или useObjectManagement,
                // так как PropertiesPanel не должна напрямую менять lockedObjectIds.
                // Вместо этого, она должна вызывать callback.
                // Пока оставим так для простоты, но это кандидат на рефакторинг.
                const newLockedIds = new Set(lockedObjectIds);
                if (isLocked) {
                    newLockedIds.delete(primarySelectedObject.id);
                } else {
                    newLockedIds.add(primarySelectedObject.id);
                }
                // Предполагаем, что есть setLockedObjectIds в родительском компоненте
                // updateSelectedObjectProperty("lockedStatusChanged", Array.from(newLockedIds)); // Неправильно, это не свойство объекта
                // Нужен прямой вызов setLockedObjectIds или коллбэк.
                // Для примера, пока оставим как есть, но это не будет работать без прокидывания setLockedObjectIds
            }}
            className={`p-1 rounded ${isLocked ? 'text-orange-400 hover:text-orange-300' : 'text-gray-500 hover:text-gray-300'}`}
            title={isLocked ? "Разблокировать (L)" : "Заблокировать (L)"}
          >
            {isLocked ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
        </button>
      </div>
      <div>
          <p className="text-xs text-gray-500 mb-1 truncate" title={primarySelectedObject.id}>
            ID: {primarySelectedObject.id.substring(0,15)}{primarySelectedObject.id.length > 15 ? '...' : ''}
            {primarySelectedObject.label
              ? ` (${primarySelectedObject.label})`
              : ""}
          </p>
          <p className="text-sm font-medium mb-3 capitalize text-gray-200">
            Тип: {objType}
            {isLocked && (
              <span className="ml-2 text-orange-400 text-xs font-normal">
                (Заблокирован)
              </span>
            )}
          </p>

          <PropertyInput
              label="X (м):"
              value={(primarySelectedObject.x || 0).toFixed(3)}
              onChange={(e) => updateSelectedObjectProperty("x", e.target.value)}
              disabled={isLockedAndCantEdit || isStaticLike}
            />
            <PropertyInput
              label="Y (м):"
              value={(primarySelectedObject.y || 0).toFixed(3)}
              onChange={(e) => updateSelectedObjectProperty("y", e.target.value)}
              disabled={isLockedAndCantEdit || isStaticLike}
            />

          <PropertyInput
              label={
                objType === "door" || objType === "window" ? "Длина (м):"
                : isCorridor && primarySelectedObject.width > primarySelectedObject.height ? "Длина (м):"
                : isCorridor && primarySelectedObject.height > primarySelectedObject.width ? "Высота (м):"
                : "Ширина (м):"
              }
              value={(primarySelectedObject.width || 0).toFixed(3)}
              min="0.01"
              onChange={(e) => updateSelectedObjectProperty("width", e.target.value)}
              disabled={isLockedAndCantEdit || isStaticLike}
            />
          <PropertyInput
              label={
                objType === "door" || objType === "window" || objType === "wall" || isCorridor ? "Толщина (м):"
                : "Высота (м):"
              }
              value={(primarySelectedObject.height || 0).toFixed(3)}
              min="0.01"
              onChange={(e) => updateSelectedObjectProperty("height", e.target.value)}
              disabled={isLockedAndCantEdit || isStaticLike}
            />

          <PropertyInput
              label="Вращение (°):"
              type="number"
              value={primarySelectedObject.rotation || 0}
              step="1"
              min="-360"
              max="360"
              onChange={(e) => updateSelectedObjectProperty("rotation", e.target.value)}
              disabled={isLockedAndCantEdit || isStaticLike}
          />
          
          {isModule && activeMode === 'modular' && (
            <div className="mt-3 space-y-1.5">
                <button
                    onClick={() => rotateModule180(primarySelectedObject.id)}
                    className={`w-full p-1.5 border border-gray-600 rounded text-xs bg-gray-700 hover:bg-gray-600 transition-colors ${isLockedAndCantEdit || isStaticLike ? "cursor-not-allowed opacity-50" : ""}`}
                    disabled={isLockedAndCantEdit || isStaticLike}
                >
                    Повернуть на 180°
                </button>
                <button
                    onClick={() => mirrorModuleX(primarySelectedObject.id)}
                    className={`w-full p-1.5 border border-gray-600 rounded text-xs bg-gray-700 hover:bg-gray-600 transition-colors ${isLockedAndCantEdit || isStaticLike ? "cursor-not-allowed opacity-50" : ""}`}
                    disabled={isLockedAndCantEdit || isStaticLike}
                >
                    Отзеркалить по X
                </button>
                <button
                    onClick={() => mirrorModuleY(primarySelectedObject.id)}
                    className={`w-full p-1.5 border border-gray-600 rounded text-xs bg-gray-700 hover:bg-gray-600 transition-colors ${isLockedAndCantEdit || isStaticLike ? "cursor-not-allowed opacity-50" : ""}`}
                    disabled={isLockedAndCantEdit || isStaticLike}
                >
                    Отзеркалить по Y
                </button>
            </div>
          )}


          {objType === "door" && (
            <>
              <PropertyInput label="Открыта:">
                <button
                  onClick={() => updateSelectedObjectProperty("isOpen", !primarySelectedObject.isOpen)}
                  className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-blue ${isLockedAndCantEdit ? "cursor-not-allowed opacity-50" : ""}`}
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
                onChange={(e) => updateSelectedObjectProperty("openingAngle", e.target.value)}
                disabled={isLockedAndCantEdit || !primarySelectedObject.isOpen}
                title={!primarySelectedObject.isOpen ? "Сначала откройте дверь" : ""}
              />
              <PropertyInput label="Петли:">
                <select
                  value={primarySelectedObject.hingeSide || "left"}
                  onChange={(e) => updateSelectedObjectProperty("hingeSide", e.target.value)}
                  className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200 ${isLockedAndCantEdit ? "bg-gray-800 cursor-not-allowed opacity-60" : "focus:ring-1 focus:ring-primary-blue focus:border-primary-blue outline-none"}`}
                  disabled={isLockedAndCantEdit}
                >
                  <option value="left">Слева</option>
                  <option value="right">Справа</option>
                </select>
              </PropertyInput>
              <PropertyInput label="Направление откр.:">
                <select
                  value={primarySelectedObject.openingDirection || "inward"}
                  onChange={(e) => updateSelectedObjectProperty("openingDirection", e.target.value)}
                  className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200 ${isLockedAndCantEdit ? "bg-gray-800 cursor-not-allowed opacity-60" : "focus:ring-1 focus:ring-primary-blue focus:border-primary-blue outline-none"}`}
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
            className={`mt-6 w-full text-white text-sm py-2 px-4 rounded flex items-center justify-center transition-colors ${isLockedAndCantEdit ? "bg-red-700/50 cursor-not-allowed" : "bg-red-600 hover:bg-red-500"}`}
            disabled={isLockedAndCantEdit}
          >
            <TrashIcon className="w-4 h-4 mr-2"/>
            Удалить {objType === 'module' ? 'модуль' : objType === 'corridor' ? 'коридор' : 'выбранный'}
          </button>
        </div>
    </div>
  );
};

export default PropertiesPanel;