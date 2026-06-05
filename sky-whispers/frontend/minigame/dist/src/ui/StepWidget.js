"use strict";
// ============================================================
// StepWidget - Step count and wind power display
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
            fillColor: color_1.DesignTokens.colors.secondary,
            bgColor: 'rgba(0,0,0,0.2)',
            borderRadius: 3,
        });
    }
    update(dt) {
        this.progressBar.update(dt);
    }
    render(renderer) {
        // Background
        renderer.fillRoundRect(this.x, this.y, this.width, this.height, color_1.DesignTokens.borderRadius.md, 'rgba(0,0,0,0.3)', constants_1.LAYERS.UI);
        // Step icon and count
        renderer.drawText('🏃', this.x + 12, this.y + 12, '#FFFFFF', 12, 'center', 'middle', constants_1.LAYERS.UI);
        renderer.drawText(`${this.formatSteps(this.steps)}步`, this.x + 24, this.y + 12, '#FFFFFF', color_1.DesignTokens.fontSize.xs, 'left', 'middle', constants_1.LAYERS.UI);
        // Wind power
        renderer.drawText(`💨${this.windPower}`, this.x + this.width - 8, this.y + 12, 'rgba(255,255,255,0.8)', color_1.DesignTokens.fontSize.xs, 'right', 'middle', constants_1.LAYERS.UI);
        // Progress bar
        this.progressBar.render(renderer);
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