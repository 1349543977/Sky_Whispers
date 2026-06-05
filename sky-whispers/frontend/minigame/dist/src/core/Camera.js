"use strict";
// ============================================================
// Camera - 2D camera with pan, zoom, and follow
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Camera = void 0;
const math_1 = require("../utils/math");
class Camera {
    constructor(screenWidth, screenHeight) {
        this.position = { x: 0, y: 0 };
        this.zoomLevel = 1;
        this.targetPosition = null;
        this.targetZoom = null;
        this.followTarget = null;
        this.bounds = null;
        this.smoothing = 0.1;
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }
    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }
    get zoom() {
        return this.zoomLevel;
    }
    setBounds(minX, minY, maxX, maxY) {
        this.bounds = { minX, minY, maxX, maxY };
    }
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.targetPosition = null;
        this.clampPosition();
    }
    setZoom(zoom) {
        this.zoomLevel = (0, math_1.clamp)(zoom, 0.5, 3);
        this.targetZoom = null;
    }
    panTo(x, y, smooth = true) {
        if (smooth) {
            this.targetPosition = { x, y };
        }
        else {
            this.position.x = x;
            this.position.y = y;
        }
    }
    zoomTo(zoom, smooth = true) {
        if (smooth) {
            this.targetZoom = (0, math_1.clamp)(zoom, 0.5, 3);
        }
        else {
            this.zoomLevel = (0, math_1.clamp)(zoom, 0.5, 3);
        }
    }
    follow(target) {
        this.followTarget = target;
    }
    stopFollow() {
        this.followTarget = null;
    }
    update(dt) {
        // Follow target
        if (this.followTarget) {
            const targetX = this.followTarget.x - this.screenWidth / (2 * this.zoomLevel);
            const targetY = this.followTarget.y - this.screenHeight / (2 * this.zoomLevel);
            this.position.x = (0, math_1.lerp)(this.position.x, targetX, this.smoothing);
            this.position.y = (0, math_1.lerp)(this.position.y, targetY, this.smoothing);
        }
        // Smooth pan
        if (this.targetPosition) {
            this.position.x = (0, math_1.lerp)(this.position.x, this.targetPosition.x, this.smoothing);
            this.position.y = (0, math_1.lerp)(this.position.y, this.targetPosition.y, this.smoothing);
            const dx = Math.abs(this.position.x - this.targetPosition.x);
            const dy = Math.abs(this.position.y - this.targetPosition.y);
            if (dx < 0.5 && dy < 0.5) {
                this.position.x = this.targetPosition.x;
                this.position.y = this.targetPosition.y;
                this.targetPosition = null;
            }
        }
        // Smooth zoom
        if (this.targetZoom !== null) {
            this.zoomLevel = (0, math_1.lerp)(this.zoomLevel, this.targetZoom, this.smoothing);
            if (Math.abs(this.zoomLevel - this.targetZoom) < 0.01) {
                this.zoomLevel = this.targetZoom;
                this.targetZoom = null;
            }
        }
        this.clampPosition();
    }
    applyTransform(ctx) {
        ctx.scale(this.zoomLevel, this.zoomLevel);
        ctx.translate(-this.position.x, -this.position.y);
    }
    screenToWorld(screenX, screenY) {
        return {
            x: screenX / this.zoomLevel + this.position.x,
            y: screenY / this.zoomLevel + this.position.y,
        };
    }
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.position.x) * this.zoomLevel,
            y: (worldY - this.position.y) * this.zoomLevel,
        };
    }
    updateScreenSize(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
    }
    clampPosition() {
        if (!this.bounds)
            return;
        this.position.x = (0, math_1.clamp)(this.position.x, this.bounds.minX, this.bounds.maxX - this.screenWidth / this.zoomLevel);
        this.position.y = (0, math_1.clamp)(this.position.y, this.bounds.minY, this.bounds.maxY - this.screenHeight / this.zoomLevel);
    }
}
exports.Camera = Camera;
//# sourceMappingURL=Camera.js.map