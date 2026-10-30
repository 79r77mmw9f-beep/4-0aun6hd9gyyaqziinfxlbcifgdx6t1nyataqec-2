import test from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../../src/simulation/World.js';
import { Clock } from '../../src/core/Clock.js';
import { Vector2 } from '../../src/core/Vector2.js';

test('Integration: full simulation game loop execution (60 ticks)', () => {
  const world = new World();
  const clock = new Clock(60);

  const startPos = world.player.position.clone();
  let ticksRun = 0;

  // Simulate 60 frames (~1000ms) with rightward movement
  clock.lastTime = 0;
  for (let frame = 1; frame <= 60; frame++) {
    clock.update(frame * 16.6667, (delta) => {
      world.update(new Vector2(1, 0), false, delta);
      ticksRun += 1;
    });
  }

  assert.ok(ticksRun >= 58, `should have executed ~60 fixed ticks (executed: ${ticksRun})`);
  assert.ok(world.player.position.x > startPos.x, 'player should have advanced to the right');
});

test('Integration: Phase 1 narrative seed observation (The City Watches You)', () => {
  const world = new World();
  let narrativeDiscovered = false;

  world.eventBus.subscribe('NarrativeSeedObserved', (evt) => {
    narrativeDiscovered = true;
    assert.equal(evt.payload.seed_id, 'SURP-001');
  });

  // Move player into north alley near window (Col: 14, Row: 2 -> X: 464, Y: 80)
  world.player.position.set(464, 80);
  world.update(new Vector2(0, 0), false, 0.016);

  assert.ok(narrativeDiscovered, 'Surprise window should emit discovery event on proximity');
});

test('Integration: Pause halts simulation and Resume restores it', () => {
  const world = new World();
  const clock = new Clock(60);

  clock.pause();
  assert.ok(clock.isPaused());

  const playerPosBefore = world.player.position.clone();
  const ticks = clock.update(1000, (delta) => {
    world.update(new Vector2(1, 1), false, delta);
  });

  assert.equal(ticks, 0, 'no ticks should execute while paused');
  assert.equal(world.player.position.x, playerPosBefore.x);
  assert.equal(world.player.position.y, playerPosBefore.y);

  clock.resume();
  assert.ok(!clock.isPaused());
});

test('Integration: World reset restores player and resets collisions', () => {
  const world = new World();
  const spawnPos = world.player.spawnPosition.clone();

  world.player.position.set(800, 600);
  world.collisionSystem.totalCollisions = 42;

  let resetEventFired = false;
  world.eventBus.subscribe('WorldReset', () => {
    resetEventFired = true;
  });

  world.reset();

  assert.equal(world.player.position.x, spawnPos.x);
  assert.equal(world.player.position.y, spawnPos.y);
  assert.equal(world.collisionSystem.totalCollisions, 0);
  assert.ok(resetEventFired, 'WorldReset event should be published');
});
