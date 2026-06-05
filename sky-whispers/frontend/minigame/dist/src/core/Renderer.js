"use strict";
// ============================================================
// Renderer - Canvas 2D rendering with layered support
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
const constants_1 = require("../utils/constants");
class Renderer {
    constructor() {
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.dpr = 1;
        this.commands = [];
        this.canvas = wx.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.dpr = wx.getSystemInfoSync().pixelRatio;
        this.updateScreenSize();
    }
    updateScreenSize() {
        const info = wx.getSystemInfoSync();
        this.screenWidth = info.windowWidth;
        this.screenHeight = info.windowHeight;
        this.canvas.width = this.screenWidth * this.dpr;
        this.canvas.height = this.screenHeight * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
    }
    get width() {
        return this.screenWidth;
    }
    get height() {
        return this.screenHeight;
    }
    get pixelRatio() {
        return this.dpr;
    }
    get context() {
        return this.ctx;
    }
    get mainCanvas() {
        return this.canvas;
    }
    addCommand(command) {
        this.commands.push(command);
    }
    clear() {
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);
    }
    render() {
        this.clear();
        // Sort commands by layer (ascending)
        this.commands.sort((a, b) => a.layer - b.layer);
        for (const cmd of this.commands) {
            this.ctx.save();
            cmd.draw(this.ctx);
            this.ctx.restore();
        }
        this.commands = [];
    }
    // Convenience drawing methods
    fillRect(x, y, w, h, color, layer = constants_1.LAYERS.UI) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            },
        });
    }
    strokeRect(x, y, w, h, color, lineWidth = 1, layer = constants_1.LAYERS.UI) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                ctx.strokeRect(x, y, w, h);
            },
        });
    }
    fillRoundRect(x, y, w, h, radius, color, layer = constants_1.LAYERS.UI) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.fillStyle = color;
                this.drawRoundRectPath(ctx, x, y, w, h, radius);
                ctx.fill();
            },
        });
    }
    strokeRoundRect(x, y, w, h, radius, color, lineWidth = 1, layer = constants_1.LAYERS.UI) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                this.drawRoundRectPath(ctx, x, y, w, h, radius);
                ctx.stroke();
            },
        });
    }
    fillText(text, x, y, color, fontSize = 14, align = 'left', baseline = 'top', layer = constants_1.LAYERS.UI) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.fillStyle = color;
                ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif`;
                ctx.textAlign = align;
                ctx.textBaseline = baseline;
                ctx.fillText(text, x, y);
            },
        });
    }
    // Alias for fillText - commonly used name in game code
    drawText(text, x, y, color, fontSize = 14, align = 'left', baseline = 'top', layer = constants_1.LAYERS.UI) {
        this.fillText(text, x, y, color, fontSize, align, baseline, layer);
    }
    drawCircle(cx, cy, radius, color, fill = true, layer = constants_1.LAYERS.UI) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                if (fill) {
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                else {
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
            },
        });
    }
    drawLine(x1, y1, x2, y2, color, lineWidth = 1, layer = constants_1.LAYERS.UI) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            },
        });
    }
    drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh, layer = constants_1.LAYERS.ENTITIES) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
            },
        });
    }
    drawGradientRect(x, y, w, h, colorStart, colorEnd, vertical = true, layer = constants_1.LAYERS.BACKGROUND) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                const gradient = vertical
                    ? ctx.createLinearGradient(x, y, x, y + h)
                    : ctx.createLinearGradient(x, y, x + w, y);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, w, h);
            },
        });
    }
    setAlpha(alpha, layer, drawFn) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.globalAlpha = alpha;
                drawFn(ctx);
                ctx.globalAlpha = 1;
            },
        });
    }
    /** Draw a soft shadow beneath an element */
    drawSoftShadow(cx, cy, rx, ry, blur, color, layer = constants_1.LAYERS.ENTITIES) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.save();
                ctx.filter = `blur(${blur}px)`;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
        });
    }
    /** Draw a radial gradient circle (for glows, halos) */
    drawRadialGlow(cx, cy, innerRadius, outerRadius, innerColor, outerColor, layer = constants_1.LAYERS.EFFECTS) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                const gradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
                gradient.addColorStop(0, innerColor);
                gradient.addColorStop(1, outerColor);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
                ctx.fill();
            },
        });
    }
    /** Draw a gradient-filled rounded rectangle */
    fillGradientRoundRect(x, y, w, h, radius, colorStart, colorEnd, vertical = true, layer = constants_1.LAYERS.UI) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                const gradient = vertical
                    ? ctx.createLinearGradient(x, y, x, y + h)
                    : ctx.createLinearGradient(x, y, x + w, y);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);
                ctx.fillStyle = gradient;
                this.drawRoundRectPath(ctx, x, y, w, h, radius);
                ctx.fill();
            },
        });
    }
    /** Draw text with a soft shadow */
    fillTextWithShadow(text, x, y, color, shadowColor = 'rgba(26, 39, 56, 0.15)', fontSize = 14, shadowBlur = 4, shadowOffsetY = 2, align = 'left', baseline = 'top', layer = constants_1.LAYERS.UI) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.save();
                ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif`;
                ctx.textAlign = align;
                ctx.textBaseline = baseline;
                ctx.shadowColor = shadowColor;
                ctx.shadowBlur = shadowBlur;
                ctx.shadowOffsetY = shadowOffsetY;
                ctx.fillStyle = color;
                ctx.fillText(text, x, y);
                ctx.restore();
            },
        });
    }
    /** Draw a star/sparkle shape */
    drawSparkle(cx, cy, size, color, alpha, layer = constants_1.LAYERS.EFFECTS) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = color;
                ctx.beginPath();
                const spikes = 4;
                const outerRadius = size;
                const innerRadius = size * 0.4;
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI) / spikes - Math.PI / 2;
                    const px = cx + Math.cos(angle) * radius;
                    const py = cy + Math.sin(angle) * radius;
                    if (i === 0)
                        ctx.moveTo(px, py);
                    else
                        ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            },
        });
    }
    /** Draw a heart shape */
    drawHeart(cx, cy, size, color, alpha, layer = constants_1.LAYERS.EFFECTS) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(cx, cy + size * 0.3);
                ctx.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy + size * 0.3);
                ctx.bezierCurveTo(cx - size, cy + size * 0.7, cx, cy + size, cx, cy + size * 1.2);
                ctx.bezierCurveTo(cx, cy + size, cx + size, cy + size * 0.7, cx + size, cy + size * 0.3);
                ctx.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size * 0.3);
                ctx.fill();
                ctx.restore();
            },
        });
    }
    /** Draw a wavy/organic shape (for clouds, bushes) */
    drawOrganicBlob(cx, cy, rx, ry, wobble, color, alpha = 1, layer = constants_1.LAYERS.ENTITIES) {
        this.addCommand({
            layer,
            draw: (ctx) => {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = color;
                ctx.beginPath();
                const points = 8;
                for (let i = 0; i <= points; i++) {
                    const angle = (i / points) * Math.PI * 2;
                    const wobbleOffset = Math.sin(angle * 3) * wobble;
                    const px = cx + Math.cos(angle) * (rx + wobbleOffset);
                    const py = cy + Math.sin(angle) * (ry + wobbleOffset);
                    if (i === 0)
                        ctx.moveTo(px, py);
                    else
                        ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            },
        });
    }
    drawRoundRectPath(ctx, x, y, w, h, radius) {
        const r = Math.min(radius, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map