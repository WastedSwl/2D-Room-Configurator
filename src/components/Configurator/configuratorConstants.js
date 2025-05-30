import { generateId } from './configuratorUtils';

export const INITIAL_PPM = 50;
export const GRID_CELL_SIZE_M = 1.2;
export const GRID_LINE_COLOR = "rgba(100, 116, 139, 0.2)";
export const GRID_BOLD_LINE_COLOR = "rgba(100, 116, 139, 0.4)";
export const ORIGIN_POINT_COLOR = "transparent";
export const MIN_ZOOM_SCALE = 0.1 * INITIAL_PPM;
export const MAX_ZOOM_SCALE = 5 * INITIAL_PPM;
export const MODES = {
  MODULAR: "modular",
  FRAME: "frame",
  FRAMELESS: "frameless",
};

export const OBJECT_TYPES = {
  MODULE: "module",
  WALL_SEGMENT: "wall_segment",
  DOOR: "door",
  WINDOW: "window",
  PANORAMIC_WINDOW: "panoramic_window",
  OUTLET: "outlet", // Розетка (одинарная)
  LIGHT_CEILING: "light_ceiling",
  LIGHT_WALL: "light_wall",
  SWITCH: "switch", // Выключатель (одинарный)
  SWITCH_DOUBLE: "switch_double", // Выключатель (двойной)
  // Убраны RADIATOR и KITCHEN_ELEMENT из основных типов для размещения через панель
  RADIATOR: "radiator", // Оставляем тип для совместимости, но убираем из панели выбора
  KITCHEN_ELEMENT: "kitchen_element", // Оставляем тип, но убираем из панели выбора

  PLACEMENT_TYPE_WALL: "wall",
  PLACEMENT_TYPE_FLOOR: "floor",
  PLACEMENT_TYPE_CEILING: "ceiling",
};

export const DEFAULT_MODULE_CELLS_WIDE = 2;
export const DEFAULT_MODULE_CELLS_LONG = 5;

export const MODULE_DEFAULT_WIDTH =
DEFAULT_MODULE_CELLS_WIDE * GRID_CELL_SIZE_M;
export const MODULE_DEFAULT_LENGTH =
DEFAULT_MODULE_CELLS_LONG * GRID_CELL_SIZE_M;

export const defaultObjectSizes = {
  [OBJECT_TYPES.DOOR]: { width: 0.9, height: 2.1, depth: 0.15, actualDoorThickness: 0.04 },
  [OBJECT_TYPES.WINDOW]: { width: GRID_CELL_SIZE_M, height: 1.0, depth: 0.15 },
  [OBJECT_TYPES.PANORAMIC_WINDOW]: { width: GRID_CELL_SIZE_M * 1.8, height: 1.8, depth: 0.15 },
  [OBJECT_TYPES.OUTLET]: { width: 0.08, height: 0.08, depth: 0.025 }, // глубина розетки
  [OBJECT_TYPES.LIGHT_CEILING]: { width: 0.6, height: 0.1, depth: 0.05 }, // Ширина и "длина" на потолке для LED панели
  [OBJECT_TYPES.LIGHT_WALL]: { width: 0.6, height: 0.1, depth: 0.05 }, // Ширина и высота настенного LED
  [OBJECT_TYPES.SWITCH]: { width: 0.08, height: 0.08, depth: 0.025 },
  [OBJECT_TYPES.SWITCH_DOUBLE]: { width: 0.15, height: 0.08, depth: 0.025 }, // Двойной чуть шире
  // Размеры для убранных элементов (для обратной совместимости, если они есть в сохраненных проектах)
  [OBJECT_TYPES.RADIATOR]: { width: 0.8, height: 0.5, depth: 0.1 },
  [OBJECT_TYPES.KITCHEN_ELEMENT]: { width: GRID_CELL_SIZE_M, height: 0.8, depth: 0.6 },
};

// Имена файлов SVG как они есть в Assets (после удаления пробелов если были)
const SVG_ICON_NAMES = {
    DOOR: "DoorSvg", // Имя для сопоставления с импортированным компонентом
    WINDOW: "WindowSvg",
    OUTLET: "SocketX1Svg",
    LED_LIGHT: "LedSvg",
    SWITCH_X1: "SwitchX1Svg",
    SWITCH_X2: "SwitchX2Svg",
};


