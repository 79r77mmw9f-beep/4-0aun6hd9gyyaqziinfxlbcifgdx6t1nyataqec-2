/**
 * LIVING CITY - Heads-Up Display (HUD)
 * Real-time indicators for coordinates, speed, FPS, controls and quick-action buttons.
 */

export class HUD {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    this.element = null;
    this.coordsEl = null;
    this.speedEl = null;
    this.fpsEl = null;

    this.createElements();
  }

  createElements() {
    this.element = document.createElement('div');
    this.element.className = 'game-hud';
    this.element.innerHTML = `
      <div class="hud-left">
        <div class="hud-brand">
          <span class="hud-title">LIVING CITY</span>
          <span class="hud-badge">PHASE 2 - ART & DISTRICTS</span>
        </div>
        <div class="hud-stats">
          <span class="stat-item">POS: <b id="hud-pos">X: 0, Y: 0</b></span>
          <span class="stat-item">SPEED: <b id="hud-speed">0 px/s</b></span>
          <span class="stat-item">FPS: <b id="hud-fps">60</b></span>
        </div>
      </div>
      <div class="hud-right">
        <button id="btn-pause" class="hud-btn" title="Pause Game (ESC)">⏸ PAUSE [ESC]</button>
        <button id="btn-dossier" class="hud-btn hud-btn-accent" title="Project Dossier (~)">📋 DOSSIER [~]</button>
        <button id="btn-restart" class="hud-btn hud-btn-danger" title="Restart Scene">🔄 RESTART</button>
      </div>
    `;

    this.container.appendChild(this.element);

    this.coordsEl = this.element.querySelector('#hud-pos');
    this.speedEl = this.element.querySelector('#hud-speed');
    this.fpsEl = this.element.querySelector('#hud-fps');

    this.element.querySelector('#btn-pause').addEventListener('click', () => {
      if (this.callbacks.onPause) this.callbacks.onPause();
    });

    this.element.querySelector('#btn-dossier').addEventListener('click', () => {
      if (this.callbacks.onDossier) this.callbacks.onDossier();
    });

    this.element.querySelector('#btn-restart').addEventListener('click', () => {
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });
  }

  update(player) {
    // Measure FPS
    this.frameCount += 1;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      if (this.fpsEl) this.fpsEl.textContent = this.fps;
    }

    if (player && this.coordsEl) {
      const px = Math.round(player.position.x);
      const py = Math.round(player.position.y);
      this.coordsEl.textContent = `X: ${px}, Y: ${py}`;

      const velLen = Math.round(player.velocity.length());
      if (this.speedEl) {
        this.speedEl.textContent = `${velLen} px/s ${player.isSprinting ? '(RUN)' : ''}`;
      }
    }
  }
}
