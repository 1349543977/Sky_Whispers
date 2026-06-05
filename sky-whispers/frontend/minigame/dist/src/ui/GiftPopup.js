"use strict";
// ============================================================
// GiftPopup - Gift send/receive popup
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftPopup = void 0;
const types_1 = require("../types");
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const Button_1 = require("./Button");
const GIFT_TYPES = [
    { type: types_1.GiftType.RainCloud, label: '雨云', icon: '🌧️', color: '#64B5F6' },
    { type: types_1.GiftType.Breeze, label: '微风', icon: '💨', color: '#81C784' },
    { type: types_1.GiftType.Sunlight, label: '阳光', icon: '☀️', color: '#FFD54F' },
    { type: types_1.GiftType.Snowflake, label: '雪花', icon: '❄️', color: '#B3E5FC' },
];
class GiftPopup {
    constructor(options) {
        this.visible = false;
        this.fadeProgress = 0;
        this.selectedGiftType = types_1.GiftType.RainCloud;
        this.selectedFriendIndex = 0;
        this.message = '';
        this.giftTypeButtons = [];
        this.popupWidth = 300;
        this.popupHeight = 380;
        this.screenWidth = options.screenWidth;
        this.screenHeight = options.screenHeight;
        this.friends = options.friends;
        this.onSend = options.onSend;
        this.onClose = options.onClose;
        this.sendButton = new Button_1.Button({
            x: 0,
            y: 0,
            width: 120,
            height: 40,
            text: '发送',
            bgColor: color_1.DesignTokens.colors.primary,
            borderRadius: 20,
            onTap: () => this.send(),
        });
        this.closeButton = new Button_1.Button({
            x: 0,
            y: 0,
            width: 28,
            height: 28,
            text: '✕',
            bgColor: 'transparent',
            textColor: color_1.DesignTokens.colors.textSecondary,
            borderRadius: 14,
            onTap: () => this.hide(),
        });
        // Gift type selection buttons
        for (let i = 0; i < GIFT_TYPES.length; i++) {
            const gift = GIFT_TYPES[i];
            this.giftTypeButtons.push(new Button_1.Button({
                x: 0,
                y: 0,
                width: 60,
                height: 60,
                text: gift.icon,
                fontSize: 24,
                bgColor: gift.color,
                borderRadius: color_1.DesignTokens.borderRadius.md,
                onTap: () => {
                    this.selectedGiftType = gift.type;
                },
            }));
        }
    }
    update(dt) {
        if (this.visible) {
            this.fadeProgress = Math.min(this.fadeProgress + dt * 5, 1);
        }
        else {
            this.fadeProgress = Math.max(this.fadeProgress - dt * 5, 0);
        }
        this.sendButton.update(dt);
        this.closeButton.update(dt);
        for (const btn of this.giftTypeButtons) {
            btn.update(dt);
        }
    }
    render(renderer) {
        if (this.fadeProgress <= 0)
            return;
        const dx = (this.screenWidth - this.popupWidth) / 2;
        const dy = (this.screenHeight - this.popupHeight) / 2;
        // Overlay
        renderer.setAlpha(this.fadeProgress * 0.5, constants_1.LAYERS.OVERLAY, (ctx) => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
        });
        // Popup body
        renderer.fillRoundRect(dx, dy, this.popupWidth, this.popupHeight, color_1.DesignTokens.borderRadius.lg, color_1.DesignTokens.colors.surface, constants_1.LAYERS.UI);
        // Title
        renderer.drawText('送出天气礼物', dx + this.popupWidth / 2, dy + 20, color_1.DesignTokens.colors.text, color_1.DesignTokens.fontSize.xl, 'center', 'top', constants_1.LAYERS.UI);
        // Close button
        this.closeButton.setPosition(dx + this.popupWidth - 36, dy + 8);
        this.closeButton.render(renderer);
        // Gift type selection
        renderer.drawText('选择礼物', dx + 16, dy + 56, color_1.DesignTokens.colors.textSecondary, color_1.DesignTokens.fontSize.sm, 'left', 'top', constants_1.LAYERS.UI);
        const giftStartX = dx + 16;
        const giftY = dy + 78;
        for (let i = 0; i < this.giftTypeButtons.length; i++) {
            const btnX = giftStartX + i * 68;
            this.giftTypeButtons[i].setPosition(btnX, giftY);
            this.giftTypeButtons[i].render(renderer);
            // Label under icon
            renderer.drawText(GIFT_TYPES[i].label, btnX + 30, giftY + 66, this.selectedGiftType === GIFT_TYPES[i].type
                ? color_1.DesignTokens.colors.primary
                : color_1.DesignTokens.colors.textSecondary, color_1.DesignTokens.fontSize.xs, 'center', 'top', constants_1.LAYERS.UI);
        }
        // Friend selection
        renderer.drawText('选择好友', dx + 16, dy + 160, color_1.DesignTokens.colors.textSecondary, color_1.DesignTokens.fontSize.sm, 'left', 'top', constants_1.LAYERS.UI);
        const friendY = dy + 182;
        for (let i = 0; i < Math.min(this.friends.length, 3); i++) {
            const friend = this.friends[i];
            const fy = friendY + i * 36;
            const isSelected = i === this.selectedFriendIndex;
            if (isSelected) {
                renderer.fillRoundRect(dx + 12, fy, this.popupWidth - 24, 32, color_1.DesignTokens.borderRadius.sm, 'rgba(74,144,217,0.1)', constants_1.LAYERS.UI);
            }
            renderer.drawText(friend.friend_info.nickname, dx + 24, fy + 16, color_1.DesignTokens.colors.text, color_1.DesignTokens.fontSize.md, 'left', 'middle', constants_1.LAYERS.UI);
        }
        // Send button
        this.sendButton.setPosition(dx + (this.popupWidth - 120) / 2, dy + this.popupHeight - 56);
        this.sendButton.render(renderer);
    }
    send() {
        var _a;
        if (this.friends.length === 0)
            return;
        const friend = this.friends[this.selectedFriendIndex];
        if (!friend)
            return;
        (_a = this.onSend) === null || _a === void 0 ? void 0 : _a.call(this, friend.friend_id, this.selectedGiftType, this.message);
        this.hide();
    }
    show() {
        this.visible = true;
    }
    hide() {
        var _a;
        this.visible = false;
        (_a = this.onClose) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    isVisible() {
        return this.visible || this.fadeProgress > 0;
    }
    setFriends(friends) {
        this.friends = friends;
        this.selectedFriendIndex = 0;
    }
    getAllButtons() {
        return [this.sendButton, this.closeButton, ...this.giftTypeButtons];
    }
}
exports.GiftPopup = GiftPopup;
//# sourceMappingURL=GiftPopup.js.map