import test from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../../src/simulation/World.js';
import { Vector2 } from '../../src/core/Vector2.js';
import { TILE_SIZE } from '../../src/core/Constants.js';

test('Integration: Walking under store canopy triggers interior occlusion', () => {
  const world = new World();

  // Initially at default spawn (sidewalk), canopy should be false
  assert.equal(world.isPlayerUnderCanopy, false);

  // Move player directly under store canopy at Col 3, Row 9 (X: 112, Y: 304)
  world.player.position.set(3 * TILE_SIZE + 16, 9 * TILE_SIZE + 16);
  world.update(new Vector2(0, 0), false, 0.016);

  assert.equal(world.isPlayerUnderCanopy, true, 'isPlayerUnderCanopy should be true when under awning');

  // Move back to open street
  world.player.position.set(8 * TILE_SIZE + 16, 14 * TILE_SIZE + 16);
  world.update(new Vector2(0, 0), false, 0.016);

  assert.equal(world.isPlayerUnderCanopy, false, 'isPlayerUnderCanopy should be false when on open street');
});

test('Integration: Interacting with stateful prop (Phase 2 surprise) persists in world state', () => {
  const world = new World();
  const poster = world.statefulProps.getProp('prop_poster_bulletin');

  // Move player within interaction range of notice board
  world.player.position.set(poster.position.x + 10, poster.position.y);
  world.update(new Vector2(0, 0), false, 0.016);

  assert.ok(world.activeNearbyProp, 'should detect nearby notice board');
  assert.equal(world.activeNearbyProp.id, 'prop_poster_bulletin');

  // Trigger interaction (equivalent to pressing E)
  const resultState = world.handleInteraction();
  assert.equal(resultState, 'torn');
  assert.equal(poster.state, 'torn');

  // Execute 30 ticks of simulation, state must stay 'torn'
  for (let i = 0; i < 30; i++) {
    world.update(new Vector2(0, 0), false, 0.016);
  }
  assert.equal(poster.state, 'torn', 'torn state must persist across ticks');
});

test('Integration: Collision prevention against new landmarks (Bodega, Auto Repair, Police)', () => {
  const world = new World();

  // Try moving player into Bodega west wall from the street
  // Bodega wall at Col 2 (X: 64 to 96), player at X: 54 moving right
  world.player.position.set(50, 6 * TILE_SIZE + 16);
  world.player.update(new Vector2(1, 0), false, 0.1, world.collisionSystem);

  assert.ok(
    world.player.position.x < 2 * TILE_SIZE,
    `player must not penetrate bodega wall (X: ${world.player.position.x})`
  );
});
