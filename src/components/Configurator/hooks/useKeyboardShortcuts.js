// src/components/Configurator/hooks/useKeyboardShortcuts.js
import { useEffect } from "react"; // Removed useCallback as it's not used

const useKeyboardShortcuts = ({
  mainContainerRef,
  deleteSelectedObject, // New prop
  deselectAll, // New prop
}) => {
  useEffect(() => {
    const mainEl = mainContainerRef.current;
    if (!mainEl) return;

    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl && ["INPUT", "TEXTAREA", "SELECT"].includes(activeEl.tagName);

      if (e.key === "Escape") {
        e.preventDefault();
        if (isInputFocused && activeEl instanceof HTMLElement) {
          activeEl.blur();
        } else if (deselectAll) {
          deselectAll(); // Deselect current object if escape is pressed and not in input
        } else {
          mainContainerRef.current?.focus();
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (!isInputFocused && deleteSelectedObject) {
          e.preventDefault();
          deleteSelectedObject();
        }
      }
      // All other shortcuts (delete, lock, copy, paste, undo, redo for objects) are removed.
    };

    mainEl.addEventListener("keydown", handleKeyDown);
    return () => {
      mainEl.removeEventListener("keydown", handleKeyDown);
    };
  }, [mainContainerRef, deleteSelectedObject, deselectAll]); // Added dependencies
};

export default useKeyboardShortcuts;
