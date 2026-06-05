"use strict";
// ============================================================
// Tween - Chainable animation/tween system
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tween = void 0;
exports.tween = tween;
const easing_1 = require("../utils/easing");
function initAction(tween) {
    var _a;
    if (tween.currentActionIndex >= tween.actions.length) {
        tween.active = false;
        return;
    }
    const action = tween.actions[tween.currentActionIndex];
    tween.elapsed = 0;
    if (action.type === 'to' || action.type === 'from') {
        tween.startValues = {};
        if (action.properties) {
            for (const key of Object.keys(action.properties)) {
                tween.startValues[key] = (_a = tween.target[key]) !== null && _a !== void 0 ? _a : 0;
            }
        }
    }
}
class Tween {
    constructor(target) {
        this.actions = [];
        this.target = target;
    }
    static create(target) {
        return new Tween(target);
    }
    to(properties, duration, easing) {
        this.actions.push({
            type: 'to',
            properties,
            duration,
            easing: easing !== null && easing !== void 0 ? easing : easing_1.linear,
        });
        return this;
    }
    from(properties, duration, easing) {
        this.actions.push({
            type: 'from',
            properties,
            duration,
            easing: easing !== null && easing !== void 0 ? easing : easing_1.linear,
        });
        return this;
    }
    delay(duration) {
        this.actions.push({
            type: 'delay',
            duration,
        });
        return this;
    }
    call(callback) {
        this.actions.push({
            type: 'call',
            callback,
        });
        return this;
    }
    repeat(times) {
        this.actions.push({
            type: 'repeat',
            times,
        });
        return this;
    }
    yoyo() {
        this.actions.push({
            type: 'yoyo',
        });
        return this;
    }
    start() {
        const tween = {
            target: this.target,
            actions: [...this.actions],
            currentActionIndex: 0,
            elapsed: 0,
            startValues: {},
            active: true,
            yoyoing: false,
            repeatCount: 0,
            repeatMax: 0,
        };
        initAction(tween);
        Tween.tweens.push(tween);
        return tween;
    }
    static update(dt) {
        for (let i = Tween.tweens.length - 1; i >= 0; i--) {
            const tween = Tween.tweens[i];
            if (!tween.active) {
                Tween.tweens.splice(i, 1);
                continue;
            }
            Tween.updateTween(tween, dt);
        }
    }
    static updateTween(tween, dt) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (tween.currentActionIndex >= tween.actions.length) {
            tween.active = false;
            return;
        }
        const action = tween.actions[tween.currentActionIndex];
        const durationMs = ((_a = action.duration) !== null && _a !== void 0 ? _a : 0) * 1000;
        switch (action.type) {
            case 'delay':
                tween.elapsed += dt;
                if (tween.elapsed >= durationMs) {
                    tween.currentActionIndex++;
                    initAction(tween);
                }
                break;
            case 'to': {
                tween.elapsed += dt;
                const progressTo = Math.min(tween.elapsed / durationMs, 1);
                const easedTo = ((_b = action.easing) !== null && _b !== void 0 ? _b : easing_1.linear)(progressTo);
                if (action.properties) {
                    for (const [key, endVal] of Object.entries(action.properties)) {
                        const startVal = (_c = tween.startValues[key]) !== null && _c !== void 0 ? _c : 0;
                        tween.target[key] = startVal + (endVal - startVal) * easedTo;
                    }
                }
                if (progressTo >= 1) {
                    tween.currentActionIndex++;
                    initAction(tween);
                }
                break;
            }
            case 'from': {
                tween.elapsed += dt;
                const progressFrom = Math.min(tween.elapsed / durationMs, 1);
                const easedFrom = ((_d = action.easing) !== null && _d !== void 0 ? _d : easing_1.linear)(progressFrom);
                if (action.properties) {
                    for (const [key, fromVal] of Object.entries(action.properties)) {
                        const endVal = (_e = tween.startValues[key]) !== null && _e !== void 0 ? _e : 0;
                        tween.target[key] = fromVal + (endVal - fromVal) * easedFrom;
                    }
                }
                if (progressFrom >= 1) {
                    tween.currentActionIndex++;
                    initAction(tween);
                }
                break;
            }
            case 'call':
                (_f = action.callback) === null || _f === void 0 ? void 0 : _f.call(action);
                tween.currentActionIndex++;
                initAction(tween);
                break;
            case 'repeat':
                tween.repeatMax = (_g = action.times) !== null && _g !== void 0 ? _g : 1;
                tween.repeatCount = 0;
                tween.currentActionIndex = 0;
                initAction(tween);
                break;
            case 'yoyo':
                tween.currentActionIndex = 0;
                initAction(tween);
                break;
            default:
                tween.currentActionIndex++;
                initAction(tween);
        }
    }
    static remove(tween) {
        const idx = Tween.tweens.indexOf(tween);
        if (idx !== -1) {
            tween.active = false;
            Tween.tweens.splice(idx, 1);
        }
    }
    static removeAll() {
        for (const tween of Tween.tweens) {
            tween.active = false;
        }
        Tween.tweens = [];
    }
    static getActiveCount() {
        return Tween.tweens.filter((t) => t.active).length;
    }
}
exports.Tween = Tween;
Tween.tweens = [];
// Convenience function
function tween(target) {
    return Tween.create(target);
}
//# sourceMappingURL=Tween.js.map