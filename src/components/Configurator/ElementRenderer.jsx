// src/components/Configurator/ElementRenderer.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    RENDER_SCALE,
    DOOR_WIDTH_MM,
    DOUBLE_DOOR_WIDTH_MM,
    DEFAULT_WINDOW_WIDTH_MM,
    DOOR_LEAF_THICKNESS_PX,
    DOOR_HANDLE_SIZE_PX,
    DOOR_HANDLE_OFFSET_FROM_EDGE_PX,
} from './constants'; // Path is correct (same directory)

const MIN_ELEMENT_SIZE_PX = 5;

const renderDoorInElementRenderer = (element, wallThicknessPx, elementStrokeWidth, doorArcStrokeWidth, baseGroupProps) => {
    const isDouble = element.type?.includes('podwójne');
    const doorWidthMm = element.width || (isDouble ? DOUBLE_DOOR_WIDTH_MM : DOOR_WIDTH_MM);
    const W_px = doorWidthMm * RENDER_SCALE;
    const T_px = DOOR_LEAF_THICKNESS_PX;

    if (!isFinite(W_px) || W_px <= 0) {
        console.warn("[ElementRenderer] Invalid door width_px for element:", element, W_px);
        return null;
    }
    
    let leafRotationDeg = 0;
    let arcStartX = 0, arcStartY = 0;
    let arcEndX = 0, arcEndY = 0;
    let arcSweepFlag = 0;
    let handlePosOnLeafX = 0;

    if (element.openingSide === 'left') {
        arcStartX = W_px;
        handlePosOnLeafX = W_px - DOOR_HANDLE_OFFSET_FROM_EDGE_PX;
        if (element.openingDirection === 'inward') {
            leafRotationDeg = 90;
            arcEndX = 0; arcEndY = W_px;
            arcSweepFlag = 0;
        } else {
            leafRotationDeg = -90;
            arcEndX = 0; arcEndY = -W_px;
            arcSweepFlag = 1;
        }
    } else {
        arcStartX = -W_px;
        handlePosOnLeafX = -W_px + DOOR_HANDLE_OFFSET_FROM_EDGE_PX;
        if (element.openingDirection === 'inward') {
            leafRotationDeg = -90;
            arcEndX = 0; arcEndY = W_px;
            arcSweepFlag = 1;
        } else {
            leafRotationDeg = 90;
            arcEndX = 0; arcEndY = -W_px;
            arcSweepFlag = 0;
        }
    }

    const leafRectProps = {
        x: element.openingSide === 'right' ? -W_px : 0,
        y: -T_px / 2,
        width: W_px,
        height: T_px,
        fill: element.isOpen ? "url(#doorTexturePattern)" : "#E5E7EB",
        stroke: "#6B7280",
        strokeWidth: elementStrokeWidth * 0.8,
        rx: 1, ry: 1,
    };

    if (!element.isOpen) {
        return (
            <g {...baseGroupProps}>
                <rect {...leafRectProps} />
                {isDouble && (
                    <line
                        x1={element.openingSide === 'right' ? -W_px / 2 : W_px / 2} y1={-T_px / 2}
                        x2={element.openingSide === 'right' ? -W_px / 2 : W_px / 2} y2={T_px / 2}
                        stroke="#6B7280" strokeWidth={elementStrokeWidth * 0.6}
                    />
                )}
                 <circle cx={handlePosOnLeafX} cy="0" r={DOOR_HANDLE_SIZE_PX / 2.5} fill="#A0AEC0" />
            </g>
        );
    }

    return (
        <g {...baseGroupProps}>
            <g transform={`rotate(${leafRotationDeg})`}>
                <rect {...leafRectProps} />
                <circle cx={handlePosOnLeafX} cy="0" r={DOOR_HANDLE_SIZE_PX / 2} fill="#6b7280" />
            </g>
            {W_px > 0 && (
                <path
                    d={`M ${arcStartX} ${arcStartY} A ${W_px} ${W_px} 0 0 ${arcSweepFlag} ${arcEndX} ${arcEndY}`}
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth={doorArcStrokeWidth}
                    strokeDasharray="3 2"
                />
            )}
        </g>
    );
};

const renderWindowInElementRenderer = (element, wallThicknessPx, elementStrokeWidth, baseGroupProps) => {
    const windowWidthMm = element.width || element.dimensions?.widthMm || DEFAULT_WINDOW_WIDTH_MM;
    const widthPx = windowWidthMm * RENDER_SCALE;

    const rectProps = {
        x: -widthPx / 2,
        y: -wallThicknessPx / 2,
        width: widthPx,
        height: wallThicknessPx,
        fill: "#bfdbfe",
        stroke: "#60a5fa",
        strokeWidth: elementStrokeWidth * 0.7,
        rx: 1, ry: 1,
    };

    if (!isFinite(widthPx) || !isFinite(wallThicknessPx) || widthPx <= 0 || wallThicknessPx <= 0) {
        console.warn("[ElementRenderer] Invalid window dimensions/wall thickness:", element, widthPx, wallThicknessPx);
        return null;
    }

    return (
        <g {...baseGroupProps}>
            <rect {...rectProps} />
            <line x1={0} y1={-wallThicknessPx/2} x2={0} y2={wallThicknessPx/2} stroke="#60a5fa" strokeWidth={elementStrokeWidth * 0.4} />
            <line x1={-widthPx/2} y1={0} x2={widthPx/2} y2={0} stroke="#60a5fa" strokeWidth={elementStrokeWidth * 0.4} />
        </g>
    );
};

