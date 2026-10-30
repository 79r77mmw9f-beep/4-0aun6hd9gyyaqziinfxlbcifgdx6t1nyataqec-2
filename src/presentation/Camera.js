/**
 * LIVING CITY - Smooth 2D Follow Camera
 * Clamped strictly within world borders to avoid rendering void areas.
 */

import { Vector2 } from '../core/Vector2.js';

export class Camera {
  constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    // Camera top-left position in world coordinates
    this.position = new Vector2(0, 0);
    this.target = new Vector2(0, 0);

    // Follow smoothing factor (0.08 = very smooth, responsive)
    this.smoothSpeed = 0.12;
  }

  resize(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.clamp();
  }

  /**
   * Snaps camera immediately to player center (used on spawn/reset).
   */
  snapTo(targetCenter) {
    this.target.set(
      targetCenter.x - this.viewportWidth / 2,
      targetCenter.y - this.viewportHeight / 2
    );
    this.position.copy(this.target);
    this.clamp();
  }

  /**
   * Smoothly interpolates camera toward target center position.
   */
  update(targetCenter, delta) {
    this.target.set(
      targetCenter.x - this.viewportWidth / 2,
      targetCenter.y - this.viewportHeight / 2
    );

    // Exponential smoothing: 1 - Math.exp(-speed * delta)
    const factor = 1 - Math.exp(-12 * delta);
    this.position.lerp(this.target, factor);

    this.clamp();
  }

  /**
   * Clamps camera view within world boundaries.
   */
  clamp() {
    // If viewport is wider than world, center world in viewport
    if (this.viewportWidth >= this.worldWidth) {
      this.position.x = (this.worldWidth - this.viewportWidth) / 2;
    } else {
      this.position.x = Math.max(0, Math.min(this.worldWidth - this.viewportWidth, this.position.x));
    }

    // If viewport is taller than world, center world in viewport
    if (this.viewportHeight >= this.worldHeight) {
      this.position.y = (this.worldHeight - this.viewportHeight) / 2;
    } else {
      this.position.y = Math.max(0, Math.min(this.worldHeight - this.viewportHeight, this.position.y));
    }
  }

  /**
   * Converts world coordinates to screen/canvas coordinates.
   */
  worldToScreen(worldX, worldY) {
    return {
      x: Math.round(worldX - this.position.x),
      y: Math.round(worldY - this.position.y)
    };
  }
}