export const OBJECT_ELEMENT_CATEGORIES = [
  {
    title: "Двери и Окна",
    items: [
      { type: OBJECT_TYPES.DOOR, label: "Дверь", placement: OBJECT_TYPES.PLACEMENT_TYPE_WALL, icon: SVG_ICON_NAMES.DOOR },
      { type: OBJECT_TYPES.WINDOW, label: "Окно (1.2м)", placement: OBJECT_TYPES.PLACEMENT_TYPE_WALL, icon: SVG_ICON_NAMES.WINDOW },
      { type: OBJECT_TYPES.PANORAMIC_WINDOW, label: "Окно панорамное", placement: OBJECT_TYPES.PLACEMENT_TYPE_WALL, icon: SVG_ICON_NAMES.WINDOW },
    ],
  },
  {
    title: "Электрика",
    items: [
      { type: OBJECT_TYPES.OUTLET, label: "Розетка", placement: OBJECT_TYPES.PLACEMENT_TYPE_WALL, icon: SVG_ICON_NAMES.OUTLET },
      { type: OBJECT_TYPES.SWITCH, label: "Выключатель", placement: OBJECT_TYPES.PLACEMENT_TYPE_WALL, icon: SVG_ICON_NAMES.SWITCH_X1 },
      { type: OBJECT_TYPES.SWITCH_DOUBLE, label: "Выключатель двойной", placement: OBJECT_TYPES.PLACEMENT_TYPE_WALL, icon: SVG_ICON_NAMES.SWITCH_X2 },
      { type: OBJECT_TYPES.LIGHT_WALL, label: "Светильник настенный", placement: OBJECT_TYPES.PLACEMENT_TYPE_WALL, icon: SVG_ICON_NAMES.LED_LIGHT },
      { type: OBJECT_TYPES.LIGHT_CEILING, label: "Светильник потолочный", placement: OBJECT_TYPES.PLACEMENT_TYPE_CEILING, icon: SVG_ICON_NAMES.LED_LIGHT },
    ],
  },
  // Категории "Оборудование и Климат" и "Мебель и Кухня" убраны, так как Radiator и KitchenElement не имеют SVG
];

const TEMPLATE_STANDARD_NAME_SUFFIX = `(${DEFAULT_MODULE_CELLS_LONG * GRID_CELL_SIZE_M}м x ${DEFAULT_MODULE_CELLS_WIDE * GRID_CELL_SIZE_M}м)`;

export const WALL_THICKNESS_M_RENDER = 0.15;
export const DOCKED_SPLIT_WALL_THICKNESS_M = 0.05;
export const DOCKED_SPLIT_WALL_OFFSET_M = 0.03;

export const MODULE_TEMPLATES = [
  {
    category: "Базовые и служебные",
    id: "empty_module_2x5",
    name: `Пустой модуль ${TEMPLATE_STANDARD_NAME_SUFFIX}`,
    cellsWide: DEFAULT_MODULE_CELLS_WIDE,
    cellsLong: DEFAULT_MODULE_CELLS_LONG,
    label: `Пустой`,
    internalWallSegments: {},
    predefinedElements: [],
    freeElements: [],
  },
  {
    category: "Базовые и служебные",
    id: "corridor_passage_2x5",
    name: `Коридор проходной ${TEMPLATE_STANDARD_NAME_SUFFIX}`,
    cellsWide: DEFAULT_MODULE_CELLS_WIDE,
    cellsLong: DEFAULT_MODULE_CELLS_LONG,
    label: "Коридор (проход)",
    internalWallSegments: {},
    predefinedElements: [],
    freeElements: [
      { id: generateId("light_"), type: OBJECT_TYPES.LIGHT_CEILING, x: GRID_CELL_SIZE_M * 0.5, y: GRID_CELL_SIZE_M * 1.5 },
      { id: generateId("light_"), type: OBJECT_TYPES.LIGHT_CEILING, x: GRID_CELL_SIZE_M * 0.5, y: GRID_CELL_SIZE_M * 3.5 },
    ]
  },
  {
    category: "Готовые планировки (одиночные)",
    id: "guest_house_studio_2x5",
    name: `Мини-студия (гостевая) ${TEMPLATE_STANDARD_NAME_SUFFIX}`,
    cellsWide: DEFAULT_MODULE_CELLS_WIDE,
    cellsLong: DEFAULT_MODULE_CELLS_LONG,
    label: "Мини-студия",
    internalWallSegments: {
      "1,0_v": { thickness: WALL_THICKNESS_M_RENDER },
      "1,1_v": { thickness: WALL_THICKNESS_M_RENDER },
      "0,2_h": { thickness: WALL_THICKNESS_M_RENDER },
    },
    predefinedElements: [
      { type: OBJECT_TYPES.DOOR, segmentKey: `0,0_v`, properties: { positionOnSegment: 0.5, width: 0.9, openingDirection: "inward", hingeSide: "right" } },
      { type: OBJECT_TYPES.DOOR, segmentKey: `1,1_v`, properties: { positionOnSegment: 0.5, width: 0.7, openingDirection: "inward", hingeSide: "left" } },
      { type: OBJECT_TYPES.WINDOW, segmentKey: `1,0_h`, properties: { positionOnSegment: 0.5, width: GRID_CELL_SIZE_M*0.6, height: 0.6 } },
      { type: OBJECT_TYPES.PANORAMIC_WINDOW, segmentKey: `0,${DEFAULT_MODULE_CELLS_LONG-1}_h`, properties: { positionOnSegment: 0.5, width: GRID_CELL_SIZE_M * 1.8 } },
      { type: OBJECT_TYPES.OUTLET, segmentKey: `0,2_v`, properties: { positionOnSegment: 0.7 } },
      { type: OBJECT_TYPES.LIGHT_WALL, segmentKey: `0,3_v`, properties: { positionOnSegment: 0.3 }}
    ],
    freeElements: [
      { id: generateId("light_"), type: OBJECT_TYPES.LIGHT_CEILING, x: GRID_CELL_SIZE_M * 0.5, y: GRID_CELL_SIZE_M * 3.5 },
      { id: generateId("light_"), type: OBJECT_TYPES.LIGHT_CEILING, x: GRID_CELL_SIZE_M * 1.5, y: GRID_CELL_SIZE_M * 0.5 },
    ]
  },
];

