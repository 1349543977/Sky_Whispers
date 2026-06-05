"use strict";
// ============================================================
// ShopScene - Shop & items
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopScene = void 0;
const Scene_1 = require("../core/Scene");
const types_1 = require("../types");
const ApiClient_1 = require("../services/ApiClient");
const StorageService_1 = require("../services/StorageService");
const Button_1 = require("../ui/Button");
const ScrollView_1 = require("../ui/ScrollView");
const Skeleton_1 = require("../ui/Skeleton");
const Toast_1 = require("../ui/Toast");
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
class ShopScene extends Scene_1.Scene {
    constructor(renderer, input) {
        super(types_1.SceneName.Shop, renderer, input);
        this.items = [];
        this.currentCategory = types_1.ItemType.Skin;
        this.loading = true;
        // UI
        this.categoryButtons = [];
        this.storageService = new StorageService_1.StorageService();
        this.apiClient = new ApiClient_1.ApiClient('', this.storageService);
    }
    async onLoad() {
        const w = this.renderer.width;
        const h = this.renderer.height;
        this.toastManager = new Toast_1.ToastManager(w);
        this.skeleton = new Skeleton_1.Skeleton({
            x: 12,
            y: 140,
            width: w - 24,
            height: h - 200,
            rows: 4,
            rowHeight: 80,
            rowGap: 12,
        });
        this.scrollView = new ScrollView_1.ScrollView({
            x: 0,
            y: 140,
            width: w,
            height: h - 196,
            contentHeight: 0,
        });
        this.backButton = new Button_1.Button({
            x: 12,
            y: 12,
            width: 60,
            height: 32,
            text: '← 返回',
            fontSize: color_1.DesignTokens.fontSize.xs,
            bgColor: 'rgba(0,0,0,0.3)',
            borderRadius: 16,
            onTap: () => this.navigateBack(),
        });
        // Category tabs
        const categories = [types_1.ItemType.Skin, types_1.ItemType.Effect, types_1.ItemType.Prop, types_1.ItemType.Pass];
        const categoryLabels = {
            skin: '皮肤',
            effect: '特效',
            prop: '道具',
            pass: '通行证',
        };
        this.categoryButtons = categories.map((cat, i) => {
            var _a;
            return new Button_1.Button({
                x: 12 + i * 88,
                y: 56,
                width: 80,
                height: 32,
                text: (_a = categoryLabels[cat]) !== null && _a !== void 0 ? _a : cat,
                fontSize: color_1.DesignTokens.fontSize.xs,
                bgColor: cat === this.currentCategory ? color_1.DesignTokens.colors.primary : 'rgba(0,0,0,0.1)',
                textColor: cat === this.currentCategory ? '#FFFFFF' : color_1.DesignTokens.colors.textSecondary,
                borderRadius: 16,
                onTap: () => this.switchCategory(cat),
            });
        });
        await this.loadShopItems();
        this.loaded = true;
    }
    async loadShopItems() {
        this.loading = true;
        try {
            const response = await this.apiClient.getShopItems({
                item_type: this.currentCategory,
            });
            if (response.code === 0) {
                this.items = response.data.items;
                this.scrollView.setContentHeight(this.items.length * 96 + 20);
            }
        }
        catch (err) {
            console.error('[ShopScene] Load items failed:', err);
            this.toastManager.show({ text: '加载商店失败' });
        }
        this.loading = false;
    }
    async switchCategory(category) {
        this.currentCategory = category;
        // Update button styles
        this.categoryButtons.forEach((btn, i) => {
            const categories = [types_1.ItemType.Skin, types_1.ItemType.Effect, types_1.ItemType.Prop, types_1.ItemType.Pass];
            const isActive = categories[i] === category;
            btn.setDisabled(false); // Reset
            // We'd need a setBgColor method for dynamic style changes
        });
        await this.loadShopItems();
    }
    async purchaseItem(item) {
        try {
            const response = await this.apiClient.purchaseItem({
                item_id: item.id,
                quantity: 1,
            });
            if (response.code === 0) {
                this.toastManager.show({ text: '购买成功!' });
            }
            else {
                this.toastManager.show({ text: response.message || '购买失败' });
            }
        }
        catch (_a) {
            this.toastManager.show({ text: '购买失败' });
        }
    }
    navigateBack() {
        // Navigate back to main scene
    }
    update(dt) {
        this.skeleton.update(dt);
        this.scrollView.update(dt);
        this.backButton.update(dt);
        this.toastManager.update(dt);
        for (const btn of this.categoryButtons) {
            btn.update(dt);
        }
    }
    fixedUpdate(_dt) { }
    render() {
        const w = this.renderer.width;
        const h = this.renderer.height;
        // Background
        this.renderer.drawGradientRect(0, 0, w, h, '#F0F4F8', '#E8ECF0', true, constants_1.LAYERS.BACKGROUND);
        // Header
        this.renderer.fillRoundRect(0, 0, w, 52, 0, color_1.DesignTokens.colors.primary, constants_1.LAYERS.UI);
        this.renderer.drawText('商店', w / 2, 26, '#FFFFFF', color_1.DesignTokens.fontSize.xl, 'center', 'middle', constants_1.LAYERS.UI);
        this.backButton.render(this.renderer);
        // Category tabs
        for (const btn of this.categoryButtons) {
            btn.render(this.renderer);
        }
        // Divider
        this.renderer.fillRect(0, 96, w, 1, color_1.DesignTokens.colors.neutral200, constants_1.LAYERS.UI);
        if (this.loading) {
            this.skeleton.render(this.renderer);
        }
        else {
            this.scrollView.render(this.renderer);
            // Shop items
            for (let i = 0; i < this.items.length; i++) {
                this.renderShopItem(this.items[i], 140 + i * 96);
            }
        }
        this.toastManager.render(this.renderer);
    }
    renderShopItem(item, y) {
        var _a;
        const w = this.renderer.width;
        const rarityColor = (_a = constants_1.RARITY_COLORS[item.rarity]) !== null && _a !== void 0 ? _a : constants_1.RARITY_COLORS[types_1.Rarity.Common];
        // Item card
        this.renderer.fillRoundRect(12, y, w - 24, 84, color_1.DesignTokens.borderRadius.md, color_1.DesignTokens.colors.surface, constants_1.LAYERS.UI);
        this.renderer.strokeRoundRect(12, y, w - 24, 84, color_1.DesignTokens.borderRadius.md, rarityColor, 1, constants_1.LAYERS.UI);
        // Item icon placeholder
        this.renderer.fillRoundRect(20, y + 8, 60, 60, color_1.DesignTokens.borderRadius.sm, 'rgba(0,0,0,0.05)', constants_1.LAYERS.UI);
        this.renderer.drawText('📦', 50, y + 38, '#000000', 24, 'center', 'middle', constants_1.LAYERS.UI);
        // Item name
        this.renderer.drawText(item.name, 92, y + 16, color_1.DesignTokens.colors.textPrimary, color_1.DesignTokens.fontSize.md, 'left', 'top', constants_1.LAYERS.UI);
        // Item description (truncated)
        const desc = item.description.length > 20 ? item.description.substring(0, 20) + '...' : item.description;
        this.renderer.drawText(desc, 92, y + 36, color_1.DesignTokens.colors.textSecondary, color_1.DesignTokens.fontSize.xs, 'left', 'top', constants_1.LAYERS.UI);
        // Price
        const priceText = item.currency === 'rmb' ? `¥${item.price}` : `${item.price}金币`;
        this.renderer.drawText(priceText, w - 24, y + 60, item.currency === 'rmb' ? color_1.DesignTokens.colors.danger : color_1.DesignTokens.colors.accent, color_1.DesignTokens.fontSize.md, 'right', 'top', constants_1.LAYERS.UI);
        // Rarity badge
        this.renderer.fillRoundRect(92, y + 56, 36, 16, 8, rarityColor, constants_1.LAYERS.UI);
        this.renderer.drawText(item.rarity.charAt(0).toUpperCase(), 110, y + 64, '#FFFFFF', 8, 'center', 'middle', constants_1.LAYERS.UI);
    }
    onUnload() { }
}
exports.ShopScene = ShopScene;
//# sourceMappingURL=ShopScene.js.map