import { useState, useEffect, useCallback } from "react";

const useModifierKeys = (mainContainerRef, svgRef) => {
  const [modifierKeys, setModifierKeys] = useState({
    ctrl: false,
    alt: false,
    meta: false,
    shift: false,
    spacebar: false,
  });

  const handleKeyDown = useCallback(
    (e) => {
      setModifierKeys((prev) => ({
        ...prev,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey,
        shift: e.shiftKey,
        spacebar: e.code === "Space" ? true : prev.spacebar,
      }));

      if (
        e.code === "Space" &&
        mainContainerRef.current &&
        svgRef.current &&
        (document.activeElement === mainContainerRef.current ||
          svgRef.current.contains(document.activeElement) ||
          document.activeElement === document.body) // Allow space pan if body focused
      ) {
        e.preventDefault(); // Prevent page scroll when space is pressed for panning
      }
    },
    [mainContainerRef, svgRef],
  );

  const handleKeyUp = useCallback((e) => {
    setModifierKeys((prev) => ({
      ...prev,
      ctrl: e.ctrlKey,
      alt: e.altKey,
      meta: e.metaKey,
      shift: e.shiftKey,
      spacebar: e.code === "Space" ? false : prev.spacebar,
    }));
  }, []);

  useEffect(() => {
    const mainEl = mainContainerRef.current;
    if (!mainEl) return;

    // Attach to main container for focused interaction
    mainEl.addEventListener("keydown", handleKeyDown);
    mainEl.addEventListener("keyup", handleKeyUp);

    // Attach to window for global modifier key detection, especially keyup
    // This helps catch keyup events if focus is lost from mainEl during a key press
    window.addEventListener("keydown", handleKeyDown); // To catch spacebar if focus isn't on mainEl
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      mainEl.removeEventListener("keydown", handleKeyDown);
      mainEl.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [mainContainerRef, handleKeyDown, handleKeyUp]);

  return modifierKeys;
};

export default useModifierKeys;
