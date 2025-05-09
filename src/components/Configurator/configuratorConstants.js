// src/components/Configurator/configuratorConstants.js
import {
  DEFAULT_PANEL_WIDTH_M as APP_DEFAULT_PANEL_WIDTH_M,
  WALL_THICKNESS_M as APP_WALL_THICKNESS_M, 
  DOOR_WIDTH_M as APP_DOOR_WIDTH_M,
  WINDOW_WIDTH_M as APP_WINDOW_WIDTH_M,
  DEFAULT_MODULE_WIDTH_M,
  DEFAULT_MODULE_HEIGHT_M,
  INTERNAL_ELEMENT_SNAP_GRID_SIZE,
} from "./appConstants";


const ARCH_BLACK = "#0F172A"; 
const ARCH_DARK_GRAY = "#334155"; 
const ARCH_MID_GRAY = "#64748B"; 
const ARCH_LIGHT_GRAY = "#94A3B8"; 
const ARCH_VERY_LIGHT_GRAY = "#CBD5E1"; 
const ARCH_WHITE = "#F8FAFC"; 
const ARCH_SELECT_BLUE = "rgba(59, 130, 246, 0.9)"; 
const ARCH_CORRIDOR_STROKE = ARCH_DARK_GRAY;
const ARCH_INTERNAL_WALL_FILL = ARCH_WHITE; 
const ARCH_DOOR_LEAF_FILL = ARCH_WHITE;
const ARCH_DOOR_STROKE = ARCH_BLACK;
const ARCH_WINDOW_FRAME_STROKE = ARCH_BLACK;
const ARCH_WINDOW_GLAZING_STROKE = ARCH_MID_GRAY;
const ARCH_OUTLET_FILL = ARCH_WHITE;
const ARCH_OUTLET_STROKE = ARCH_BLACK;
const ARCH_HATCH_COLOR = ARCH_LIGHT_GRAY;
const ARCH_FURNITURE_FILL_LIGHT = ARCH_WHITE;
const ARCH_FURNITURE_FILL_MID = ARCH_VERY_LIGHT_GRAY;
const ARCH_FURNITURE_STROKE = ARCH_DARK_GRAY;

const ARCH_STROKE_THICK = 1.2;
const ARCH_STROKE_MEDIUM = 0.8;
const ARCH_STROKE_THIN = 0.5;
const ARCH_STROKE_VERY_THIN = 0.3;

export const PANEL_SIZE_M = APP_DEFAULT_PANEL_WIDTH_M;
export const INITIAL_PPM = 50;
export const GRID_LINE_COLOR = "rgba(100, 116, 139, 0.2)"; 
export const GRID_BOLD_LINE_COLOR = "rgba(100, 116, 139, 0.4)"; 
export const ORIGIN_POINT_COLOR = "transparent";
export const SNAP_THRESHOLD_WORLD = 0.05;
export const SNAP_LINE_COLOR = "rgba(59, 130, 246, 0.7)"; 
export const PASTE_OFFSET_M = 0.2;
export const MAX_HISTORY_SIZE = 50;
export const MARQUEE_FILL_COLOR = "rgba(59, 130, 246, 0.15)";
export const MARQUEE_STROKE_COLOR = "rgba(59, 130, 246, 0.6)";
export const MIN_ZOOM_SCALE = 0.1 * INITIAL_PPM; 
export const MAX_ZOOM_SCALE = 5 * INITIAL_PPM;   
export const MIN_DRAG_FOR_MARQUEE_PAN = 5;
export const RESIZE_HANDLE_SIZE_PX = 8;
export const RESIZE_HANDLE_COLOR = "rgba(59, 130, 246, 1)"; 
export const DIMENSION_TEXT_COLOR = ARCH_BLACK;
export const DIMENSION_TEXT_BG_COLOR = "rgba(255, 255, 255, 0.8)";
export const OVERLAP_HIGHLIGHT_COLOR = "rgba(255, 0, 0, 0.2)";
export const LOCKED_OBJECT_STROKE_COLOR = "orange";
export const DOOR_LEAF_VISUAL_THICKNESS_M = 0.04;
export const WALL_THICKNESS_M = APP_WALL_THICKNESS_M; 
export { INTERNAL_ELEMENT_SNAP_GRID_SIZE };
export const PLUS_BUTTON_COLOR = "#3B82F6"; 


