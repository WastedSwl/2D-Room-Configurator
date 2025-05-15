// ==== src\components\Configurator\sidebar\ElementPlacementPanel.jsx ====
// src/components/Configurator/sidebar/ElementPlacementPanel.jsx
import React from "react";
import {
  defaultObjectSizes,
  OBJECT_TYPES_TO_ADD,
  GRID_CELL_SIZE_M,
} from "../configuratorConstants";

const ElementPlacementPanel = ({
  selectedWallSegment,
  onPlaceElement,
  onClose,
  isModal,
}) => {
  if (!selectedWallSegment || !selectedWallSegment.id) {
    return null;
  }

  const placeableTypes = OBJECT_TYPES_TO_ADD.filter(
    (item) => defaultObjectSizes[item.type]
  );

  const wallHasElement =
    selectedWallSegment.elements && selectedWallSegment.elements.length > 0;
  
  // isPortalWall is true if it's any part of a portal (empty side or with element)
  const isPortalWallSegment = selectedWallSegment.isPortalWall; 
  // isPortalOpeningSide is true if it's a portal wall segment *without* elements
  const isPortalOpeningSide = isPortalWallSegment && !wallHasElement;


  const handlePlace = (type) => {
    // No specific restriction for isPortalWallSegment anymore here,
    // as the panel won't allow placing if wallHasElement is true.
    // If it's an isPortalOpeningSide, it's fine to place.

    if (wallHasElement) { // This check covers all cases
      alert(
        "На этом сегменте стены уже есть элемент. Удалите его, чтобы добавить новый.",
      );
      return;
    }

    const elementDefaults = defaultObjectSizes[type];
    if (!elementDefaults) {
      console.error(`No default size for type ${type}`);
      return;
    }
    if (elementDefaults.width > GRID_CELL_SIZE_M + 0.01) {
      alert(
        `Элемент (${elementDefaults.width.toFixed(2)}м) слишком широк для сегмента стены (${GRID_CELL_SIZE_M.toFixed(2)}м).`,
      );
      return;
    }
    onPlaceElement(type, elementDefaults.width, elementDefaults.height);
  };

  const panelBaseClasses =
    "bg-card-bg border border-gray-700 p-4 shadow-xl text-gray-200 rounded-md";
  const panelPositionClasses = isModal
    ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 max-h-[80vh] overflow-y-auto z-50"
    : "fixed right-0 top-1/2 transform -translate-y-1/2 w-64 h-full max-h-screen overflow-y-auto z-30 rounded-l-md";

  return (
    <>
      {isModal && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}
      <div className={`${panelBaseClasses} ${panelPositionClasses}`}>
        <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
          <h3 className="text-md font-semibold text-gray-200">Добавить на стену</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-1">
          Модуль: <span className="font-mono">{(selectedWallSegment.moduleLabel || '').substring(0, 12)}...</span>
        </p>
        <p className="text-xs text-gray-400 mb-1">
          Сегмент ID: <span className="font-mono">{(selectedWallSegment.id || '').substring(0, 12)}...</span>
        </p>
        <p className="text-xs text-gray-400 mb-3">
          Ключ: <span className="font-mono">{selectedWallSegment.segmentKey}</span> (Длина: {GRID_CELL_SIZE_M.toFixed(2)}м)
        </p>
        
        {isPortalWallSegment && wallHasElement && (
             <p className="text-sm text-yellow-400 mb-3 p-2 bg-yellow-900/30 rounded-md border border-yellow-700">
               Этот сегмент стены является частью проема и уже содержит элемент.
             </p>
        )}
        {isPortalOpeningSide && (
             <p className="text-sm text-sky-400 mb-3 p-2 bg-sky-900/30 rounded-md border border-sky-700">
               Этот сегмент является стороной межмодульного проема. Вы можете добавить сюда дверь или окно.
             </p>
        )}
        {wallHasElement && !isPortalWallSegment && ( // Normal wall with an element
          <p className="text-sm text-yellow-400 mb-3 p-2 bg-yellow-900/30 rounded-md border border-yellow-700">
            На этом сегменте уже есть элемент. Удалите его, чтобы разместить
            новый.
          </p>
        )}

        <div className="space-y-2">
          {placeableTypes.map((item) => {
            const elementDefaults = defaultObjectSizes[item.type];
            const isTooWide = elementDefaults && elementDefaults.width > GRID_CELL_SIZE_M + 0.01;
            // Item is disabled if wall already has an element OR if the new element is too wide.
            // Being a portal side (isPortalOpeningSide) does NOT disable it.
            const itemDisabled = wallHasElement || isTooWide;

            return (
              <button
                key={item.type}
                onClick={() => handlePlace(item.type)}
                className={`w-full text-left p-2 rounded text-sm
                  ${
                    itemDisabled
                      ? "opacity-50 cursor-not-allowed bg-gray-800 text-gray-500"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  }`}
                disabled={itemDisabled}
                title={
                  wallHasElement
                    ? "На стене уже есть элемент"
                    : isTooWide
                      ? `Элемент (${elementDefaults.width.toFixed(2)}м) слишком широк для сегмента (${GRID_CELL_SIZE_M.toFixed(2)}м)`
                      : `Размер по умолчанию: ${elementDefaults?.width?.toFixed(2) || "?"}м`
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ElementPlacementPanel;