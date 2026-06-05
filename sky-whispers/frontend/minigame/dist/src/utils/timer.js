"use strict";
// ============================================================
// Timer Utilities
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimerManager = exports.Timer = void 0;
exports.formatTime = formatTime;
exports.formatDuration = formatDuration;
exports.now = now;
exports.todayDateString = todayDateString;
class Timer {
    constructor(duration, callback, recurring = false) {
        this.elapsed = 0;
        this.active = true;
        this.duration = duration;
        this.callback = callback;
        this.recurring = recurring;
    }
    update(dt) {
        if (!this.active)
            return;
        this.elapsed += dt;
        if (this.elapsed >= this.duration) {
            this.callback();
            if (this.recurring) {
                this.elapsed -= this.duration;
            }
            else {
                this.active = false;
            }
        }
    }
    get progress() {
        return Math.min(this.elapsed / this.duration, 1);
    }
    get isActive() {
        return this.active;
    }
    reset() {
        this.elapsed = 0;
        this.active = true;
    }
    cancel() {
        this.active = false;
    }
}
exports.Timer = Timer;
class TimerManager {
    constructor() {
        this.timers = [];
    }
    addTimer(duration, callback, recurring = false) {
        const timer = new Timer(duration, callback, recurring);
        this.timers.push(timer);
        return timer;
    }
    update(dt) {
        for (let i = this.timers.length - 1; i >= 0; i--) {
            this.timers[i].update(dt);
            if (!this.timers[i].isActive) {
                this.timers.splice(i, 1);
            }
        }
    }
    clear() {
        this.timers = [];
    }
    removeTimer(timer) {
        const idx = this.timers.indexOf(timer);
        if (idx !== -1) {
            this.timers.splice(idx, 1);
        }
    }
}
exports.TimerManager = TimerManager;
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}
function formatDuration(ms) {
    if (ms < 60000) {
        return `${Math.ceil(ms / 1000)}秒`;
    }
    if (ms < 3600000) {
        return `${Math.floor(ms / 60000)}分钟`;
    }
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (minutes === 0) {
        return `${hours}小时`;
    }
    return `${hours}小时${minutes}分钟`;
}
function now() {
    return Date.now();
}
function todayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}
//# sourceMappingURL=timer.js.map