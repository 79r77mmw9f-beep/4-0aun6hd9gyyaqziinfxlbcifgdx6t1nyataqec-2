import test from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../../src/player/Player.js';
import { Vector2 } from '../../src/core/Vector2.js';
import { PLAYER_WALK_SPEED, PLAYER_RUN_SPEED } from '../../src/core/Constants.js';

test('Player: speed invariance in diagonal movement', () => {
  const player = new Player(100, 100);

  // 1. Horizontal movement
  player.update(new Vector2(1, 0), false, 0.016, null);
  const horizontalSpeed = player.velocity.length();
  assert.ok(Math.abs(horizontalSpeed - PLAYER_WALK_SPEED) < 0.01);

  // 2. Diagonal movement (1, 1)
  player.update(new Vector2(1, 1), false, 0.016, null);
  const diagonalSpeed = player.velocity.length();
  assert.ok(
    Math.abs(diagonalSpeed - PLAYER_WALK_SPEED) < 0.01,
    `diagonal speed (${diagonalSpeed}) must equal horizontal walk speed (${PLAYER_WALK_SPEED})`
  );

  // 3. Sprinting
  player.update(new Vector2(0, 1), true, 0.016, null);
  const sprintSpeed = player.velocity.length();
  assert.ok(Math.abs(sprintSpeed - PLAYER_RUN_SPEED) < 0.01);
});

test('Player: idle state when no input', () => {
  const player = new Player(200, 200);
  player.update(new Vector2(0, 0), false, 0.016, null);

  assert.equal(player.state, 'idle');
  assert.equal(player.velocity.x, 0);
  assert.equal(player.velocity.y, 0);
});

test('Player: reset restores initial spawn location', () => {
  const player = new Player(350, 450);
  player.position.set(999, 999);
  player.state = 'walking';

  player.reset();
  assert.equal(player.position.x, 350);
  assert.equal(player.position.y, 450);
  assert.equal(player.state, 'idle');
});
