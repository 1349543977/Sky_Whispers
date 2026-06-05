"use strict";
// ============================================================
// FriendItem - Friend list item
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendItem = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const Button_1 = require("./Button");
class FriendItem {
    constructor(options) {
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.friendship = options.friendship;
        this.visitButton = new Button_1.Button({
            x: this.x + this.width - 140,
            y: this.y + 8,
            width: 60,
            height: 28,
            text: '拜访',
            fontSize: color_1.DesignTokens.fontSize.xs,
            bgColor: color_1.DesignTokens.colors.primary,
            borderRadius: 14,
            onTap: () => { var _a; return (_a = options.onVisit) === null || _a === void 0 ? void 0 : _a.call(options, this.friendship.friend_id); },
        });
        this.giftButton = new Button_1.Button({
            x: this.x + this.width - 72,
            y: this.y + 8,
            width: 60,
            height: 28,
            text: '送礼',
            fontSize: color_1.DesignTokens.fontSize.xs,
            bgColor: color_1.DesignTokens.colors.accent,
            borderRadius: 14,
            onTap: () => { var _a; return (_a = options.onGift) === null || _a === void 0 ? void 0 : _a.call(options, this.friendship.friend_id); },
        });
    }
    update(dt) {
        this.visitButton.update(dt);
        this.giftButton.update(dt);
    }
    render(renderer) {
        // Background
        renderer.fillRoundRect(this.x, this.y, this.width, this.height, color_1.DesignTokens.borderRadius.md, color_1.DesignTokens.colors.surface, constants_1.LAYERS.UI);
        // Avatar placeholder
        renderer.drawCircle(this.x + 28, this.y + this.height / 2, 18, color_1.DesignTokens.colors.primaryLight, true, constants_1.LAYERS.UI);
        renderer.drawText(this.friendship.friend_info.nickname.charAt(0), this.x + 28, this.y + this.height / 2, '#FFFFFF', color_1.DesignTokens.fontSize.lg, 'center', 'middle', constants_1.LAYERS.UI);
        // Online indicator
        renderer.drawCircle(this.x + 40, this.y + this.height / 2 + 12, 4, color_1.DesignTokens.colors.success, true, constants_1.LAYERS.UI);
        // Name
        renderer.drawText(this.friendship.friend_info.nickname, this.x + 54, this.y + 14, color_1.DesignTokens.colors.text, color_1.DesignTokens.fontSize.md, 'left', 'top', constants_1.LAYERS.UI);
        // Level
        renderer.drawText(`Lv.${this.friendship.friend_info.level}`, this.x + 54, this.y + 32, color_1.DesignTokens.colors.textSecondary, color_1.DesignTokens.fontSize.xs, 'left', 'top', constants_1.LAYERS.UI);
        // Buttons
        this.visitButton.render(renderer);
        this.giftButton.render(renderer);
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.visitButton.setPosition(x + this.width - 140, y + 8);
        this.giftButton.setPosition(x + this.width - 72, y + 8);
    }
    getButtons() {
        return [this.visitButton, this.giftButton];
    }
}
exports.FriendItem = FriendItem;
//# sourceMappingURL=FriendItem.js.map