import test from 'node:test';
import assert from 'node:assert/strict';
import { CollisionSystem } from '../../src/simulation/CollisionSystem.js';
import { TileMap } from '../../src/simulation/TileMap.js';
import { Vector2 } from '../../src/core/Vector2.js';

test('CollisionSystem: AABB overlap detection', () => {
  const box1 = { x: 10, y: 10, width: 20, height: 20 };
  const box2 = { x: 25, y: 15, width: 20, height: 20 };
  const box3 = { x: 100, y: 100, width: 20, height: 20 };

  assert.ok(CollisionSystem.checkAABB(box1, box2), 'box1 and box2 should overlap');
  assert.ok(!CollisionSystem.checkAABB(box1, box3), 'box1 and box3 should not overlap');
});

test('CollisionSystem: obstacle blocking along movement axis', () => {
  const tileMap = new TileMap();
  const collision = new CollisionSystem(tileMap);

  // Northwest building is at cols 2 to 6, rows 2 to 9 (X: 64 to 224, Y: 64 to 320)
  // Let player be on sidewalk to the east of this building at X: 236, Y: 150
  // Moving left (-X) towards building
  const startPos = new Vector2(236, 150);
  const velocity = new Vector2(-150, 0); // moving left
  const boxSize = { width: 20, height: 20 };
  const delta = 0.1;

  const res = collision.resolveMovement(startPos, velocity, boxSize, delta);

  assert.ok(res.collidedX, 'should detect collision on X');
  assert.ok(res.position.x >= 224 + 10, 'player should be stopped outside obstacle right edge');
});

test('CollisionSystem: vertical wall sliding mechanics (diagonal into vertical wall)', () => {
  const tileMap = new TileMap();
  const collision = new CollisionSystem(tileMap);

  // Position player next to a vertical building wall, moving diagonally left and down
  const startPos = new Vector2(235, 150);
  const velocity = new Vector2(-100, 100); // moving left (into wall) AND down (along wall)
  const boxSize = { width: 20, height: 20 };
  const delta = 0.05;

  const res = collision.resolveMovement(startPos, velocity, boxSize, delta);

  assert.ok(res.collidedX, 'X movement should collide and stop');
  assert.equal(res.collidedY, false, 'Y movement should continue freely sliding');
  assert.ok(res.position.y > startPos.y, 'player must slide downwards along the wall');
});

test('CollisionSystem: horizontal wall sliding mechanics (diagonal into horizontal wall)', () => {
  const tileMap = new TileMap();
  const collision = new CollisionSystem(tileMap);

  // Residential building bottom edge is at Y: 320 (Row 9, Cols 12 to 21).
  // Position player at X: 480, Y: 332, moving diagonally right and up into the wall
  const startPos = new Vector2(480, 332);
  const velocity = new Vector2(120, -120); // right and up
  const boxSize = { width: 20, height: 20 };
  const delta = 0.05;

  const res = collision.resolveMovement(startPos, velocity, boxSize, delta);

  assert.ok(res.collidedY, 'Y movement should collide with bottom of building');
  assert.equal(res.collidedX, false, 'X movement should continue freely sliding right');
  assert.ok(res.position.x > startPos.x, 'player must slide rightwards along the horizontal wall');
});

test('CollisionSystem: perimeter world boundaries', () => {
  const tileMap = new TileMap();
  const collision = new CollisionSystem(tileMap);

  // Try moving outside top boundary
  const nearTop = new Vector2(300, 40);
  const upVel = new Vector2(0, -200);
  const boxSize = { width: 20, height: 20 };

  const res = collision.resolveMovement(nearTop, upVel, boxSize, 0.5);
  assert.ok(res.collidedY, 'should collide with world boundary');
  assert.ok(res.position.y >= tileMap.tileSize + 10, 'must stay inside world perimeter');
});
