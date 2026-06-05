"use strict";
// ============================================================
// Island - Floating island entity with slots and skin
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Island = void 0;
const constants_1 = require("../utils/constants");
class Island {
    constructor(data, x, y) {
        this.skin = null;
        this.bobOffset = 0;
        this.time = 0;
        this.data = data;
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.width = 280;
        this.height = 180;
    }
    update(dt) {
        this.time += dt * 1000;
        this.bobOffset = Math.sin(this.time * constants_1.ANIMATION.ISLAND_BOB_SPEED) * constants_1.ANIMATION.ISLAND_BOB_AMPLITUDE;
        this.y = this.baseY + this.bobOffset;
    }
    render(renderer) {
        var _a, _b, _c, _d;
        const baseColor = (_b = (_a = this.skin) === null || _a === void 0 ? void 0 : _a.base_color) !== null && _b !== void 0 ? _b : constants_1.COLORS.ISLAND_BASE;
        const grassColor = (_d = (_c = this.skin) === null || _c === void 0 ? void 0 : _c.grass_color) !== null && _d !== void 0 ? _d : constants_1.COLORS.ISLAND_GRASS;
        const dirtColor = constants_1.COLORS.ISLAND_DIRT;
        // Island shadow
        renderer.setAlpha(0.15, constants_1.LAYERS.ENTITIES, (ctx) => {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height + 10, this.width / 2 - 10, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        // Island base (dirt/earth)
        renderer.fillRoundRect(this.x + 20, this.y + 40, this.width - 40, this.height - 40, 20, dirtColor, constants_1.LAYERS.ENTITIES);
        // Island top (grass)
        renderer.fillRoundRect(this.x + 10, this.y + 20, this.width - 20, this.height - 50, 24, grassColor, constants_1.LAYERS.ENTITIES);
        // Grass surface highlight
        renderer.fillRoundRect(this.x + 20, this.y + 20, this.width - 40, 16, 12, baseColor, constants_1.LAYERS.ENTITIES);
        // Plant slots
        this.renderSlots(renderer);
        // Expansion slots (locked)
        this.renderLockedSlots(renderer);
    }
    renderSlots(renderer) {
        const slotSize = 40;
        const startX = this.x + 30;
        const startY = this.y + 50;
        const cols = 3;
        const gap = 10;
        for (const slot of this.data.plant_slots) {
            if (!slot.is_unlocked)
                continue;
            const col = slot.slot_index % cols;
            const row = Math.floor(slot.slot_index / cols);
            const sx = startX + col * (slotSize + gap);
            const sy = startY + row * (slotSize + gap);
            // Slot background
            renderer.fillRoundRect(sx, sy, slotSize, slotSize, 8, 'rgba(0,0,0,0.1)', constants_1.LAYERS.ENTITIES);
            // Empty slot indicator
            if (!slot.plant_id) {
                renderer.strokeRoundRect(sx + 4, sy + 4, slotSize - 8, slotSize - 8, 6, 'rgba(255,255,255,0.3)', 1, constants_1.LAYERS.ENTITIES);
                renderer.drawText('+', sx + slotSize / 2, sy + slotSize / 2, 'rgba(255,255,255,0.5)', 20, 'center', 'middle', constants_1.LAYERS.ENTITIES);
            }
        }
    }
    renderLockedSlots(renderer) {
        const totalSlots = this.data.expansion_slots;
        const unlockedCount = this.data.plant_slots.filter((s) => s.is_unlocked).length;
        const slotSize = 40;
        const startX = this.x + 30;
        const startY = this.y + 50;
        const cols = 3;
        const gap = 10;
        for (let i = unlockedCount; i < totalSlots; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const sx = startX + col * (slotSize + gap);
            const sy = startY + row * (slotSize + gap);
            renderer.fillRoundRect(sx, sy, slotSize, slotSize, 8, 'rgba(0,0,0,0.2)', constants_1.LAYERS.ENTITIES);
            renderer.drawText('🔒', sx + slotSize / 2, sy + slotSize / 2, 'rgba(255,255,255,0.3)', 14, 'center', 'middle', constants_1.LAYERS.ENTITIES);
        }
    }
    setData(data) {
        this.data = data;
    }
    setSkin(skin) {
        this.skin = skin;
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
    getSlotPosition(slotIndex) {
        const slotSize = 40;
        const startX = this.x + 30;
        const startY = this.y + 50;
        const cols = 3;
        const gap = 10;
        const col = slotIndex % cols;
        const row = Math.floor(slotIndex / cols);
        return {
            x: startX + col * (slotSize + gap),
            y: startY + row * (slotSize + gap),
        };
    }
    containsPoint(px, py) {
        return (px >= this.x &&
            px <= this.x + this.width &&
            py >= this.y &&
            py <= this.y + this.height);
    }
}
exports.Island = Island;
//# sourceMappingURL=Island.js.map