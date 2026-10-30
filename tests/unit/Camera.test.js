import test from 'node:test';
import assert from 'node:assert/strict';
import { Camera } from '../../src/presentation/Camera.js';
import { Vector2 } from '../../src/core/Vector2.js';

test('Camera: snaps and follows target center', () => {
  const worldW = 1000;
  const worldH = 1000;
  const viewW = 400;
  const viewH = 300;

  const cam = new Camera(viewW, viewH, worldW, worldH);
  cam.snapTo(new Vector2(500, 500));

  // Top-left should be 500 - 200 = 300, 500 - 150 = 350
  assert.equal(cam.position.x, 300);
  assert.equal(cam.position.y, 350);
});

test('Camera: boundary clamping prevents viewing outside world', () => {
  const worldW = 1000;
  const worldH = 1000;
  const viewW = 400;
  const viewH = 300;

  const cam = new Camera(viewW, viewH, worldW, worldH);

  // Target near top-left corner (0, 0)
  cam.snapTo(new Vector2(50, 50));
  assert.ok(cam.position.x >= 0, 'camera x must not be negative');
  assert.ok(cam.position.y >= 0, 'camera y must not be negative');

  // Target near bottom-right corner (1000, 1000)
  cam.snapTo(new Vector2(980, 980));
  assert.ok(cam.position.x <= worldW - viewW, 'camera x must not exceed worldWidth - viewportWidth');
  assert.ok(cam.position.y <= worldH - viewH, 'camera y must not exceed worldHeight - viewportHeight');
});
