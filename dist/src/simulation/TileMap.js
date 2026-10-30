/**
 * LIVING CITY - City TileMap Layout & Spatial Grid
 * Expanded for Phase 2: Distinct urban landmarks, greenery park, cracked asphalt,
 * store canopies with interior occlusion, and accurate colliders.
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
      TILE_TYPES.BOLLARD,
      TILE_TYPES.TREE,
      TILE_TYPES.LANDMARK_SHOP,
      TILE_TYPES.LANDMARK_REPAIR,
      TILE_TYPES.LANDMARK_POLICE
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

    // 6. Northern service alley with cracked asphalt (Row 1, Cols 10 to 22)
    for (let c = 10; c <= 22; c++) {
      this.grid[1][c] = TILE_TYPES.ASPHALT_CRACKED;
    }

    // 7. LANDMARK 1: Corner Bodega / 24-7 Market (Cols 2 to 6, Rows 4 to 8)
    for (let r = 4; r <= 8; r++) {
      for (let c = 2; c <= 6; c++) {
        this.grid[r][c] = TILE_TYPES.LANDMARK_SHOP;
      }
    }
    // Roof section of bodega
    for (let r = 4; r <= 7; r++) {
      for (let c = 3; c <= 5; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_ROOF;
      }
    }
    // Entrance canopy / striped awning at Row 9, Cols 3, 4 (Walkable with occlusion!)
    this.grid[9][3] = TILE_TYPES.BUILDING_CANOPY;
    this.grid[9][4] = TILE_TYPES.BUILDING_CANOPY;

    // 8. Residential Tenement Block with Surprise Window (Cols 12 to 21, Rows 3 to 9)
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
    this.grid[this.surpriseWindowPos.row][this.surpriseWindowPos.col] = TILE_TYPES.SURPRISE_WINDOW;

    // 9. LANDMARK 2: Redline Auto Repair & Parking Lot (Cols 24 to 30, Rows 3 to 9)
    for (let r = 4; r <= 8; r++) {
      for (let c = 25; c <= 29; c++) {
        this.grid[r][c] = TILE_TYPES.LANDMARK_REPAIR;
      }
    }
    for (let r = 5; r <= 7; r++) {
      for (let c = 26; c <= 28; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_ROOF;
      }
    }
    // Parking stalls with marked parking bays (Cols 23 to 30, Rows 10 to 11)
    for (let r = 10; r <= 11; r++) {
      for (let c = 24; c <= 29; c++) {
        this.grid[r][c] = TILE_TYPES.PARKING_BAY;
      }
    }
    // Bollards around parking area
    this.grid[10][23] = TILE_TYPES.BOLLARD;
    this.grid[11][23] = TILE_TYPES.BOLLARD;
    this.grid[10][30] = TILE_TYPES.BOLLARD;
    this.grid[11][30] = TILE_TYPES.BOLLARD;

    // 10. LANDMARK 3: Precinct 4 Police Substation (Cols 2 to 6, Rows 18 to 22)
    for (let r = 18; r <= 22; r++) {
      for (let c = 2; c <= 6; c++) {
        this.grid[r][c] = TILE_TYPES.LANDMARK_POLICE;
      }
    }
    for (let r = 19; r <= 21; r++) {
      for (let c = 3; c <= 5; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_ROOF;
      }
    }

    // 11. LANDMARK 4: Pocket Park with Greenery & Trees (Cols 12 to 21, Rows 18 to 22)
    for (let r = 18; r <= 22; r++) {
      for (let c = 12; c <= 21; c++) {
        this.grid[r][c] = TILE_TYPES.GREENERY;
      }
    }
    // Park walkways
    for (let c = 12; c <= 21; c++) {
      this.grid[20][c] = TILE_TYPES.SIDEWALK;
    }
    for (let r = 18; r <= 22; r++) {
      this.grid[r][16] = TILE_TYPES.SIDEWALK;
    }
    // Park Trees (solid trunk collider)
    this.grid[19][13] = TILE_TYPES.TREE;
    this.grid[19][19] = TILE_TYPES.TREE;
    this.grid[21][14] = TILE_TYPES.TREE;
    this.grid[21][18] = TILE_TYPES.TREE;

    // 12. Southeast Industrial Block (Cols 24 to 29, Rows 18 to 22)
    for (let r = 18; r <= 22; r++) {
      for (let c = 24; c <= 29; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_WALL;
      }
    }
    for (let r = 19; r <= 21; r++) {
      for (let c = 25; c <= 28; c++) {
        this.grid[r][c] = TILE_TYPES.BUILDING_ROOF;
      }
    }
  }

  getTile(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return TILE_TYPES.BUILDING_WALL;
    }
    return this.grid[row][col];
  }

  isCollidable(col, row) {
    const tile = this.getTile(col, row);
    return this.collidableTiles.has(tile);
  }

  /**
   * Checks if a point in world coordinates is under a building canopy or awning.
   */
  isUnderCanopy(worldX, worldY) {
    const col = Math.floor(worldX / this.tileSize);
    const row = Math.floor(worldY / this.tileSize);
    return this.getTile(col, row) === TILE_TYPES.BUILDING_CANOPY;
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
          // Tree collider is specifically its centered trunk (16x16) for realistic navigation around foliage
          if (this.grid[r][c] === TILE_TYPES.TREE) {
            obstacles.push({
              x: c * this.tileSize + 8,
              y: r * this.tileSize + 8,
              width: 16,
              height: 16,
              tileType: TILE_TYPES.TREE
            });
          } else {
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
    }

    return obstacles;
  }

  getDefaultSpawnPosition() {
    return {
      x: 10 * this.tileSize + 16, // Central sidewalk near crosswalk
      y: 11 * this.tileSize + 16
    };
  }
}
