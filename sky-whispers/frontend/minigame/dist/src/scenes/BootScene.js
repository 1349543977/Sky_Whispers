"use strict";
// ============================================================
// BootScene - Loading & initialization
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.BootScene = void 0;
const Scene_1 = require("../core/Scene");
const types_1 = require("../types");
const ApiClient_1 = require("../services/ApiClient");
const WxService_1 = require("../services/WxService");
const StorageService_1 = require("../services/StorageService");
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
class BootScene extends Scene_1.Scene {
    constructor(renderer, input) {
        super(types_1.SceneName.Boot, renderer, input);
        this.loadingProgress = 0;
        this.loadingText = '正在初始化...';
        this.loadingSteps = [];
        this.currentStep = 0;
        this.storageService = new StorageService_1.StorageService();
        this.apiClient = new ApiClient_1.ApiClient('', this.storageService);
        this.wxService = new WxService_1.WxService();
    }
    async onLoad() {
        this.setupLoadingSteps();
        for (let i = 0; i < this.loadingSteps.length; i++) {
            this.currentStep = i;
            this.loadingText = this.loadingSteps[i].text;
            this.loadingProgress = i / this.loadingSteps.length;
            try {
                await this.loadingSteps[i].action();
            }
            catch (err) {
                console.error(`[BootScene] Step "${this.loadingSteps[i].text}" failed:`, err);
                // Continue loading even if a step fails
            }
            this.loadingProgress = (i + 1) / this.loadingSteps.length;
        }
        this.loadingText = '加载完成!';
        this.loadingProgress = 1;
        // Transition to main scene
        await this.delay(300);
        const sceneManager = this.getSceneManager();
        if (sceneManager) {
            await sceneManager.switchTo(types_1.SceneName.Main);
        }
    }
    setupLoadingSteps() {
        this.loadingSteps = [
            {
                text: '正在登录...',
                action: async () => {
                    try {
                        const code = await this.wxService.login();
                        const response = await this.apiClient.login(code);
                        if (response.code === 0) {
                            this.storageService.set('auth_token', response.data.token);
                            this.storageService.set('user_profile', response.data.user);
                        }
                    }
                    catch (err) {
                        console.error('[BootScene] Login failed:', err);
                    }
                },
            },
            {
                text: '正在加载用户数据...',
                action: async () => {
                    try {
                        const response = await this.apiClient.getUser();
                        if (response.code === 0) {
                            this.storageService.set('user_profile', response.data);
                        }
                    }
                    catch (err) {
                        console.error('[BootScene] Load user data failed:', err);
                    }
                },
            },
            {
                text: '正在加载岛屿数据...',
                action: async () => {
                    try {
                        const response = await this.apiClient.getIsland();
                        if (response.code === 0) {
                            this.storageService.set('island_data', response.data);
                        }
                    }
                    catch (err) {
                        console.error('[BootScene] Load island data failed:', err);
                    }
                },
            },
            {
                text: '正在获取天气信息...',
                action: async () => {
                    try {
                        const response = await this.apiClient.getWeather();
                        if (response.code === 0) {
                            this.storageService.set('weather_data', response.data);
                        }
                    }
                    catch (err) {
                        console.error('[BootScene] Load weather failed:', err);
                    }
                },
            },
            {
                text: '正在同步步数...',
                action: async () => {
                    try {
                        const weRunData = await this.wxService.getWeRunData();
                        if (weRunData) {
                            await this.apiClient.syncSteps({
                                encrypted_data: weRunData.encryptedData,
                                iv: weRunData.iv,
                            });
                        }
                    }
                    catch (err) {
                        console.error('[BootScene] Sync steps failed:', err);
                    }
                },
            },
        ];
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    getSceneManager() {
        // Access scene manager through the game instance
        // This is a workaround since Scene doesn't directly hold a reference
        return null; // Will be set by Game class
    }
    update(_dt) {
        // No continuous updates needed during boot
    }
    fixedUpdate(_dt) {
        // No fixed updates needed during boot
    }
    render() {
        const w = this.renderer.width;
        const h = this.renderer.height;
        // Background
        this.renderer.drawGradientRect(0, 0, w, h, '#4A90D9', '#7ED6A8', true, constants_1.LAYERS.BACKGROUND);
        // App title
        this.renderer.drawText('云端气象局', w / 2, h * 0.3, '#FFFFFF', color_1.DesignTokens.fontSize.title, 'center', 'middle', constants_1.LAYERS.UI);
        // Subtitle
        this.renderer.drawText('Sky Whispers', w / 2, h * 0.3 + 44, 'rgba(255,255,255,0.7)', color_1.DesignTokens.fontSize.lg, 'center', 'middle', constants_1.LAYERS.UI);
        // Loading progress bar
        const barWidth = w * 0.6;
        const barHeight = 6;
        const barX = (w - barWidth) / 2;
        const barY = h * 0.55;
        this.renderer.fillRoundRect(barX, barY, barWidth, barHeight, 3, 'rgba(255,255,255,0.3)', constants_1.LAYERS.UI);
        if (this.loadingProgress > 0) {
            this.renderer.fillRoundRect(barX, barY, barWidth * this.loadingProgress, barHeight, 3, '#FFFFFF', constants_1.LAYERS.UI);
        }
        // Loading text
        this.renderer.drawText(this.loadingText, w / 2, barY + 24, 'rgba(255,255,255,0.8)', color_1.DesignTokens.fontSize.sm, 'center', 'top', constants_1.LAYERS.UI);
        // Progress percentage
        this.renderer.drawText(`${Math.round(this.loadingProgress * 100)}%`, w / 2, barY - 16, 'rgba(255,255,255,0.6)', color_1.DesignTokens.fontSize.xs, 'center', 'bottom', constants_1.LAYERS.UI);
    }
    onUnload() {
        // Cleanup
    }
}
exports.BootScene = BootScene;
//# sourceMappingURL=BootScene.js.map