import React from "react";
import { toast } from 'react-toastify';
import DoorVisual from "./DoorVisual";
import WindowVisual from "./WindowVisual";
import OutletVisual from "./OutletVisual";
import DefaultRectVisual from "./DefaultRectVisual";

import {
  objectColors,
  LOCKED_OBJECT_STROKE_COLOR,
  defaultObjectSizes,
  INITIAL_PPM,
  ARCH_BLACK,
  ARCH_DARK_GRAY,
  ARCH_LIGHT_GRAY,
  ARCH_WHITE,
  ARCH_STROKE_MEDIUM,
  ARCH_STROKE_THIN,
  ARCH_STROKE_VERY_THIN,
  ARCH_SELECT_BLUE,
  ARCH_CORRIDOR_STROKE,
  WALL_THICKNESS_M,
  PLUS_BUTTON_COLOR,
  GRID_BOLD_LINE_COLOR, 
} from "../configuratorConstants";

import { DEFAULT_PANEL_WIDTH_M } from "../appConstants";
import { MODULE_PLACEHOLDER_ID } from "../modes/ModularMode"; 

const ModulePlaceholderVisual = ({ obj, scale, commonProps }) => {
  const widthScaled = obj.width * scale;
  const heightScaled = obj.height * scale;
  
  const textStyle = {
    fontSize: `${Math.max(10, 18 * (scale / INITIAL_PPM))}px`, 
    textAnchor: "middle",
    dominantBaseline: "central",
    fill: ARCH_LIGHT_GRAY, 
    pointerEvents: "none",
    fontWeight: 500,
  };

  return (
    <g>
      <rect
        x={0}
        y={0}
        width={widthScaled}
        height={heightScaled}
        fill="rgba(75, 85, 99, 0.1)" 
        stroke={GRID_BOLD_LINE_COLOR} 
        strokeWidth={1.5 / (scale / INITIAL_PPM)} 
        strokeDasharray={`${4 / (scale / INITIAL_PPM)},${2 / (scale / INITIAL_PPM)}`} 
        rx={4 / (scale / INITIAL_PPM)} 
        style={{ cursor: 'pointer' }} 
        data-object-id={commonProps['data-object-id']}
      />
      <text x={widthScaled / 2} y={heightScaled / 2} style={textStyle}>
        {obj.label || "Добавить модуль"}
      </text>
    </g>
  );
};


