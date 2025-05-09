// ========= src/components/Configurator/sidebar/ElementPlacementPanel.jsx =========
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
    (item) =>
      item.type === "door" ||
      item.type === "window" ||
      item.type === "outlet" ||
      item.type === "light_led" ||
      item.type === "radiator",
  );

  const wallHasElement =
    selectedWallSegment.elements && selectedWallSegment.elements.length > 0;

  const handlePlace = (type) => {
    if (wallHasElement) {
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
        `Элемент (${elementDefaults.width}м) слишком широк для сегмента стены (${GRID_CELL_SIZE_M}м).`,
      );
      return;
    }
    onPlaceElement(type, elementDefaults.width, elementDefaults.height);
  };

  const panelBaseClasses =
    "bg-card-bg border border-gray-700 p-4 shadow-xl text-gray-200 rounded-md";
  const panelPositionClasses = isModal
    ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 z-50"
    : "fixed right-0 top-1/2 transform -translate-y-1/2 w-64 z-30 rounded-l-md";

  return (
    <>
      {isModal && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}
      <div className={`${panelBaseClasses} ${panelPositionClasses}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold">Добавить на стену</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-1">
          Модуль:{" "}
          {(
            selectedWallSegment.moduleLabel ||
            selectedWallSegment.moduleId ||
            ""
          ).substring(0, 12)}
          ...
        </p>
        <p className="text-xs text-gray-400 mb-1">
          Сегмент ID: {(selectedWallSegment.id || "").substring(0, 12)}...
        </p>
        <p className="text-xs text-gray-400 mb-3">
          Ключ: {selectedWallSegment.segmentKey} (Длина: {GRID_CELL_SIZE_M}м)
        </p>

        {wallHasElement && (
          <p className="text-sm text-yellow-400 mb-3 p-2 bg-yellow-900/30 rounded-md border border-yellow-700">
            На этом сегменте уже есть элемент. Удалите его, чтобы разместить
            новый.
          </p>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {placeableTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => handlePlace(item.type)}
              className={`w-full text-left p-2 bg-gray-700 rounded text-sm
                ${
                  wallHasElement
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-600"
                }`}
              disabled={wallHasElement}
              title={
                wallHasElement
                  ? "На стене уже есть элемент"
                  : `Размер по умолчанию: ${defaultObjectSizes[item.type]?.width || "?"}м`
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ElementPlacementPanel;
