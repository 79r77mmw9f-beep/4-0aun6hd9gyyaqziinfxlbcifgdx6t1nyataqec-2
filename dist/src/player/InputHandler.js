/**
 * LIVING CITY - Input Handler
 * Captures keyboard inputs (WASD, Arrows, Shift, ESC, ~, R) and on-screen touch controls.
 */

import { Vector2 } from '../core/Vector2.js';

export class InputHandler {
  constructor() {
    this.keys = new Set();
    this.rawDirection = new Vector2(0, 0);
    this.isSprinting = false;

    // Single-frame action triggers
    this.pauseTriggered = false;
    this.dossierTriggered = false;
    this.restartTriggered = false;

    this.onPauseToggle = null;
    this.onDossierToggle = null;
    this.onRestart = null;

    this.setupListeners();
  }

  setupListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      // Prevent browser scroll on arrow keys / space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      this.keys.add(e.code);
      this.keys.add(e.key.toLowerCase());

      if (e.code === 'Escape') {
        if (this.onPauseToggle) this.onPauseToggle();
      }

      if (e.code === 'Backquote' || e.key === '~' || e.code === 'F1') {
        e.preventDefault();
        if (this.onDossierToggle) this.onDossierToggle();
      }

      if (e.code === 'KeyR' && e.ctrlKey === false && e.metaKey === false) {
        // Optional quick restart (can be triggered from pause menu too)
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.keys.delete(e.key.toLowerCase());
    });

    // Window blur safety: release all keys so character doesn't run indefinitely
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.rawDirection.set(0, 0);
      this.isSprinting = false;
    });
  }

  /**
   * Polls current keyboard states and computes raw unnormalized direction.
   */
  getMovementVector() {
    let dx = 0;
    let dy = 0;

    // Horizontal
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft') || this.keys.has('a')) {
      dx -= 1;
    }
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight') || this.keys.has('d')) {
      dx += 1;
    }

    // Vertical
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp') || this.keys.has('w')) {
      dy -= 1;
    }
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown') || this.keys.has('s')) {
      dy += 1;
    }

    this.rawDirection.set(dx, dy);
    this.isSprinting = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');

    return {
      direction: this.rawDirection,
      sprint: this.isSprinting
    };
  }

  clear() {
    this.keys.clear();
    this.rawDirection.set(0, 0);
    this.isSprinting = false;
  }
}
