// src/components/Configurator/hooks/useKeyboardShortcuts.js
import { useEffect, useCallback } from "react";
import { PASTE_OFFSET_M } from "../configuratorConstants";
// createObject, getNextId needs to be accessible, e.g. from useObjectManagement context or passed in
// For simplicity here, assuming they are imported if static, or passed if instance-based.
import { createObject } from "./useObjectManagement";

const useKeyboardShortcuts = ({
  mainContainerRef,
  selectedObjectIds,
  setSelectedObjectIds,
  lockedObjectIds,
  setLockedObjectIds,
  objectsRef, // direct ref to current objects array
  setObjects, // state setter with history
  handleUndo,
  handleRedo,
  copiedObjectsData,
  setCopiedObjectsData,
  addingObjectType, // To cancel adding mode
  setAddingObjectType,
  marqueeRectActive, // To cancel marquee
  resizingStateActive, // To cancel resize
}) => {
  const deleteSelectedObjects = useCallback(() => {
    if (selectedObjectIds.length === 0) return;
    const deletableIds = selectedObjectIds.filter(
      (id) => !lockedObjectIds.includes(id),
    );
    if (deletableIds.length > 0) {
      setObjects(
        (prev) => prev.filter((obj) => !deletableIds.includes(obj.id)),
        true,
      );
      setSelectedObjectIds((prev) =>
        prev.filter(
          (id) => !deletableIds.includes(id) || lockedObjectIds.includes(id),
        ),
      );
    }
  }, [selectedObjectIds, lockedObjectIds, setObjects, setSelectedObjectIds]);

  const copySelectedObjects = useCallback(() => {
    if (selectedObjectIds.length > 0) {
      const selected = objectsRef.current.filter(
        (obj) =>
          selectedObjectIds.includes(obj.id) &&
          !lockedObjectIds.includes(obj.id),
      );
      if (selected.length > 0) {
        setCopiedObjectsData({
          objects: JSON.parse(JSON.stringify(selected)), // Deep copy
          pasteCount: 0,
        });
      }
    }
  }, [selectedObjectIds, objectsRef, lockedObjectIds, setCopiedObjectsData]);

  const pasteCopiedObjects = useCallback(() => {
    if (copiedObjectsData && copiedObjectsData.objects.length > 0) {
      const pasteCount = copiedObjectsData.pasteCount + 1;
      const newIds = [];
      const newObjects = copiedObjectsData.objects.map((objToPaste) => {
        const newObj = createObject(
          // Uses imported createObject which handles new IDs
          objToPaste.type,
          objToPaste.x + PASTE_OFFSET_M * pasteCount,
          objToPaste.y + PASTE_OFFSET_M * pasteCount,
          objToPaste.width,
          objToPaste.height,
          {
            ...objToPaste,
            id: undefined,
            label: objToPaste.label ? `${objToPaste.label} (copy)` : "",
          }, // Exclude ID to get new one
        );
        newIds.push(newObj.id);
        return newObj;
      });
      setObjects((prev) => [...prev, ...newObjects], true);
      setSelectedObjectIds(newIds);
      setCopiedObjectsData((prev) => ({ ...prev, pasteCount }));
    }
  }, [
    copiedObjectsData,
    setCopiedObjectsData,
    setObjects,
    setSelectedObjectIds,
  ]);

  useEffect(() => {
    const mainEl = mainContainerRef.current;
    if (!mainEl) return;

    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl && ["INPUT", "TEXTAREA", "SELECT"].includes(activeEl.tagName);

      if (isInputFocused) {
        // Allow native copy/paste/undo/redo in inputs
        if (
          isCtrlOrCmd &&
          ["c", "v", "x", "z", "y"].includes(e.key.toLowerCase())
        )
          return;
        if (e.key === "Escape") {
          setAddingObjectType(null); // Also cancel add mode if input focused
          if (activeEl instanceof HTMLElement) activeEl.blur();
          return;
        }
        // Allow delete/backspace in inputs
        if (e.key === "Delete" || e.key === "Backspace") return;
      }

      // Global shortcuts (if not in input or specific keys)
      if (isCtrlOrCmd && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (isCtrlOrCmd && e.key.toLowerCase() === "y") ||
        (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
      } else if (
        isCtrlOrCmd &&
        e.key.toLowerCase() === "c" &&
        !isInputFocused
      ) {
        e.preventDefault();
        copySelectedObjects();
      } else if (
        isCtrlOrCmd &&
        e.key.toLowerCase() === "v" &&
        !isInputFocused
      ) {
        e.preventDefault();
        pasteCopiedObjects();
      } else if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedObjectIds.length > 0 &&
        !isInputFocused
      ) {
        e.preventDefault();
        deleteSelectedObjects();
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (addingObjectType) setAddingObjectType(null);
        else if (marqueeRectActive || resizingStateActive) {
          /* Handled by mouse up/leave */
        } else if (selectedObjectIds.length > 0) setSelectedObjectIds([]);
        else mainContainerRef.current?.focus(); // Refocus main if nothing else to cancel
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
    copySelectedObjects,
    pasteCopiedObjects,
    deleteSelectedObjects,
    addingObjectType,
    setAddingObjectType,
    marqueeRectActive,
    resizingStateActive,
  ]);
};

export default useKeyboardShortcuts;
