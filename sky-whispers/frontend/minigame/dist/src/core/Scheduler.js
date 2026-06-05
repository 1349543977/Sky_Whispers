"use strict";
// ============================================================
// Scheduler - Game loop with delta time and fixed timestep
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const constants_1 = require("../utils/constants");
class Scheduler {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.running = false;
        this.rafId = 0;
        this.updateCallback = null;
        this.fixedUpdateCallback = null;
        this.renderCallback = null;
        this.fixedTimestep = constants_1.GAME.FIXED_TIMESTEP;
        this.maxDelta = constants_1.GAME.MAX_DELTA;
    }
    setUpdateCallback(cb) {
        this.updateCallback = cb;
    }
    setFixedUpdateCallback(cb) {
        this.fixedUpdateCallback = cb;
    }
    setRenderCallback(cb) {
        this.renderCallback = cb;
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.lastTime = Date.now();
        this.accumulator = 0;
        this.tick();
    }
    stop() {
        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }
    pause() {
        this.running = false;
    }
    resume() {
        if (!this.running) {
            this.running = true;
            this.lastTime = Date.now();
            this.accumulator = 0;
            this.tick();
        }
    }
    get isRunning() {
        return this.running;
    }
    tick() {
        if (!this.running)
            return;
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
exports.Scheduler = Scheduler;
//# sourceMappingURL=Scheduler.js.map