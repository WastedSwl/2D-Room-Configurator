// src/components/Configurator/hooks/useConfiguratorState.js
import { useState, useCallback, useRef, useEffect } from "react";
import { MAX_HISTORY_SIZE } from "../configuratorConstants";
import { getInitialObjects } from "./useObjectManagement";

const useConfiguratorState = (setProjectInfoDataProp, activeMode) => {
  const [objects, setObjectsState] = useState(() => {
    if (activeMode === 'modular') return [];
    if (activeMode === 'frameless') return getInitialObjects();
    // Для других режимов по умолчанию пусто
    return [];
  });
  const [selectedObjectIds, setSelectedObjectIds] = useState([]);
  const [lockedObjectIds, setLockedObjectIds] = useState([]);
  const [history, setHistory] = useState({ undo: [], redo: [] });
  const [copiedObjectsData, setCopiedObjectsData] = useState(null); // For copy/paste
  const [overlappingObjectIds, setOverlappingObjectIds] = useState([]);

  const objectsRef = useRef(objects);
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  const setProjectInfoData = setProjectInfoDataProp || (() => {});

  const setObjects = useCallback(
    (newObjectsOrCallback, saveToHistory = false) => {
      const objectsBeforeUpdate = objectsRef.current;
      setObjectsState((prevState) => {
        const newState =
          typeof newObjectsOrCallback === "function"
            ? newObjectsOrCallback(prevState)
            : newObjectsOrCallback;
        if (saveToHistory) {
          if (
            JSON.stringify(newState) !== JSON.stringify(objectsBeforeUpdate)
          ) {
            setHistory((prevHistory) => ({
              undo: [objectsBeforeUpdate, ...prevHistory.undo].slice(
                0,
                MAX_HISTORY_SIZE,
              ),
              redo: [],
            }));
          }
        }
        // Update project info data
        let totalArea = 0;
        newState.forEach((obj) => {
          if (
            obj &&
            typeof obj.width === "number" &&
            typeof obj.height === "number" &&
            (obj.type === "panel" ||
              obj.type === "wall" ||
              obj.type.match(/sofa|table|cabinet|toilet|bed/))
          ) {
            totalArea += obj.width * obj.height;
          }
        });
        setProjectInfoData((prev) => ({
          ...prev,
          area: totalArea,
          elements: [{ name: "Objects", count: newState.length }],
        }));
        return newState;
      });
    },
    [setProjectInfoData],
  );

  const handleUndo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.undo.length > 0) {
        const stateToRestore = prevHistory.undo[0];
        const remainingUndo = prevHistory.undo.slice(1);
        const currentStateForRedo = objectsRef.current; // Use ref for current state
        setObjectsState(stateToRestore); // Directly set state, history handled by setObjects
        setSelectedObjectIds([]); // Clear selection on undo
        return {
          undo: remainingUndo,
          redo: [currentStateForRedo, ...prevHistory.redo].slice(
            0,
            MAX_HISTORY_SIZE,
          ),
        };
      }
      return prevHistory;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.redo.length > 0) {
        const [stateToRestore, ...remainingRedo] = prevHistory.redo;
        const currentStateForUndo = objectsRef.current; // Use ref for current state
        setObjectsState(stateToRestore); // Directly set state
        setSelectedObjectIds([]); // Clear selection on redo
        return {
          undo: [currentStateForUndo, ...prevHistory.undo].slice(
            0,
            MAX_HISTORY_SIZE,
          ),
          redo: remainingRedo,
        };
      }
      return prevHistory;
    });
  }, []);

  const primarySelectedObject =
    selectedObjectIds.length === 1
      ? objects.find((obj) => obj.id === selectedObjectIds[0])
      : null;

  return {
    objects,
    objectsRef,
    setObjects,
    selectedObjectIds,
    setSelectedObjectIds,
    lockedObjectIds,
    setLockedObjectIds,
    history,
    setHistory, // Expose for direct manipulation if needed (e.g. mouse up after drag)
    handleUndo,
    handleRedo,
    primarySelectedObject,
    copiedObjectsData,
    setCopiedObjectsData,
    overlappingObjectIds,
    setOverlappingObjectIds,
  };
};

export default useConfiguratorState;
