// components/Configurator/ElementRenderer.jsx
import React from 'react';
import PropTypes from 'prop-types'; // Добавим PropTypes для лучшей проверки компонента
import {
    RENDER_SCALE,
    DOOR_LEAF_THICKNESS_PX,
    DOOR_HANDLE_SIZE_PX,
    DOOR_HANDLE_OFFSET_FROM_EDGE_PX,
} from './constants'; // Предполагается, что appConstants.js переименован в constants.js или наоборот

const ElementRenderer = ({ element, wallThicknessPx, isSelected, onClick }) => {
    const {
        id,
        type,
        position, // { x, y } - hinge position for doors, center for windows
        rotation, // degrees (0, 90, 180, -90) - overall rotation of the element
        width: elementWidthMm, // Specific width of the element in mm
        isOpen,
        openingSide, // 'left' or 'right'
        openingDirection, // 'inward' or 'outward'
        moduleId, // For data attributes
    } = element;

    // Проверка на наличие необходимых свойств
    if (!id || !type || !position || typeof position.x !== 'number' || typeof position.y !== 'number' || typeof rotation !== 'number' || typeof elementWidthMm !== 'number') {
        console.warn('[ElementRenderer] Missing or invalid core element properties:', element);
        return null;
    }
    
    const elementTypeNormalized = type.toLowerCase();
    const elementWidthPx = elementWidthMm * RENDER_SCALE;

    if (elementWidthPx <= 0) {
        console.warn('[ElementRenderer] Invalid elementWidthPx:', elementWidthPx, 'for element:', element);
        return null;
    }


    const groupTransform = `translate(${position.x.toFixed(3)}, ${position.y.toFixed(3)}) rotate(${rotation.toFixed(3)})`;

    const handleClick = (e) => {
        e.stopPropagation(); 
        if (onClick) {
            onClick(element, e); // Передаем сам элемент и событие
        }
    };

    const gProps = {
        'data-module-id': moduleId,
        'data-element-id': id,
        'data-interactive': 'true',
        // className: `cursor-pointer element-group ${isSelected ? 'selected-element-highlight' : ''}`, // Класс для стилизации через CSS, если нужно
        style: { 
            cursor: onClick ? 'pointer' : 'default',
            outline: isSelected ? '1px dashed #007bff' : 'none', // Пример подсветки выбранного элемента
            outlineOffset: '2px', // Отступ для outline
        },
        onClick: handleClick,
        transform: groupTransform,
    };


    if (elementTypeNormalized.includes('drzwi')) {
        const doorLeafWidthPx = elementWidthPx;
        const doorLeafThicknessPx = DOOR_LEAF_THICKNESS_PX;

        let swingAngleDeg = 0; // Угол поворота в градусах
        if (isOpen) {
            if (openingDirection === 'inward') {
                swingAngleDeg = (openingSide === 'left') ? 90 : -90;
            } else { // outward
                swingAngleDeg = (openingSide === 'left') ? -90 : 90;
            }
        }

        // Путь для дверного полотна. Петля в локальных (0,0).
        const leafPath = openingSide === 'left'
            ? `M 0 ${-doorLeafThicknessPx / 2} L ${doorLeafWidthPx} ${-doorLeafThicknessPx / 2} L ${doorLeafWidthPx} ${doorLeafThicknessPx / 2} L 0 ${doorLeafThicknessPx / 2} Z`
            : `M 0 ${-doorLeafThicknessPx / 2} L ${-doorLeafWidthPx} ${-doorLeafThicknessPx / 2} L ${-doorLeafWidthPx} ${doorLeafThicknessPx / 2} L 0 ${doorLeafThicknessPx / 2} Z`;
        
        // Позиция ручки (относительно полотна, до его поворота)
        const handleOffsetFromEdge = DOOR_HANDLE_OFFSET_FROM_EDGE_PX; // Более понятное имя
        const handleRadius = DOOR_HANDLE_SIZE_PX / 2;
        const handleCenterX = openingSide === 'left'
            ? doorLeafWidthPx - handleOffsetFromEdge - handleRadius
            : -doorLeafWidthPx + handleOffsetFromEdge + handleRadius;
        const handleCenterY = 0; 

        // Параметры дуги открывания
        let arcPathD = "";
        if (isOpen) {
            const radius = doorLeafWidthPx;
            const startX = 0; // Петля
            const startY = 0;

            // Конечная точка дуги
            const endX_arc = radius * Math.cos(swingAngleDeg * Math.PI / 180);
            const endY_arc = radius * Math.sin(swingAngleDeg * Math.PI / 180);
            
            // Флаги для SVG path arc
            // large-arc-flag всегда 0 для <= 90 градусов
            // sweep-flag: 0 = против часовой, 1 = по часовой
            let sweepFlag;
            if (openingSide === 'left') {
                sweepFlag = (openingDirection === 'inward') ? 1 : 0; // Inward (+90 deg) -> clockwise, Outward (-90 deg) -> counter-clockwise
            } else { // openingSide === 'right'
                sweepFlag = (openingDirection === 'inward') ? 0 : 1; // Inward (-90 deg) -> counter-clockwise, Outward (+90 deg) -> clockwise
            }

            // Координаты для прямой линии от петли до края закрытой двери
            const lineToX = (openingSide === 'left') ? doorLeafWidthPx : -doorLeafWidthPx;

            arcPathD = `M ${startX} ${startY} L ${lineToX} ${startY} A ${radius} ${radius} 0 0 ${sweepFlag} ${endX_arc} ${endY_arc}`;
        }

        return (
            <g {...gProps}>
                {/* Дверное полотно - трансформируется на swingAngleDeg */}
                <g transform={`rotate(${swingAngleDeg})`}>
                    <path
                        d={leafPath}
                        fill={isSelected ? "rgba(75, 125, 230, 0.5)" : "rgba(160, 120, 80, 0.6)"} 
                        stroke={isSelected ? "#3B82F6" : "#6D513D"}
                        strokeWidth="0.5" 
                    />
                    {/* Ручка двери - отображается всегда, вращается с полотном */}
                    <circle
                        cx={handleCenterX}
                        cy={handleCenterY}
                        r={handleRadius}
                        fill={isOpen ? "#A0A0A0" : "#808080"} // Разный цвет для открытой/закрытой
                        stroke="#505050"
                        strokeWidth="0.2"
                    />
                </g>
                {/* Дуга для визуализации открывания (только когда открыта) */}
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
            console.warn('[ElementRenderer] Invalid wallThicknessPx for window:', wallThicknessPx, 'for element:', element);
            return ( // Можно вернуть заглушку или null
                <g {...gProps}>
                    <text x="0" y="0" fontSize="3" fill="red">Invalid Wall</text>
                </g>
            );
        }
        const windowDrawWidthPx = elementWidthPx; 
        
        return (
            <g {...gProps}>
                {/* Стекло окна */}
                <rect
                    x={-windowDrawWidthPx / 2}
                    y={-wallThicknessPx / 2}
                    width={windowDrawWidthPx}
                    height={wallThicknessPx}
                    fill={isSelected ? "rgba(135, 206, 250, 0.6)" : "rgba(173, 216, 230, 0.5)"} 
                    stroke={isSelected ? "#3B82F6" : "#708090"} 
                    strokeWidth="0.5" 
                />
                {/* Центральная линия рамы (вертикальная) */}
                <line
                    x1="0" y1={-wallThicknessPx / 2}
                    x2="0" y2={wallThicknessPx / 2}
                    stroke={isSelected ? "#FFFFFF" : "#B0C4DE"} 
                    strokeWidth="0.3" 
                />
                 {/* Центральная линия рамы (горизонтальная) */}
                <line
                    x1={-windowDrawWidthPx / 2} y1="0"
                    x2={windowDrawWidthPx / 2} y2="0"
                    stroke={isSelected ? "#FFFFFF" : "#B0C4DE"} 
                    strokeWidth="0.3" 
                />
            </g>
        );
    }

    // console.warn(`ElementRenderer: Unsupported element type: ${type}`);
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
        width: PropTypes.number.isRequired, // 'width' from element object is elementWidthMm
        isOpen: PropTypes.bool,
        openingSide: PropTypes.oneOf(['left', 'right']),
        openingDirection: PropTypes.oneOf(['inward', 'outward']),
        moduleId: PropTypes.string,
    }).isRequired,
    wallThicknessPx: PropTypes.number, // Required for windows
    isSelected: PropTypes.bool,
    onClick: PropTypes.func,
};

ElementRenderer.defaultProps = {
    isSelected: false,
    onClick: null,
    wallThicknessPx: 0, // Default to 0, but windows should have a valid one
};

export default ElementRenderer;