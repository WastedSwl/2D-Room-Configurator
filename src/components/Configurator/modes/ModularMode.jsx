// src/components/Configurator/modes/ModularMode.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaDoorOpen, FaWindowMaximize } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ModularMode = ({ projectData, setProjectData, floor }) => {
    // Стандартные размеры в миллиметрах
    const GRID_SIZE = 100; // 1 метр = 100px (масштаб 1:10)
    const WALL_THICKNESS = 150; // 150 мм
    const DOOR_WIDTH = 900;     // 900 мм
    const WINDOW_WIDTH = 1200;  // 1200 мм

    // Размеры модуля в метрах
    const MODULE_WIDTH_METERS = 6;
    const MODULE_DEPTH_METERS = 2;

    // Конвертируем размеры в пиксели (масштаб 1:10)
    const moduleWidthPx = MODULE_WIDTH_METERS * GRID_SIZE; // 600px
    const moduleDepthPx = MODULE_DEPTH_METERS * GRID_SIZE; // 200px
    const wallThicknessPx = 15; // Толщина стены только для визуализации
    const gridSizePx = GRID_SIZE;  // 100px
    const doorWidthPx = DOOR_WIDTH / 10;
    const windowWidthPx = WINDOW_WIDTH / 10;

    // Состояние для внутренних стен и элементов
    const [internalWalls, setInternalWalls] = useState(() => {
        console.log('Initializing internal walls state');
        return [];
    });
    const [doors, setDoors] = useState([]);
    const [windows, setWindows] = useState([]);
    const [hoveredLine, setHoveredLine] = useState(null);
    const [isAddingDoor, setIsAddingDoor] = useState(false);
    const [isAddingWindow, setIsAddingWindow] = useState(false);

    // Состояния для выбора блока и панели
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [showElementPanel, setShowElementPanel] = useState(false);
    const moduleRef = useRef();

    // Состояния для элементов на стенах
    const [elementsOnWalls, setElementsOnWalls] = useState([]);
    const [activeDoorId, setActiveDoorId] = useState(null); // теперь только id

    // Генерация позиций для плюсиков на вертикальных и горизонтальных линиях
    const verticalLines = [];
    for (let col = 1; col < MODULE_WIDTH_METERS; col++) {
        verticalLines.push({
            type: 'vertical',
            x: col * gridSizePx,
            y: moduleDepthPx / 2
        });
    }
    const horizontalLines = [];
    for (let row = 1; row < MODULE_DEPTH_METERS; row++) {
        horizontalLines.push({
            type: 'horizontal',
            x: moduleWidthPx / 2,
            y: row * gridSizePx
        });
    }

    // Функция для определения ближайшей точки сетки
    const snapToGrid = (value) => {
        return Math.round(value / gridSizePx) * gridSizePx;
    };

    // Обработчик движения мыши по модулю для создания стены
    const handleModuleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Проверяем, что мышь внутри модуля
        if (x < 0 || x > moduleWidthPx || y < 0 || y > moduleDepthPx) {
            setHoveredLine(null);
            return;
        }
        // Проверяем близость к вертикальной линии
        for (let col = 1; col < MODULE_WIDTH_METERS; col++) {
            const lineX = col * gridSizePx;
            if (Math.abs(x - lineX) < 8) {
                setHoveredLine({
                    type: 'vertical',
                    x: lineX,
                    y: Math.round(y / gridSizePx) * gridSizePx + gridSizePx / 2
                });
             return;
         }
        }
        // Проверяем близость к горизонтальной линии
        for (let row = 1; row < MODULE_DEPTH_METERS; row++) {
            const lineY = row * gridSizePx;
            if (Math.abs(y - lineY) < 8) {
                setHoveredLine({
                    type: 'horizontal',
                    x: Math.round(x / gridSizePx) * gridSizePx + gridSizePx / 2,
                    y: lineY
                });
                return;
            }
        }
        setHoveredLine(null);
    };

    // Клик по плюсику для создания стены
    const handlePlusClick = () => {
        if (!hoveredLine) return;
        let newWall;
        if (hoveredLine.type === 'vertical') {
            const cellY = Math.floor((hoveredLine.y - gridSizePx / 2) / gridSizePx);
            if (cellY < 0 || cellY >= MODULE_DEPTH_METERS) return;
            newWall = {
                id: Date.now(),
                start: { x: hoveredLine.x, y: cellY * gridSizePx },
                end: { x: hoveredLine.x, y: (cellY + 1) * gridSizePx }
            };
        } else {
            const cellX = Math.floor((hoveredLine.x - gridSizePx / 2) / gridSizePx);
            if (cellX < 0 || cellX >= MODULE_WIDTH_METERS) return;
            newWall = {
                id: Date.now(),
                start: { x: cellX * gridSizePx, y: hoveredLine.y },
                end: { x: (cellX + 1) * gridSizePx, y: hoveredLine.y }
            };
        }
        // Проверка на пересечение
        const hasIntersection = internalWalls.some(wall =>
            (wall.start.x === newWall.start.x && wall.start.y === newWall.start.y && wall.end.x === newWall.end.x && wall.end.y === newWall.end.y)
        );
        if (hasIntersection) {
            toast.warning('Такая стена уже существует');
            return;
        }
        setInternalWalls(prev => [...prev, newWall]);
        toast.success('Стена успешно создана');
    };

    // Добавляем обработчик для отладки состояния стен
    useEffect(() => {
        console.log('Internal walls state updated:', internalWalls);
    }, [internalWalls]);

    // Внутренние стены
    const renderInternalWalls = () => {
        if (!internalWalls || internalWalls.length === 0) {
            return null;
        }
        return internalWalls.map(wall => {
            const width = Math.abs(wall.end.x - wall.start.x);
            const height = Math.abs(wall.end.y - wall.start.y);
            const isHorizontal = height < width;
            const style = {
                position: 'absolute',
                left: `${isHorizontal ? wall.start.x : wall.start.x - 7}px`,
                top: `${isHorizontal ? wall.start.y - 7 : wall.start.y}px`,
                width: isHorizontal ? `${width}px` : `14px`,
                height: isHorizontal ? `14px` : `${height}px`,
                background: isHorizontal
                    ? 'linear-gradient(90deg, #cbd5e1 0%, #e5e7eb 100%)'
                    : 'linear-gradient(180deg, #cbd5e1 0%, #e5e7eb 100%)',
                borderRadius: isHorizontal ? '7px' : '7px',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                border: '1px solid #d1d5db',
                zIndex: 10,
                pointerEvents: 'none',
                transition: 'background 0.2s',
            };
            return (
                <div
                    key={wall.id}
                    style={style}
                />
            );
        });
    };

    // Генерация блоков для внешних стен
    const getExternalWallBlocks = () => {
        const blocks = [];
        // Верхняя стена
        for (let i = 0; i < MODULE_WIDTH_METERS; i++) {
            blocks.push({
                wall: 'top',
                x: i * gridSizePx,
                y: 0,
                orientation: 'horizontal',
                idx: i
            });
        }
        // Нижняя стена
        for (let i = 0; i < MODULE_WIDTH_METERS; i++) {
            blocks.push({
                wall: 'bottom',
                x: i * gridSizePx,
                y: moduleDepthPx,
                orientation: 'horizontal',
                idx: i
            });
        }
        // Левая стена
        for (let i = 0; i < MODULE_DEPTH_METERS; i++) {
            blocks.push({
                wall: 'left',
                x: 0,
                y: i * gridSizePx,
                orientation: 'vertical',
                idx: i
            });
        }
        // Правая стена
        for (let i = 0; i < MODULE_DEPTH_METERS; i++) {
            blocks.push({
                wall: 'right',
                x: moduleWidthPx,
                y: i * gridSizePx,
                orientation: 'vertical',
                idx: i
            });
        }
        return blocks;
    };

    // Генерация блоков для внутренних стен
    const getInternalWallBlocks = () => {
        const blocks = [];
        internalWalls.forEach(wall => {
            const isHorizontal = wall.start.y === wall.end.y;
            const length = isHorizontal
                ? Math.abs(wall.end.x - wall.start.x)
                : Math.abs(wall.end.y - wall.start.y);
            const count = length / gridSizePx;
            for (let i = 0; i < count; i++) {
                blocks.push({
                    wall: wall,
                    x: isHorizontal ? wall.start.x + i * gridSizePx : wall.start.x,
                    y: isHorizontal ? wall.start.y : wall.start.y + i * gridSizePx,
                    orientation: isHorizontal ? 'horizontal' : 'vertical',
                    idx: i
                });
            }
        });
        return blocks;
    };

    // Подсветка блока при наведении
    const [hoveredBlock, setHoveredBlock] = useState(null);

    // Обработчик выбора элемента из панели
    const handleElementSelect = (type) => {
        if (!selectedBlock) return;
        setElementsOnWalls(prev => [
            ...prev,
            {
                id: Date.now() + Math.random(),
                type,
                wall: selectedBlock.wall,
                idx: selectedBlock.idx,
                orientation: selectedBlock.orientation,
                x: selectedBlock.x,
                y: selectedBlock.y,
                hingeSide: 'left',
                openDirection: 'in',
                isOpen: true // по умолчанию дверь открыта
            }
        ]);
        setShowElementPanel(false);
    };

    // Панель выбора элемента
    const ElementPanel = ({ x, y, onClose }) => (
        <div
            className="absolute bg-white rounded-lg shadow-lg p-3 flex flex-col space-y-2 border border-gray-200"
            style={{ left: x, top: y, zIndex: 100 }}
        >
            <button className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600" onClick={() => handleElementSelect('door')}>Дверь</button>
            <button className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600" onClick={() => handleElementSelect('window')}>Окно</button>
            <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={onClose}>Отмена</button>
        </div>
    );

    // Панель управления дверью
    const DoorControlPanel = ({ doorId, onClose }) => {
        const door = elementsOnWalls.find(e => e.id === doorId);
        if (!door) return null;

        const updateDoor = (changes) => {
            setElementsOnWalls(prev => prev.map(e =>
                e.id === door.id ? { ...e, ...changes } : e
            ));
        };

        const removeDoor = () => {
            setElementsOnWalls(prev => prev.filter(e => e.id !== door.id));
            setActiveDoorId(null);
        };

    return (
            <div className="absolute bg-white rounded-lg shadow-lg p-3 flex flex-col space-y-2 border border-gray-200 z-[100]" 
                style={{ left: door.x + 30, top: door.y + 30 }}>
                <div className="font-semibold text-gray-700 mb-1">Управление дверью</div>
                <button 
                    className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600" 
                    onClick={() => updateDoor({ isOpen: !door.isOpen })}
                >
                    {door.isOpen ? 'Закрыть дверь' : 'Открыть дверь'}
                </button>
                <button 
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600" 
                    onClick={removeDoor}
                >
                    Удалить
                </button>
                <button 
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" 
                    onClick={onClose}
                >
                    Закрыть
                </button>
            </div>
        );
    };

    // Исправленный DoorSVG
    const DoorSVG = ({ orientation = 'horizontal', width = 100, height = 14, isOpen = true, hingeSide = 'left', openDirection = 'in' }) => {
        const doorThickness = 6;
        const boxLength = 10;
        const handleLength = 8;
        if (orientation === 'horizontal') {
            const doorLength = width - 10;
            const swing = openDirection === 'in' ? 1 : -1;
            const boxX = hingeSide === 'left' ? 0 : width - boxLength;
            const doorX = hingeSide === 'left' ? boxLength : width - boxLength;
            const doorRotate = isOpen ? (hingeSide === 'left' ? swing * 90 : -swing * 90) : 0;
            const arcStartX = hingeSide === 'left' ? boxLength : width - boxLength;
            const arcEndX = hingeSide === 'left' ? boxLength + swing * doorLength : width - boxLength - swing * doorLength;
            const handleX = hingeSide === 'left' ? boxLength + doorLength - handleLength : width - boxLength - doorLength;
            return (
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
                    <rect x={boxX} y={(height - doorThickness) / 2} width={boxLength} height={doorThickness} fill="#222" rx={2} />
                    <rect x={doorX} y={(height - doorThickness) / 2} width={doorLength} height={doorThickness} fill="#fff" stroke="#222" strokeWidth={1.5} rx={2} transform={`rotate(${doorRotate},${doorX},${height / 2})`} />
                    {isOpen && (
                        <path d={`M${arcStartX},${height / 2} A${doorLength},${doorLength} 0 0,1 ${arcEndX},${height / 2 + swing * doorLength}`} fill="none" stroke="#888" strokeWidth={1.2} />
                    )}
                    <rect x={boxX - 2} y={(height - 4) / 2} width={4} height={4} fill="#222" rx={1} />
                    <rect x={handleX} y={(height - 2) / 2} width={handleLength} height={2} fill="#888" rx={1} />
                </svg>
            );
        } else {
            // ВЕРТИКАЛЬНАЯ ДВЕРЬ: исправлено позиционирование
            const doorLength = height - 10;
            const swing = openDirection === 'in' ? 1 : -1;
            const boxY = hingeSide === 'top' ? 0 : height - boxLength;
            const doorY = hingeSide === 'top' ? boxLength : height - boxLength;
            const doorRotate = isOpen ? (hingeSide === 'top' ? swing * 90 : -swing * 90) : 0;
            const arcStartY = hingeSide === 'top' ? boxLength : height - boxLength;
            const arcEndY = hingeSide === 'top' ? boxLength + swing * doorLength : height - boxLength - swing * doorLength;
            const handleY = hingeSide === 'top' ? boxLength + doorLength - handleLength : height - boxLength - doorLength;
            return (
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
                    {/* Коробка двери */}
                    <rect x={(width - doorThickness) / 2} y={boxY} width={doorThickness} height={boxLength} fill="#222" ry={2} />
                    {/* Створка двери */}
                    <rect x={(width - doorThickness) / 2} y={doorY} width={doorThickness} height={doorLength} fill="#fff" stroke="#222" strokeWidth={1.5} ry={2} transform={`rotate(${doorRotate},${width / 2},${doorY})`} />
                    {/* Дуга открывания */}
                    {isOpen && (
                        <path d={`M${width / 2},${arcStartY} A${doorLength},${doorLength} 0 0,1 ${width / 2 + swing * doorLength},${arcEndY}`} fill="none" stroke="#888" strokeWidth={1.2} />
                    )}
                    {/* Петли */}
                    <rect x={(width - 4) / 2} y={boxY - 2} width={4} height={4} fill="#222" ry={1} />
                    {/* Ручка */}
                    <rect x={(width - 2) / 2} y={handleY} width={2} height={handleLength} fill="#888" ry={1} />
                </svg>
            );
        }
    };

    // Визуализация элементов на стенах
    const renderWallElement = (block) => {
        const el = elementsOnWalls.find(e =>
            e.wall === block.wall && e.idx === block.idx && e.orientation === block.orientation
        );
        if (!el) return null;
        if (el.type === 'door') {
            return (
                <div className="absolute flex items-center justify-center w-full h-full" onClick={e => { e.stopPropagation(); setActiveDoorId(el.id); }} style={{ cursor: 'pointer' }}>
                    <DoorSVG orientation={el.orientation || block.orientation} width={block.orientation === 'horizontal' ? gridSizePx : 14} height={block.orientation === 'horizontal' ? 14 : gridSizePx} isOpen={el.isOpen} />
                </div>
            );
        }
        if (el.type === 'window') {
            return (
                <div className="absolute flex items-center justify-center bg-blue-200/60 border border-blue-400 w-full h-full" style={{ borderRadius: 4 }}>
                    {/* Окно на весь блок */}
                </div>
            );
        }
        return null;
    };

                         return (
        <div className="relative h-full bg-gray-50 flex items-center justify-center">
            {/* Панель инструментов */}
            <div className="absolute top-4 left-4 flex space-x-2 z-50">
                <button
                    onClick={() => {
                        setIsAddingDoor(!isAddingDoor);
                        setIsAddingWindow(false);
                    }}
                    className={`p-2 rounded-lg shadow-md transition-colors ${
                        isAddingDoor 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-600 hover:text-gray-900'
                    }`}
                    title="Додати двері"
                >
                    <FaDoorOpen className="w-5 h-5" />
                </button>
                <button
                    onClick={() => {
                        setIsAddingWindow(!isAddingWindow);
                        setIsAddingDoor(false);
                    }}
                    className={`p-2 rounded-lg shadow-md transition-colors ${
                        isAddingWindow 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-600 hover:text-gray-900'
                    }`}
                    title="Додати вікно"
                >
                    <FaWindowMaximize className="w-5 h-5" />
                </button>
            </div>

            {/* Сетка и модуль */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className="w-[800px] h-[600px] bg-white relative"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                        `,
                        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
                    }}
                >
                    {/* Модуль с сеткой и стенами */}
                    <div 
                        className="absolute"
                        style={{
                            width: `${moduleWidthPx}px`,
                            height: `${moduleDepthPx}px`,
                            left: `100px`,
                            top: `100px`,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        ref={moduleRef}
                        onMouseMove={handleModuleMouseMove}
                        onMouseLeave={() => setHoveredLine(null)}
                        onClick={handlePlusClick}
                    >
                        {/* Внутренняя сетка */}
                        <div 
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `
                                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                                `,
                                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                                zIndex: 1
                            }}
                        />

                        {/* Блоки внешних стен */}
                        {getExternalWallBlocks().map((block, idx) => {
                            const hasElement = elementsOnWalls.some(e =>
                                e.wall === block.wall && e.idx === block.idx && e.orientation === block.orientation
                            );
                            return (
                                <div
                                    key={`extblock-${block.wall}-${block.idx}`}
                                    className={`absolute cursor-pointer transition-all duration-100 ${hoveredBlock && hoveredBlock.key === `extblock-${block.wall}-${block.idx}` && !hasElement ? 'bg-blue-200/70' : ''}`}
                                    style={{
                                        left: block.orientation === 'vertical' ? block.x - 7 : block.x,
                                        top: block.orientation === 'horizontal' ? block.y - 7 : block.y,
                                        width: block.orientation === 'horizontal' ? `${gridSizePx}px` : '14px',
                                        height: block.orientation === 'horizontal' ? '14px' : `${gridSizePx}px`,
                                        zIndex: 50,
                                        borderRadius: '7px',
                                        background: 'transparent',
                                    }}
                                    onMouseEnter={() => setHoveredBlock({ ...block, key: `extblock-${block.wall}-${block.idx}` })}
                                    onMouseLeave={() => setHoveredBlock(null)}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setSelectedBlock({ ...block, key: `extblock-${block.wall}-${block.idx}` });
                                        setShowElementPanel(true);
                                    }}
                                >
                                    {/* Если есть элемент — только элемент, иначе только толстый сегмент стены */}
                                    {hasElement
                                        ? renderWallElement(block)
                                        : (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: block.orientation === 'horizontal' ? 0 : '50%',
                                                    top: block.orientation === 'horizontal' ? '50%' : 0,
                                                    width: block.orientation === 'horizontal' ? '100%' : '14px',
                                                    height: block.orientation === 'horizontal' ? '14px' : '100%',
                                                    background: '#23272f',
                                                    transform: block.orientation === 'horizontal' ? 'translateY(-50%)' : 'translateX(-50%)',
                                                    borderRadius: 4,
                                                }}
                                            />
                                        )}
                                </div>
                         );
                    })}

                        {/* Блоки внутренних стен */}
                        {getInternalWallBlocks().map((block, idx) => {
                            const hasElement = elementsOnWalls.some(e =>
                                e.wall === block.wall && e.idx === block.idx && e.orientation === block.orientation
                            );
                            return (
                                <div
                                    key={`intblock-${idx}`}
                                    className={`absolute cursor-pointer transition-all duration-100 ${hoveredBlock && hoveredBlock.key === `intblock-${idx}` && !hasElement ? 'bg-blue-200/70' : ''}`}
                                    style={{
                                        left: block.orientation === 'vertical' ? block.x - 7 : block.x,
                                        top: block.orientation === 'horizontal' ? block.y - 7 : block.y,
                                        width: block.orientation === 'horizontal' ? `${gridSizePx}px` : '14px',
                                        height: block.orientation === 'horizontal' ? '14px' : `${gridSizePx}px`,
                                        zIndex: 20,
                                        borderRadius: '7px',
                                        background: 'transparent',
                                    }}
                                    onMouseEnter={() => setHoveredBlock({ ...block, key: `intblock-${idx}` })}
                                    onMouseLeave={() => setHoveredBlock(null)}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setSelectedBlock({ ...block, key: `intblock-${idx}` });
                                        setShowElementPanel(true);
                                    }}
                                >
                                    {/* Если есть элемент — только элемент, иначе только линия */}
                                    {hasElement
                                        ? renderWallElement(block)
                                        : (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: block.orientation === 'horizontal' ? 0 : '50%',
                                                    top: block.orientation === 'horizontal' ? '50%' : 0,
                                                    width: block.orientation === 'horizontal' ? '100%' : '4px',
                                                    height: block.orientation === 'horizontal' ? '4px' : '100%',
                                                    background: '#4B5563',
                                                    transform: block.orientation === 'horizontal' ? 'translateY(-50%)' : 'translateX(-50%)',
                                                    borderRadius: 2,
                                                }}
                                            />
                                        )}
                                </div>
                            );
                        })}

                        {/* Панель выбора элемента */}
                        {showElementPanel && selectedBlock && (
                            <ElementPanel
                                x={selectedBlock.x + (selectedBlock.orientation === 'vertical' ? 20 : gridSizePx / 2)}
                                y={selectedBlock.y + (selectedBlock.orientation === 'horizontal' ? 20 : gridSizePx / 2)}
                                onClose={() => setShowElementPanel(false)}
                            />
                        )}

                        {/* Плюсик для создания стены */}
                        {hoveredLine && (
                            <div
                                className="absolute w-6 h-6 flex items-center justify-center bg-blue-500 rounded-full text-white shadow-lg"
                                style={{
                                    left: hoveredLine.x - 12,
                                    top: hoveredLine.y - 12,
                                    pointerEvents: 'none',
                                    zIndex: 30
                                }}
                            >
                                <FaPlus className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Информация о размерах */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ширина:</span>
                        <span className="font-medium text-gray-800">6 м</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Глибина:</span>
                        <span className="font-medium text-gray-800">2 м</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Площа:</span>
                        <span className="font-medium text-gray-800">12.00 м²</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Кількість кімнат:</span>
                        <span className="font-medium text-gray-800">{internalWalls.length > 0 ? internalWalls.length + 1 : 1}</span>
                    </div>
                </div>
            </div>

            {/* Панель управления дверью */}
            {activeDoorId && (
                <DoorControlPanel doorId={activeDoorId} onClose={() => setActiveDoorId(null)} />
             )}
        </div>
    );
};

export default ModularMode;
