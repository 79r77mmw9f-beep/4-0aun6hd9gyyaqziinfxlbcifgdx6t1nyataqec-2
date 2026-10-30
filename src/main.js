/**
 * LIVING CITY - Main Entry Point
 * Initializes systems, handles canvas sizing, hooks inputs, and drives the main loop.
 */

import { Clock } from './core/Clock.js';
import { World } from './simulation/World.js';
import { Camera } from './presentation/Camera.js';
import { Renderer } from './presentation/Renderer.js';
import { InputHandler } from './player/InputHandler.js';
import { HUD } from './ui/HUD.js';
import { PauseMenu } from './ui/PauseMenu.js';
import { DevDossier } from './ui/DevDossier.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.container = document.getElementById('app');

    // Systems
    this.clock = new Clock(60);
    this.world = new World();
    this.renderer = new Renderer(this.canvas);
    this.input = new InputHandler();

    // Camera initialized to canvas size and world size
    this.camera = new Camera(
      this.canvas.width || 800,
      this.canvas.height || 600,
      this.world.tileMap.width,
      this.world.tileMap.height
    );

    // Initial snap camera to player
    this.camera.snapTo(this.world.player.position);

    // UI Overlays
    this.hud = new HUD(this.container, {
      onPause: () => this.togglePause(),
      onDossier: () => this.devDossier.toggle(),
      onRestart: () => this.restartGame()
    });

    this.pauseMenu = new PauseMenu(this.container, {
      onResume: () => this.resumeGame(),
      onRestart: () => this.restartGame()
    });

    this.devDossier = new DevDossier(this.container, {
      onClose: () => this.devDossier.hide()
    });

    this.setupInputCallbacks();
    this.setupWindowResize();

    // Initial resize
    this.handleResize();

    // Start loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  setupInputCallbacks() {
    this.input.onPauseToggle = () => {
      // If dossier is open, close dossier first
      if (this.devDossier.visible) {
        this.devDossier.hide();
        return;
      }
      this.togglePause();
    };

    this.input.onDossierToggle = () => {
      this.devDossier.toggle();
    };

    this.input.onInteract = () => {
      if (this.clock.isPaused()) return;
      this.world.handleInteraction();
    };
  }

  setupWindowResize() {
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = width;
    this.canvas.height = height;

    this.camera.resize(width, height);
  }

  togglePause() {
    if (this.clock.isPaused()) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  pauseGame() {
    this.clock.pause();
    this.pauseMenu.show();
    this.world.eventBus.publish({
      event_type: 'GamePaused',
      actor_id: 'player_main',
      tick: this.clock.tick
    });
  }

  resumeGame() {
    this.clock.resume();
    this.pauseMenu.hide();
    this.world.eventBus.publish({
      event_type: 'GameResumed',
      actor_id: 'player_main',
      tick: this.clock.tick
    });
  }

  restartGame() {
    this.world.reset();
    this.camera.snapTo(this.world.player.position);
    this.resumeGame();
  }

  loop(timestamp) {
    const { direction, sprint } = this.input.getMovementVector();

    // 1. Advance deterministic clock & simulation
    this.clock.update(timestamp, (delta) => {
      this.world.update(direction, sprint, delta);
    });

    // 2. Smooth camera follow (delta derived from clock's fixedDelta or frame)
    const frameDelta = 1 / 60;
    this.camera.update(this.world.player.position, frameDelta);

    // 3. Render frame
    this.renderer.render(this.world, this.camera);

    // 4. Update UI
    this.hud.update(this.world.player);
    this.devDossier.update(this.world, this.clock);

    requestAnimationFrame(this.loop);
  }
}

// Boot game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.livingCityGame = new Game();
});
