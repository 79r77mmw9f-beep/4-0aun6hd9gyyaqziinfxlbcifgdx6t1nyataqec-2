/**
 * LIVING CITY - Deterministic Simulation Clock
 * Fixed timestep update loop (60 Hz) with pause and frame stepping.
 */

export class Clock {
  constructor(targetFps = 60) {
    this.targetFps = targetFps;
    this.fixedDelta = 1 / targetFps; // 0.016666...s
    this.tick = 0;
    this.elapsedTime = 0;
    this.accumulator = 0;
    this.paused = false;
    this.lastTime = 0;
    this.maxAccumulation = 0.25; // prevent spiral of death
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.lastTime = performance.now();
  }

  togglePause() {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
    return this.paused;
  }

  isPaused() {
    return this.paused;
  }

  /**
   * Advances simulation with fixed timestep.
   * Calls onFixedTick(fixedDelta, tick) for each consumed tick.
   */
  update(currentTime, onFixedTick) {
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
      return 0;
    }

    let frameDelta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.paused) {
      return 0;
    }

    if (frameDelta > this.maxAccumulation) {
      frameDelta = this.maxAccumulation;
    }

    this.accumulator += frameDelta;
    let ticksExecuted = 0;

    while (this.accumulator >= this.fixedDelta) {
      this.tick += 1;
      this.elapsedTime += this.fixedDelta;
      if (onFixedTick) {
        onFixedTick(this.fixedDelta, this.tick);
      }
      this.accumulator -= this.fixedDelta;
      ticksExecuted += 1;
    }

    return ticksExecuted;
  }

  /**
   * Manual single step (used for debugging/testing).
   */
  stepOnce(onFixedTick) {
    this.tick += 1;
    this.elapsedTime += this.fixedDelta;
    if (onFixedTick) {
      onFixedTick(this.fixedDelta, this.tick);
    }
    return this.tick;
  }

  reset() {
    this.tick = 0;
    this.elapsedTime = 0;
    this.accumulator = 0;
    this.lastTime = 0;
  }
}
