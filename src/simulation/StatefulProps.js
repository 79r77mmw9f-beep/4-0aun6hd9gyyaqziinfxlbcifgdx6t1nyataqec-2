/**
 * LIVING CITY - Stateful Environmental Props (Phase 2 Surprise: "معماری حافظه‌دار")
 * Props that persist dynamic state changes (torn poster, flickering lamp, cracked panel).
 */

import { TILE_SIZE } from '../core/Constants.js';
import { Vector2 } from '../core/Vector2.js';

export class StatefulPropsManager {
  constructor(eventBus = null) {
    this.eventBus = eventBus;
    this.props = new Map();

    this.initDefaultProps();
  }

  initDefaultProps() {
    // 1. Street poster / community bulletin board (Col 10, Row 11 near intersection)
    this.registerProp({
      id: 'prop_poster_bulletin',
      name: 'Community Notice Board',
      type: 'poster',
      tileCol: 10,
      tileRow: 11,
      state: 'intact', // 'intact' | 'torn'
      interactable: true,
      collisionRadius: 18,
      position: new Vector2(10 * TILE_SIZE + 16, 11 * TILE_SIZE + 16),
      description: 'A neighborhood notice board with a clean concert and local alert poster.'
    });

    // 2. Vintage Street Lamp (Col 7, Row 12 on sidewalk corner)
    this.registerProp({
      id: 'prop_street_lamp_west',
      name: 'Corner Street Lamp',
      type: 'lamp',
      tileCol: 7,
      tileRow: 12,
      state: 'lit', // 'lit' | 'flickering' | 'broken'
      interactable: true,
      collisionRadius: 16,
      position: new Vector2(7 * TILE_SIZE + 16, 12 * TILE_SIZE + 16),
      description: 'An old cast-iron sodium-vapor street lamp casting a warm amber pool of light.'
    });

    // 3. Electric Utility Cabinet (Col 23, Row 3 at parking lot corner)
    this.registerProp({
      id: 'prop_electric_box',
      name: 'Industrial Utility Box',
      type: 'cabinet',
      tileCol: 23,
      tileRow: 3,
      state: 'intact', // 'intact' | 'opened'
      interactable: true,
      collisionRadius: 16,
      position: new Vector2(23 * TILE_SIZE + 16, 3 * TILE_SIZE + 16),
      description: 'A heavy metal electrical junction box with stencil warning signs.'
    });
  }

  registerProp(prop) {
    this.props.set(prop.id, prop);
  }

  getProp(id) {
    return this.props.get(id);
  }

  getAllProps() {
    return Array.from(this.props.values());
  }

  /**
   * Toggles or triggers prop state alteration upon interaction or impact.
   */
  interact(propId) {
    const prop = this.props.get(propId);
    if (!prop) return null;

    const oldState = prop.state;

    if (prop.type === 'poster') {
      prop.state = prop.state === 'intact' ? 'torn' : 'intact';
    } else if (prop.type === 'lamp') {
      if (prop.state === 'lit') prop.state = 'flickering';
      else if (prop.state === 'flickering') prop.state = 'broken';
      else prop.state = 'lit';
    } else if (prop.type === 'cabinet') {
      prop.state = prop.state === 'intact' ? 'opened' : 'intact';
    }

    if (this.eventBus) {
      this.eventBus.publish({
        event_type: 'PropStateChanged',
        actor_id: 'player_main',
        location: { x: prop.position.x, y: prop.position.y },
        payload: {
          prop_id: prop.id,
          name: prop.name,
          old_state: oldState,
          new_state: prop.state
        }
      });
    }

    return prop.state;
  }

  /**
   * Checks if player is within interaction distance of any prop.
   */
  checkPlayerProximity(playerPos, maxDistance = 38) {
    for (const prop of this.props.values()) {
      if (prop.position.distanceTo(playerPos) <= maxDistance) {
        return prop;
      }
    }
    return null;
  }
}
