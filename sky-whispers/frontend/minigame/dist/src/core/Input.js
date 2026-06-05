"use strict";
// ============================================================
// Input - Touch input handler with gesture recognition
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const math_1 = require("../utils/math");
class Input {
    constructor() {
        this.targets = [];
        this.activeTouches = new Map();
        this.longPressTimers = new Map();
        this.touchStartPoints = new Map();
        this.globalListeners = new Map();
        this.longPressThreshold = 500;
        this.tapDistanceThreshold = 10;
        this.isDragging = false;
        this.dragStartPoint = null;
        this.dragThreshold = 5;
        this.bindWxEvents();
    }
    bindWxEvents() {
        wx.onTouchStart((e) => {
            this.handleTouchStart(this.convertWxEvent(e, 'touchstart'));
        });
        wx.onTouchMove((e) => {
            this.handleTouchMove(this.convertWxEvent(e, 'touchmove'));
        });
        wx.onTouchEnd((e) => {
            this.handleTouchEnd(this.convertWxEvent(e, 'touchend'));
        });
        wx.onTouchCancel((e) => {
            this.handleTouchEnd(this.convertWxEvent(e, 'touchend'));
        });
    }
    convertWxEvent(e, type) {
        return {
            type,
            touches: e.touches.map((t) => ({
                identifier: t.identifier,
                x: t.clientX,
                y: t.clientY,
            })),
            changedTouches: e.changedTouches.map((t) => ({
                identifier: t.identifier,
                x: t.clientX,
                y: t.clientY,
            })),
            timeStamp: e.timeStamp,
        };
    }
    addTarget(target) {
        this.targets.push(target);
    }
    removeTarget(id) {
        this.targets = this.targets.filter((t) => t.id !== id);
    }
    clearTargets() {
        this.targets = [];
    }
    on(event, callback) {
        if (!this.globalListeners.has(event)) {
            this.globalListeners.set(event, []);
        }
        this.globalListeners.get(event).push(callback);
        return () => {
            const list = this.globalListeners.get(event);
            if (list) {
                const idx = list.indexOf(callback);
                if (idx !== -1)
                    list.splice(idx, 1);
            }
        };
    }
    emitGlobal(event, data) {
        const list = this.globalListeners.get(event);
        if (list) {
            for (const cb of list) {
                try {
                    cb(data);
                }
                catch (err) {
                    console.error('[Input] Global listener error:', err);
                }
            }
        }
    }
    handleTouchStart(event) {
        var _a;
        this.emitGlobal('touchstart', event);
        for (const touch of event.changedTouches) {
            this.activeTouches.set(touch.identifier, touch);
            this.touchStartPoints.set(touch.identifier, Object.assign({}, touch));
            // Start long press timer
            const timerId = setTimeout(() => {
                this.handleLongPress(touch);
            }, this.longPressThreshold);
            this.longPressTimers.set(touch.identifier, timerId);
            // Check targets
            for (const target of this.targets) {
                if ((0, math_1.pointInRect)(touch.x, touch.y, target.x, target.y, target.width, target.height)) {
                    (_a = target.onTouchStart) === null || _a === void 0 ? void 0 : _a.call(target, touch);
                }
            }
        }
    }
    handleTouchMove(event) {
        var _a;
        this.emitGlobal('touchmove', event);
        for (const touch of event.changedTouches) {
            this.activeTouches.set(touch.identifier, touch);
            // Cancel long press if moved too far
            const startPoint = this.touchStartPoints.get(touch.identifier);
            if (startPoint) {
                const dx = touch.x - startPoint.x;
                const dy = touch.y - startPoint.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > this.dragThreshold && !this.isDragging) {
                    this.isDragging = true;
                    this.dragStartPoint = startPoint;
                    this.cancelLongPress(touch.identifier);
                }
            }
            // Check targets
            for (const target of this.targets) {
                if ((0, math_1.pointInRect)(touch.x, touch.y, target.x, target.y, target.width, target.height)) {
                    (_a = target.onTouchMove) === null || _a === void 0 ? void 0 : _a.call(target, touch);
                }
            }
        }
    }
    handleTouchEnd(event) {
        var _a;
        this.emitGlobal('touchend', event);
        for (const touch of event.changedTouches) {
            // Cancel long press timer
            this.cancelLongPress(touch.identifier);
            const startPoint = this.touchStartPoints.get(touch.identifier);
            // Check for tap
            if (startPoint && !this.isDragging) {
                const dx = touch.x - startPoint.x;
                const dy = touch.y - startPoint.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= this.tapDistanceThreshold) {
                    this.handleTap(touch);
                }
            }
            // Check targets
            for (const target of this.targets) {
                (_a = target.onTouchEnd) === null || _a === void 0 ? void 0 : _a.call(target, touch);
            }
            this.activeTouches.delete(touch.identifier);
            this.touchStartPoints.delete(touch.identifier);
        }
        this.isDragging = false;
        this.dragStartPoint = null;
    }
    handleTap(touch) {
        var _a;
        for (const target of this.targets) {
            if ((0, math_1.pointInRect)(touch.x, touch.y, target.x, target.y, target.width, target.height)) {
                (_a = target.onTap) === null || _a === void 0 ? void 0 : _a.call(target, touch);
            }
        }
    }
    handleLongPress(touch) {
        var _a;
        for (const target of this.targets) {
            if ((0, math_1.pointInRect)(touch.x, touch.y, target.x, target.y, target.width, target.height)) {
                (_a = target.onLongPress) === null || _a === void 0 ? void 0 : _a.call(target, touch);
            }
        }
        this.longPressTimers.delete(touch.identifier);
    }
    cancelLongPress(identifier) {
        const timerId = this.longPressTimers.get(identifier);
        if (timerId !== undefined) {
            clearTimeout(timerId);
            this.longPressTimers.delete(identifier);
        }
    }
    get isPressed() {
        return this.activeTouches.size > 0;
    }
    getActiveTouches() {
        return Array.from(this.activeTouches.values());
    }
}
exports.Input = Input;
//# sourceMappingURL=Input.js.map