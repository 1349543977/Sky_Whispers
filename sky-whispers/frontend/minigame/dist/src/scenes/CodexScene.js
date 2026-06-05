"use strict";
// ============================================================
// CodexScene - Sprite/plant collection
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexScene = void 0;
const Scene_1 = require("../core/Scene");
const types_1 = require("../types");
const ApiClient_1 = require("../services/ApiClient");
const StorageService_1 = require("../services/StorageService");
const PlantCard_1 = require("../ui/PlantCard");
const SpriteCard_1 = require("../ui/SpriteCard");
const Button_1 = require("../ui/Button");
const ScrollView_1 = require("../ui/ScrollView");
const Skeleton_1 = require("../ui/Skeleton");
const Toast_1 = require("../ui/Toast");
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
class CodexScene extends Scene_1.Scene {
    constructor(renderer, input) {
        super(types_1.SceneName.Codex, renderer, input);
        this.currentTab = 'plants';
        this.plantTypes = [];
        this.spriteTypes = [];
        this.discoveredPlants = new Set();
        this.discoveredSprites = new Set();
        this.loading = true;
        // UI
        this.plantCards = [];
        this.spriteCards = [];
        this.storageService = new StorageService_1.StorageService();
        this.apiClient = new ApiClient_1.ApiClient('', this.storageService);
    }
    async onLoad() {
        const w = this.renderer.width;
        const h = this.renderer.height;
        this.toastManager = new Toast_1.ToastManager(w);
        this.skeleton = new Skeleton_1.Skeleton({
            x: 12,
            y: 100,
            width: w - 24,
            height: h - 160,
            rows: 6,
            rowHeight: 20,
            rowGap: 16,
        });
        this.scrollView = new ScrollView_1.ScrollView({
            x: 0,
            y: 100,
            width: w,
            height: h - 156,
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
        this.plantsTabButton = new Button_1.Button({
            x: w / 2 - 80,
            y: 56,
            width: 72,
            height: 32,
            text: '植物',
            fontSize: color_1.DesignTokens.fontSize.sm,
            bgColor: color_1.DesignTokens.colors.primary,
            borderRadius: 16,
            onTap: () => this.switchTab('plants'),
        });
        this.spritesTabButton = new Button_1.Button({
            x: w / 2 + 8,
            y: 56,
            width: 72,
            height: 32,
            text: '精灵',
            fontSize: color_1.DesignTokens.fontSize.sm,
            bgColor: 'rgba(0,0,0,0.1)',
            textColor: color_1.DesignTokens.colors.textSecondary,
            borderRadius: 16,
            onTap: () => this.switchTab('sprites'),
        });
        await this.loadData();
        this.loaded = true;
    }
    async loadData() {
        this.loading = true;
        try {
            // Load plant types
            const plantResponse = await this.apiClient.getPlantTypes({ page: 1, page_size: 50 });
            if (plantResponse.code === 0) {
                this.plantTypes = plantResponse.data.items;
                this.createPlantCards();
            }
            // Load sprite types
            const spriteResponse = await this.apiClient.getSpriteTypes({ page: 1, page_size: 50 });
            if (spriteResponse.code === 0) {
                this.spriteTypes = spriteResponse.data.items;
                this.createSpriteCards();
            }
            // Load discovered items from user data
            // This would come from the API in production
        }
        catch (err) {
            console.error('[CodexScene] Load data failed:', err);
            this.toastManager.show({ text: '加载图鉴失败' });
        }
        this.loading = false;
    }
    createPlantCards() {
        const w = this.renderer.width;
        const cols = 3;
        const cardWidth = (w - 48) / cols;
        const cardHeight = cardWidth + 20;
        this.plantCards = this.plantTypes.map((pt, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return new PlantCard_1.PlantCard({
                x: 12 + col * (cardWidth + 8),
                y: 100 + row * (cardHeight + 8),
                width: cardWidth,
                height: cardHeight,
                plantType: pt,
                discovered: this.discoveredPlants.has(pt.id),
                onTap: () => this.showPlantDetail(pt),
            });
        });
        const rows = Math.ceil(this.plantTypes.length / cols);
        this.scrollView.setContentHeight(100 + rows * (cardHeight + 8) + 20);
    }
    createSpriteCards() {
        const w = this.renderer.width;
        const cols = 3;
        const cardWidth = (w - 48) / cols;
        const cardHeight = cardWidth + 20;
        this.spriteCards = this.spriteTypes.map((st, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return new SpriteCard_1.SpriteCard({
                x: 12 + col * (cardWidth + 8),
                y: 100 + row * (cardHeight + 8),
                width: cardWidth,
                height: cardHeight,
                spriteType: st,
                discovered: this.discoveredSprites.has(st.id),
                onTap: () => this.showSpriteDetail(st),
            });
        });
        const rows = Math.ceil(this.spriteTypes.length / cols);
        this.scrollView.setContentHeight(100 + rows * (cardHeight + 8) + 20);
    }
    switchTab(tab) {
        this.currentTab = tab;
        // Update tab button styles
        if (tab === 'plants') {
            this.plantsTabButton.setDisabled(false);
            this.spritesTabButton.setDisabled(false);
        }
        else {
            this.plantsTabButton.setDisabled(false);
            this.spritesTabButton.setDisabled(false);
        }
    }
    showPlantDetail(pt) {
        this.toastManager.show({ text: `${pt.name}: ${pt.description}` });
    }
    showSpriteDetail(st) {
        this.toastManager.show({ text: `${st.name}: ${st.description}` });
    }
    navigateBack() {
        // Navigate back to main scene
    }
    update(dt) {
        this.skeleton.update(dt);
        this.scrollView.update(dt);
        this.backButton.update(dt);
        this.plantsTabButton.update(dt);
        this.spritesTabButton.update(dt);
        this.toastManager.update(dt);
        for (const card of this.plantCards) {
            card.update(dt);
        }
        for (const card of this.spriteCards) {
            card.update(dt);
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
        this.renderer.drawText('图鉴', w / 2, 26, '#FFFFFF', color_1.DesignTokens.fontSize.xl, 'center', 'middle', constants_1.LAYERS.UI);
        this.backButton.render(this.renderer);
        // Tab buttons
        this.plantsTabButton.render(this.renderer);
        this.spritesTabButton.render(this.renderer);
        if (this.loading) {
            this.skeleton.render(this.renderer);
        }
        else {
            this.scrollView.render(this.renderer);
            if (this.currentTab === 'plants') {
                for (const card of this.plantCards) {
                    card.render(this.renderer);
                }
            }
            else {
                for (const card of this.spriteCards) {
                    card.render(this.renderer);
                }
            }
        }
        this.toastManager.render(this.renderer);
    }
    onUnload() { }
}
exports.CodexScene = CodexScene;
//# sourceMappingURL=CodexScene.js.map