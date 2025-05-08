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

import { getInitialObjects } from "./hooks/useObjectManagement"; // Это нормально, если getInitialObjects статична

const Configurator = ({
  activeMode: activeModeProp,
  setProjectInfoData: setProjectInfoDataProp,
  renderModeSpecificUI: renderModeSpecificUIProp,
}) => {
  const [activeModeInternal, setActiveModeInternal] = useState(
    activeModeProp !== undefined ? activeModeProp : DEFAULT_MODE
  );
  const setProjectInfoDataExt = setProjectInfoDataProp || (() => {});
  const renderModeSpecificUIExt = renderModeSpecificUIProp || (() => null);

  const svgRef = useRef(null);
  const mainContainerRef = useRef(null);

  // ---- Hooks ----
  // 1. useConfiguratorState должен быть первым, так как он предоставляет objectsRef
  const {
    objects,
    objectsRef, // Этот objectsRef инициализируется в useConfiguratorState
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
  } = useConfiguratorState(setProjectInfoDataExt, activeModeInternal);

  const modifierKeys = useModifierKeys(mainContainerRef, svgRef);

  // 2. useObjectManagement зависит от setObjects и objectsRef из useConfiguratorState
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
    objectsRef // Передаем objectsRef напрямую. Его .current будет актуальным.
  );

  const { viewTransform, setViewTransform, screenToWorld, screenToWorldRect } =
    useViewTransform(svgRef);

  const [addingObjectType, setAddingObjectType] = useState(null);
  const [addingCorridorMode, setAddingCorridorMode] = useState(false);

  const mouseInteractions = useMouseInteractions({
    objectsRef, // Передаем objectsRef
    setObjects, // setObjects (с логикой истории)
    setObjectsState: setObjects, // Для mouseMove, где история не нужна при каждом шаге
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
    activeMode: activeModeInternal,
  });

  useKeyboardShortcuts({
    mainContainerRef,
    selectedObjectIds,
    setSelectedObjectIds,
    lockedObjectIds,
    setLockedObjectIds,
    objectsRef, // Передаем objectsRef
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
  
  // Если activeModeProp меняется извне, обновляем внутренний стейт
  useEffect(() => {
    if (activeModeProp !== undefined && activeModeProp !== activeModeInternal) {
        // Здесь можно добавить логику смены режима, если это необходимо
        // пока просто синхронизируем
        setActiveModeInternal(activeModeProp);
    }
  }, [activeModeProp, activeModeInternal]);


  const handleStartAddObject = useCallback(
    (type) => {
      setAddingObjectType(type);
      setSelectedObjectIds([]); 
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

  const handleAddCorridor = useCallback((corridorData) => {
    const blockSize = 1; 
    const corridorThickness = 0.2; 

    const isVertical = corridorData.orientation === 'vertical';
    let finalX, finalY, corridorWidth, corridorHeight;

    if (isVertical) {
      corridorWidth = corridorThickness;
      corridorHeight = blockSize;
      finalX = corridorData.x - corridorThickness / 2; 
      finalY = corridorData.y;
    } else { 
      corridorWidth = blockSize;
      corridorHeight = corridorThickness;
      finalX = corridorData.x;
      finalY = corridorData.y - corridorThickness / 2; 
    }

    addObject(
      'corridor',
      finalX,
      finalY,
      corridorWidth,
      corridorHeight,
      { 
        orientation: corridorData.orientation, 
        parentId: corridorData.parentId,
      }
    );
    setAddingCorridorMode(false);
  }, [addObject]);

  function getInitialObjectsForMode(mode) {
    if (mode === MODES.FRAMELESS) return getInitialObjects();
    return [];
  }

  const handleModeChange = useCallback((newMode) => {
    if (newMode === activeModeInternal) return;
    if (objects.length > 0) { // objects из useConfiguratorState
      const confirmed = window.confirm(
        "При смене режима все несохраненные изменения будут потеряны. Продолжить?"
      );
      if (!confirmed) return;
    }
    setObjects(getInitialObjectsForMode(newMode));
    setSelectedObjectIds([]);
    setLockedObjectIds([]);
    setHistory({ undo: [], redo: [] }); 
    setAddingObjectType(null);
    setActiveModeInternal(newMode);
  }, [activeModeInternal, objects, setObjects, setSelectedObjectIds, setLockedObjectIds, setHistory]);

  const configuratorInterface = {
    addObject,
    updateObject,
    deleteObject: deleteObjectById,
    getObjects: () => objectsRef.current, // Используем objectsRef.current
    getSelectedObjectIds: () => selectedObjectIds,
    setSelectedObjectIds,
    screenToWorld,
    viewTransform,
    svgRef,
  };

  const renderModeComponent = () => {
    switch (activeModeInternal) {
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
      tabIndex={0} 
    >
      <ConfiguratorToolbar
        activeModeName={activeModeInternal}
        addingObjectType={addingObjectType}
        onStartAddObject={handleStartAddObject}
        onModeChange={handleModeChange}
      />

      <div className="flex flex-grow overflow-hidden">
        <div className="flex-grow relative bg-gray-200">
          {false && activeModeInternal === 'modular' && primarySelectedObject && primarySelectedObject.type === 'module' && !addingCorridorMode && (
            <button
              className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded shadow z-30 hover:bg-indigo-700"
              onClick={() => setAddingCorridorMode(true)}
            >
              Добавить коридор
            </button>
          )}
          {addingCorridorMode && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-100 text-indigo-900 px-4 py-2 rounded shadow z-30">
              Кликните по линии внутри модуля для размещения коридора
              <button
                className="ml-4 text-indigo-700 underline"
                onClick={() => setAddingCorridorMode(false)}
              >
                Отмена
              </button>
            </div>
          )}
          <SvgCanvas
            svgRef={svgRef}
            viewTransform={viewTransform}
            setViewTransform={setViewTransform} 
            objects={objects} // objects из useConfiguratorState
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
            onAddObject={addObject} // из useObjectManagement
            addingCorridorMode={addingCorridorMode}
            onAddCorridor={handleAddCorridor}
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
          {renderModeSpecificUIExt && (
            <div className="absolute top-2 left-2 p-0 z-20">
              {renderModeSpecificUIExt(configuratorInterface)}
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
          activeMode={activeModeInternal}
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