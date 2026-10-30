/**
 * LIVING CITY - 2D Canvas Renderer (Phase 2 Expanded)
 * Full Layered Rendering: Ground -> Shadows -> Walls/Landmarks -> Props -> Player -> Roofs/Canopies (with Occlusion).
 */

import { TILE_SIZE, TILE_TYPES, PALETTE } from '../core/Constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.showDebugCollision = false;

    // Smooth transition for canopy occlusion alpha
    this.canopyAlpha = 1.0;
    this.policeBeaconTimer = 0;
  }

  clear() {
    this.ctx.fillStyle = '#0f1115';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Main render loop entry point.
   */
  render(world, camera) {
    this.clear();
    const { ctx } = this;

    // Update timers
    this.policeBeaconTimer += 0.05;

    // Smoothly interpolate canopy occlusion alpha
    const targetCanopyAlpha = world.isPlayerUnderCanopy ? 0.32 : 1.0;
    this.canopyAlpha += (targetCanopyAlpha - this.canopyAlpha) * 0.18;

    ctx.save();
    // Offset by camera position
    ctx.translate(-Math.round(camera.position.x), -Math.round(camera.position.y));

    // LAYER 0: Ground (Asphalt, Sidewalks, Grass, Crosswalks, Parking Bays)
    this.renderGroundLayer(world.tileMap, camera);

    // LAYER 1: Environmental shadows
    this.renderShadows(world.tileMap, camera);

    // LAYER 2: Walls, Landmarks, and Trees
    this.renderWallsAndLandmarks(world.tileMap, camera);

    // LAYER 3: Surprise Window (Phase 1 narrative seed)
    if (world.surpriseWindow) {
      this.renderSurpriseWindow(world.surpriseWindow);
    }

    // LAYER 4: Stateful Environmental Props (Phase 2 Surprise: معماری حافظه‌دار)
    if (world.statefulProps) {
      this.renderStatefulProps(world.statefulProps);
    }

    // LAYER 5: Player Entity
    if (world.player) {
      this.renderPlayer(world.player);
    }

    // LAYER 6: Roofs & Canopies (with Occlusion)
    this.renderRoofsAndCanopies(world.tileMap, camera);

    // LAYER 7: In-World Interactive Prompts
    this.renderInteractionPrompts(world);

    // LAYER 8: Debug Overlays (if enabled)
    if (this.showDebugCollision) {
      this.renderDebugObstacles(world);
    }

    ctx.restore();
  }

  renderGroundLayer(tileMap, camera) {
    const { ctx } = this;
    const ts = TILE_SIZE;

    const startCol = Math.max(0, Math.floor(camera.position.x / ts));
    const endCol = Math.min(tileMap.cols - 1, Math.ceil((camera.position.x + camera.viewportWidth) / ts));
    const startRow = Math.max(0, Math.floor(camera.position.y / ts));
    const endRow = Math.min(tileMap.rows - 1, Math.ceil((camera.position.y + camera.viewportHeight) / ts));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileType = tileMap.getTile(c, r);
        const x = c * ts;
        const y = r * ts;

        switch (tileType) {
          case TILE_TYPES.ASPHALT:
            ctx.fillStyle = PALETTE.ASPHALT;
            ctx.fillRect(x, y, ts, ts);

            // Yellow center divider line on Row 14
            if (r === 14 && c % 2 === 0) {
              ctx.fillStyle = PALETTE.ROAD_MARKING;
              ctx.fillRect(x, y + ts / 2 - 2, ts, 4);
            }
            break;

          case TILE_TYPES.ASPHALT_CRACKED:
            ctx.fillStyle = PALETTE.ASPHALT;
            ctx.fillRect(x, y, ts, ts);

            // Fine crack lines and stains
            ctx.strokeStyle = PALETTE.ASPHALT_CRACK;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x + 4, y + 6);
            ctx.lineTo(x + 16, y + 18);
            ctx.lineTo(x + 28, y + 14);
            ctx.stroke();

            // Oil patch
            ctx.fillStyle = 'rgba(12, 14, 18, 0.6)';
            ctx.beginPath();
            ctx.ellipse(x + 18, y + 20, 6, 4, 0.2, 0, Math.PI * 2);
            ctx.fill();
            break;

          case TILE_TYPES.CROSSWALK:
            ctx.fillStyle = PALETTE.ASPHALT;
            ctx.fillRect(x, y, ts, ts);
            ctx.fillStyle = PALETTE.ROAD_MARKING_WHITE;
            for (let i = 3; i < ts; i += 9) {
              ctx.fillRect(x + 2, y + i, ts - 4, 5);
            }
            break;

          case TILE_TYPES.PARKING_BAY:
            ctx.fillStyle = PALETTE.ASPHALT;
            ctx.fillRect(x, y, ts, ts);

            // Blue-white parking stall marker lines
            ctx.strokeStyle = PALETTE.PARKING_LINE;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);
            break;

          case TILE_TYPES.GREENERY:
            ctx.fillStyle = PALETTE.GREENERY;
            ctx.fillRect(x, y, ts, ts);

            // Subtle grass blade details
            ctx.fillStyle = PALETTE.GREENERY_HIGHLIGHT;
            ctx.fillRect(x + 6, y + 8, 3, 4);
            ctx.fillRect(x + 20, y + 16, 3, 4);
            ctx.fillRect(x + 12, y + 24, 3, 4);
            break;

          case TILE_TYPES.SIDEWALK:
          case TILE_TYPES.BOLLARD:
          case TILE_TYPES.BUILDING_CANOPY:
            // Standard concrete pavement
            ctx.fillStyle = PALETTE.SIDEWALK;
            ctx.fillRect(x, y, ts, ts);

            // Expansion joints
            ctx.strokeStyle = PALETTE.SIDEWALK_LINE;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, ts - 1, ts - 1);
            break;

          default:
            // Background base
            ctx.fillStyle = PALETTE.SIDEWALK;
            ctx.fillRect(x, y, ts, ts);
        }
      }
    }
  }

  renderShadows(tileMap, camera) {
    const { ctx } = this;
    const ts = TILE_SIZE;

    // Drop shadows cast southeast from buildings & trees
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';

    for (let r = 0; r < tileMap.rows; r++) {
      for (let c = 0; c < tileMap.cols; c++) {
        const tile = tileMap.getTile(c, r);

        if (tileMap.isCollidable(c, r)) {
          const x = c * ts;
          const y = r * ts;
          // Cast soft shadow 6px right and 6px down
          ctx.fillRect(x + 6, y + 6, ts, ts);
        }
      }
    }
  }

  renderWallsAndLandmarks(tileMap, camera) {
    const { ctx } = this;
    const ts = TILE_SIZE;

    const startCol = Math.max(0, Math.floor(camera.position.x / ts));
    const endCol = Math.min(tileMap.cols - 1, Math.ceil((camera.position.x + camera.viewportWidth) / ts));
    const startRow = Math.max(0, Math.floor(camera.position.y / ts));
    const endRow = Math.min(tileMap.rows - 1, Math.ceil((camera.position.y + camera.viewportHeight) / ts));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileType = tileMap.getTile(c, r);
        const x = c * ts;
        const y = r * ts;

        switch (tileType) {
          case TILE_TYPES.BUILDING_WALL:
            ctx.fillStyle = PALETTE.BUILDING_WALL;
            ctx.fillRect(x, y, ts, ts);
            ctx.fillStyle = PALETTE.BUILDING_LIP;
            ctx.fillRect(x, y, ts, 3);
            ctx.fillStyle = '#2b303c';
            ctx.fillRect(x, y + ts - 4, ts, 4);
            break;

          case TILE_TYPES.LANDMARK_SHOP:
            // Corner Bodega (24/7 Market)
            ctx.fillStyle = PALETTE.SHOP_WALL;
            ctx.fillRect(x, y, ts, ts);

            // Brick joints & display window
            if (r === 8 && (c === 3 || c === 4)) {
              // Store display window with warm interior amber glow
              ctx.fillStyle = '#ebcb8b';
              ctx.fillRect(x + 4, y + 10, ts - 8, ts - 14);
              ctx.strokeStyle = '#d08770';
              ctx.lineWidth = 1;
              ctx.strokeRect(x + 4, y + 10, ts - 8, ts - 14);
            }
            if (r === 7 && c === 4) {
              // Neon Store Header Sign
              ctx.fillStyle = '#2e3440';
              ctx.fillRect(x - 10, y + 8, ts + 20, 14);
              ctx.fillStyle = PALETTE.SHOP_SIGN;
              ctx.font = 'bold 9px monospace';
              ctx.fillText('24H BODEGA', x - 8, y + 18);
            }
            break;

          case TILE_TYPES.LANDMARK_REPAIR:
            // Redline Auto Repair
            ctx.fillStyle = PALETTE.REPAIR_WALL;
            ctx.fillRect(x, y, ts, ts);

            // Roll-up garage door horizontal slats
            if (r === 8 && (c === 26 || c === 28)) {
              ctx.fillStyle = '#2e3440';
              ctx.fillRect(x + 2, y + 4, ts - 4, ts - 6);
              ctx.strokeStyle = '#4c566a';
              ctx.lineWidth = 1;
              for (let sy = y + 8; sy < y + ts - 4; sy += 5) {
                ctx.beginPath();
                ctx.moveTo(x + 3, sy);
                ctx.lineTo(x + ts - 3, sy);
                ctx.stroke();
              }
            }
            // Hazard caution diagonal stripes at entrance
            if (r === 8 && c === 27) {
              ctx.fillStyle = '#d08770';
              ctx.font = 'bold 8px monospace';
              ctx.fillText('REDLINE', x + 2, y + 18);
            }
            break;

          case TILE_TYPES.LANDMARK_POLICE:
            // Precinct 4 Police Substation
            ctx.fillStyle = PALETTE.POLICE_WALL;
            ctx.fillRect(x, y, ts, ts);

            // Police Emblem & Beacon
            if (r === 18 && c === 4) {
              // Police Signboard
              ctx.fillStyle = PALETTE.POLICE_BLUE;
              ctx.fillRect(x - 8, y + 6, ts + 16, 14);
              ctx.fillStyle = '#eceff4';
              ctx.font = 'bold 8px monospace';
              ctx.fillText('POLICE P4', x - 6, y + 16);

              // Alternating flashing beacon light
              const isRed = Math.sin(this.policeBeaconTimer * 6) > 0;
              ctx.fillStyle = isRed ? PALETTE.POLICE_RED : PALETTE.POLICE_BLUE;
              ctx.beginPath();
              ctx.arc(x + 16, y + 4, 4, 0, Math.PI * 2);
              ctx.fill();

              // Beacon light spill
              ctx.fillStyle = isRed ? 'rgba(191, 97, 106, 0.25)' : 'rgba(94, 129, 172, 0.25)';
              ctx.beginPath();
              ctx.arc(x + 16, y + 4, 22, 0, Math.PI * 2);
              ctx.fill();
            }
            break;

          case TILE_TYPES.TREE:
            // Pocket park tree
            // Solid trunk base
            ctx.fillStyle = PALETTE.TREE_TRUNK;
            ctx.fillRect(x + 10, y + 10, 12, 12);

            // Lush circular canopy with highlight rim
            ctx.fillStyle = PALETTE.TREE_CANOPY;
            ctx.beginPath();
            ctx.arc(x + 16, y + 16, 18, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = PALETTE.TREE_CANOPY_RIM;
            ctx.lineWidth = 2.5;
            ctx.stroke();
            break;

          case TILE_TYPES.BOLLARD:
            // Safety bollard post with white reflector cap
            ctx.fillStyle = PALETTE.BOLLARD;
            ctx.beginPath();
            ctx.arc(x + ts / 2, y + ts / 2, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PALETTE.BOLLARD_CAP;
            ctx.beginPath();
            ctx.arc(x + ts / 2, y + ts / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
      }
    }
  }

  renderSurpriseWindow(sw) {
    const { ctx } = this;
    const wx = sw.col * TILE_SIZE;
    const wy = sw.row * TILE_SIZE;

    // Window frame
    ctx.fillStyle = '#1c202a';
    ctx.fillRect(wx + 6, wy + 4, 20, 24);

    // Dynamic flickering CRT TV blue glow
    const glowAlpha = Math.max(0.2, Math.min(0.95, sw.glowIntensity));
    ctx.fillStyle = `rgba(136, 192, 208, ${glowAlpha})`;
    ctx.fillRect(wx + 8, wy + 6, 16, 20);

    // Inner tube glow
    ctx.fillStyle = `rgba(236, 239, 244, ${glowAlpha * 0.7})`;
    ctx.fillRect(wx + 11, wy + 9, 10, 14);

    // Window crossbars
    ctx.strokeStyle = '#2e3440';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wx + 16, wy + 6);
    ctx.lineTo(wx + 16, wy + 26);
    ctx.moveTo(wx + 8, wy + 16);
    ctx.lineTo(wx + 24, wy + 16);
    ctx.stroke();

    // Passing silhouette
    if (sw.shadowVisible) {
      const silX = wx + 16 + sw.shadowOffset * 10;
      ctx.fillStyle = 'rgba(16, 20, 28, 0.92)';
      ctx.beginPath();
      ctx.arc(silX, wy + 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(silX - 4, wy + 15, 8, 10);
    }

    // Soft light bloom on pavement
    const grad = ctx.createRadialGradient(wx + 16, wy + 16, 2, wx + 16, wy + 16, 40);
    grad.addColorStop(0, `rgba(136, 192, 208, ${glowAlpha * 0.35})`);
    grad.addColorStop(1, 'rgba(136, 192, 208, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(wx + 16, wy + 16, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Renders Phase 2 Surprise: Stateful Props ("معماری حافظه‌دار")
   */
  renderStatefulProps(propsManager) {
    const { ctx } = this;
    const props = propsManager.getAllProps();

    for (const prop of props) {
      const px = prop.position.x;
      const py = prop.position.y;

      if (prop.type === 'poster') {
        // Wooden frame backing
        ctx.fillStyle = '#4c3f31';
        ctx.fillRect(px - 14, py - 12, 28, 24);

        if (prop.state === 'intact') {
          // Fresh colorful city concert poster
          ctx.fillStyle = '#ebcb8b';
          ctx.fillRect(px - 12, py - 10, 24, 20);

          ctx.fillStyle = '#bf616a';
          ctx.fillRect(px - 10, py - 8, 20, 5);

          ctx.fillStyle = '#2e3440';
          ctx.fillRect(px - 8, py, 16, 2);
          ctx.fillRect(px - 8, py + 4, 12, 2);
        } else {
          // TORN POSTER: Jagged paper fragments exposing dark wood
          ctx.fillStyle = '#ebcb8b';
          ctx.beginPath();
          ctx.moveTo(px - 12, py - 10);
          ctx.lineTo(px + 4, py - 10);
          ctx.lineTo(px - 2, py + 2);
          ctx.lineTo(px - 12, py + 4);
          ctx.closePath();
          ctx.fill();

          // Shredded paper hanging
          ctx.strokeStyle = '#d08770';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px - 2, py + 2);
          ctx.lineTo(px + 2, py + 8);
          ctx.stroke();
        }
      } else if (prop.type === 'lamp') {
        // Cast-iron pole
        ctx.fillStyle = '#2e3440';
        ctx.fillRect(px - 2, py - 16, 4, 20);

        // Lantern head
        ctx.fillStyle = '#434c5e';
        ctx.fillRect(px - 5, py - 20, 10, 6);

        if (prop.state === 'lit') {
          // Amber glowing light pool
          ctx.fillStyle = '#ebcb8b';
          ctx.beginPath();
          ctx.arc(px, py - 17, 3, 0, Math.PI * 2);
          ctx.fill();

          const grad = ctx.createRadialGradient(px, py, 4, px, py, 46);
          grad.addColorStop(0, 'rgba(235, 203, 139, 0.45)');
          grad.addColorStop(1, 'rgba(235, 203, 139, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, 46, 0, Math.PI * 2);
          ctx.fill();
        } else if (prop.state === 'flickering') {
          const isFlash = Math.random() > 0.4;
          if (isFlash) {
            ctx.fillStyle = '#ebcb8b';
            ctx.beginPath();
            ctx.arc(px, py - 17, 3, 0, Math.PI * 2);
            ctx.fill();

            const grad = ctx.createRadialGradient(px, py, 4, px, py, 38);
            grad.addColorStop(0, 'rgba(235, 203, 139, 0.25)');
            grad.addColorStop(1, 'rgba(235, 203, 139, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, 38, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Broken lamp: dark
          ctx.fillStyle = '#20242c';
          ctx.beginPath();
          ctx.arc(px, py - 17, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (prop.type === 'cabinet') {
        // Utility box
        ctx.fillStyle = '#4c566a';
        ctx.fillRect(px - 10, py - 10, 20, 20);

        if (prop.state === 'intact') {
          // High voltage lightning stencil
          ctx.strokeStyle = '#e5b839';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px, py - 6);
          ctx.lineTo(px - 3, py);
          ctx.lineTo(px + 2, py);
          ctx.lineTo(px - 1, py + 6);
          ctx.stroke();
        } else {
          // Opened door showing colorful wiring
          ctx.fillStyle = '#2e3440';
          ctx.fillRect(px - 8, py - 8, 16, 16);
          ctx.strokeStyle = '#bf616a';
          ctx.beginPath();
          ctx.moveTo(px - 5, py - 4);
          ctx.lineTo(px + 4, py + 4);
          ctx.stroke();
          ctx.strokeStyle = '#88c0d0';
          ctx.beginPath();
          ctx.moveTo(px + 4, py - 4);
          ctx.lineTo(px - 4, py + 4);
          ctx.stroke();
        }
      }
    }
  }

  renderPlayer(player) {
    const { ctx } = this;
    const px = Math.round(player.position.x);
    const py = Math.round(player.position.y);
    const heading = player.heading;

    // Soft drop shadow
    ctx.fillStyle = PALETTE.PLAYER_SHADOW;
    ctx.beginPath();
    ctx.ellipse(px, py + 10, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(heading);

    const stepBob = player.state === 'walking' ? Math.sin(player.walkBob) * 2.5 : 0;

    // Player shoes
    ctx.fillStyle = '#2e3440';
    ctx.fillRect(-6 + stepBob, -10, 6, 4);
    ctx.fillRect(-6 - stepBob, 6, 4);

    // Torso / Neon cyan jacket
    ctx.fillStyle = PALETTE.PLAYER_JACKET;
    ctx.beginPath();
    ctx.roundRect(-8, -9, 16, 18, 4);
    ctx.fill();

    // Dark trim
    ctx.fillStyle = '#00a8bb';
    ctx.fillRect(-8, -9, 4, 18);

    // Head / silhouette
    ctx.fillStyle = PALETTE.PLAYER_SILHOUETTE;
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Cap visor
    ctx.fillStyle = '#1e222b';
    ctx.beginPath();
    ctx.arc(2, 0, 4.5, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Directional indicator
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(6, -4);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();

    // Flashlight beam
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();

    ctx.restore();
  }

  renderRoofsAndCanopies(tileMap, camera) {
    const { ctx } = this;
    const ts = TILE_SIZE;

    const startCol = Math.max(0, Math.floor(camera.position.x / ts));
    const endCol = Math.min(tileMap.cols - 1, Math.ceil((camera.position.x + camera.viewportWidth) / ts));
    const startRow = Math.max(0, Math.floor(camera.position.y / ts));
    const endRow = Math.min(tileMap.rows - 1, Math.ceil((camera.position.y + camera.viewportHeight) / ts));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileType = tileMap.getTile(c, r);
        const x = c * ts;
        const y = r * ts;

        if (tileType === TILE_TYPES.BUILDING_ROOF) {
          ctx.fillStyle = PALETTE.BUILDING_ROOF;
          ctx.fillRect(x, y, ts, ts);
          ctx.fillStyle = '#1a1d24';
          ctx.fillRect(x + 4, y + 4, ts - 8, ts - 8);
        } else if (tileType === TILE_TYPES.BUILDING_CANOPY) {
          // Store entrance striped canopy awning with smooth occlusion
          ctx.save();
          ctx.globalAlpha = this.canopyAlpha;

          // Red and white striped diagonal awning
          ctx.fillStyle = PALETTE.CANOPY_STRIPE_A;
          ctx.fillRect(x, y, ts, ts);

          ctx.fillStyle = PALETTE.CANOPY_STRIPE_B;
          for (let sx = 0; sx < ts; sx += 8) {
            ctx.beginPath();
            ctx.moveTo(x + sx, y);
            ctx.lineTo(x + sx + 4, y);
            ctx.lineTo(x + sx, y + ts);
            ctx.lineTo(x + sx - 4, y + ts);
            ctx.closePath();
            ctx.fill();
          }

          // Awning shadow rim
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(x, y + ts - 4, ts, 4);

          ctx.restore();
        }
      }
    }
  }

  renderInteractionPrompts(world) {
    const { ctx } = this;

    // Proximity prompt for interactive stateful props
    if (world.activeNearbyProp) {
      const prop = world.activeNearbyProp;
      const px = Math.round(prop.position.x);
      const py = Math.round(prop.position.y - 24);

      ctx.save();
      ctx.fillStyle = 'rgba(18, 22, 30, 0.92)';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px - 44, py - 12, 88, 22, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[E] INTERACT', px, py + 3);
      ctx.restore();
    }

    // Inside canopy hint
    if (world.isPlayerUnderCanopy) {
      const px = Math.round(world.player.position.x);
      const py = Math.round(world.player.position.y - 28);

      ctx.save();
      ctx.fillStyle = 'rgba(18, 22, 30, 0.88)';
      ctx.strokeStyle = '#a3be8c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px - 58, py - 10, 116, 20, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#a3be8c';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STORE ENTRANCE', px, py + 4);
      ctx.restore();
    }
  }

  renderDebugObstacles(world) {
    const { ctx } = this;
    const obstacles = world.tileMap.getNearbyObstacles(world.player.getBoundingBox());

    ctx.strokeStyle = 'rgba(235, 203, 139, 0.8)';
    ctx.lineWidth = 1;
    for (const obs of obstacles) {
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    }

    const pb = world.player.getBoundingBox();
    ctx.strokeStyle = 'rgba(163, 190, 140, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pb.x, pb.y, pb.width, pb.height);
  }
}
