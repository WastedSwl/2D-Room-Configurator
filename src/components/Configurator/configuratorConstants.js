// src/components/Configurator/configuratorConstants.js
export const INITIAL_PPM = 50;
export const GRID_CELL_SIZE_M = 1.15;
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
  OUTLET: "outlet",
  RADIATOR: "radiator",
  LIGHT_LED: "light_led",
  KITCHEN_UNIT: "kitchen_unit",
};
export const MODULE_DEFAULT_CELLS_WIDE = 2;
export const MODULE_DEFAULT_CELLS_LONG = 5;
export const MODULE_DEFAULT_WIDTH =
  MODULE_DEFAULT_CELLS_WIDE * GRID_CELL_SIZE_M;
export const MODULE_DEFAULT_LENGTH =
  MODULE_DEFAULT_CELLS_LONG * GRID_CELL_SIZE_M;
export const defaultObjectSizes = {
  [OBJECT_TYPES.DOOR]: { width: 0.9, height: 2.1, depth: 0.15 },
  [OBJECT_TYPES.WINDOW]: { width: 1.0, height: 1.0, depth: 0.15 },
  [OBJECT_TYPES.OUTLET]: { width: 0.08, height: 0.08, depth: 0.05 },
  [OBJECT_TYPES.RADIATOR]: { width: 1.0, height: 0.6, depth: 0.1 },
  [OBJECT_TYPES.LIGHT_LED]: { width: 1.0, height: 0.05, depth: 0.05 },
  [OBJECT_TYPES.KITCHEN_UNIT]: { width: 0.6, height: 0.85, depth: 0.6 },
};
export const OBJECT_TYPES_TO_ADD = [
  { type: OBJECT_TYPES.DOOR, label: "Дверь" },
  { type: OBJECT_TYPES.WINDOW, label: "Окно" },
  { type: OBJECT_TYPES.OUTLET, label: "Розетка" },
  { type: OBJECT_TYPES.LIGHT_LED, label: "Светильник (LED)" },
  { type: OBJECT_TYPES.RADIATOR, label: "Радиатор" },
];
export const WALL_COLOR = "#A0A0A0";
export const WALL_THICKNESS_M_RENDER = 0.15;
export const SELECTED_WALL_SEGMENT_COLOR = "#007BFF";
export const POTENTIAL_WALL_SLOT_COLOR = "rgba(0, 123, 255, 0.3)";
export const DOOR_COLOR = "#AE8A6F";
export const WINDOW_COLOR = "#87CEFA";
export const ELEMENT_STROKE_COLOR = "#333333";