import test from 'node:test';
import assert from 'node:assert/strict';
import { TileMap } from '../../src/simulation/TileMap.js';
import { TILE_TYPES, TILE_SIZE } from '../../src/core/Constants.js';

test('TileMap: landmark tile generation', () => {
  const map = new TileMap();

  // Corner Bodega (Shop) at col 4, row 5
  assert.equal(map.getTile(4, 5), TILE_TYPES.BUILDING_ROOF);
  assert.equal(map.getTile(2, 5), TILE_TYPES.LANDMARK_SHOP);

  // Redline Auto Repair at col 26, row 5
  assert.equal(map.getTile(26, 5), TILE_TYPES.BUILDING_ROOF);
  assert.equal(map.getTile(25, 5), TILE_TYPES.LANDMARK_REPAIR);

  // Precinct 4 Police Substation at col 4, row 19
  assert.equal(map.getTile(4, 19), TILE_TYPES.BUILDING_ROOF);
  assert.equal(map.getTile(2, 19), TILE_TYPES.LANDMARK_POLICE);

  // Pocket Park Greenery at col 15, row 19
  assert.equal(map.getTile(15, 19), TILE_TYPES.GREENERY);
  // Pocket Park Tree at col 13, row 19
  assert.equal(map.getTile(13, 19), TILE_TYPES.TREE);
});

test('TileMap: collidable vs walkable tiles', () => {
  const map = new TileMap();

  // Walls, landmarks, and trees are collidable
  assert.ok(map.isCollidable(2, 5), 'shop wall should be collidable');
  assert.ok(map.isCollidable(25, 5), 'repair wall should be collidable');
  assert.ok(map.isCollidable(2, 19), 'police wall should be collidable');
  assert.ok(map.isCollidable(13, 19), 'tree trunk should be collidable');

  // Canopy awning is walkable (allows standing beneath it)
  assert.equal(map.getTile(3, 9), TILE_TYPES.BUILDING_CANOPY);
  assert.ok(!map.isCollidable(3, 9), 'canopy should be walkable');

  // Asphalt and sidewalk are walkable
  assert.ok(!map.isCollidable(8, 14), 'asphalt street should be walkable');
  assert.ok(!map.isCollidable(10, 11), 'sidewalk should be walkable');
});

test('TileMap: canopy occlusion detection', () => {
  const map = new TileMap();

  // Canopy is at Row 9, Cols 3-4 (X: 96 to 160, Y: 288 to 320)
  const underCanopyX = 3 * TILE_SIZE + 16;
  const underCanopyY = 9 * TILE_SIZE + 16;
  assert.ok(map.isUnderCanopy(underCanopyX, underCanopyY), 'should be under canopy');

  // Position on street
  const streetX = 8 * TILE_SIZE + 16;
  const streetY = 14 * TILE_SIZE + 16;
  assert.ok(!map.isUnderCanopy(streetX, streetY), 'street position should not be under canopy');
});

test('TileMap: tree trunk obstacle bounds', () => {
  const map = new TileMap();
  const treeCol = 13;
  const treeRow = 19;

  const obstacles = map.getNearbyObstacles({
    x: treeCol * TILE_SIZE,
    y: treeRow * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE
  });

  const treeObstacle = obstacles.find((o) => o.tileType === TILE_TYPES.TREE);
  assert.ok(treeObstacle, 'should find tree trunk obstacle');
  assert.equal(treeObstacle.width, 16);
  assert.equal(treeObstacle.height, 16);
});
