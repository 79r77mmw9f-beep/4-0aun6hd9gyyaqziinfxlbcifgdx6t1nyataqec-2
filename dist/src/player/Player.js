/**
 * LIVING CITY - Player Controller
 * 8-directional normalized movement, bounding box, heading & walk animation bob.
 */

import { Vector2 } from '../core/Vector2.js';
import {
  PLAYER_WALK_SPEED,
  PLAYER_RUN_SPEED,
  PLAYER_WIDTH,
  PLAYER_HEIGHT
} from '../core/Constants.js';

export class Player {
  constructor(spawnX, spawnY, eventBus = null) {
    this.id = 'player_main';
    this.position = new Vector2(spawnX, spawnY);
    this.spawnPosition = new Vector2(spawnX, spawnY);
    this.velocity = new Vector2(0, 0);
    this.size = { width: PLAYER_WIDTH, height: PLAYER_HEIGHT };

    this.walkSpeed = PLAYER_WALK_SPEED;
    this.runSpeed = PLAYER_RUN_SPEED;
    this.currentSpeed = this.walkSpeed;

    this.heading = 0; // Facing angle in radians (0 = East, Math.PI/2 = South)
    this.isSprinting = false;
    this.state = 'idle'; // 'idle' | 'walking'
    this.walkBob = 0; // Animation phase for walking footstep bob
    this.eventBus = eventBus;
  }

  reset() {
    this.position.copy(this.spawnPosition);
    this.velocity.set(0, 0);
    this.heading = 0;
    this.state = 'idle';
    this.walkBob = 0;
  }

  /**
   * Updates player movement using normalized 8-directional input.
   *
   * @param {Vector2} rawInput - Unnormalized input direction (-1 to 1)
   * @param {boolean} sprint - Whether sprint key is held
   * @param {number} delta - Frame delta time in seconds
   * @param {CollisionSystem} collisionSystem - Collision solver
   */
  update(rawInput, sprint, delta, collisionSystem) {
    this.isSprinting = sprint;
    this.currentSpeed = sprint ? this.runSpeed : this.walkSpeed;

    // 1. Diagonal normalization
    const inputDir = rawInput.clone().normalize();

    if (inputDir.lengthSq() > 0.0001) {
      this.state = 'walking';
      this.velocity.set(inputDir.x * this.currentSpeed, inputDir.y * this.currentSpeed);
      this.heading = Math.atan2(inputDir.y, inputDir.x);

      // Walk cycle bob
      const bobFreq = sprint ? 16 : 10;
      this.walkBob += delta * bobFreq;
    } else {
      this.state = 'idle';
      this.velocity.set(0, 0);
      this.walkBob = 0;
    }

    // 2. Resolve movement with collision system & sliding
    if (collisionSystem) {
      const resolution = collisionSystem.resolveMovement(
        this.position,
        this.velocity,
        this.size,
        delta
      );
      this.position.copy(resolution.position);
    } else {
      this.position.add(this.velocity.clone().scale(delta));
    }
  }

  getBoundingBox() {
    return {
      x: this.position.x - this.size.width / 2,
      y: this.position.y - this.size.height / 2,
      width: this.size.width,
      height: this.size.height
    };
  }
}
