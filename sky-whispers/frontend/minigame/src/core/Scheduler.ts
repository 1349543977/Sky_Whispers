// ============================================================
// Scheduler - Game loop with delta time and fixed timestep
// ============================================================

import { GAME } from '../utils/constants';

export class Scheduler {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private fixedTimestep: number;
  private running: boolean = false;
  private rafId: number = 0;
  private updateCallback: ((dt: number) => void) | null = null;
  private fixedUpdateCallback: ((dt: number) => void) | null = null;
  private renderCallback: (() => void) | null = null;
  private maxDelta: number;

  constructor() {
    this.fixedTimestep = GAME.FIXED_TIMESTEP;
    this.maxDelta = GAME.MAX_DELTA;
  }

  setUpdateCallback(cb: (dt: number) => void): void {
    this.updateCallback = cb;
  }

  setFixedUpdateCallback(cb: (dt: number) => void): void {
    this.fixedUpdateCallback = cb;
  }

  setRenderCallback(cb: () => void): void {
    this.renderCallback = cb;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = Date.now();
    this.accumulator = 0;
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  pause(): void {
    this.running = false;
  }

  resume(): void {
    if (!this.running) {
      this.running = true;
      this.lastTime = Date.now();
      this.accumulator = 0;
      this.tick();
    }
  }

  get isRunning(): boolean {
    return this.running;
  }

  private tick(): void {
    if (!this.running) return;

    this.rafId = requestAnimationFrame(() => this.tick());

    const now = Date.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Clamp delta to prevent spiral of death
    dt = Math.min(dt, this.maxDelta);

    // Variable update
    if (this.updateCallback) {
      this.updateCallback(dt);
    }

    // Fixed update accumulation
    this.accumulator += dt;
    while (this.accumulator >= this.fixedTimestep) {
      if (this.fixedUpdateCallback) {
        this.fixedUpdateCallback(this.fixedTimestep);
      }
      this.accumulator -= this.fixedTimestep;
    }

    // Render
    if (this.renderCallback) {
      this.renderCallback();
    }
  }
}
