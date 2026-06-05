"use strict";
// ============================================================
// Easing Functions
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.easingMap = exports.easeInBack = exports.easeOutBack = exports.easeInOutBounce = exports.easeOutBounce = exports.easeInBounce = exports.easeInOutElastic = exports.easeOutElastic = exports.easeInElastic = exports.easeInOutCubic = exports.easeOutCubic = exports.easeInCubic = exports.easeInOutQuad = exports.easeOutQuad = exports.easeInQuad = exports.linear = void 0;
const linear = (t) => t;
exports.linear = linear;
const easeInQuad = (t) => t * t;
exports.easeInQuad = easeInQuad;
const easeOutQuad = (t) => t * (2 - t);
exports.easeOutQuad = easeOutQuad;
const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
exports.easeInOutQuad = easeInOutQuad;
const easeInCubic = (t) => t * t * t;
exports.easeInCubic = easeInCubic;
const easeOutCubic = (t) => {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
};
exports.easeOutCubic = easeOutCubic;
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
exports.easeInOutCubic = easeInOutCubic;
const easeInElastic = (t) => {
    if (t === 0 || t === 1)
        return t;
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
};
exports.easeInElastic = easeInElastic;
const easeOutElastic = (t) => {
    if (t === 0 || t === 1)
        return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
};
exports.easeOutElastic = easeOutElastic;
const easeInOutElastic = (t) => {
    if (t === 0 || t === 1)
        return t;
    const t1 = t * 2;
    if (t1 < 1) {
        return -0.5 * Math.pow(2, 10 * (t1 - 1)) * Math.sin((t1 - 1.1) * 5 * Math.PI);
    }
    return (0.5 * Math.pow(2, -10 * (t1 - 1)) * Math.sin((t1 - 1.1) * 5 * Math.PI) + 1);
};
exports.easeInOutElastic = easeInOutElastic;
const easeInBounce = (t) => 1 - (0, exports.easeOutBounce)(1 - t);
exports.easeInBounce = easeInBounce;
const easeOutBounce = (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
        return n1 * t * t;
    }
    else if (t < 2 / d1) {
        const t1 = t - 1.5 / d1;
        return n1 * t1 * t1 + 0.75;
    }
    else if (t < 2.5 / d1) {
        const t1 = t - 2.25 / d1;
        return n1 * t1 * t1 + 0.9375;
    }
    else {
        const t1 = t - 2.625 / d1;
        return n1 * t1 * t1 + 0.984375;
    }
};
exports.easeOutBounce = easeOutBounce;
const easeInOutBounce = (t) => t < 0.5
    ? (1 - (0, exports.easeOutBounce)(1 - 2 * t)) / 2
    : (1 + (0, exports.easeOutBounce)(2 * t - 1)) / 2;
exports.easeInOutBounce = easeInOutBounce;
const easeOutBack = (t) => {
    const s = 1.70158;
    const t1 = t - 1;
    return t1 * t1 * ((s + 1) * t1 + s) + 1;
};
exports.easeOutBack = easeOutBack;
const easeInBack = (t) => {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
};
exports.easeInBack = easeInBack;
exports.easingMap = {
    linear: exports.linear,
    easeInQuad: exports.easeInQuad,
    easeOutQuad: exports.easeOutQuad,
    easeInOutQuad: exports.easeInOutQuad,
    easeInCubic: exports.easeInCubic,
    easeOutCubic: exports.easeOutCubic,
    easeInOutCubic: exports.easeInOutCubic,
    easeInElastic: exports.easeInElastic,
    easeOutElastic: exports.easeOutElastic,
    easeInOutElastic: exports.easeInOutElastic,
    easeInBounce: exports.easeInBounce,
    easeOutBounce: exports.easeOutBounce,
    easeInOutBounce: exports.easeInOutBounce,
    easeOutBack: exports.easeOutBack,
    easeInBack: exports.easeInBack,
};
//# sourceMappingURL=easing.js.map