/**
 * LIVING CITY - Continuous AABB Collision System with Wall Sliding
 * Prevents getting stuck on corners and ensures responsive, tactile navigation.
 */

import { Vector2 } from '../core/Vector2.js';

export class CollisionSystem {
  constructor(tileMap) {
    this.tileMap = tileMap;
    this.totalCollisions = 0;
  }

  /**
   * Tests overlap between two axis-aligned bounding boxes.
   */
  static checkAABB(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Resolves entity movement against static obstacles and world boundaries.
   * Resolves X and Y independently to enable smooth wall-sliding.
   *
   * @param {Vector2} currentPos - Current center or top-left position
   * @param {Vector2} velocity - Current velocity in pixels/second
   * @param {{width: number, height: number}} boxSize - Width and height
   * @param {number} delta - Frame delta time in seconds
   * @returns {{position: Vector2, collidedX: boolean, collidedY: boolean}}
   */
  resolveMovement(currentPos, velocity, boxSize, delta) {
    const newPos = currentPos.clone();
    let collidedX = false;
    let collidedY = false;

    const halfW = boxSize.width / 2;
    const halfH = boxSize.height / 2;

    // --- 1. RESOLVE X AXIS ---
    const stepX = velocity.x * delta;
    if (Math.abs(stepX) > 0.0001) {
      newPos.x += stepX;

      // Construct temporary bounding box for X movement
      let boxX = {
        x: newPos.x - halfW,
        y: currentPos.y - halfH,
        width: boxSize.width,
        height: boxSize.height
      };

      // Check map boundary on X
      if (boxX.x < this.tileMap.tileSize) {
        newPos.x = this.tileMap.tileSize + halfW;
        collidedX = true;
      } else if (boxX.x + boxX.width > this.tileMap.width - this.tileMap.tileSize) {
        newPos.x = this.tileMap.width - this.tileMap.tileSize - halfW;
        collidedX = true;
      }

      // Check obstacle collisions on X
      boxX.x = newPos.x - halfW;
      const obstaclesX = this.tileMap.getNearbyObstacles(boxX);
      for (const obs of obstaclesX) {
        if (CollisionSystem.checkAABB(boxX, obs)) {
          collidedX = true;
          if (stepX > 0) {
            // Moving right: clamp to obstacle's left edge
            newPos.x = obs.x - halfW;
          } else {
            // Moving left: clamp to obstacle's right edge
            newPos.x = obs.x + obs.width + halfW;
          }
          boxX.x = newPos.x - halfW;
        }
      }
    }

    // --- 2. RESOLVE Y AXIS ---
    const stepY = velocity.y * delta;
    if (Math.abs(stepY) > 0.0001) {
      newPos.y += stepY;

      // Construct temporary bounding box for Y movement (using finalized newPos.x)
      let boxY = {
        x: newPos.x - halfW,
        y: newPos.y - halfH,
        width: boxSize.width,
        height: boxSize.height
      };

      // Check map boundary on Y
      if (boxY.y < this.tileMap.tileSize) {
        newPos.y = this.tileMap.tileSize + halfH;
        collidedY = true;
      } else if (boxY.y + boxY.height > this.tileMap.height - this.tileMap.tileSize) {
        newPos.y = this.tileMap.height - this.tileMap.tileSize - halfH;
        collidedY = true;
      }

      // Check obstacle collisions on Y
      boxY.y = newPos.y - halfH;
      const obstaclesY = this.tileMap.getNearbyObstacles(boxY);
      for (const obs of obstaclesY) {
        if (CollisionSystem.checkAABB(boxY, obs)) {
          collidedY = true;
          if (stepY > 0) {
            // Moving down: clamp to obstacle's top edge
            newPos.y = obs.y - halfH;
          } else {
            // Moving up: clamp to obstacle's bottom edge
            newPos.y = obs.y + obs.height + halfH;
          }
          boxY.y = newPos.y - halfH;
        }
      }
    }

    if (collidedX || collidedY) {
      this.totalCollisions += 1;
    }

    return {
      position: newPos,
      collidedX,
      collidedY
    };
  }
}
