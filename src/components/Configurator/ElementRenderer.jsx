import React from 'react';
import PropTypes from 'prop-types'; 
import {
    RENDER_SCALE,
    DOOR_LEAF_THICKNESS_PX,
    DOOR_HANDLE_SIZE_PX,
    DOOR_HANDLE_OFFSET_FROM_EDGE_PX,
} from './constants'; 

const ElementRenderer = ({ element, wallThicknessPx, isSelected, onClick }) => {
    const {
        id,
        type,
        position, 
        rotation, 
        width: elementWidthMm, 
        isOpen,
        openingSide, 
        openingDirection, 
        moduleId, 
    } = element;

    if (!id || !type || !position || typeof position.x !== 'number' || typeof position.y !== 'number' || typeof rotation !== 'number' || typeof elementWidthMm !== 'number') {
        return null;
    }
    
    const elementTypeNormalized = type.toLowerCase();
    const elementWidthPx = elementWidthMm * RENDER_SCALE;

    if (elementWidthPx <= 0) {
        return null;
    }


    const groupTransform = `translate(${position.x.toFixed(3)}, ${position.y.toFixed(3)}) rotate(${rotation.toFixed(3)})`;

    const handleClick = (e) => {
        e.stopPropagation(); 
        if (onClick) {
            onClick(element, e); 
        }
    };

    const gProps = {
        'data-module-id': moduleId,
        'data-element-id': id,
        'data-interactive': 'true',
        style: { 
            cursor: onClick ? 'pointer' : 'default',
            outline: isSelected ? '1px dashed #007bff' : 'none', 
            outlineOffset: '2px', 
        },
        onClick: handleClick,
        transform: groupTransform,
    };


    if (elementTypeNormalized.includes('drzwi')) {
        const doorLeafWidthPx = elementWidthPx;
        const doorLeafThicknessPx = DOOR_LEAF_THICKNESS_PX;

        let swingAngleDeg = 0; 
        if (isOpen) {
            if (openingDirection === 'inward') {
                swingAngleDeg = (openingSide === 'left') ? 90 : -90;
            } else { 
                swingAngleDeg = (openingSide === 'left') ? -90 : 90;
            }
        }

        const leafPath = openingSide === 'left'
            ? `M 0 ${-doorLeafThicknessPx / 2} L ${doorLeafWidthPx} ${-doorLeafThicknessPx / 2} L ${doorLeafWidthPx} ${doorLeafThicknessPx / 2} L 0 ${doorLeafThicknessPx / 2} Z`
            : `M 0 ${-doorLeafThicknessPx / 2} L ${-doorLeafWidthPx} ${-doorLeafThicknessPx / 2} L ${-doorLeafWidthPx} ${doorLeafThicknessPx / 2} L 0 ${doorLeafThicknessPx / 2} Z`;
        
        const handleOffsetFromEdge = DOOR_HANDLE_OFFSET_FROM_EDGE_PX; 
        const handleRadius = DOOR_HANDLE_SIZE_PX / 2;
        const handleCenterX = openingSide === 'left'
            ? doorLeafWidthPx - handleOffsetFromEdge - handleRadius
            : -doorLeafWidthPx + handleOffsetFromEdge + handleRadius;
        const handleCenterY = 0; 

        let arcPathD = "";
        if (isOpen) {
            const radius = doorLeafWidthPx;
            const startX = 0; 
            const startY = 0;

            const endX_arc = radius * Math.cos(swingAngleDeg * Math.PI / 180);
            const endY_arc = radius * Math.sin(swingAngleDeg * Math.PI / 180);
            
            let sweepFlag;
            if (openingSide === 'left') {
                sweepFlag = (openingDirection === 'inward') ? 1 : 0; 
            } else { 
                sweepFlag = (openingDirection === 'inward') ? 0 : 1; 
            }

            const lineToX = (openingSide === 'left') ? doorLeafWidthPx : -doorLeafWidthPx;

            arcPathD = `M ${startX} ${startY} L ${lineToX} ${startY} A ${radius} ${radius} 0 0 ${sweepFlag} ${endX_arc} ${endY_arc}`;
        }

        return (
            <g {...gProps}>
                <g transform={`rotate(${swingAngleDeg})`}>
                    <path
                        d={leafPath}
                        fill={isSelected ? "rgba(75, 125, 230, 0.5)" : "rgba(160, 120, 80, 0.6)"} 
                        stroke={isSelected ? "#3B82F6" : "#6D513D"}
                        strokeWidth="0.5" 
                    />
                    <circle
                        cx={handleCenterX}
                        cy={handleCenterY}
                        r={handleRadius}
                        fill={isOpen ? "#A0A0A0" : "#808080"} 
                        stroke="#505050"
                        strokeWidth="0.2"
                    />
                </g>
                {isOpen && (
                    <path
                        d={arcPathD}
                        fill="none"
                        stroke={isSelected ? "#3B82F6" : "#A0A0A0"}
                        strokeWidth="0.3" 
                        strokeDasharray="1.5,1.5" 
                    />
                )}
            </g>
        );

    } else if (elementTypeNormalized.includes('okno')) {
        if (typeof wallThicknessPx !== 'number' || wallThicknessPx <= 0) {
            return ( 
                <g {...gProps}>
                    <text x="0" y="0" fontSize="3" fill="red">Invalid Wall</text>
                </g>
            );
        }
        const windowDrawWidthPx = elementWidthPx; 
        
        return (
            <g {...gProps}>
                <rect
                    x={-windowDrawWidthPx / 2}
                    y={-wallThicknessPx / 2}
                    width={windowDrawWidthPx}
                    height={wallThicknessPx}
                    fill={isSelected ? "rgba(135, 206, 250, 0.6)" : "rgba(173, 216, 230, 0.5)"} 
                    stroke={isSelected ? "#3B82F6" : "#708090"} 
                    strokeWidth="0.5" 
                />
                <line
                    x1="0" y1={-wallThicknessPx / 2}
                    x2="0" y2={wallThicknessPx / 2}
                    stroke={isSelected ? "#FFFFFF" : "#B0C4DE"} 
                    strokeWidth="0.3" 
                />
                <line
                    x1={-windowDrawWidthPx / 2} y1="0"
                    x2={windowDrawWidthPx / 2} y2="0"
                    stroke={isSelected ? "#FFFFFF" : "#B0C4DE"} 
                    strokeWidth="0.3" 
                />
            </g>
        );
    }
    return null; 
};

ElementRenderer.propTypes = {
    element: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        position: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        }).isRequired,
        rotation: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired, 
        isOpen: PropTypes.bool,
        openingSide: PropTypes.oneOf(['left', 'right']),
        openingDirection: PropTypes.oneOf(['inward', 'outward']),
        moduleId: PropTypes.string,
    }).isRequired,
    wallThicknessPx: PropTypes.number, 
    isSelected: PropTypes.bool,
    onClick: PropTypes.func,
};

ElementRenderer.defaultProps = {
    isSelected: false,
    onClick: null,
    wallThicknessPx: 0, 
};

export default ElementRenderer;