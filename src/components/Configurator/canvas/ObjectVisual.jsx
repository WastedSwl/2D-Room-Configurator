import React from "react";
import SelectionExtras from "./SelectionExtras";
import DoorVisual from "./DoorVisual";
import WindowVisual from "./WindowVisual"; 
import OutletVisual from "./OutletVisual"; 
import DefaultRectVisual from "./DefaultRectVisual"; 

import {
  objectColors,
  OVERLAP_HIGHLIGHT_COLOR,
  LOCKED_OBJECT_STROKE_COLOR,
  defaultObjectSizes, 
  INITIAL_PPM,
} from "../configuratorConstants";

const ObjectVisual = ({
  obj,
  scale,
  isSelected,
  isLocked,
  isOverlapping,
  modifierKeys,
  onMouseDown,
  onResizeHandleMouseDown,
  draggingState,
  resizingState,
  onAddObject,
  addingCorridorMode,
  onAddCorridor,
  objects,
}) => {
  const [hoveredCorridor, setHoveredCorridor] = React.useState(null);

  const rotationCenterXScaled = (obj.width * scale) / 2;
  const rotationCenterYScaled = (obj.height * scale) / 2;

  let strokeColor = objectColors[obj.type]
    ? objectColors[obj.type] === "lightgray"
      ? "#555"
      : "black"
    : "black";
  if (obj.type === "wall") strokeColor = "#666";
  if (isLocked) strokeColor = LOCKED_OBJECT_STROKE_COLOR;
  else if (isSelected) strokeColor = "blue";

  const baseStrokeWidthUnscaled = 1;
  const selectedStrokeWidthUnscaled = 2;
  const baseStrokeWidth = Math.max(
    0.2,
    baseStrokeWidthUnscaled / (scale / INITIAL_PPM),
  );
  const selectedStrokeWidth = Math.max(
    0.5,
    selectedStrokeWidthUnscaled / (scale / INITIAL_PPM),
  );

  const commonProps = {
    stroke: strokeColor,
    strokeWidth:
      isSelected && !isLocked ? selectedStrokeWidth : baseStrokeWidth,
    style: {
      cursor:
        isLocked && !modifierKeys.shift && !isSelected
          ? "default"
          : draggingState?.initialPositions?.find((p) => p.id === obj.id) ||
              resizingState?.objectId === obj.id
            ? "grabbing"
            : "grab",
    },
    "data-object-id": obj.id,
  };

  const groupTransform = `translate(${obj.x * scale}, ${obj.y * scale}) rotate(${obj.rotation || 0}, ${rotationCenterXScaled}, ${rotationCenterYScaled})`;

  let specificVisual;
  if (obj.type === "door") {
    specificVisual = (
      <DoorVisual
        obj={obj}
        scale={scale}
        commonProps={commonProps}
        isSelected={isSelected}
        isLocked={isLocked}
      />
    );
  } else if (obj.type === "window") {
    specificVisual = (
      <WindowVisual obj={obj} scale={scale} commonProps={commonProps} />
    );
  } else if (obj.type === "outlet") {
    specificVisual = (
      <OutletVisual
        obj={obj}
        scale={scale}
        commonProps={commonProps}
        rotationCenterXScaled={rotationCenterXScaled}
        rotationCenterYScaled={rotationCenterYScaled}
      />
    );
  } else if (obj.type === "corridor") {
    const isVertical = obj.height > obj.width;
    const lineLength = isVertical ? obj.height * scale : obj.width * scale;
    const lineThickness = 2; 
    specificVisual = (
      <line
        x1={isVertical ? lineThickness / 2 : 0}
        y1={isVertical ? 0 : lineThickness / 2}
        x2={isVertical ? lineThickness / 2 : lineLength}
        y2={isVertical ? lineLength : lineThickness / 2}
        stroke="#222"
        strokeWidth={lineThickness}
      />
    );
  } else if (obj.type === "module" && obj.bathroom && obj.shower) {
    specificVisual = (
      <DefaultRectVisual
        obj={obj}
        width={obj.width * scale}
        height={obj.height * scale}
        {...commonProps}
      />
    );
  } else if (obj.type === "module" && obj.bathroom) {
    specificVisual = (
      <DefaultRectVisual
        obj={obj}
        width={obj.width * scale}
        height={obj.height * scale}
        {...commonProps}
      />
    );
  } else if (obj.type === "module" && !obj.corridor && !obj.bathroom && !obj.shower) {
    const patternId = `module-hatch-${obj.id}`;
    const wallThickness = 0.08; 
    const blockSize = 1; 
    
    const wallBlocks = [];
    
    for (let x_seg = 0; x_seg < obj.width; x_seg += blockSize) {
      wallBlocks.push({
        x: x_seg, 
        y: 0,     
        width: Math.min(blockSize, obj.width - x_seg),
        height: wallThickness,
        side: 'top',
        segmentIndex: Math.floor(x_seg / blockSize)
      });
      wallBlocks.push({
        x: x_seg,
        y: obj.height - wallThickness,
        width: Math.min(blockSize, obj.width - x_seg),
        height: wallThickness,
        side: 'bottom',
        segmentIndex: Math.floor(x_seg / blockSize)
      });
    }
    
    for (let y_seg = wallThickness; y_seg < obj.height - wallThickness; y_seg += blockSize) {
       wallBlocks.push({
        x: 0,
        y: y_seg,
        width: wallThickness,
        height: Math.min(blockSize, obj.height - y_seg - wallThickness),
        side: 'left',
        segmentIndex: Math.floor((y_seg - wallThickness) / blockSize)
      });
      wallBlocks.push({
        x: obj.width - wallThickness,
        y: y_seg,
        width: wallThickness,
        height: Math.min(blockSize, obj.height - y_seg - wallThickness),
        side: 'right',
        segmentIndex: Math.floor((y_seg - wallThickness) / blockSize)
      });
    }
    
    let corridorBlocks = [];
    const existingCorridors = (window.__corridorObjectsCache = window.__corridorObjectsCache || []);
    if (Array.isArray(existingCorridors)) {
      existingCorridors.length = 0;
    }
    
    for (let i = 1; i < obj.width; i++) {
      for (let j = 0; j < obj.height - 1; j++) {
         const blockX = i * blockSize * scale;
         const blockY = j * blockSize * scale;
         const blockH = blockSize * scale;
         const plusX = blockX;
         const plusY = blockY + blockH / 2;
         const isHovered = hoveredCorridor && 
           hoveredCorridor.type === 'vertical' && 
           hoveredCorridor.index === i && 
           hoveredCorridor.blockIndex === j;
        
         const corridorExists = Array.isArray(existingCorridors) && existingCorridors.some(c =>
           c.parentId === obj.id &&
           c.orientation === 'vertical' &&
           Math.abs(c.x - (obj.x + i * blockSize)) < 0.01 && 
           Math.abs(c.y - (obj.y + j * blockSize)) < 0.01
         );
         if (!corridorExists) {
           corridorBlocks.push(
             <g key={`corridor-vblock-${i}-${j}`}
               onMouseEnter={() => setHoveredCorridor({ 
                 type: 'vertical', index: i, blockIndex: j,
                 x: obj.x + i * blockSize, y: obj.y + j * blockSize, 
                 width: blockSize, height: blockSize, 
                 orientation: 'vertical', parentId: obj.id 
               })}
               onMouseLeave={() => setHoveredCorridor(null)}
             >
               <rect x={blockX - 8} y={blockY} width={16} height={blockH} fill="transparent" style={{ cursor: 'pointer' }}/>
               {isHovered && <line x1={blockX} y1={blockY} x2={blockX} y2={blockY + blockH} stroke="#4f46e5" strokeWidth={2} strokeDasharray="4,4" opacity={0.5} />}
               {isHovered && (
                 <g style={{ cursor: 'pointer' }} onClick={(e) => {
                     e.stopPropagation();
                     if (typeof onAddCorridor === 'function') { onAddCorridor({ ...hoveredCorridor }); } 
                     else { console.warn('onAddCorridor is not a function!'); }
                   }}>
                   <circle cx={plusX} cy={plusY} r={14} fill="#fff" stroke="#4f46e5" strokeWidth={2} opacity={0.9} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', transition: 'all 0.2s ease' }}/>
                   <text x={plusX} y={plusY + 5} textAnchor="middle" fontSize="20" fill="#4f46e5" fontWeight="bold" opacity={0.9} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))', transition: 'all 0.2s ease' }}>+</text>
                 </g>)}
             </g>
           );
         }
       }
     }
    
    for (let j = 1; j < obj.height; j++) {
      for (let i = 0; i < obj.width - 1; i++) {
         const blockX = i * blockSize * scale;
         const blockY = j * blockSize * scale;
         const blockW = blockSize * scale;
         const plusX = blockX + blockW / 2;
         const plusY = blockY;
         const isHovered = hoveredCorridor && 
           hoveredCorridor.type === 'horizontal' && 
           hoveredCorridor.index === j && 
           hoveredCorridor.blockIndex === i;
        
         const corridorExists = Array.isArray(existingCorridors) && existingCorridors.some(c =>
           c.parentId === obj.id &&
           c.orientation === 'horizontal' &&
           Math.abs(c.x - (obj.x + i * blockSize)) < 0.01 &&
           Math.abs(c.y - (obj.y + j * blockSize)) < 0.01
         );
         if (!corridorExists) {
           corridorBlocks.push(
             <g key={`corridor-hblock-${j}-${i}`}
               onMouseEnter={() => setHoveredCorridor({ 
                 type: 'horizontal', index: j, blockIndex: i,
                 x: obj.x + i * blockSize, y: obj.y + j * blockSize, 
                 width: blockSize, height: blockSize, 
                 orientation: 'horizontal', parentId: obj.id 
               })}
               onMouseLeave={() => setHoveredCorridor(null)}
             >
               <rect x={blockX} y={blockY - 8} width={blockW} height={16} fill="transparent" style={{ cursor: 'pointer' }}/>
               {isHovered && <line x1={blockX} y1={blockY} x2={blockX + blockW} y2={blockY} stroke="#4f46e5" strokeWidth={2} strokeDasharray="4,4" opacity={0.5} />}
               {isHovered && (
                 <g style={{ cursor: 'pointer' }} onClick={(e) => {
                     e.stopPropagation();
                     if (typeof onAddCorridor === 'function') { onAddCorridor({ ...hoveredCorridor }); } 
                     else { console.warn('onAddCorridor is not a function!'); }
                   }}>
                   <circle cx={plusX} cy={plusY} r={14} fill="#fff" stroke="#4f46e5" strokeWidth={2} opacity={0.9} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', transition: 'all 0.2s ease' }} />
                   <text x={plusX} y={plusY + 5} textAnchor="middle" fontSize="20" fill="#4f46e5" fontWeight="bold" opacity={0.9} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))', transition: 'all 0.2s ease' }}>+</text>
                 </g>)}
             </g>
           );
         }
       }
     }

    const occupiedSegments = new Set();
    if (objects && obj.type === 'module') {
      objects.forEach(el => {
        if (
          (el.type === 'door' || el.type === 'window' || el.type === 'outlet') &&
          el.parentId === obj.id &&
          el.side && typeof el.segmentIndex === 'number'
        ) {
          occupiedSegments.add(`${el.side}-${el.segmentIndex}`);
        }
      });
    }

    specificVisual = (
      <>
        <defs>
          <pattern id={patternId} width={8} height={8} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#bbb" strokeWidth="1" />
          </pattern>
        </defs>
        
        <rect
          x={wallThickness * scale}
          y={wallThickness * scale}
          width={(obj.width - 2 * wallThickness) * scale}
          height={(obj.height - 2 * wallThickness) * scale}
          fill={`url(#${patternId})`}
          stroke="none"
        />
        
        {wallBlocks.map((block, index) => (
          occupiedSegments.has(`${block.side}-${block.segmentIndex}`) ? null : (
            <g key={`wall-block-${index}`}>
              <rect 
                x={(block.x + 0.02) * scale}
                y={(block.y + 0.02) * scale}
                width={block.width * scale}
                height={block.height * scale}
                fill="#222"
                opacity="0.3"
              />
              <rect 
                x={block.x * scale}
                y={block.y * scale}
                width={block.width * scale}
                height={block.height * scale}
                fill="#444"
                stroke="#222"
                strokeWidth={0.5}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.fill = '#666';
                  e.currentTarget.style.filter = 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.fill = '#444';
                  e.currentTarget.style.filter = 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const panel = document.createElement('div');
                  panel.className = 'fixed bg-white rounded-lg shadow-lg p-4 z-50';
                  panel.style.left = `${e.clientX}px`;
                  panel.style.top = `${e.clientY}px`;
                  
                  const buttons = [
                    { type: 'door', label: 'Дверь', icon: '🚪' },
                    { type: 'window', label: 'Окно', icon: '🪟' },
                    { type: 'outlet', label: 'Розетка', icon: '🔌' }
                  ];
                  
                  buttons.forEach(btn => {
                    const button = document.createElement('button');
                    button.className = 'flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 w-full mb-2';
                    button.innerHTML = `${btn.icon} ${btn.label}`;
                    button.onclick = () => {
                      if (typeof onAddObject === 'function') {
                        const elementDefaultSize = defaultObjectSizes[btn.type];
                        if (!elementDefaultSize) {
                          console.error(`No default size for type ${btn.type}`);
                          if (panel.parentNode) panel.parentNode.removeChild(panel);
                          return;
                        }

                        const elW = elementDefaultSize.width; 
                        const elH = elementDefaultSize.height; 
                        
                        let newElementX, newElementY;
                        let elementRotation = 0;
                        
                        const moduleWorldX = obj.x;
                        const moduleWorldY = obj.y;
                        const blockLocalX = block.x;
                        const blockLocalY = block.y;
                        const blockW = block.width;
                        const blockH = block.height;
                        
                        // Calculate the center of the wall block in world coordinates
                        const blockCenterX = moduleWorldX + blockLocalX + blockW / 2;
                        const blockCenterY = moduleWorldY + blockLocalY + blockH / 2;

                        // Calculate the top-left corner (newElementX, newElementY) 
                        // needed for the element so its center aligns with the block center.
                        newElementX = blockCenterX - elW / 2;
                        newElementY = blockCenterY - elH / 2;

                        // Assign rotation based on the wall side
                        if (block.side === 'top') {
                          elementRotation = 0;
                        } else if (block.side === 'bottom') {
                          elementRotation = 180; 
                        } else if (block.side === 'left') {
                           elementRotation = -90;
                        } else if (block.side === 'right') {
                           elementRotation = 90;
                        } else {
                          console.error("Unknown block side:", block.side);
                          if (panel.parentNode) panel.parentNode.removeChild(panel);
                          return;
                        }

                        onAddObject(
                          btn.type,
                          newElementX, // Use calculated top-left X
                          newElementY, // Use calculated top-left Y
                          elW, // Use intrinsic element width
                          elH, // Use intrinsic element height
                          {
                            rotation: elementRotation,
                            segmentIndex: block.segmentIndex,
                            side: block.side,
                            parentId: obj.id, 
                            ...(btn.type === 'door' && { isOpen: false, openingAngle: 90, hingeSide: 'left', openingDirection: 'inward' }),
                          }
                        );
                      }
                      if (panel.parentNode) {
                        panel.parentNode.removeChild(panel);
                      }
                    };
                    panel.appendChild(button);
                  });
                  
                  const closeBtn = document.createElement('button');
                  closeBtn.className = 'absolute top-2 right-2 text-gray-500 hover:text-gray-700';
                  closeBtn.innerHTML = '✕';
                  closeBtn.onclick = () => {
                    if (panel.parentNode) {
                      panel.parentNode.removeChild(panel);
                    }
                  };
                  panel.appendChild(closeBtn);
                  
                  document.body.appendChild(panel);
                  
                  const closePanel = (e) => {
                    if (panel.parentNode && !panel.contains(e.target)) {
                      panel.parentNode.removeChild(panel);
                      document.removeEventListener('click', closePanel);
                    }
                  };
                  setTimeout(() => document.addEventListener('click', closePanel), 0);
                }}
              />
            </g>
          )
        ))}
        {corridorBlocks}
      </>
    );
  } else if (obj.type === "module") {
    specificVisual = (
      <DefaultRectVisual
        obj={obj}
        width={obj.width * scale}
        height={obj.height * scale}
        {...commonProps}
      />
    );
  } else {
    specificVisual = (
      <DefaultRectVisual obj={obj} scale={scale} commonProps={commonProps} />
    );
  }

  const canInteractWithHandles = !isLocked || modifierKeys.shift;

  return (
    <g transform={groupTransform} onMouseDown={(e) => onMouseDown(e, obj.id)}>
      {specificVisual}
      {isOverlapping && !isLocked && (
        <rect
          x="0"
          y="0"
          width={Math.max(1, obj.width * scale)}
          height={Math.max(1, obj.height * scale)}
          fill={OVERLAP_HIGHLIGHT_COLOR}
          stroke="red"
          strokeWidth={commonProps.strokeWidth * 0.5}
          pointerEvents="none"
        />
      )}
      {isSelected && !isLocked && (
        <SelectionExtras
          obj={obj}
          scale={scale}
          canInteractWithHandles={canInteractWithHandles}
          onResizeHandleMouseDown={onResizeHandleMouseDown}
        />
      )}
      {obj.label && isSelected && !isLocked && (
        <text
          x={(obj.width * scale) / 2}
          y={obj.height * scale + 12 / (scale / INITIAL_PPM)}
          fontSize={`${10 / (scale / INITIAL_PPM)}px`}
          textAnchor="middle"
          fill="#333"
          style={{ pointerEvents: "none" }}
        >
          {obj.label}
        </text>
      )}
    </g>
  );
};
export default React.memo(ObjectVisual);