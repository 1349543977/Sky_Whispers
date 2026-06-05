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
        // Animation state
        this.elapsedTime = 0;
        this.dotCount = 0;
        this.dotTimer = 0;
        this.clouds = [];
        this.particles = [];
        this.sparkleTimer = 0;
        this.sparkles = [];
        this.storageService = new StorageService_1.StorageService();
        this.apiClient = new ApiClient_1.ApiClient('', this.storageService);
        this.wxService = new WxService_1.WxService();
    }
    async onLoad() {
        this.setupLoadingSteps();
        this.initClouds();
        this.initParticles();
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
        this.loadingText = '正在唤醒云朵...';
        this.loadingProgress = 1;
        // Transition to main scene with fade
        await this.delay(500);
        const sceneManager = this.getSceneManager();
        if (sceneManager) {
            await sceneManager.switchWithTransition(types_1.SceneName.Main, 'fade');
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
    initClouds() {
        const w = this.renderer.width;
        this.clouds = [];
        for (let i = 0; i < 4; i++) {
            this.clouds.push({
                x: Math.random() * w,
                y: 40 + Math.random() * 100,
                speed: 0.15 + Math.random() * 0.2,
                size: 0.6 + Math.random() * 0.6,
                alpha: 0.3 + Math.random() * 0.4,
            });
        }
    }
    initParticles() {
        this.particles = [];
        for (let i = 0; i < 12; i++) {
            this.spawnParticle();
        }
    }
    spawnParticle() {
        const w = this.renderer.width;
        const h = this.renderer.height;
        this.particles.push({
            x: Math.random() * w,
            y: h * 0.5 + Math.random() * h * 0.4,
            vy: -(0.2 + Math.random() * 0.4),
            vx: (Math.random() - 0.5) * 0.3,
            size: 1.5 + Math.random() * 2.5,
            alpha: 0.3 + Math.random() * 0.5,
            life: 0,
            maxLife: 3000 + Math.random() * 4000,
        });
    }
    getSceneManager() {
        // Access scene manager through the game instance
        // This is a workaround since Scene doesn't directly hold a reference
        return null; // Will be set by Game class
    }
    update(dt) {
        this.elapsedTime += dt;
        // Animate dots in loading text
        this.dotTimer += dt;
        if (this.dotTimer > 500) {
            this.dotTimer = 0;
            this.dotCount = (this.dotCount + 1) % 4;
        }
        // Update clouds
        const w = this.renderer.width;
        for (const cloud of this.clouds) {
            cloud.x += cloud.speed;
            if (cloud.x > w + 60) {
                cloud.x = -60;
                cloud.y = 40 + Math.random() * 100;
            }
        }
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life += dt;
            p.x += p.vx;
            p.y += p.vy;
            // Fade out near end of life
            const lifeRatio = p.life / p.maxLife;
            p.alpha = lifeRatio < 0.1
                ? lifeRatio / 0.1 * 0.5
                : lifeRatio > 0.8
                    ? (1 - (lifeRatio - 0.8) / 0.2) * 0.5
                    : 0.5;
            if (p.life >= p.maxLife) {
                this.particles.splice(i, 1);
                this.spawnParticle();
            }
        }
        // Update sparkles on progress bar
        this.sparkleTimer += dt;
        if (this.sparkleTimer > 200 && this.loadingProgress > 0) {
            this.sparkleTimer = 0;
            const barWidth = w * 0.6;
            const barX = (w - barWidth) / 2;
            const barY = this.renderer.height * 0.55;
            const fillWidth = barWidth * this.loadingProgress;
            if (fillWidth > 10) {
                this.sparkles.push({
                    x: barX + Math.random() * fillWidth,
                    y: barY + Math.random() * 6,
                    alpha: 1,
                    size: 2 + Math.random() * 3,
                });
            }
        }
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            this.sparkles[i].alpha -= 0.03;
            if (this.sparkles[i].alpha <= 0) {
                this.sparkles.splice(i, 1);
            }
        }
    }
    fixedUpdate(_dt) {
        // No fixed updates needed during boot
    }
    render() {
        const w = this.renderer.width;
        const h = this.renderer.height;
        // Dawn sky gradient background
        this.renderer.drawGradientRect(0, 0, w, h, '#F2C57C', '#7EB5D6', true, constants_1.LAYERS.BACKGROUND);
        // Secondary gradient overlay for depth
        this.renderer.drawGradientRect(0, h * 0.3, w, h * 0.7, 'rgba(126, 181, 214, 0)', 'rgba(174, 214, 241, 0.4)', true, constants_1.LAYERS.BACKGROUND);
        // Drifting clouds
        for (const cloud of this.clouds) {
            this.renderer.drawOrganicBlob(cloud.x, cloud.y, 30 * cloud.size, 16 * cloud.size, 4 * cloud.size, '#FAFBFD', cloud.alpha, constants_1.LAYERS.BACKGROUND);
            // Cloud shadow
            this.renderer.drawOrganicBlob(cloud.x + 5, cloud.y + 4, 26 * cloud.size, 12 * cloud.size, 3 * cloud.size, '#E1E6EE', cloud.alpha * 0.5, constants_1.LAYERS.BACKGROUND);
        }
        // Floating island silhouette
        const islandX = w / 2;
        const islandY = h * 0.42;
        const bobOffset = Math.sin(this.elapsedTime * 0.002) * 3;
        // Island shadow
        this.renderer.drawSoftShadow(islandX, islandY + 50 + bobOffset, 70, 12, 8, 'rgba(26, 39, 56, 0.1)', constants_1.LAYERS.ENTITIES);
        // Island body (silhouette)
        this.renderer.setAlpha(0.25, constants_1.LAYERS.ENTITIES, (ctx) => {
            ctx.fillStyle = '#5A94B8';
            ctx.beginPath();
            ctx.moveTo(islandX - 80, islandY + 20 + bobOffset);
            ctx.quadraticCurveTo(islandX - 60, islandY - 15 + bobOffset, islandX - 20, islandY - 20 + bobOffset);
            ctx.quadraticCurveTo(islandX, islandY - 30 + bobOffset, islandX + 20, islandY - 20 + bobOffset);
            ctx.quadraticCurveTo(islandX + 60, islandY - 15 + bobOffset, islandX + 80, islandY + 20 + bobOffset);
            ctx.quadraticCurveTo(islandX + 50, islandY + 35 + bobOffset, islandX, islandY + 40 + bobOffset);
            ctx.quadraticCurveTo(islandX - 50, islandY + 35 + bobOffset, islandX - 80, islandY + 20 + bobOffset);
            ctx.fill();
        });
        // Small tree silhouette on island
        this.renderer.setAlpha(0.2, constants_1.LAYERS.ENTITIES, (ctx) => {
            ctx.fillStyle = '#5A94B8';
            // Trunk
            ctx.fillRect(islandX - 2, islandY - 40 + bobOffset, 4, 20);
            // Canopy
            ctx.beginPath();
            ctx.arc(islandX, islandY - 44 + bobOffset, 10, 0, Math.PI * 2);
            ctx.fill();
        });
        // Floating particles (dandelion seeds)
        for (const p of this.particles) {
            this.renderer.setAlpha(p.alpha, constants_1.LAYERS.EFFECTS, (ctx) => {
                ctx.fillStyle = '#FAFBFD';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        // Game title with shadow
        this.renderer.fillTextWithShadow('云端气象局', w / 2, h * 0.18, '#FFFFFF', 'rgba(90, 148, 184, 0.3)', color_1.DesignTokens.fontSize.hero, 8, 3, 'center', 'middle', constants_1.LAYERS.UI);
        // Subtitle
        this.renderer.drawText('Sky Whispers', w / 2, h * 0.18 + 52, 'rgba(255,255,255,0.65)', color_1.DesignTokens.fontSize.lg, 'center', 'middle', constants_1.LAYERS.UI);
        // Loading progress bar
        const barWidth = w * 0.6;
        const barHeight = 6;
        const barX = (w - barWidth) / 2;
        const barY = h * 0.62;
        // Bar background
        this.renderer.fillRoundRect(barX, barY, barWidth, barHeight, 3, 'rgba(255,255,255,0.25)', constants_1.LAYERS.UI);
        // Bar fill with gradient
        if (this.loadingProgress > 0) {
            const fillWidth = barWidth * this.loadingProgress;
            this.renderer.fillGradientRoundRect(barX, barY, fillWidth, barHeight, 3, '#FFFFFF', 'rgba(247, 219, 160, 0.9)', true, constants_1.LAYERS.UI);
        }
        // Sparkles on progress bar
        for (const sparkle of this.sparkles) {
            this.renderer.drawSparkle(sparkle.x, sparkle.y, sparkle.size, '#F7DBA0', sparkle.alpha, constants_1.LAYERS.UI);
        }
        // Loading text with animated dots
        const dots = '.'.repeat(this.dotCount);
        this.renderer.drawText(`${this.loadingText}${dots}`, w / 2, barY + 24, 'rgba(255,255,255,0.75)', color_1.DesignTokens.fontSize.sm, 'center', 'top', constants_1.LAYERS.UI);
        // Progress percentage
        this.renderer.drawText(`${Math.round(this.loadingProgress * 100)}%`, w / 2, barY - 16, 'rgba(255,255,255,0.5)', color_1.DesignTokens.fontSize.xs, 'center', 'bottom', constants_1.LAYERS.UI);
    }
    onUnload() {
        // Cleanup
    }
}
exports.BootScene = BootScene;
//# sourceMappingURL=BootScene.js.map