const ObjectVisual = ({
  obj,
  scale,
  isSelected, 
  isLocked,
  lockedObjectIds,
  modifierKeys,
  onMouseDown, 
  onAddObject,
  onAddCorridor,
  objects,
  viewTransform,
  svgRef,
  setSelectedObjectIds, 
  updateObject, 
}) => {
  const [hoveredCorridor, setHoveredCorridor] = React.useState(null);

  const rotationCenterXScaled = (obj.width * scale) / 2;
  const rotationCenterYScaled = (obj.height * scale) / 2;

  let baseStroke = ARCH_BLACK;
  let baseStrokeWidthUnscaled = ARCH_STROKE_THIN;
  let corridorLineStrokeWidth = 1.5;

  if (obj.type === 'wall' || obj.type === 'module') {
      baseStrokeWidthUnscaled = ARCH_STROKE_MEDIUM;
  } else if (obj.type === 'door' || obj.type === 'window') {
       baseStrokeWidthUnscaled = ARCH_STROKE_THIN;
  } else if (obj.type === 'light_led' || obj.type === 'radiator' || obj.type === 'kitchen_unit') {
        baseStrokeWidthUnscaled = ARCH_STROKE_VERY_THIN;
  } else if (obj.type === 'outlet') {
      baseStrokeWidthUnscaled = ARCH_STROKE_THIN;
      baseStroke = ARCH_BLACK;
  } else if (obj.type === 'corridor') {
      baseStroke = ARCH_CORRIDOR_STROKE;
  } else if (obj.type === 'module_placeholder') {
      // No stroke defined here, handled by ModulePlaceholderVisual
  } else {
       baseStrokeWidthUnscaled = ARCH_STROKE_MEDIUM;
       baseStroke = objectColors[obj.type] || ARCH_DARK_GRAY;
  }

  const finalStroke = isLocked ? LOCKED_OBJECT_STROKE_COLOR : (isSelected ? ARCH_SELECT_BLUE : baseStroke);

  let finalObjectStrokeWidth;
  if (obj.type === 'corridor') {
    finalObjectStrokeWidth = corridorLineStrokeWidth;
  } else if (obj.type === 'module_placeholder') {
    finalObjectStrokeWidth = 0; 
  } else {
    finalObjectStrokeWidth = isSelected
     ? Math.max(0.5, ARCH_STROKE_MEDIUM / (scale / INITIAL_PPM))
     : Math.max(0.15, baseStrokeWidthUnscaled / (scale / INITIAL_PPM));
  }

  const commonProps = {
    stroke: finalStroke,
    strokeWidth: finalObjectStrokeWidth,
    style: {
      cursor: (obj.clickable || obj.type === 'module_placeholder') ? "pointer" : "default",
    },
    "data-object-id": obj.id,
  };

  const groupTransform = `translate(${obj.x * scale}, ${obj.y * scale}) rotate(${obj.rotation || 0}, ${rotationCenterXScaled}, ${rotationCenterYScaled})`;

  const localScreenToWorld = (screenX, screenY) => {
      if (!svgRef?.current || !viewTransform) {
          return { x: 0, y: 0 };
      }
      const svgRect = svgRef.current.getBoundingClientRect();
      return {
        x: (screenX - svgRect.left - viewTransform.x) / viewTransform.scale,
        y: (screenY - svgRect.top - viewTransform.y) / viewTransform.scale,
      };
  };

  const handleWallSegmentClick = (e, block, parentObj) => {
        e.stopPropagation();
        if (parentObj.id && lockedObjectIds && lockedObjectIds.includes(parentObj.id) && !modifierKeys.shift) {
            toast.warn(`Родительский объект ${parentObj.label || parentObj.id} заблокирован.`);
            return;
        }
        
        const existingElementInSegment = objects.find(o => o.parentId === parentObj.id && o.side === block.side && o.segmentIndex === block.segmentIndex);

        let segmentOccupiedByDoorWindowOutlet = false;
        if (parentObj.type === 'module') {
            segmentOccupiedByDoorWindowOutlet = objects.some(o => o.parentId === parentObj.id && o.side === block.side && o.segmentIndex === block.segmentIndex && (o.type === 'door' || o.type === 'window' || o.type === 'outlet'));
        } else if (parentObj.type === 'corridor') {
            segmentOccupiedByDoorWindowOutlet = objects.some(o => o.parentId === parentObj.id && o.type === 'door' );
        }
        
        const intendedTypeFromBlock = block.intendedType || null;
        if (segmentOccupiedByDoorWindowOutlet && (intendedTypeFromBlock === 'radiator' || intendedTypeFromBlock === 'kitchen_unit')) {
            toast.info(`Этот участок уже занят дверью/окном/розеткой. Аксессуар добавить нельзя.`);
            return;
        }
        if (existingElementInSegment && (existingElementInSegment.type === 'radiator' || existingElementInSegment.type === 'kitchen_unit') && (intendedTypeFromBlock === 'door' || intendedTypeFromBlock === 'window' || intendedTypeFromBlock === 'outlet')) {
            toast.info(`Этот участок уже занят аксессуаром. Дверь/окно/розетку добавить нельзя.`);
            return;
        }
         if (existingElementInSegment && intendedTypeFromBlock && existingElementInSegment.type !== intendedTypeFromBlock) {
             toast.info(`Этот участок ${parentObj.type === 'module' ? 'стены' : 'коридора'} уже занят другим типом объекта.`);
             return;
        }

        const panel = document.createElement('div');
        panel.className = 'fixed bg-card-bg text-gray-200 rounded-lg shadow-2xl p-3 z-50 border border-gray-700';
        panel.style.left = `${e.clientX}px`; panel.style.top = `${e.clientY}px`;

        let availableButtons = [];
        if (parentObj.type === 'corridor') {
            availableButtons = [{ type: 'door', label: 'Дверь', icon: '🚪', category: 'opening' }];
        } else {
            availableButtons = [
                { type: 'door', label: 'Дверь', icon: '🚪', category: 'opening' },
                { type: 'window', label: 'Окно', icon: '🪟', category: 'opening' },
                { type: 'outlet', label: 'Розетка', icon: '🔌', category: 'opening' },
                { type: 'radiator', label: 'Радиатор', icon: '♨️', category: 'accessory' },
                { type: 'kitchen_unit', label: 'Кух. блок', icon: '🍳', category: 'accessory' },
            ];
        }

        const segmentHasOpening = objects.some(o => o.parentId === parentObj.id && o.side === block.side && o.segmentIndex === block.segmentIndex && (o.type === 'door' || o.type === 'window' || o.type === 'outlet'));
        const segmentHasAccessory = objects.some(o => o.parentId === parentObj.id && o.side === block.side && o.segmentIndex === block.segmentIndex && (o.type === 'radiator' || o.type === 'kitchen_unit'));

        availableButtons.forEach(btn => {
            if (segmentHasOpening && btn.category === 'accessory') return; 
            if (segmentHasAccessory && btn.category === 'opening') return;
            
            if (existingElementInSegment && existingElementInSegment.type !== btn.type) {
                 if(existingElementInSegment.id) return; 
            }

            const buttonElement = document.createElement('button');
            buttonElement.className = 'flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 w-full mb-1 text-sm text-left text-gray-200';
            buttonElement.innerHTML = `${btn.icon} ${btn.label}`;
            buttonElement.onclick = () => {
                if (typeof onAddObject === 'function') {
                    const elementDefaultSize = defaultObjectSizes[btn.type];
                    if (!elementDefaultSize) { console.error(`No default size for type ${btn.type}`); if (panel.parentNode) panel.parentNode.removeChild(panel); return; }
                    let elW = elementDefaultSize.width; let elH = WALL_THICKNESS_M;
                    if (btn.type === 'radiator' || btn.type === 'kitchen_unit') {
                        elH = elementDefaultSize.height; 
                    }

                    let newElementX, newElementY; let elementRotation = 0;
                    const parentWorldX = parentObj.x; const parentWorldY = parentObj.y;
                    if (parentObj.type === 'module') {
                        const blockLocalX = block.x; const blockLocalY = block.y;
                        const blockW = block.width; const blockH = block.height;
                        const blockCenterX = parentWorldX + blockLocalX + blockW / 2;
                        const blockCenterY = parentWorldY + blockLocalY + blockH / 2;
                        
                        if (block.side === 'top') {
                            elementRotation = 0;
                            newElementX = blockCenterX - elW / 2;
                            newElementY = blockCenterY - elH / 2;
                        } else if (block.side === 'bottom') {
                            elementRotation = 180;
                             newElementX = blockCenterX - elW / 2;
                             newElementY = blockCenterY - elH / 2;
                        } else if (block.side === 'left') {
                            elementRotation = -90;
                            let tempW = elW; elW = elH; elH = tempW; 
                            newElementX = blockCenterX - elW / 2;
                            newElementY = blockCenterY - elH / 2;
                        } else if (block.side === 'right') {
                            elementRotation = 90;
                            let tempW = elW; elW = elH; elH = tempW; 
                            newElementX = blockCenterX - elW / 2;
                            newElementY = blockCenterY - elH / 2;
                        }
                    } else if (parentObj.type === 'corridor') {
                        const isVerticalCorridor = parentObj.height > parentObj.width;
                        const doorLength = elW; const doorThickness = WALL_THICKNESS_M;
                        const corridorCenterX = parentWorldX + parentObj.width / 2;
                        const corridorCenterY = parentWorldY + parentObj.height / 2;
                        const clickWorld = localScreenToWorld(e.clientX, e.clientY);
                        if (isVerticalCorridor) { elementRotation = 0; newElementX = corridorCenterX - doorThickness / 2; newElementY = clickWorld.y - doorLength / 2;
                        } else { elementRotation = 90; newElementX = clickWorld.x - doorLength / 2; newElementY = corridorCenterY - doorThickness / 2; }
                        elW = doorLength; elH = doorThickness;
                    } else { if (panel.parentNode) panel.parentNode.removeChild(panel); return; }
                    onAddObject( btn.type, newElementX, newElementY, elW, elH, { rotation: elementRotation, segmentIndex: block.segmentIndex, side: block.side, parentId: parentObj.id, ...(btn.type === 'door' && { isOpen: false, openingAngle: 90, hingeSide: 'left', openingDirection: 'inward' })});
                }
                if (panel.parentNode) panel.parentNode.removeChild(panel);
            };
            panel.appendChild(buttonElement);
        });
        const closeBtn = document.createElement('button'); closeBtn.className = 'absolute top-2 right-2 text-gray-500 hover:text-gray-700'; closeBtn.innerHTML = '✕';
        closeBtn.onclick = () => { if (panel.parentNode) panel.parentNode.removeChild(panel); }; 
        document.body.appendChild(panel); 
        const closePanel = (ev) => { if (panel.parentNode && !panel.contains(ev.target)) { panel.parentNode.removeChild(panel); document.removeEventListener('click', closePanel); }};
        setTimeout(() => document.addEventListener('click', closePanel), 0);
  };

  let specificVisual;
  if (obj.type === "module_placeholder") {
    specificVisual = ( <ModulePlaceholderVisual obj={obj} scale={scale} commonProps={commonProps} /> );
  } else if (obj.type === "door") {
    specificVisual = ( <DoorVisual obj={obj} scale={scale} commonProps={commonProps} isSelected={isSelected} /> );
  } else if (obj.type === "window") {
    specificVisual = ( <WindowVisual obj={obj} scale={scale} commonProps={commonProps} isSelected={isSelected} /> );
  } else if (obj.type === "outlet") {
    specificVisual = ( <OutletVisual obj={obj} scale={scale} commonProps={commonProps} rotationCenterXScaled={rotationCenterXScaled} rotationCenterYScaled={rotationCenterYScaled} isSelected={isSelected} /> );
  } else if (obj.type === "corridor") {
    const isVertical = obj.height > obj.width;
    const lengthScaled = isVertical ? obj.height * scale : obj.width * scale;
    let x1, y1, x2, y2;
    const logicalThicknessForClick = Math.max(WALL_THICKNESS_M * scale, 10);

    if (isVertical) {
        x1 = obj.width * scale / 2; y1 = 0;
        x2 = obj.width * scale / 2; y2 = lengthScaled;
    } else {
        x1 = 0; y1 = obj.height * scale / 2;
        x2 = lengthScaled; y2 = obj.height * scale / 2;
    }
    specificVisual = (
        <g onClick={(e) => handleWallSegmentClick(e, { x: 0, y: 0, width: obj.width, height: obj.height, side: isVertical ? 'vertical' : 'horizontal', segmentIndex: 0, intendedType: 'door' }, obj)}
           style={{ cursor: 'pointer' }} 
        >
            <rect
                x={isVertical ? (obj.width * scale / 2) - (logicalThicknessForClick / 2) : 0}
                y={isVertical ? 0 : (obj.height * scale / 2) - (logicalThicknessForClick / 2)}
                width={isVertical ? logicalThicknessForClick : lengthScaled}
                height={isVertical ? lengthScaled : logicalThicknessForClick}
                fill="transparent"
            />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={commonProps.stroke} strokeWidth={commonProps.strokeWidth} />
        </g>
    );

  } else if (obj.type === "module" && !obj.corridor && !obj.bathroom && !obj.shower) {
    const moduleWidth = obj.width * scale;
    const moduleHeight = obj.height * scale;
    const wallThicknessM = 0.08;
    const wallThicknessScaled = wallThicknessM * scale;
    const blockSize = DEFAULT_PANEL_WIDTH_M; 

    const outerPath = `M 0 0 L ${moduleWidth.toFixed(2)} 0 L ${moduleWidth.toFixed(2)} ${moduleHeight.toFixed(2)} L 0 ${moduleHeight.toFixed(2)} Z`;
    const innerPath = `M ${wallThicknessScaled.toFixed(2)} ${wallThicknessScaled.toFixed(2)} L ${(moduleWidth - wallThicknessScaled).toFixed(2)} ${wallThicknessScaled.toFixed(2)} L ${(moduleWidth - wallThicknessScaled).toFixed(2)} ${(moduleHeight - wallThicknessScaled).toFixed(2)} L ${wallThicknessScaled.toFixed(2)} ${(moduleHeight - wallThicknessScaled).toFixed(2)} Z`;

    const studLines = [];
    const studInterval = blockSize * scale;
    for (let x = studInterval; x < moduleWidth - wallThicknessScaled; x += studInterval) {
        studLines.push(<line key={`stud-t-${x}`} x1={x} y1={wallThicknessScaled} x2={x} y2={wallThicknessScaled + 5} stroke={ARCH_LIGHT_GRAY} strokeWidth={ARCH_STROKE_VERY_THIN} />);
        studLines.push(<line key={`stud-b-${x}`} x1={x} y1={moduleHeight - wallThicknessScaled} x2={x} y2={moduleHeight - wallThicknessScaled - 5} stroke={ARCH_LIGHT_GRAY} strokeWidth={ARCH_STROKE_VERY_THIN} />);
    }
     for (let y = studInterval + wallThicknessScaled; y < moduleHeight - wallThicknessScaled; y += studInterval) {
        studLines.push(<line key={`stud-l-${y}`} x1={wallThicknessScaled} y1={y} x2={wallThicknessScaled + 5} y2={y} stroke={ARCH_LIGHT_GRAY} strokeWidth={ARCH_STROKE_VERY_THIN} />);
        studLines.push(<line key={`stud-r-${y}`} x1={moduleWidth - wallThicknessScaled} y1={y} x2={moduleWidth - wallThicknessScaled - 5} y2={y} stroke={ARCH_LIGHT_GRAY} strokeWidth={ARCH_STROKE_VERY_THIN} />);
    }

    const interactionBlocks = [];
     for (let x_seg = 0; x_seg < obj.width; x_seg += blockSize) {
        interactionBlocks.push({ x: x_seg * scale, y: 0, width: Math.min(blockSize, obj.width - x_seg) * scale, height: wallThicknessScaled, side: 'top', segmentIndex: Math.floor(x_seg / blockSize), origBlock: {x: x_seg, y: 0, width: Math.min(blockSize, obj.width - x_seg), height: wallThicknessM, side: 'top'} });
        interactionBlocks.push({ x: x_seg * scale, y: moduleHeight - wallThicknessScaled, width: Math.min(blockSize, obj.width - x_seg) * scale, height: wallThicknessScaled, side: 'bottom', segmentIndex: Math.floor(x_seg / blockSize), origBlock: {x: x_seg, y: obj.height - wallThicknessM, width: Math.min(blockSize, obj.width - x_seg), height: wallThicknessM, side: 'bottom'} });
    }
    for (let y_seg = wallThicknessM; y_seg < obj.height - wallThicknessM; y_seg += blockSize) {
       interactionBlocks.push({ x: 0, y: y_seg * scale, width: wallThicknessScaled, height: Math.min(blockSize, obj.height - y_seg - wallThicknessM) * scale, side: 'left', segmentIndex: Math.floor((y_seg - wallThicknessM) / blockSize), origBlock: {x: 0, y: y_seg, width: wallThicknessM, height: Math.min(blockSize, obj.height - y_seg - wallThicknessM), side: 'left'} });
       interactionBlocks.push({ x: moduleWidth - wallThicknessScaled, y: y_seg * scale, width: wallThicknessScaled, height: Math.min(blockSize, obj.height - y_seg - wallThicknessM) * scale, side: 'right', segmentIndex: Math.floor((y_seg - wallThicknessM) / blockSize), origBlock: {x: obj.width - wallThicknessM, y: y_seg, width: wallThicknessM, height: Math.min(blockSize, obj.height - y_seg - wallThicknessM), side: 'right'} });
    }
    
    let corridorPlaceholders = [];
    const existingCorridors = (window.__corridorObjectsCache = window.__corridorObjectsCache || []);
    if (Array.isArray(existingCorridors)) { existingCorridors.length = 0;}
    for (let i = 1; i < obj.width / blockSize; i++) { 
      for (let j = 0; j < (obj.height - 2 * wallThicknessM) / blockSize; j++) { 
         const blockGridX = i * blockSize * scale; 
         const blockGridY = (j * blockSize + wallThicknessM) * scale; 
         const blockGridH = blockSize * scale;     
         const plusX = blockGridX;
         const plusY = blockGridY + blockGridH / 2;
         const isHovered = hoveredCorridor && hoveredCorridor.type === 'vertical' && hoveredCorridor.index === i && hoveredCorridor.blockIndex === j;
         const corridorExists = false; 
         if (!corridorExists) {
           corridorPlaceholders.push(
             <g key={`corridor-vblock-${i}-${j}`}
               onMouseEnter={() => setHoveredCorridor({ type: 'vertical', index: i, blockIndex: j, x: obj.x + i * blockSize, y: obj.y + j * blockSize + wallThicknessM, width: blockSize, height: blockSize, orientation: 'vertical', parentId: obj.id })}
               onMouseLeave={() => setHoveredCorridor(null)}
             >
               <rect x={blockGridX - 8} y={blockGridY} width={16} height={blockGridH} fill="transparent" style={{ cursor: 'pointer' }}/>
               {isHovered && <line x1={blockGridX} y1={blockGridY} x2={blockGridX} y2={blockGridY + blockGridH} stroke={PLUS_BUTTON_COLOR} strokeWidth={2} strokeDasharray="4,4" opacity={0.5} />}
               {isHovered && (<g style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); if (typeof onAddCorridor === 'function') { onAddCorridor({ ...hoveredCorridor }); } else { console.warn('onAddCorridor is not a function!'); } }}>
                   <circle cx={plusX} cy={plusY} r={14} fill={ARCH_WHITE} stroke={PLUS_BUTTON_COLOR} strokeWidth={2} opacity={0.9} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', transition: 'all 0.2s ease' }}/>
                   <text x={plusX} y={plusY + 5} textAnchor="middle" fontSize="20" fill={PLUS_BUTTON_COLOR} fontWeight="bold" opacity={0.9} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))', transition: 'all 0.2s ease' }}>+</text>
               </g>)}
             </g>
           );}
      }}
    for (let j = 1; j < obj.height / blockSize; j++) { 
      for (let i = 0; i < (obj.width - 2 * wallThicknessM) / blockSize; i++) { 
         const blockGridX = (i * blockSize + wallThicknessM) * scale;
         const blockGridY = j * blockSize * scale;
         const blockGridW = blockSize * scale;
         const plusX = blockGridX + blockGridW / 2;
         const plusY = blockGridY;
         const isHovered = hoveredCorridor && hoveredCorridor.type === 'horizontal' && hoveredCorridor.index === j && hoveredCorridor.blockIndex === i;
         const corridorExists = false; 
          if (!corridorExists) {
           corridorPlaceholders.push(
             <g key={`corridor-hblock-${j}-${i}`}
               onMouseEnter={() => setHoveredCorridor({ type: 'horizontal', index: j, blockIndex: i, x: obj.x + i * blockSize + wallThicknessM, y: obj.y + j * blockSize, width: blockSize, height: blockSize, orientation: 'horizontal', parentId: obj.id })}
               onMouseLeave={() => setHoveredCorridor(null)}
             >
               <rect x={blockGridX} y={blockGridY - 8} width={blockGridW} height={16} fill="transparent" style={{ cursor: 'pointer' }}/>
               {isHovered && <line x1={blockGridX} y1={blockGridY} x2={blockGridX + blockGridW} y2={blockGridY} stroke={PLUS_BUTTON_COLOR} strokeWidth={2} strokeDasharray="4,4" opacity={0.5} />}
               {isHovered && (<g style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); if (typeof onAddCorridor === 'function') { onAddCorridor({ ...hoveredCorridor }); } else { console.warn('onAddCorridor is not a function!'); } }}>
                   <circle cx={plusX} cy={plusY} r={14} fill={ARCH_WHITE} stroke={PLUS_BUTTON_COLOR} strokeWidth={2} opacity={0.9} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', transition: 'all 0.2s ease' }} />
                   <text x={plusX} y={plusY + 5} textAnchor="middle" fontSize="20" fill={PLUS_BUTTON_COLOR} fontWeight="bold" opacity={0.9} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))', transition: 'all 0.2s ease' }}>+</text>
               </g>)}
             </g>
           );}
      }}

    const occupiedSegments = new Set();
     if (objects && obj.type === 'module') {
      objects.forEach(el => {
        if ((el.type === 'door' || el.type === 'window' || el.type === 'outlet' || el.type === 'radiator' || el.type === 'kitchen_unit') && el.parentId === obj.id && el.side && typeof el.segmentIndex === 'number') {
          occupiedSegments.add(`${el.side}-${el.segmentIndex}`);
        }
      });
    }

    specificVisual = (
      <>
        <path d={outerPath} fill="none" stroke={commonProps.stroke} strokeWidth={commonProps.strokeWidth} />
        <path d={innerPath} fill="none" stroke={commonProps.stroke} strokeWidth={commonProps.strokeWidth * 0.6} opacity={0.7} />
        {interactionBlocks.map((block, index) => (
          occupiedSegments.has(`${block.origBlock.side}-${block.segmentIndex}`) ? null : (
            <rect key={`int-block-${index}`} x={block.x} y={block.y} width={block.width} height={block.height} fill="transparent" style={{ cursor: 'pointer' }} onClick={(e) => handleWallSegmentClick(e, block.origBlock, obj)} />
          )
        ))}
        {corridorPlaceholders}
      </>
    );
  }
  else if (obj.type === "module") {
    specificVisual = ( <DefaultRectVisual obj={obj} scale={scale} commonProps={commonProps} /> );
  }
  else {
    specificVisual = ( <DefaultRectVisual obj={obj} scale={scale} commonProps={commonProps} /> );
  }

  const handleMouseDownVisual = (e) => {
    // console.log('ObjectVisual Clicked:', obj.id, obj.type);
    if (obj.type === "module_placeholder") {
        e.stopPropagation();
        if (typeof setSelectedObjectIds === 'function') {
            // console.log('Calling setSelectedObjectIds with:', [obj.id]);
            setSelectedObjectIds([obj.id]); 
        } else {
            console.error("setSelectedObjectIds is not a function in ObjectVisual for placeholder");
        }
    } else {
      onMouseDown(e, obj.id);
    }
  };

  return (
    <g transform={groupTransform} onMouseDown={handleMouseDownVisual}>
      {specificVisual}
       {obj.type === 'module' && obj.label && isSelected && !isLocked && (
        <text x={(obj.width * scale) / 2} y={(obj.height * scale) / 2} fontSize={`${Math.max(10, 14 / (scale / INITIAL_PPM))}px`} textAnchor="middle" dominantBaseline="central" fill={ARCH_DARK_GRAY} style={{ pointerEvents: "none", fontWeight: 500 }} > {obj.label} </text>
      )}
    </g>
  );
};
export default React.memo(ObjectVisual);