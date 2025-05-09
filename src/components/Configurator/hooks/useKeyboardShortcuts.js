// src/components/Configurator/hooks/useKeyboardShortcuts.js
import { useEffect, useCallback } from "react";
// import { PASTE_OFFSET_M } from "../configuratorConstants"; // Not needed for static
// import { createObject } from "./useObjectManagement"; // Not needed for paste

const useKeyboardShortcuts = ({
  mainContainerRef,
  selectedObjectIds,
  setSelectedObjectIds,
  lockedObjectIds,
  setLockedObjectIds,
  objectsRef, 
  setObjects, 
  handleUndo,
  handleRedo,
  // copiedObjectsData, // Disabled for static
  // setCopiedObjectsData, // Disabled for static
  addingObjectType, 
  setAddingObjectType,
  marqueeRectActive, // Should be always false for static
  resizingStateActive, // Should be always null for static
}) => {
  const deleteSelectedObjects = useCallback(() => {
    if (selectedObjectIds.length === 0) return;
    const deletableIds = selectedObjectIds.filter(
      (id) => !lockedObjectIds.includes(id),
    );
    if (deletableIds.length > 0) {
      setObjects(
        (prev) => prev.filter((obj) => !deletableIds.includes(obj.id) && (!obj.parentId || !deletableIds.includes(obj.parentId))),
        true,
      );
      setSelectedObjectIds((prev) =>
        prev.filter(
          (id) => !deletableIds.includes(id) || lockedObjectIds.includes(id),
        ),
      );
    }
  }, [selectedObjectIds, lockedObjectIds, setObjects, setSelectedObjectIds]);

  // const copySelectedObjects = useCallback(() => { /* ... */ }, []); // Disabled
  // const pasteCopiedObjects = useCallback(() => { /* ... */ }, []); // Disabled

  useEffect(() => {
    const mainEl = mainContainerRef.current;
    if (!mainEl) return;

    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl && ["INPUT", "TEXTAREA", "SELECT"].includes(activeEl.tagName);

      if (isInputFocused) {
        if (
          isCtrlOrCmd &&
          ["z", "y"].includes(e.key.toLowerCase()) // Allow undo/redo in inputs if native
        )
          return;
        if (e.key === "Escape") {
          setAddingObjectType(null); 
          if (activeEl instanceof HTMLElement) activeEl.blur();
          return;
        }
        // Allow delete/backspace in inputs
        if (e.key === "Delete" || e.key === "Backspace") return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (isCtrlOrCmd && e.key.toLowerCase() === "y") ||
        (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
      } 
      // Copy and Paste shortcuts disabled for static objects
      // else if (
      //   isCtrlOrCmd &&
      //   e.key.toLowerCase() === "c" &&
      //   !isInputFocused
      // ) { /* ... */ }
      // else if (
      //   isCtrlOrCmd &&
      //   e.key.toLowerCase() === "v" &&
      //   !isInputFocused
      // ) { /* ... */ } 
      else if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedObjectIds.length > 0 &&
        !isInputFocused
      ) {
        e.preventDefault();
        deleteSelectedObjects(); // Deletion can still be useful
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (addingObjectType) {
            setAddingObjectType(null);
        } else if (selectedObjectIds.length > 0) {
            setSelectedObjectIds([]);
        } else {
            mainContainerRef.current?.focus(); 
        }
      } else if (e.key.toLowerCase() === "l" && !isInputFocused) {
        e.preventDefault();
        if (selectedObjectIds.length > 0) {
          setLockedObjectIds((prevLockedIds) => {
            const newLockedIds = new Set(prevLockedIds);
            selectedObjectIds.forEach((id) => {
              newLockedIds.has(id)
                ? newLockedIds.delete(id)
                : newLockedIds.add(id);
            });
            return Array.from(newLockedIds);
          });
        }
      }
    };
    mainEl.addEventListener("keydown", handleKeyDown);
    return () => {
      mainEl.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    mainContainerRef,
    selectedObjectIds,
    setSelectedObjectIds,
    lockedObjectIds,
    setLockedObjectIds,
    handleUndo,
    handleRedo,
    // copySelectedObjects, // Disabled
    // pasteCopiedObjects, // Disabled
    deleteSelectedObjects,
    addingObjectType,
    setAddingObjectType,
    // marqueeRectActive, // Always false
    // resizingStateActive, // Always null
    objectsRef, // For deleteSelectedObjects
    setObjects, // For deleteSelectedObjects
  ]);
};

export default useKeyboardShortcuts;