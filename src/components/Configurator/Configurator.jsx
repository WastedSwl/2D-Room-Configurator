// src/components/Configurator/Configurator.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { MODES, DEFAULT_MODE } from "./appConstants";
import { OBJECT_TYPES_TO_ADD } from "./configuratorConstants";

import useConfiguratorState from "./hooks/useConfiguratorState";
import useObjectManagement from "./hooks/useObjectManagement";
import useViewTransform from "./hooks/useViewTransform";
import useModifierKeys from "./hooks/useModifierKeys";
import useMouseInteractions from "./hooks/useMouseInteractions";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";

import ConfiguratorToolbar from "./toolbar/ConfiguratorToolbar";
import SvgCanvas from "./canvas/SvgCanvas";
import PropertiesPanel from "./sidebar/PropertiesPanel";
import StatusBar from "./statusbar/StatusBar";

// Import mode components
import ModularMode from "./modes/ModularMode";
import FramelessMode from "./modes/FramelessMode";
import FrameMode from "./modes/FrameMode";

import { getInitialObjects } from "./hooks/useObjectManagement";

const Configurator = ({
  activeMode: activeModeProp,
  setProjectInfoData: setProjectInfoDataProp,
  renderModeSpecificUI: renderModeSpecificUIProp,
}) => {
  const [activeMode, setActiveMode] = useState(
    activeModeProp !== undefined ? activeModeProp : DEFAULT_MODE
  );
  const setProjectInfoDataExt = setProjectInfoDataProp || (() => {});
  const renderModeSpecificUI = renderModeSpecificUIProp || (() => null);

  const svgRef = useRef(null);
  const mainContainerRef = useRef(null);

  // ---- Hooks ----
  const {
    objects,
    objectsRef,
    setObjects,
    selectedObjectIds,
    setSelectedObjectIds,
    lockedObjectIds,
    setLockedObjectIds,
    history,
    setHistory,
    handleUndo,
    handleRedo,
    primarySelectedObject,
    copiedObjectsData,
    setCopiedObjectsData,
    overlappingObjectIds,
    setOverlappingObjectIds,
  } = useConfiguratorState(setProjectInfoDataExt, activeMode);

  const modifierKeys = useModifierKeys(mainContainerRef, svgRef);

  const {
    addObject,
    updateObject,
    deleteObjectById,
    updateSelectedObjectProperty,
    addAndSelectObject,
    defaultObjectSizes,
  } = useObjectManagement(
    setObjects,
    selectedObjectIds,
    lockedObjectIds,
    modifierKeys,
  );

  const { viewTransform, setViewTransform, screenToWorld, screenToWorldRect } =
    useViewTransform(svgRef);

  const [addingObjectType, setAddingObjectType] = useState(null);

  const mouseInteractions = useMouseInteractions({
    objectsRef,
    setObjects,
    setObjectsState: setObjects,
    selectedObjectIds,
    setSelectedObjectIds,
    lockedObjectIds,
    setHistory,
    viewTransform,
    screenToWorld,
    screenToWorldRect,
    modifierKeys,
    addingObjectType,
    setAddingObjectType,
    addAndSelectObject,
    mainContainerRef,
    svgRef,
    setOverlappingObjectIdsProp: setOverlappingObjectIds,
  });

  useKeyboardShortcuts({
    mainContainerRef,
    selectedObjectIds,
    setSelectedObjectIds,
    lockedObjectIds,
    setLockedObjectIds,
    objectsRef,
    setObjects,
    handleUndo,
    handleRedo,
    copiedObjectsData,
    setCopiedObjectsData,
    addingObjectType,
    setAddingObjectType,
    marqueeRectActive: mouseInteractions.marqueeRect.active,
    resizingStateActive: !!mouseInteractions.resizingState,
  });

  useEffect(() => {
    mainContainerRef.current?.focus();
  }, []);

  const handleStartAddObject = useCallback(
    (type) => {
      setAddingObjectType(type);
      setSelectedObjectIds([]); // Clear selection when starting to add
    },
    [setSelectedObjectIds],
  );

  const handleDeleteSelectedObjectInPanel = useCallback(() => {
    if (
      primarySelectedObject &&
      (!lockedObjectIds.includes(primarySelectedObject.id) ||
        modifierKeys.shift)
    ) {
      deleteObjectById(primarySelectedObject.id);
      setSelectedObjectIds((ids) =>
        ids.filter((id) => id !== primarySelectedObject.id),
      );
    }
  }, [
    primarySelectedObject,
    lockedObjectIds,
    modifierKeys.shift,
    deleteObjectById,
    setSelectedObjectIds,
  ]);

  // Возвращает стартовые объекты для режима
  function getInitialObjectsForMode(mode) {
    if (mode === MODES.FRAMELESS) return getInitialObjects();
    // Для модульного и каркасного — пусто
    return [];
  }

  const handleModeChange = useCallback((newMode) => {
    if (newMode === activeMode) return;
    // Show confirmation dialog if there are unsaved changes
    if (objects.length > 0) {
      const confirmed = window.confirm(
        "При смене режима все несохраненные изменения будут потеряны. Продолжить?"
      );
      if (!confirmed) return;
    }
    // Clear all objects and reset state
    setObjects(getInitialObjectsForMode(newMode));
    setSelectedObjectIds([]);
    setLockedObjectIds([]);
    setHistory({ undo: [], redo: [] }); // Initialize history properly
    setAddingObjectType(null);
    // Set new mode
    setActiveMode(newMode);
  }, [activeMode, objects.length, setObjects, setSelectedObjectIds, setLockedObjectIds, setHistory]);

  // Interface for mode-specific UI
  const configuratorInterface = {
    addObject,
    updateObject,
    deleteObject: deleteObjectById,
    getObjects: () => objectsRef.current,
    getSelectedObjectIds: () => selectedObjectIds,
    setSelectedObjectIds,
    screenToWorld,
    viewTransform,
    svgRef,
  };

  // Render the appropriate mode component
  const renderModeComponent = () => {
    switch (activeMode) {
      case MODES.MODULAR:
        return <ModularMode {...configuratorInterface} />;
      case MODES.FRAMELESS:
        return <FramelessMode {...configuratorInterface} />;
      case MODES.FRAMED:
        return <FrameMode {...configuratorInterface} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={mainContainerRef}
      className="w-full h-full flex flex-col select-none outline-none"
      tabIndex={0} // Make div focusable
    >
      <ConfiguratorToolbar
        activeModeName={activeMode}
        addingObjectType={addingObjectType}
        onStartAddObject={handleStartAddObject}
        onModeChange={handleModeChange}
      />

      <div className="flex flex-grow overflow-hidden">
        <div className="flex-grow relative bg-gray-200">
          <SvgCanvas
            svgRef={svgRef}
            viewTransform={viewTransform}
            setViewTransform={setViewTransform} // For panning
            objects={objects}
            selectedObjectIds={selectedObjectIds}
            lockedObjectIds={lockedObjectIds}
            overlappingObjectIds={overlappingObjectIds}
            activeSnapLines={mouseInteractions.activeSnapLines}
            marqueeRect={mouseInteractions.marqueeRect}
            modifierKeys={modifierKeys}
            addingObjectType={addingObjectType}
            isPanningWithSpace={mouseInteractions.isPanningWithSpace}
            draggingState={mouseInteractions.draggingState}
            resizingState={mouseInteractions.resizingState}
            handleMouseMove={mouseInteractions.handleMouseMove}
            handleMouseUp={mouseInteractions.handleMouseUp}
            handleMouseLeave={mouseInteractions.handleMouseLeave}
            handleMouseDownOnCanvas={mouseInteractions.handleMouseDownOnCanvas}
            handleMouseDownOnObject={mouseInteractions.handleMouseDownOnObject}
            handleMouseDownOnResizeHandle={
              mouseInteractions.handleMouseDownOnResizeHandle
            }
          />
          {addingObjectType && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-300 text-black px-3 py-1.5 rounded shadow-lg text-xs z-10 pointer-events-none">
              Клик для добавления "
              {
                OBJECT_TYPES_TO_ADD.find((o) => o.type === addingObjectType)
                  ?.label
              }
              ". ESC для отмены.
            </div>
          )}
          {renderModeComponent()}
          {renderModeSpecificUI && (
            <div className="absolute top-2 left-2 p-0 z-20">
              {renderModeSpecificUI(configuratorInterface)}
            </div>
          )}
        </div>

        <PropertiesPanel
          primarySelectedObject={primarySelectedObject}
          selectedObjectIds={selectedObjectIds}
          lockedObjectIds={lockedObjectIds}
          modifierKeys={modifierKeys}
          updateSelectedObjectProperty={updateSelectedObjectProperty}
          deleteSelectedObject={handleDeleteSelectedObjectInPanel}
        />
      </div>

      <StatusBar
        selectedObjectIds={selectedObjectIds}
        primarySelectedObject={primarySelectedObject}
        lockedObjectIds={lockedObjectIds}
        history={history}
      />
    </div>
  );
};

Configurator.propTypes = {
  activeMode: PropTypes.oneOf(Object.values(MODES)),
  setProjectInfoData: PropTypes.func,
  renderModeSpecificUI: PropTypes.func,
};

export default Configurator;
