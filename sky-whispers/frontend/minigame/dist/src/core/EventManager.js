"use strict";
// ============================================================
// EventManager - Type-safe pub/sub event bus
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
class EventManager {
    constructor() {
        this.listeners = new Map();
    }
    static getInstance() {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }
    on(event, callback) {
        return this.addListener(event, callback, false);
    }
    once(event, callback) {
        return this.addListener(event, callback, true);
    }
    off(event, callback) {
        const list = this.listeners.get(event);
        if (!list)
            return;
        const idx = list.findIndex((l) => l.callback === callback);
        if (idx !== -1) {
            list.splice(idx, 1);
        }
        if (list.length === 0) {
            this.listeners.delete(event);
        }
    }
    emit(event, ...args) {
        const list = this.listeners.get(event);
        if (!list || list.length === 0)
            return;
        const payload = args[0];
        const toRemove = [];
        for (let i = 0; i < list.length; i++) {
            const listener = list[i];
            try {
                listener.callback(payload);
            }
            catch (err) {
                console.error(`[EventManager] Error in listener for "${event}":`, err);
            }
            if (listener.once) {
                toRemove.push(i);
            }
        }
        // Remove once listeners in reverse order
        for (let i = toRemove.length - 1; i >= 0; i--) {
            list.splice(toRemove[i], 1);
        }
        if (list.length === 0) {
            this.listeners.delete(event);
        }
    }
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
        }
        else {
            this.listeners.clear();
        }
    }
    listenerCount(event) {
        var _a, _b;
        return (_b = (_a = this.listeners.get(event)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }
    addListener(event, callback, once) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        const list = this.listeners.get(event);
        list.push({
            callback: callback,
            once,
        });
        // Return unsubscribe function
        return () => {
            this.off(event, callback);
        };
    }
}
exports.EventManager = EventManager;
//# sourceMappingURL=EventManager.js.map