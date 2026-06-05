"use strict";
// ============================================================
// StepWidget - Step count and wind power with Cloud Whisper aesthetic
// Compact pill, gradient wind bar, pulse effect
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepWidget = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const ProgressBar_1 = require("./ProgressBar");
class StepWidget {
    constructor(x, y) {
        this.steps = 0;
        this.windPower = 0;
        this.maxWindPower = 100;
        this.width = 110;
        this.height = 44;
        // Animation state
        this.pulseScale = 1;
        this.pulseTarget = 1;
        this.lastWindPower = 0;
        this.x = x;
        this.y = y;
        this.progressBar = new ProgressBar_1.ProgressBar({
            x: this.x + 4,
            y: this.y + 28,
            width: this.width - 8,
            height: 6,
            min: 0,
            max: this.maxWindPower,
            value: 0,
            fillColor: color_1.DesignTokens.colors.primary,
            fillGradientEnd: color_1.DesignTokens.colors.primaryLight,
            bgColor: 'rgba(0,0,0,0.08)',
            borderRadius: 3,
        });
    }
    update(dt) {
        this.progressBar.update(dt);
        // Pulse when wind power changes
        if (this.windPower !== this.lastWindPower) {
            this.pulseTarget = 1.15;
            setTimeout(() => { this.pulseTarget = 1; }, 150);
            this.lastWindPower = this.windPower;
        }
        // Smooth pulse animation
        this.pulseScale += (this.pulseTarget - this.pulseScale) * 0.2;
    }
    render(renderer) {
        // Background pill with semi-transparent white
        renderer.fillRoundRect(this.x, this.y, this.width, this.height, color_1.DesignTokens.borderRadius.lg, 'rgba(255,255,255,0.75)', constants_1.LAYERS.UI);
        // Subtle shadow
        renderer.drawSoftShadow(this.x + this.width / 2, this.y + this.height + 1, this.width * 0.4, 1.5, 3, 'rgba(26, 39, 56, 0.05)', constants_1.LAYERS.UI - 1);
        // Step icon (shoe drawn with canvas)
        const shoeCx = this.x + 14;
        const shoeCy = this.y + 12;
        this.drawShoeIcon(renderer, shoeCx, shoeCy);
        // Step count text
        renderer.fillTextWithShadow(`${this.formatSteps(this.steps)}步`, this.x + 26, this.y + 12, color_1.DesignTokens.colors.textPrimary, 'rgba(0,0,0,0.04)', color_1.DesignTokens.fontSize.xs, 1, 1, 'left', 'middle', constants_1.LAYERS.UI);
        // Wind power with pulse effect
        const windX = this.x + this.width - 8;
        const windY = this.y + 12;
        renderer.setAlpha(this.pulseScale > 1.05 ? 0.9 : 0.7, constants_1.LAYERS.UI, (ctx) => {
            ctx.font = `${color_1.DesignTokens.fontSize.xs}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = color_1.DesignTokens.colors.primary;
            ctx.fillText(`💨${this.windPower}`, windX, windY);
        });
        // Wind power progress bar
        this.progressBar.render(renderer);
    }
    drawShoeIcon(renderer, cx, cy) {
        renderer.setAlpha(0.8, constants_1.LAYERS.UI, (ctx) => {
            ctx.fillStyle = color_1.DesignTokens.colors.secondary;
            // Simplified shoe shape
            ctx.beginPath();
            ctx.ellipse(cx, cy, 5, 3.5, -0.2, 0, Math.PI * 2);
            ctx.fill();
            // Sole
            ctx.fillStyle = color_1.DesignTokens.colors.secondaryDark;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 2, 5, 1.5, -0.2, 0, Math.PI);
            ctx.fill();
        });
    }
    formatSteps(steps) {
        if (steps >= 10000)
            return `${(steps / 10000).toFixed(1)}W`;
        if (steps >= 1000)
            return `${(steps / 1000).toFixed(1)}K`;
        return String(steps);
    }
    setSteps(steps) {
        this.steps = steps;
    }
    setWindPower(power) {
        this.windPower = power;
        this.progressBar.setValue(power);
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.progressBar.setPosition(x + 4, y + 28);
    }
}
exports.StepWidget = StepWidget;
//# sourceMappingURL=StepWidget.js.map