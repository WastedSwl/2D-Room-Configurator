import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { MODES, DEFAULT_MODE } from "./appConstants";
import { OBJECT_TYPES_TO_ADD, WALL_THICKNESS_M } from "./configuratorConstants"; 

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

import ModularMode, { MODULE_PLACEHOLDER_ID } from "./modes/ModularMode"; 
import FramelessMode from "./modes/FramelessMode";
import FrameMode from "./modes/FrameMode";

import { getInitialObjects } from "./hooks/useObjectManagement";
import { toast } from "react-toastify";


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

  const [showModuleTemplatesPanel, setShowModuleTemplatesPanel] = useState(false);

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
  } = useConfiguratorState(setProjectInfoDataExt, activeModeInternal);

  const overlappingObjectIds = []; 

  const modifierKeys = useModifierKeys(mainContainerRef, svgRef);

  const {
    addObject,
    updateObject,
    deleteObjectById,
    updateSelectedObjectProperty,
    addAndSelectObject,
    defaultObjectSizes,
    rotateModule180,
    mirrorModuleX,
    mirrorModuleY,
  } = useObjectManagement(
    setObjects,
    selectedObjectIds,
    lockedObjectIds,
    modifierKeys,
    objectsRef,
    activeModeInternal
  );

  const { viewTransform, setViewTransform, screenToWorld, screenToWorldRect } =
    useViewTransform(svgRef);

  const [addingObjectType, setAddingObjectType] = useState(null);
  const [addingCorridorMode, setAddingCorridorMode] = useState(false); 

  const mouseInteractions = useMouseInteractions({
    objectsRef,
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
    activeMode: activeModeInternal,
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
    addingObjectType,
    setAddingObjectType,
    marqueeRectActive: false, 
    resizingStateActive: false, 
  });

  useEffect(() => {
    mainContainerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (activeModeProp !== undefined && activeModeProp !== activeModeInternal) {
        setActiveModeInternal(activeModeProp);
    }
  }, [activeModeProp, activeModeInternal]);

  useEffect(() => {
    // console.log('Configurator useEffect for panel:');
    // console.log('  activeModeInternal:', activeModeInternal);
    // console.log('  selectedObjectIds:', selectedObjectIds);
    // console.log('  objects:', objects.map(o => ({id: o.id, type: o.type}))); // Краткая инфо об объектах
    // console.log('  showModuleTemplatesPanel (current):', showModuleTemplatesPanel);

    if (activeModeInternal === MODES.MODULAR) {
      const placeholderIsActuallySelected = selectedObjectIds.length === 1 && selectedObjectIds[0] === MODULE_PLACEHOLDER_ID;
      const noRealModulesExist = !objects.some(obj => obj.type === 'module');
      
      // console.log('  placeholderIsActuallySelected:', placeholderIsActuallySelected);
      // console.log('  noRealModulesExist:', noRealModulesExist);

      if (placeholderIsActuallySelected && noRealModulesExist) {
        if (!showModuleTemplatesPanel) {
          // console.log('  >>> Setting showModuleTemplatesPanel to true');
          setShowModuleTemplatesPanel(true);
        }
      }
    } else {
      if (showModuleTemplatesPanel) {
        // console.log('  >>> Setting showModuleTemplatesPanel to false (not modular mode)');
        setShowModuleTemplatesPanel(false);
      }
    }
  }, [selectedObjectIds, activeModeInternal, objects, showModuleTemplatesPanel, setShowModuleTemplatesPanel]);


  const handleStartAddObject = useCallback(
    (type) => {
      setAddingObjectType(type);
      setSelectedObjectIds([]);
      if (showModuleTemplatesPanel) { 
        setShowModuleTemplatesPanel(false);
      }
    },
    [setSelectedObjectIds, showModuleTemplatesPanel, setShowModuleTemplatesPanel], 
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
    const visualCorridorLineThickness = 0.01;

    const isVertical = corridorData.orientation === 'vertical';
    let finalX, finalY, corridorWidth, corridorHeight;

    if (isVertical) {
      corridorWidth = visualCorridorLineThickness;
      corridorHeight = blockSize;
      finalX = corridorData.x - visualCorridorLineThickness / 2;
      finalY = corridorData.y;
    } else {
      corridorWidth = blockSize;
      corridorHeight = visualCorridorLineThickness;
      finalX = corridorData.x;
      finalY = corridorData.y - visualCorridorLineThickness / 2;
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
        logicalThickness: WALL_THICKNESS_M 
      }
    );
    setAddingCorridorMode(false);
  }, [addObject]);


  function getInitialObjectsForMode(mode) {
    if (mode === MODES.FRAMELESS) return getInitialObjects();
    if (mode === MODES.MODULAR) return []; 
    return [];
  }

  const handleModeChange = useCallback((newMode) => {
    if (newMode === activeModeInternal) return;
    if (objects.length > 0) {
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
    if (showModuleTemplatesPanel) { 
      setShowModuleTemplatesPanel(false);
    }
  }, [activeModeInternal, objects, setObjects, setSelectedObjectIds, setLockedObjectIds, setHistory, showModuleTemplatesPanel, setShowModuleTemplatesPanel]); 

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
    activeMode: activeModeInternal,
    objects, 
    showModuleTemplatesPanel,
    setShowModuleTemplatesPanel,
  };

  const renderModeComponent = () => {
    switch (activeModeInternal) {
      case MODES.MODULAR:
        return <ModularMode {...configuratorInterface} selectedObjectIds={selectedObjectIds} />; 
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
      tabIndex={-1} 
    >
      <ConfiguratorToolbar
        activeModeName={activeModeInternal}
        addingObjectType={addingObjectType}
        onStartAddObject={handleStartAddObject}
        onModeChange={handleModeChange}
      />

      <div className="flex flex-grow overflow-hidden">
        <div className="flex-grow flex items-center justify-center p-1 sm:p-2 md:p-4 bg-dark-bg relative"> 
          <div className="relative bg-card-bg shadow-2xl w-full h-full max-w-[1920px] max-h-[1080px] aspect-[16/9] overflow-hidden rounded-md border border-gray-700"> 
            <SvgCanvas
              svgRef={svgRef}
              viewTransform={viewTransform}
              setViewTransform={setViewTransform}
              objects={objects}
              selectedObjectIds={selectedObjectIds}
              setSelectedObjectIds={setSelectedObjectIds}
              updateObject={updateObject}
              lockedObjectIds={lockedObjectIds}
              overlappingObjectIds={overlappingObjectIds} 
              activeSnapLines={mouseInteractions.activeSnapLines} 
              marqueeRect={mouseInteractions.marqueeRect} 
              modifierKeys={modifierKeys}
              addingObjectType={addingObjectType}
              isPanningWithSpace={mouseInteractions.isPanningWithSpace}
              draggingState={mouseInteractions.draggingState} 
              handleMouseMove={mouseInteractions.handleMouseMove}
              handleMouseUp={mouseInteractions.handleMouseUp}
              handleMouseLeave={mouseInteractions.handleMouseLeave}
              handleMouseDownOnCanvas={mouseInteractions.handleMouseDownOnCanvas}
              handleMouseDownOnObject={mouseInteractions.handleMouseDownOnObject}
              handleMouseDownOnResizeHandle={
                mouseInteractions.handleMouseDownOnResizeHandle 
              }
              onAddObject={addObject}
              addingCorridorMode={addingCorridorMode}
              onAddCorridor={handleAddCorridor}
              activeMode={activeModeInternal}
            />
          </div>
          {addingObjectType && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-3 py-1.5 rounded shadow-lg text-xs z-10 pointer-events-none">
              Клик для добавления "
              {
                OBJECT_TYPES_TO_ADD.find((o) => o.type === addingObjectType)
                  ?.label
              }
              ". <span className='font-semibold'>ESC</span> для отмены.
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
            rotateModule180={rotateModule180} 
            mirrorModuleX={mirrorModuleX}     
            mirrorModuleY={mirrorModuleY}     
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