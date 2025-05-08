// src/components/Configurator/configuratorConstants.js
import {
  DEFAULT_PANEL_WIDTH_M as APP_DEFAULT_PANEL_WIDTH_M,
  WALL_THICKNESS_M as APP_WALL_THICKNESS_M,
  DOOR_WIDTH_M as APP_DOOR_WIDTH_M,
  WINDOW_WIDTH_M as APP_WINDOW_WIDTH_M,
} from "./appConstants"; // Assuming appConstants.js is in the parent directory

export const PANEL_SIZE_M = APP_DEFAULT_PANEL_WIDTH_M;
export const INITIAL_PPM = 50;
export const GRID_LINE_COLOR = "#e0e0e0";
export const GRID_BOLD_LINE_COLOR = "#c0c0c0";
export const ORIGIN_POINT_COLOR = "transparent";
export const SNAP_THRESHOLD_WORLD = 0.05;
export const SNAP_LINE_COLOR = "rgba(255, 0, 255, 0.7)";
export const PASTE_OFFSET_M = 0.2;
export const MAX_HISTORY_SIZE = 50;
export const MARQUEE_FILL_COLOR = "rgba(0, 100, 255, 0.1)";
export const MARQUEE_STROKE_COLOR = "rgba(0, 100, 255, 0.5)";
export const MIN_DRAG_FOR_MARQUEE_PAN = 5;
export const RESIZE_HANDLE_SIZE_PX = 8;
export const RESIZE_HANDLE_COLOR = "rgba(0, 100, 255, 0.8)";
export const DIMENSION_TEXT_COLOR = "black";
export const DIMENSION_TEXT_BG_COLOR = "rgba(255, 255, 255, 0.7)";
export const OVERLAP_HIGHLIGHT_COLOR = "rgba(255, 0, 0, 0.3)";
export const LOCKED_OBJECT_STROKE_COLOR = "orange";
export const DOOR_LEAF_VISUAL_THICKNESS_M = 0.05; // Should be in meters for consistency with object dimensions

export const objectColors = {
  panel: "lightgray",
  window: "lightblue",
  door: "#D2B48C",
  outlet: "yellow",
  wall: "#A0AEC0",
  default: "purple",
  sofa: "#DEB887",
  table: "#A0522D",
  cabinet: "#D2691E",
  toilet: "#F5F5F5",
  bed: "#CD853F",
};

export const defaultObjectSizes = {
  panel: { width: PANEL_SIZE_M, height: PANEL_SIZE_M },
  window: { width: APP_WINDOW_WIDTH_M, height: APP_WALL_THICKNESS_M },
  door: { width: APP_DOOR_WIDTH_M, height: APP_WALL_THICKNESS_M },
  outlet: { width: 0.15, height: 0.15 },
  wall: { width: PANEL_SIZE_M, height: APP_WALL_THICKNESS_M },
  sofa: { width: 1.8, height: 0.8 },
  table: { width: 1.0, height: 0.5 },
  cabinet: { width: 0.8, height: 0.4 },
  toilet: { width: 0.4, height: 0.7 },
  bed: { width: 1.5, height: 2.0 },
};

export const OBJECT_TYPES_TO_ADD = [
  { type: "wall", label: "Стена" },
  { type: "panel", label: "Панель" },
  { type: "window", label: "Окно" },
  { type: "door", label: "Дверь" },
  { type: "outlet", label: "Розетка" },
  { type: "sofa", label: "Диван" },
  { type: "table", label: "Стол" },
  { type: "cabinet", label: "Шкаф" },
  { type: "bed", label: "Кровать" },
  { type: "toilet", label: "Туалет" },
];
