/**
 * LIVING CITY - 2D Canvas Renderer
 * High-clarity oblique urban rendering with pixel-crisp details, shadows & lighting.
 */

import { TILE_SIZE, TILE_TYPES, PALETTE } from '../core/Constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.showDebugCollision = false;
  }

  clear() {
    this.ctx.fillStyle = '#101216';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Main render entry point.
   */
  render(world, camera) {
    this.clear();

    const { ctx } = this;
    ctx.save();
    // Translate canvas by camera offset
    ctx.translate(-Math.round(camera.position.x), -Math.round(camera.position.y));

    // 1. Render Map Tiles
    this.renderTileMap(world.tileMap, camera);

    // 2. Render Surprise Window (Phase 1 narrative seed)
    if (world.surpriseWindow) {
      this.renderSurpriseWindow(world.surpriseWindow);
    }

    // 3. Render Player
    if (world.player) {
      this.renderPlayer(world.player);
    }

    // 4. Debug Overlays (if active)
    if (this.showDebugCollision) {
      this.renderDebugObstacles(world);
    }

    ctx.restore();
  }

  renderTileMap(tileMap, camera) {
    const { ctx } = this;
    const ts = TILE_SIZE;

    // Viewport tile range culling
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

            // Subtle road grain / dashes
            if (r === 14 && c % 2 === 0) {
              // Yellow center divider line
              ctx.fillStyle = PALETTE.ROAD_MARKING;
              ctx.fillRect(x, y + ts / 2 - 2, ts, 4);
            }
            break;

          case TILE_TYPES.SIDEWALK:
            ctx.fillStyle = PALETTE.SIDEWALK;
            ctx.fillRect(x, y, ts, ts);
            // Sidewalk tile joint borders
            ctx.strokeStyle = PALETTE.SIDEWALK_LINE;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, ts - 1, ts - 1);
            break;

          case TILE_TYPES.CROSSWALK:
            // Asphalt base with white zebra stripes
            ctx.fillStyle = PALETTE.ASPHALT;
            ctx.fillRect(x, y, ts, ts);
            ctx.fillStyle = PALETTE.ROAD_MARKING_WHITE;
            for (let i = 4; i < ts; i += 10) {
              ctx.fillRect(x + 2, y + i, ts - 4, 5);
            }
            break;

          case TILE_TYPES.BUILDING_WALL:
            // Oblique building wall with rim lighting
            ctx.fillStyle = PALETTE.BUILDING_WALL;
            ctx.fillRect(x, y, ts, ts);
            // Outer wall border
            ctx.fillStyle = PALETTE.BUILDING_LIP;
            ctx.fillRect(x, y, ts, 3);
            ctx.fillStyle = '#2b303c';
            ctx.fillRect(x, y + ts - 4, ts, 4);
            break;

          case TILE_TYPES.BUILDING_ROOF:
            // Recessed roof area with dark ventilation/gravel texture
            ctx.fillStyle = PALETTE.BUILDING_ROOF;
            ctx.fillRect(x, y, ts, ts);
            ctx.fillStyle = '#1a1d24';
            ctx.fillRect(x + 4, y + 4, ts - 8, ts - 8);
            break;

          case TILE_TYPES.BOLLARD:
            // Concrete base + Red safety bollard with white reflector cap
            ctx.fillStyle = PALETTE.SIDEWALK;
            ctx.fillRect(x, y, ts, ts);

            // Bollard post
            ctx.fillStyle = PALETTE.BOLLARD;
            ctx.beginPath();
            ctx.arc(x + ts / 2, y + ts / 2, 7, 0, Math.PI * 2);
            ctx.fill();

            // Reflector cap
            ctx.fillStyle = PALETTE.BOLLARD_CAP;
            ctx.beginPath();
            ctx.arc(x + ts / 2, y + ts / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            break;

          case TILE_TYPES.SURPRISE_WINDOW:
            // Wall background for the window
            ctx.fillStyle = PALETTE.BUILDING_WALL;
            ctx.fillRect(x, y, ts, ts);
            break;

          default:
            ctx.fillStyle = '#0f1115';
            ctx.fillRect(x, y, ts, ts);
        }
      }
    }
  }

  /**
   * Renders Phase 1 Surprise: "The City Watches You"
   */
  renderSurpriseWindow(sw) {
    const { ctx } = this;
    const wx = sw.col * TILE_SIZE;
    const wy = sw.row * TILE_SIZE;

    // Window frame
    ctx.fillStyle = '#1c202a';
    ctx.fillRect(wx + 6, wy + 4, 20, 24);

    // Dynamic flickering CRT TV blue glow inside window
    const glowAlpha = Math.max(0.2, Math.min(0.95, sw.glowIntensity));
    ctx.fillStyle = `rgba(136, 192, 208, ${glowAlpha})`;
    ctx.fillRect(wx + 8, wy + 6, 16, 20);

    // Inner bright center tube glow
    ctx.fillStyle = `rgba(236, 239, 244, ${glowAlpha * 0.7})`;
    ctx.fillRect(wx + 11, wy + 9, 10, 14);

    // Window pane mullion crossbars
    ctx.strokeStyle = '#2e3440';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wx + 16, wy + 6);
    ctx.lineTo(wx + 16, wy + 26);
    ctx.moveTo(wx + 8, wy + 16);
    ctx.lineTo(wx + 24, wy + 16);
    ctx.stroke();

    // Passing silhouette figure inside the room
    if (sw.shadowVisible) {
      const silX = wx + 16 + sw.shadowOffset * 10;
      ctx.fillStyle = 'rgba(16, 20, 28, 0.92)';
      // Head
      ctx.beginPath();
      ctx.arc(silX, wy + 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Shoulders/torso
      ctx.fillRect(silX - 4, wy + 15, 8, 10);
    }

    // Soft light bloom casting onto pavement in front of building
    const grad = ctx.createRadialGradient(
      wx + 16, wy + 16, 2,
      wx + 16, wy + 16, 40
    );
    grad.addColorStop(0, `rgba(136, 192, 208, ${glowAlpha * 0.35})`);
    grad.addColorStop(1, 'rgba(136, 192, 208, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(wx + 16, wy + 16, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Renders the distinctive player character sprite.
   */
  renderPlayer(player) {
    const { ctx } = this;
    const px = Math.round(player.position.x);
    const py = Math.round(player.position.y);
    const heading = player.heading;

    // 1. Soft oval drop shadow
    ctx.fillStyle = PALETTE.PLAYER_SHADOW;
    ctx.beginPath();
    ctx.ellipse(px, py + 10, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(heading);

    // Footstep animation offset
    const stepBob = player.state === 'walking' ? Math.sin(player.walkBob) * 2.5 : 0;

    // 2. Player feet/shoes
    ctx.fillStyle = '#2e3440';
    ctx.fillRect(-6 + stepBob, -10, 6, 4);
    ctx.fillRect(-6 - stepBob, 6, 6, 4);

    // 3. Torso / Jacket (High contrast cyan neon jacket for instant readability)
    ctx.fillStyle = PALETTE.PLAYER_JACKET;
    ctx.beginPath();
    // Rounded jacket body
    ctx.roundRect(-8, -9, 16, 18, 4);
    ctx.fill();

    // Jacket dark trim & collar
    ctx.fillStyle = '#00a8bb';
    ctx.fillRect(-8, -9, 4, 18);

    // 4. Head / Cap
    ctx.fillStyle = PALETTE.PLAYER_SILHOUETTE;
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Dark cap visor
    ctx.fillStyle = '#1e222b';
    ctx.beginPath();
    ctx.arc(2, 0, 4.5, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // 5. Directional indicator (White triangle pointing forward in facing direction)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(6, -4);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();

    // 6. Forward flashlight / vision cone line (subtle beam)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();

    ctx.restore();
  }

  renderDebugObstacles(world) {
    const { ctx } = this;
    const obstacles = world.tileMap.getNearbyObstacles(world.player.getBoundingBox());

    ctx.strokeStyle = 'rgba(235, 203, 139, 0.8)';
    ctx.lineWidth = 1;
    for (const obs of obstacles) {
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    }

    // Player bounding box
    const pb = world.player.getBoundingBox();
    ctx.strokeStyle = 'rgba(163, 190, 140, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pb.x, pb.y, pb.width, pb.height);
  }
}
