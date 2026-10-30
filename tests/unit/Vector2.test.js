import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector2 } from '../../src/core/Vector2.js';

test('Vector2: initialization and setters', () => {
  const v = new Vector2(10, 20);
  assert.equal(v.x, 10);
  assert.equal(v.y, 20);

  v.set(5, 7);
  assert.equal(v.x, 5);
  assert.equal(v.y, 7);
});

test('Vector2: arithmetic operations', () => {
  const a = new Vector2(2, 3);
  const b = new Vector2(4, 5);

  a.add(b);
  assert.equal(a.x, 6);
  assert.equal(a.y, 8);

  a.sub(new Vector2(1, 2));
  assert.equal(a.x, 5);
  assert.equal(a.y, 6);

  a.scale(2);
  assert.equal(a.x, 10);
  assert.equal(a.y, 12);
});

test('Vector2: normalization and diagonal speed invariance', () => {
  // Diagonal vector (1, 1)
  const diag = new Vector2(1, 1);
  diag.normalize();

  const expectedComponent = 1 / Math.SQRT2; // ~0.70710678
  assert.ok(Math.abs(diag.x - expectedComponent) < 0.00001, 'diag.x should be 1/sqrt(2)');
  assert.ok(Math.abs(diag.y - expectedComponent) < 0.00001, 'diag.y should be 1/sqrt(2)');
  assert.ok(Math.abs(diag.length() - 1.0) < 0.00001, 'normalized length must be strictly 1.0');

  // Zero vector safety
  const zero = new Vector2(0, 0);
  zero.normalize();
  assert.equal(zero.x, 0);
  assert.equal(zero.y, 0);
  assert.ok(!Number.isNaN(zero.x), 'must not produce NaN');
});

test('Vector2: distance and lerp', () => {
  const p1 = new Vector2(0, 0);
  const p2 = new Vector2(3, 4);
  assert.equal(p1.distanceTo(p2), 5);

  const start = new Vector2(0, 0);
  const end = new Vector2(100, 200);
  start.lerp(end, 0.5);
  assert.equal(start.x, 50);
  assert.equal(start.y, 100);
});
