// src/components/Configurator/hooks/useViewTransform.js
import { useState, useCallback, useEffect } from "react";
import { INITIAL_PPM } from "../configuratorConstants";

const useViewTransform = (svgRef) => {
  const [viewTransform, setViewTransform] = useState({
    x: 80,
    y: 60,
    scale: INITIAL_PPM * 0.6,
  });
  const [initialized, setInitialized] = useState(false);

  // Центрируем мир по центру SVG при первом рендере
  useEffect(() => {
    if (initialized) return;
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewTransform((prev) => ({
          ...prev,
          x: rect.width / 2,
          y: rect.height / 2,
        }));
        setInitialized(true);
      }
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

  const screenToWorldRect = useCallback(
    (rect) => {
      const tl = screenToWorld(rect.startScreenX, rect.startScreenY);
      const br = screenToWorld(rect.currentScreenX, rect.currentScreenY);
      return {
        minX: Math.min(tl.x, br.x),
        minY: Math.min(tl.y, br.y),
        maxX: Math.max(tl.x, br.x),
        maxY: Math.max(tl.y, br.y),
      };
    },
    [screenToWorld],
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
        const newScale = prevTransform.scale * newScaleFactor;
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
    screenToWorldRect,
  };
};

export default useViewTransform;
