"use strict";
// ============================================================
// SettingsScene - Sound, location, about & help
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsScene = void 0;
const Scene_1 = require("../core/Scene");
const types_1 = require("../types");
const Button_1 = require("../ui/Button");
const Toast_1 = require("../ui/Toast");
const AudioService_1 = require("../services/AudioService");
const WxService_1 = require("../services/WxService");
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
class SettingsScene extends Scene_1.Scene {
    constructor(renderer, input) {
        super(types_1.SceneName.Settings, renderer, input);
        this.bgmEnabled = true;
        this.sfxEnabled = true;
        this.locationEnabled = false;
        this.audioService = new AudioService_1.AudioService();
        this.wxService = new WxService_1.WxService();
    }
    async onLoad() {
        const w = this.renderer.width;
        this.bgmEnabled = this.audioService.isBgmEnabled();
        this.sfxEnabled = this.audioService.isSfxEnabled();
        this.toastManager = new Toast_1.ToastManager(w);
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
        this.bgmToggle = new Button_1.Button({
            x: w - 80,
            y: 80,
            width: 64,
            height: 32,
            text: this.bgmEnabled ? '开启' : '关闭',
            fontSize: color_1.DesignTokens.fontSize.xs,
            bgColor: this.bgmEnabled ? color_1.DesignTokens.colors.success : color_1.DesignTokens.colors.textLight,
            borderRadius: 16,
            onTap: () => this.toggleBgm(),
        });
        this.sfxToggle = new Button_1.Button({
            x: w - 80,
            y: 128,
            width: 64,
            height: 32,
            text: this.sfxEnabled ? '开启' : '关闭',
            fontSize: color_1.DesignTokens.fontSize.xs,
            bgColor: this.sfxEnabled ? color_1.DesignTokens.colors.success : color_1.DesignTokens.colors.textLight,
            borderRadius: 16,
            onTap: () => this.toggleSfx(),
        });
        this.locationButton = new Button_1.Button({
            x: w - 80,
            y: 176,
            width: 64,
            height: 32,
            text: '授权',
            fontSize: color_1.DesignTokens.fontSize.xs,
            bgColor: color_1.DesignTokens.colors.primary,
            borderRadius: 16,
            onTap: () => this.requestLocation(),
        });
        this.aboutButton = new Button_1.Button({
            x: 12,
            y: 240,
            width: w - 24,
            height: 44,
            text: '关于云端气象局',
            fontSize: color_1.DesignTokens.fontSize.md,
            bgColor: color_1.DesignTokens.colors.surface,
            textColor: color_1.DesignTokens.colors.text,
            borderRadius: color_1.DesignTokens.borderRadius.md,
            onTap: () => this.showAbout(),
        });
        this.helpButton = new Button_1.Button({
            x: 12,
            y: 296,
            width: w - 24,
            height: 44,
            text: '帮助与反馈',
            fontSize: color_1.DesignTokens.fontSize.md,
            bgColor: color_1.DesignTokens.colors.surface,
            textColor: color_1.DesignTokens.colors.text,
            borderRadius: color_1.DesignTokens.borderRadius.md,
            onTap: () => this.showHelp(),
        });
        this.loaded = true;
    }
    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        this.audioService.setBgmEnabled(this.bgmEnabled);
        this.bgmToggle.setText(this.bgmEnabled ? '开启' : '关闭');
        // Update button color would need a setBgColor method
    }
    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        this.audioService.setSfxEnabled(this.sfxEnabled);
        this.sfxToggle.setText(this.sfxEnabled ? '开启' : '关闭');
    }
    async requestLocation() {
        try {
            await this.wxService.getLocation();
            this.locationEnabled = true;
            this.toastManager.show({ text: '位置权限已开启' });
        }
        catch (_a) {
            this.locationEnabled = false;
            this.toastManager.show({ text: '位置权限被拒绝' });
        }
    }
    showAbout() {
        this.wxService.showModal({
            title: '关于云端气象局',
            content: '云端气象局 v1.0.0\n一款基于真实天气的放置治愈小游戏\n让天气成为你生活的一部分',
            showCancel: false,
        });
    }
    showHelp() {
        this.wxService.showModal({
            title: '帮助',
            content: '1. 种植植物，观察它们随天气变化\n2. 收集天气精灵，它们会出现在特定天气\n3. 步数可以转化为风力，驱动风车产币\n4. 和好友互送天气礼物',
            showCancel: false,
        });
    }
    navigateBack() {
        // Navigate back to main scene
    }
    update(dt) {
        this.backButton.update(dt);
        this.bgmToggle.update(dt);
        this.sfxToggle.update(dt);
        this.locationButton.update(dt);
        this.aboutButton.update(dt);
        this.helpButton.update(dt);
        this.toastManager.update(dt);
    }
    fixedUpdate(_dt) { }
    render() {
        const w = this.renderer.width;
        const h = this.renderer.height;
        // Background
        this.renderer.drawGradientRect(0, 0, w, h, '#F0F4F8', '#E8ECF0', true, constants_1.LAYERS.BACKGROUND);
        // Header
        this.renderer.fillRoundRect(0, 0, w, 52, 0, color_1.DesignTokens.colors.primary, constants_1.LAYERS.UI);
        this.renderer.drawText('设置', w / 2, 26, '#FFFFFF', color_1.DesignTokens.fontSize.xl, 'center', 'middle', constants_1.LAYERS.UI);
        this.backButton.render(this.renderer);
        // Settings items
        this.renderSettingRow('背景音乐', 80);
        this.bgmToggle.render(this.renderer);
        this.renderSettingRow('音效', 128);
        this.sfxToggle.render(this.renderer);
        this.renderSettingRow('位置权限', 176);
        this.locationButton.render(this.renderer);
        // Divider
        this.renderer.fillRect(12, 220, w - 24, 1, color_1.DesignTokens.colors.border, constants_1.LAYERS.UI);
        // About & Help
        this.aboutButton.render(this.renderer);
        this.helpButton.render(this.renderer);
        // Version info
        this.renderer.drawText('v1.0.0', w / 2, h - 40, color_1.DesignTokens.colors.textLight, color_1.DesignTokens.fontSize.xs, 'center', 'middle', constants_1.LAYERS.UI);
        this.toastManager.render(this.renderer);
    }
    renderSettingRow(label, y) {
        this.renderer.drawText(label, 16, y + 16, color_1.DesignTokens.colors.text, color_1.DesignTokens.fontSize.md, 'left', 'middle', constants_1.LAYERS.UI);
    }
    onUnload() {
        this.audioService.destroy();
    }
}
exports.SettingsScene = SettingsScene;
//# sourceMappingURL=SettingsScene.js.map