// src/components/Configurator/constants.js
export const MODES = {
  MODULAR: 'modular',
  FRAMELESS: 'frameless',
  FRAMED: 'framed',
};

export const DEFAULT_MODE = MODES.MODULAR;

export const DEFAULT_MODULAR_WIDTH = 6000; // mm
export const DEFAULT_MODULAR_DEPTH = 2400; // mm
export const DEFAULT_PANEL_WIDTH = 1150; // mm
export const DOOR_WIDTH_MM = 900;
export const DOUBLE_DOOR_WIDTH_MM = 1800;
export const DEFAULT_WINDOW_WIDTH_MM = 1200;

export const RENDER_SCALE = 0.1;
export const EXTERNAL_WALL_THICKNESS_MM = 150;
export const EXTERNAL_WALL_THICKNESS_PX = EXTERNAL_WALL_THICKNESS_MM * RENDER_SCALE;
export const DOOR_LEAF_THICKNESS_MM = 40;
export const DOOR_LEAF_THICKNESS_PX = DOOR_LEAF_THICKNESS_MM * RENDER_SCALE;

export const DOOR_HANDLE_SIZE_PX = 6; // Adjusted from original project for relative size
export const DOOR_HANDLE_OFFSET_FROM_EDGE_PX = 10; // Offset of handle from the swinging edge of the door leaf
export const HINGE_OFFSET_FACTOR = 0.5; // How far into wall thickness hinge is. 0.5 = center. (Used by caller of ElementRenderer)

export const GRID_PANEL_WIDTH_PX = DEFAULT_PANEL_WIDTH * RENDER_SCALE;
export const ACCESSORY_SIZE_PX = 20; // Base size for accessory icons in px before dynamic scaling

// Constants for ModularMode specific calculations
export const WALL_THICKNESS_MM_MODULAR = 150; // Specific to modular mode walls if different from external
export const WALL_THICKNESS_PX_MODULAR = WALL_THICKNESS_MM_MODULAR * RENDER_SCALE;
export const COLLISION_BUFFER_PX_MODULAR = 2 * RENDER_SCALE;