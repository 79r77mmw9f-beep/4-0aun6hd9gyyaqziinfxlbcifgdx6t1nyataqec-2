/**
 * LIVING CITY - Core Constants
 */

export const TILE_SIZE = 32;

// Map grid dimensions (32 tiles wide, 24 tiles high = 1024 x 768 px)
export const MAP_COLS = 32;
export const MAP_ROWS = 24;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE; // 1024 px
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE; // 768 px

// Player movement parameters
export const PLAYER_WALK_SPEED = 140; // pixels per second
export const PLAYER_RUN_SPEED = 220; // pixels per second
export const PLAYER_WIDTH = 22;
export const PLAYER_HEIGHT = 22;

// Tile types
export const TILE_TYPES = {
  EMPTY: 0,
  ASPHALT: 1,
  SIDEWALK: 2,
  CROSSWALK: 3,
  ROAD_MARKING: 4,
  BUILDING_WALL: 10,
  BUILDING_ROOF: 11,
  BOLLARD: 20,
  SURPRISE_WINDOW: 30
};

// Color palette (from ART_BIBLE.md)
export const PALETTE = {
  ASPHALT: '#181b22',
  ROAD_MARKING: '#e5b839',
  ROAD_MARKING_WHITE: '#d8dee9',
  SIDEWALK: '#333946',
  SIDEWALK_LINE: '#3e4656',
  BUILDING_ROOF: '#20242c',
  BUILDING_WALL: '#3d4452',
  BUILDING_LIP: '#576075',
  BOLLARD: '#bf616a',
  BOLLARD_CAP: '#eceff4',
  PLAYER_JACKET: '#00e5ff',
  PLAYER_SILHOUETTE: '#eceff4',
  PLAYER_SHADOW: 'rgba(0, 0, 0, 0.45)',
  WINDOW_OFF: '#232832',
  WINDOW_TV_BASE: '#5e81ac',
  WINDOW_TV_GLOW: 'rgba(136, 192, 208, 0.75)',
  ACCENT_RED: '#bf616a',
  ACCENT_GREEN: '#a3be8c',
  HUD_BG: 'rgba(18, 20, 26, 0.88)',
  HUD_TEXT: '#eceff4',
  HUD_ACCENT: '#88c0d0'
};
