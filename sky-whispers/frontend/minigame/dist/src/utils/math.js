"use strict";
// ============================================================
// Math Utilities
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.lerp = lerp;
exports.lerpAngle = lerpAngle;
exports.randomRange = randomRange;
exports.randomInt = randomInt;
exports.randomPick = randomPick;
exports.distance = distance;
exports.distanceSq = distanceSq;
exports.normalize = normalize;
exports.dot = dot;
exports.degToRad = degToRad;
exports.radToDeg = radToDeg;
exports.mapRange = mapRange;
exports.smoothStep = smoothStep;
exports.pointInRect = pointInRect;
exports.pointInCircle = pointInCircle;
exports.rectIntersect = rectIntersect;
exports.easeOutBack = easeOutBack;
exports.easeOutElastic = easeOutElastic;
exports.easeOutCubic = easeOutCubic;
exports.easeInOutCubic = easeInOutCubic;
exports.easeOutQuart = easeOutQuart;
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > Math.PI)
        diff -= Math.PI * 2;
    while (diff < -Math.PI)
        diff += Math.PI * 2;
    return a + diff * t;
}
function randomRange(min, max) {
    return min + Math.random() * (max - min);
}
function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}
function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
function distanceSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
}
function normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len === 0)
        return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
}
function dot(a, b) {
    return a.x * b.x + a.y * b.y;
}
function degToRad(deg) {
    return (deg * Math.PI) / 180;
}
function radToDeg(rad) {
    return (rad * 180) / Math.PI;
}
function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}
function smoothStep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}
function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
function pointInCircle(px, py, cx, cy, radius) {
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= radius * radius;
}
function rectIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
// ============================================================
// Easing Functions - For Cloud Whisper animations
// ============================================================
function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function easeOutElastic(t) {
    if (t === 0 || t === 1)
        return t;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}
//# sourceMappingURL=math.js.map