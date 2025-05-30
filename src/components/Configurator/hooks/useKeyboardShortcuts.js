// ==== src\components\Configurator\hooks\useKeyboardShortcuts.js ====
import { useEffect } from "react";

const useKeyboardShortcuts = ({
  mainContainerRef,
  deleteSelectedObject,
  deselectAll,
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
          deselectAll();
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
    };

    mainEl.addEventListener("keydown", handleKeyDown);
    return () => {
      mainEl.removeEventListener("keydown", handleKeyDown);
    };
  }, [mainContainerRef, deleteSelectedObject, deselectAll]);
};

export default useKeyboardShortcuts;