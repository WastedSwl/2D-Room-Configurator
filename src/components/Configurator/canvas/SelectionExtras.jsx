import React from "react";
import {
  RESIZE_HANDLE_SIZE_PX,
  RESIZE_HANDLE_COLOR,
  INITIAL_PPM,
  DIMENSION_TEXT_COLOR,
  DIMENSION_TEXT_BG_COLOR,
} from "../configuratorConstants";
import { getResizeCursorForHandle } from "../configuratorUtils";

const SelectionExtras = ({
  obj,
  scale,
  canInteractWithHandles,
  onResizeHandleMouseDown,
}) => {
  const handles = [];
  const dimensionTexts = [];

  const uiScaleFactor = INITIAL_PPM / scale;

  const OBBHandlesDef = [
    { type: "tl", x: 0, y: 0 },
    { type: "t", x: obj.width / 2, y: 0 },
    { type: "tr", x: obj.width, y: 0 },
    { type: "l", x: 0, y: obj.height / 2 },
    { type: "r", x: obj.width, y: obj.height / 2 },
    { type: "bl", x: 0, y: obj.height },
    { type: "b", x: obj.width / 2, y: obj.height },
    { type: "br", x: obj.width, y: obj.height },
  ];

  const handleSizeBase = RESIZE_HANDLE_SIZE_PX; 
  const handleSizeSVG = Math.max(
    4 * uiScaleFactor,
    handleSizeBase * uiScaleFactor,
  );
  const handleStrokeWidthSVG = Math.max(
    0.2 * uiScaleFactor,
    0.5 * uiScaleFactor,
  );


  OBBHandlesDef.forEach((h) => {
    handles.push(
      <rect
        key={`handle-${h.type}`}
        data-resize-handle="true"
        x={h.x * scale - handleSizeSVG / 2}
        y={h.y * scale - handleSizeSVG / 2}
        width={handleSizeSVG}
        height={handleSizeSVG}
        fill={RESIZE_HANDLE_COLOR}
        stroke="white"
        strokeWidth={handleStrokeWidthSVG}
        style={{
          cursor: canInteractWithHandles
            ? getResizeCursorForHandle(h.type, obj.rotation || 0)
            : "default",
        }}
        onMouseDown={(e) => {
          if (canInteractWithHandles)
            onResizeHandleMouseDown(e, obj.id, h.type);
          else e.stopPropagation();
        }}
      />,
    );
  });
  

  const midPointXObjScaled = (obj.width / 2) * scale; 
  const midPointYObjScaled = (obj.height / 2) * scale;

  const textOffsetBase = 15; 
  const textOffsetSVG = textOffsetBase * uiScaleFactor; 

  const fontSizeBase = 10; 
  const fontSizeSVG = Math.max(6 * uiScaleFactor, fontSizeBase * uiScaleFactor); 

  const strokeBgWidthBase = 3; 
  const strokeBgWidthSVG = Math.max(
    1 * uiScaleFactor,
    strokeBgWidthBase * uiScaleFactor,
  );

  dimensionTexts.push(
    <text
      key="dim-width"
      x={midPointXObjScaled} 
      y={0 - textOffsetSVG} 
      fontSize={`${fontSizeSVG}px`}
      textAnchor="middle"
      fill={DIMENSION_TEXT_COLOR}
      style={{
        paintOrder: "stroke",
        stroke: DIMENSION_TEXT_BG_COLOR,
        strokeWidth: `${strokeBgWidthSVG}px`,
        strokeLinejoin: "round",
        pointerEvents: "none",
      }}
    >
      {obj.width.toFixed(2)} м
    </text>,
  );
  dimensionTexts.push(
    <text
      key="dim-height"
      x={0 - textOffsetSVG} 
      y={midPointYObjScaled} 
      fontSize={`${fontSizeSVG}px`}
      textAnchor="middle"
      dominantBaseline="middle"
      transform={`rotate(-90, ${0 - textOffsetSVG}, ${midPointYObjScaled})`} 
      fill={DIMENSION_TEXT_COLOR}
      style={{
        paintOrder: "stroke",
        stroke: DIMENSION_TEXT_BG_COLOR,
        strokeWidth: `${strokeBgWidthSVG}px`,
        strokeLinejoin: "round",
        pointerEvents: "none",
      }}
    >
      {obj.height.toFixed(2)} м
    </text>,
  );

  return (
    <>
      {handles}
      {dimensionTexts}
    </>
  );
};

export default React.memo(SelectionExtras);