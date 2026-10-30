/**
 * LIVING CITY - Phase 1 Narrative Seed: "The City Watches You" (شهر به تو نگاه می‌کند)
 * A subtle, glowing upper-story apartment window with flickering CRT glow and fleeting silhouette.
 */

import { TILE_SIZE } from '../core/Constants.js';
import { Vector2 } from '../core/Vector2.js';

export class SurpriseWindow {
  constructor(tileCol = 14, tileRow = 2, eventBus = null) {
    this.col = tileCol;
    this.row = tileRow;
    this.eventBus = eventBus;

    // World pixel center coordinates
    this.position = new Vector2(
      tileCol * TILE_SIZE + TILE_SIZE / 2,
      tileRow * TILE_SIZE + TILE_SIZE / 2
    );

    this.timer = 0;
    this.glowIntensity = 0.7;
    this.shadowOffset = -1; // -1 to 1 across window
    this.shadowVisible = false;
    this.shadowCooldown = 6.0;
    this.discovered = false;
  }

  update(delta, playerPos) {
    this.timer += delta;

    // 1. Subtle CRT TV light flicker (combination of slow ambient pulse & fast micro-flicker)
    const slowPulse = Math.sin(this.timer * 3.5) * 0.15;
    const fastFlicker = Math.sin(this.timer * 23.0) * 0.08;
    this.glowIntensity = 0.65 + slowPulse + fastFlicker;

    // 2. Periodic silhouette transit across the window
    this.shadowCooldown -= delta;
    if (this.shadowCooldown <= 0) {
      this.shadowVisible = true;
      this.shadowOffset += delta * 1.2; // takes ~1.6 seconds to pass
      if (this.shadowOffset > 1.2) {
        this.shadowVisible = false;
        this.shadowOffset = -1.2;
        this.shadowCooldown = 7.0 + Math.random() * 4.0; // next transit in 7-11 seconds
      }
    }

    // 3. Narrative event emission on first player proximity
    if (!this.discovered && playerPos) {
      const dist = this.position.distanceTo(playerPos);
      if (dist < 120 && this.eventBus) {
        this.discovered = true;
        this.eventBus.publish({
          event_type: 'NarrativeSeedObserved',
          actor_id: 'player_main',
          location: { x: this.position.x, y: this.position.y },
          payload: {
            seed_id: 'SURP-001',
            name: 'The City Watches You',
            description: 'Player noticed a flickering blue CRT glow and shifting silhouette in the north alley apartment.'
          }
        });
      }
    }
  }
}