export const PREVIEW_LINE_COLOR = "rgba(255, 165, 0, 0.7)";
export const PREVIEW_LINE_STROKE_WIDTH = 2;


export const objectColors = {
  panel: "rgba(203, 213, 225, 0.1)", 
  window: ARCH_BLACK,
  door: ARCH_BLACK,
  outlet: ARCH_BLACK,
  wall: "rgba(148, 163, 184, 0.15)", 
  partition: ARCH_INTERNAL_WALL_FILL, 
  default: ARCH_MID_GRAY,
  sofa: ARCH_WHITE,
  table: ARCH_WHITE,
  cabinet: ARCH_WHITE,
  toilet: ARCH_WHITE,
  bed: ARCH_WHITE,
  corridor: ARCH_CORRIDOR_STROKE,
  light_led: ARCH_BLACK,
  module: ARCH_WHITE,
  radiator: ARCH_LIGHT_GRAY,
  kitchen_unit: ARCH_MID_GRAY,
};

export const defaultObjectSizes = {
  panel: { width: PANEL_SIZE_M, height: PANEL_SIZE_M },
  window: { width: APP_WINDOW_WIDTH_M, height: APP_WALL_THICKNESS_M },
  door: { width: APP_DOOR_WIDTH_M, height: APP_WALL_THICKNESS_M },
  outlet: { width: 0.1, height: 0.1 },
  wall: { width: PANEL_SIZE_M, height: APP_WALL_THICKNESS_M }, 
  partition: { width: PANEL_SIZE_M, height: APP_WALL_THICKNESS_M }, 
  sofa: { width: 1.8, height: 0.8 },
  table: { width: 1.0, height: 0.5 },
  cabinet: { width: 0.8, height: 0.4 },
  toilet: { width: 0.4, height: 0.7 },
  bed: { width: 1.5, height: 2.0 },
  corridor: { width: 1.0, height: 0.01 }, 
  light_led: {width: 1.2, height: 0.15},
  module: { width: DEFAULT_MODULE_WIDTH_M, height: DEFAULT_MODULE_HEIGHT_M },
  radiator: { width: 0.8, height: 0.1 }, 
  kitchen_unit: { width: 1.5, height: 0.6 },
};

export const OBJECT_TYPES_TO_ADD = [
  { type: "wall", label: "Стена (внеш.)" }, 
  { type: "window", label: "Окно" },
  { type: "door", label: "Дверь" },
  { type: "outlet", label: "Розетка" },
  { type: "light_led", label: "Свет LED"},
  { type: "sofa", label: "Диван" },
  { type: "table", label: "Стол" },
  { type: "cabinet", label: "Шкаф" },
  { type: "bed", label: "Кровать" },
  { type: "toilet", label: "Туалет" },
  { type: "radiator", label: "Радиатор"},
  { type: "kitchen_unit", label: "Кух. блок"},
];

export const INTERNAL_DRAWING_TYPES = {
    PARTITION: 'partition',
    CORRIDOR: 'corridor',
};

export {
    ARCH_BLACK,
    ARCH_DARK_GRAY,
    ARCH_MID_GRAY,
    ARCH_LIGHT_GRAY,
    ARCH_VERY_LIGHT_GRAY,
    ARCH_WHITE,
    ARCH_SELECT_BLUE,
    ARCH_STROKE_THICK,
    ARCH_STROKE_MEDIUM,
    ARCH_STROKE_THIN,
    ARCH_STROKE_VERY_THIN,
    ARCH_CORRIDOR_STROKE,
    ARCH_DOOR_LEAF_FILL,
    ARCH_DOOR_STROKE,
    ARCH_WINDOW_FRAME_STROKE,
    ARCH_WINDOW_GLAZING_STROKE,
    ARCH_FURNITURE_FILL_LIGHT,
    ARCH_FURNITURE_FILL_MID,
    ARCH_FURNITURE_STROKE,
    ARCH_OUTLET_FILL,
    ARCH_OUTLET_STROKE,
    ARCH_HATCH_COLOR,
    ARCH_INTERNAL_WALL_FILL,
};