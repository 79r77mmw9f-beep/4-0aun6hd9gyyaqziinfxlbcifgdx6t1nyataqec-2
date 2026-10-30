/**
 * LIVING CITY - World Container
 * Orchestrates spatial tilemap, collision system, player entity, and environmental seeds.
 */

import { EventBus } from '../core/EventBus.js';
import { TileMap } from './TileMap.js';
import { CollisionSystem } from './CollisionSystem.js';
import { SurpriseWindow } from './SurpriseWindow.js';
import { Player } from '../player/Player.js';

export class World {
  constructor() {
    this.eventBus = new EventBus();
    this.tileMap = new TileMap();
    this.collisionSystem = new CollisionSystem(this.tileMap);

    // Spawn player in safe sidewalk location
    const spawn = this.tileMap.getDefaultSpawnPosition();
    this.player = new Player(spawn.x, spawn.y, this.eventBus);

    // Narrative seed window (Phase 1 surprise)
    this.surpriseWindow = new SurpriseWindow(
      this.tileMap.surpriseWindowPos.col,
      this.tileMap.surpriseWindowPos.row,
      this.eventBus
    );
  }

  /**
   * Fixed tick update.
   */
  update(inputVector, isSprinting, delta) {
    // 1. Update player entity
    this.player.update(inputVector, isSprinting, delta, this.collisionSystem);

    // 2. Update environmental narrative seed (Phase 1 surprise)
    this.surpriseWindow.update(delta, this.player.position);
  }

  /**
   * Resets world state and respawns player at starting location.
   */
  reset() {
    this.player.reset();
    this.collisionSystem.totalCollisions = 0;
    this.eventBus.publish({
      event_type: 'WorldReset',
      actor_id: 'system',
      location: { x: this.player.position.x, y: this.player.position.y },
      payload: { reason: 'user_restart' }
    });
  }
}