const renderOtherElementInElementRenderer = (element, wallThicknessPx, elementStrokeWidth, baseGroupProps) => {
    const widthPx = element.dimensions?.widthPx || MIN_ELEMENT_SIZE_PX;
    const heightPx = element.dimensions?.heightPx || wallThicknessPx || MIN_ELEMENT_SIZE_PX;
    const size = Math.max(widthPx, heightPx, MIN_ELEMENT_SIZE_PX);
    return (
        <g {...baseGroupProps}>
            <rect x={-size / 2} y={-size / 2} width={size} height={size} fill="#a0aec0" stroke="#718096" strokeWidth={elementStrokeWidth * 0.4} />
        </g>
    );
};


export const ElementRenderer = ({ element, wallThicknessPx, isSelected, onClick, onMouseDown }) => {
    let errorReason = null;
    if (!element || !element.id) errorReason = "element or element.id is missing";
    else if (!element.position || typeof element.position.x !== 'number' || typeof element.position.y !== 'number' || !isFinite(element.position.x) || !isFinite(element.position.y)) errorReason = "element.position is invalid";
    else if (element.type !== 'container' && (element.type.includes('Okno')) && (!wallThicknessPx || wallThicknessPx <= 0 || !isFinite(wallThicknessPx))) {
        errorReason = "wallThicknessPx is invalid for window";
    }


    if (errorReason) {
        console.warn(`[ElementRenderer] Invalid props: ${errorReason}`, { element, wallThicknessPx });
        return null;
    }

    const elementStrokeWidth = 0.7;
    const doorArcStrokeWidth = 0.4;

    const style = {
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        zIndex: isSelected ? 10 : 5,
        cursor: element.type === 'container' ? 'grab' : (onClick ? 'pointer' : 'default'),
        outline: isSelected ? '2px solid #4A90E2' : 'none',
        outlineOffset: '2px',
        pointerEvents: 'none',
    };

    const contentTransform = `rotate(${element.rotation || 0})`;

    const baseGroupProps = {
        "data-module-id": element.parentContainerId || element.moduleId || element.id.split('-')[0],
        "data-element-id": element.id,
        "data-interactive": "true",
        onClick: onClick ? (e) => { e.stopPropagation(); onClick(e); } : undefined,
        onMouseDown: onMouseDown ? (e) => { e.stopPropagation(); onMouseDown(e); } : undefined,
        style: { pointerEvents: 'auto' },
        transform: contentTransform,
    };

    let renderedElementContent = null;
    const elementTypeNormalized = element.type.toLowerCase();

    if (elementTypeNormalized === 'container') {
        return (<div style={style} {...baseGroupProps} title={`Container ${element.id.substring(0, 4)}`}></div>);
    } else if (elementTypeNormalized.includes('drzwi')) {
        renderedElementContent = renderDoorInElementRenderer(element, wallThicknessPx, elementStrokeWidth, doorArcStrokeWidth, baseGroupProps);
    } else if (elementTypeNormalized.includes('okno')) {
        renderedElementContent = renderWindowInElementRenderer(element, wallThicknessPx, elementStrokeWidth, baseGroupProps);
    } else {
        renderedElementContent = renderOtherElementInElementRenderer(element, wallThicknessPx || MIN_ELEMENT_SIZE_PX, elementStrokeWidth, baseGroupProps);
    }
    

    const svgPadding = 20;
    let maxExtent = 0;

    if (elementTypeNormalized.includes('drzwi')) {
        const doorWidthMm = element.width || (elementTypeNormalized.includes('podwójne') ? DOUBLE_DOOR_WIDTH_MM : DOOR_WIDTH_MM);
        const W_px = doorWidthMm * RENDER_SCALE;
        maxExtent = W_px + DOOR_LEAF_THICKNESS_PX + svgPadding;
    } else if (elementTypeNormalized.includes('okno')) {
        const windowWidthMm = element.width || element.dimensions?.widthMm || DEFAULT_WINDOW_WIDTH_MM;
        maxExtent = (windowWidthMm * RENDER_SCALE) / 2 + (wallThicknessPx || 0) / 2 + svgPadding;
    } else {
        maxExtent = (element.dimensions?.widthPx || MIN_ELEMENT_SIZE_PX) / 2 + svgPadding;
    }
    
    const svgViewBoxSize = Math.max(MIN_ELEMENT_SIZE_PX + svgPadding*2, maxExtent * 2);

    const viewBoxX = -svgViewBoxSize / 2;
    const viewBoxY = -svgViewBoxSize / 2;
    const svgRenderWidth = svgViewBoxSize;
    const svgRenderHeight = svgViewBoxSize;

    if (!isFinite(viewBoxX + viewBoxY + svgRenderWidth + svgRenderHeight) || svgRenderWidth <= 0 || svgRenderHeight <= 0) {
        console.warn("[ElementRenderer] Invalid SVG viewBox calculated:", { viewBoxX, viewBoxY, svgRenderWidth, svgRenderHeight }, element);
        return null;
    }

    return (
        <svg
            style={style}
            width={svgRenderWidth}
            height={svgRenderHeight}
            viewBox={`${viewBoxX} ${viewBoxY} ${svgRenderWidth} ${svgRenderHeight}`}
            overflow="visible"
        >
            {renderedElementContent}
        </svg>
    );
};

ElementRenderer.propTypes = {
    element: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }).isRequired,
        dimensions: PropTypes.shape({ widthPx: PropTypes.number, heightPx: PropTypes.number, widthMm: PropTypes.number }),
        rotation: PropTypes.number,
        parentContainerId: PropTypes.string,
        moduleId: PropTypes.string,
        isOpen: PropTypes.bool,
        openingSide: PropTypes.oneOf(['left', 'right']),
        openingDirection: PropTypes.oneOf(['inward', 'outward']),
        width: PropTypes.number,
    }).isRequired,
    wallThicknessPx: PropTypes.number,
    isSelected: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
    onMouseDown: PropTypes.func,
};