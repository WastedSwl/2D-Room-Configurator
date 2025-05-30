import { useState, useCallback, useEffect } from "react";
import {
  INITIAL_PPM,
  MIN_ZOOM_SCALE,
  MAX_ZOOM_SCALE,
} from "../configuratorConstants";

const useViewTransform = (svgRef) => {
  const [viewTransform, setViewTransform] = useState({
    x: 0, 
    y: 0, 
    scale: INITIAL_PPM * 0.6,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0) {
      setViewTransform((prev) => ({
        ...prev, 
        x: rect.width / 2,
        y: rect.height / 2,
      }));
      setInitialized(true);
    }
  }, [svgRef, initialized]);

  const screenToWorld = useCallback(
    (screenX, screenY) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const svgRect = svgRef.current.getBoundingClientRect();
      return {
        x: (screenX - svgRect.left - viewTransform.x) / viewTransform.scale,
        y: (screenY - svgRect.top - viewTransform.y) / viewTransform.scale,
      };
    },
    [viewTransform, svgRef],
  );

  const worldToScreen = useCallback(
    (worldX, worldY) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const svgRect = svgRef.current.getBoundingClientRect();
        return {
            x: worldX * viewTransform.scale + viewTransform.x + svgRect.left,
            y: worldY * viewTransform.scale + viewTransform.y + svgRect.top,
        };
    },
    [viewTransform, svgRef],
  );


  useEffect(() => {
    const currentSvgElement = svgRef.current;
    if (!currentSvgElement) return;

    const wheelHandler = (e) => {
      e.preventDefault();
      const scaleAmount = 1.1;
      const newScaleFactor = e.deltaY > 0 ? 1 / scaleAmount : scaleAmount;

      const svgRect = currentSvgElement.getBoundingClientRect();
      const mouseX = e.clientX - svgRect.left; 
      const mouseY = e.clientY - svgRect.top;

      setViewTransform((prevTransform) => {
        const worldBeforeZoomX =
          (mouseX - prevTransform.x) / prevTransform.scale;
        const worldBeforeZoomY =
          (mouseY - prevTransform.y) / prevTransform.scale;

        let newScale = prevTransform.scale * newScaleFactor;
        newScale = Math.max(MIN_ZOOM_SCALE, Math.min(newScale, MAX_ZOOM_SCALE));

        const newViewX = mouseX - worldBeforeZoomX * newScale;
        const newViewY = mouseY - worldBeforeZoomY * newScale;

        return { x: newViewX, y: newViewY, scale: newScale };
      });
    };

    currentSvgElement.addEventListener("wheel", wheelHandler, {
      passive: false, 
    });
    return () => {
      currentSvgElement.removeEventListener("wheel", wheelHandler);
    };
  }, [svgRef]); 

  return {
    viewTransform,
    setViewTransform,
    screenToWorld,
    worldToScreen, // Exported
  };
};

export default useViewTransform;