export const DRAWING_WALL_FILL_COLOR = "#F5F5F5";
export const DRAWING_WALL_STROKE_COLOR = "#333333";
export const DRAWING_WALL_STROKE_WIDTH = 1;

export const DRAWING_PORTAL_JAMB_FILL_COLOR = "#E0E0E0";
export const DRAWING_PORTAL_JAMB_STROKE_COLOR = "#666666";

export const DRAWING_DOOR_FILL_COLOR = "#000000";
export const DRAWING_DOOR_STROKE_COLOR = "#222222";
export const DRAWING_DOOR_JAMB_FILL_COLOR = "#DCDCDC";
export const DRAWING_DOOR_SWING_COLOR = "#555555";
export const DRAWING_DOOR_STROKE_WIDTH = 1;

export const DRAWING_WINDOW_FRAME_COLOR = "#444444";
export const DRAWING_WINDOW_GLASS_LINE_COLOR = "#777777";
export const DRAWING_WINDOW_STROKE_WIDTH = 0.75;
export const DRAWING_PANORAMIC_WINDOW_FILL_COLOR = "rgba(173, 216, 230, 0.3)";

export const DRAWING_OUTLET_FILL_COLOR = "#E0E0E0";
export const DRAWING_OUTLET_STROKE_COLOR = "#757575";
export const DRAWING_LIGHT_FILL_COLOR = "#FFF9C4";
export const DRAWING_LIGHT_STROKE_COLOR = "#FBC02D";
export const DRAWING_RADIATOR_FILL_COLOR = "#CFD8DC";
export const DRAWING_RADIATOR_STROKE_COLOR = "#78909C";
export const DRAWING_KITCHEN_ELEMENT_FILL_COLOR = "#BCAAA4";
export const DRAWING_KITCHEN_ELEMENT_STROKE_COLOR = "#5D4037";

export const SELECTED_ELEMENT_COLOR = "#007BFF";
export const PLACEMENT_HIGHLIGHT_FILL_COLOR = "rgba(0, 255, 0, 0.3)";
export const PLACEMENT_NOT_ALLOWED_FILL_COLOR = "rgba(255, 0, 0, 0.3)";
export const PLACEMENT_GENERAL_HIGHLIGHT_FILL_COLOR = "rgba(255, 223, 0, 0.25)";

export const POTENTIAL_WALL_SLOT_COLOR = "rgba(0, 123, 255, 0.3)";

export const EPSILON = 0.01;

export const SELECTED_WALL_SEGMENT_COLOR = "#007BFF";
export const ELEMENT_STROKE_COLOR = "#333333";