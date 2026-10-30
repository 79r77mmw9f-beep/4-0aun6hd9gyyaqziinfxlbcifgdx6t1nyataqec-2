/**
 * LIVING CITY - Pause Menu
 * Modal overlay with Resume, Restart, Controls summary and Phase 1 acceptance criteria.
 */

export class PauseMenu {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.element = null;
    this.visible = false;

    this.createElements();
  }

  createElements() {
    this.element = document.createElement('div');
    this.element.className = 'pause-overlay hidden';
    this.element.innerHTML = `
      <div class="pause-card">
        <div class="pause-header">
          <h2>⏸ GAME PAUSED</h2>
          <p class="pause-sub">LIVING CITY - Prototype Phase 1</p>
        </div>

        <div class="pause-actions">
          <button id="btn-resume" class="btn-primary">▶ RESUME GAME (ESC)</button>
          <button id="btn-pause-restart" class="btn-secondary">🔄 RESTART TO SPAWN</button>
        </div>

        <div class="pause-section">
          <h3>🎮 CONTROLS</h3>
          <div class="controls-grid">
            <div class="ctrl-row"><span>Movement (8 directions):</span> <b>W, A, S, D / Arrows</b></div>
            <div class="ctrl-row"><span>Sprint:</span> <b>Hold Shift</b></div>
            <div class="ctrl-row"><span>Pause / Resume:</span> <b>Escape</b></div>
            <div class="ctrl-row"><span>Project Dossier:</span> <b>~ (Tilde) / F1</b></div>
            <div class="ctrl-row"><span>Corner Collision:</span> <b>Wall-sliding enabled</b></div>
          </div>
        </div>

        <div class="pause-section">
          <h3>✅ PHASE 1 ACCEPTANCE CRITERIA</h3>
          <ul class="criteria-list">
            <li>✔ 8-Directional movement with normalized diagonal speed ($1/\\sqrt{2}$)</li>
            <li>✔ Smooth continuous collision with obstacle sliding (no corner sticking)</li>
            <li>✔ Camera follow with soft lerp and strict world border clamping</li>
            <li>✔ Phase 1 Narrative Seed: Glowing window in north alleyway</li>
            <li>✔ 100% automated test coverage in Node.js test runner</li>
          </ul>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    this.element.querySelector('#btn-resume').addEventListener('click', () => {
      if (this.callbacks.onResume) this.callbacks.onResume();
    });

    this.element.querySelector('#btn-pause-restart').addEventListener('click', () => {
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });
  }

  show() {
    this.visible = true;
    this.element.classList.remove('hidden');
  }

  hide() {
    this.visible = false;
    this.element.classList.add('hidden');
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
    return this.visible;
  }
}
