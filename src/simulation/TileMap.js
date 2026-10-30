/**
 * LIVING CITY - City TileMap Layout & Spatial Grid
 * Standard 32x32 pixel tiles representing urban geometry.
 */

import {
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  TILE_TYPES
} from '../core/Constants.js';

export class TileMap {
  constructor() {
    this.cols = MAP_COLS;
    this.rows = MAP_ROWS;
    this.tileSize = TILE_SIZE;
    this.width = WORLD_WIDTH;
    this.height = WORLD_HEIGHT;

    // 2D grid array [row][col]
    this.grid = [];
    this.collidableTiles = new Set([
      TILE_TYPES.BUILDING_WALL,
      TILE_TYPES.BUILDING_ROOF,
      TILE_TYPES.BOLLARD
    ]);

    this.surpriseWindowPos = { col: 14, row: 2 };
    this.generateMap();
  }

  generateMap() {
    // 1. Initialize grid with sidewalk as baseline urban ground
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = new Array(this.cols).fill(TILE_TYPES.SIDEWALK);
      this.grid.push(row);
    }

    // 2. Outer solid perimeter borders (prevents leaving map)
    for (let c = 0; c < this.cols; c++) {
      this.grid[0][c] = TILE_TYPES.BUILDING_WALL;
      this.grid[this.rows - 1][c] = TILE_TYPES.BUILDING_WALL;
    }
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.BUILDING_WALL;
      this.grid[r][this.cols - 1] = TILE_TYPES.BUILDING_WALL;
    }

    // 3. Horizontal Main Avenue (Rows 13, 14, 15)
    for (let r = 13; r <= 15; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        this.grid[r][c] = TILE_TYPES.ASPHALT;
      }
    }

    // 4. Vertical Cross Street (Cols 8, 9)
    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 8; c <= 9; c++) {
        this.grid[r][c] = TILE_TYPES.ASPHALT;
      }
    }

    // 5. Crosswalks at intersections
    // Across Avenue at vertical street (Cols 7 & 10)
    for (let r = 13; r <= 15; r++) {
      this.grid[r][7] = TILE_TYPES.CROSSWALK;
      this.grid[r][10] = TILE_TYPES.CROSSWALK;
    }
    // Across vertical street at Avenue (Rows 12 & 16)
    for (let c = 8; c <= 9; c++) {
      this.grid[12][c] = TILE_TYPES.CROSSWALK;
      this.grid[16][c] = TILE_TYPES.CROSSWALK;
    }

    // East Crosswalk on Avenue (Cols 24 & 25)
    for (let r = 13; r <= 15; r++) {
      this.grid[r][24] = TILE_TYPES.CROSSWALK;
    }

    // 6. Northwest Commercial Building (Cols 2 to 6, Rows 2 to 9)
    for (let r = 2; r <= 9; r++) {
      for (let c = 2; c <= 6; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_WALL;
      }
    }
    // Commercial building roof top section
    for (let r = 3; r <= 8; r++) {
      for (let c = 3; c <= 5; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_ROOF;
      }
    }

    // 7. Northeast Residential Block (Cols 12 to 21, Rows 3 to 9)
    // Walkable alley left at Row 1 and 2
    for (let r = 3; r <= 9; r++) {
      for (let c = 12; c <= 21; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_WALL;
      }
    }
    for (let r = 4; r <= 8; r++) {
      for (let c = 13; c <= 20; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_ROOF;
      }
    }

    // Phase 1 Surprise Window on North Wall of Residential Block
    // Located at (Col 14, Row 2) facing the northern alley
    this.grid[this.surpriseWindowPos.row][this.surpriseWindowPos.col] = TILE_TYPES.SURPRISE_WINDOW;

    // 8. Northeast Parking/Service Yard (Cols 24 to 29, Rows 3 to 9)
    // Asphalt surface
    for (let r = 3; r <= 9; r++) {
      for (let c = 24; c <= 29; c++) {
        this.grid[r][c] = TILE_TYPES.ASPHALT;
      }
    }
    // Bollards lining the parking perimeter
    this.grid[3][24] = TILE_TYPES.BOLLARD;
    this.grid[3][27] = TILE_TYPES.BOLLARD;
    this.grid[9][24] = TILE_TYPES.BOLLARD;
    this.grid[9][27] = TILE_TYPES.BOLLARD;

    // 9. Southwest Industrial Warehouse (Cols 2 to 6, Rows 18 to 21)
    for (let r = 18; r <= 21; r++) {
      for (let c = 2; c <= 6; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_WALL;
      }
    }
    for (let r = 19; r <= 20; r++) {
      for (let c = 3; c <= 5; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_ROOF;
      }
    }

    // 10. Southeast Plaza & Diner (Cols 13 to 22, Rows 18 to 21)
    for (let r = 18; r <= 21; r++) {
      for (let c = 13; c <= 22; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_WALL;
      }
    }
    for (let r = 19; r <= 20; r++) {
      for (let c = 14; c <= 21; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_ROOF;
      }
    }

    // Bollards along southeast sidewalk border
    this.grid[17][14] = TILE_TYPES.BOLLARD;
    this.grid[17][18] = TILE_TYPES.BOLLARD;
    this.grid[17][22] = TILE_TYPES.BOLLARD;
  }

  getTile(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return TILE_TYPES.BUILDING_WALL; // Out of bounds is collidable
    }
    return this.grid[row][col];
  }

  isCollidable(col, row) {
    const tile = this.getTile(col, row);
    return this.collidableTiles.has(tile);
  }

  /**
   * Returns all collidable AABBs overlapping or near a query bounding box.
   */
  getNearbyObstacles(box) {
    const obstacles = [];
    const minCol = Math.max(0, Math.floor(box.x / this.tileSize) - 1);
    const maxCol = Math.min(this.cols - 1, Math.floor((box.x + box.width) / this.tileSize) + 1);
    const minRow = Math.max(0, Math.floor(box.y / this.tileSize) - 1);
    const maxRow = Math.min(this.rows - 1, Math.floor((box.y + box.height) / this.tileSize) + 1);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (this.isCollidable(c, r)) {
          obstacles.push({
            x: c * this.tileSize,
            y: r * this.tileSize,
            width: this.tileSize,
            height: this.tileSize,
            tileType: this.grid[r][c]
          });
        }
      }
    }

    return obstacles;
  }

  /**
   * Safe spawn location in the central plaza sidewalk.
   */
  getDefaultSpawnPosition() {
    return {
      x: 10 * this.tileSize + 16, // Near intersection sidewalk
      y: 11 * this.tileSize + 16
    };
  }
}
