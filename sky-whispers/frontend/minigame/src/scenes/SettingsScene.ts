// ============================================================
// SettingsScene - Sound, location, about & help
// ============================================================

import { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { Input } from '../core/Input';
import { SceneName } from '../types';
import { EventManager } from '../core/EventManager';
import { Button } from '../ui/Button';
import { ToastManager } from '../ui/Toast';
import { AudioService } from '../services/AudioService';
import { WxService } from '../services/WxService';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export class SettingsScene extends Scene {
  private audioService: AudioService;
  private wxService: WxService;

  // UI
  private toastManager!: ToastManager;
  private backButton!: Button;
  private bgmToggle!: Button;
  private sfxToggle!: Button;
  private locationButton!: Button;
  private aboutButton!: Button;
  private helpButton!: Button;

  private bgmEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  private locationEnabled: boolean = false;

  constructor(renderer: Renderer, input: Input) {
    super(SceneName.Settings, renderer, input);
    this.audioService = new AudioService();
    this.wxService = new WxService();
  }

  async onLoad(): Promise<void> {
    const w = this.renderer.width;

    this.bgmEnabled = this.audioService.isBgmEnabled();
    this.sfxEnabled = this.audioService.isSfxEnabled();

    this.toastManager = new ToastManager(w);

    this.backButton = new Button({
      x: 12,
      y: 12,
      width: 60,
      height: 32,
      text: '← 返回',
      fontSize: DesignTokens.fontSize.xs,
      bgColor: 'rgba(0,0,0,0.3)',
      borderRadius: 16,
      onTap: () => this.navigateBack(),
    });

    this.bgmToggle = new Button({
      x: w - 80,
      y: 80,
      width: 64,
      height: 32,
      text: this.bgmEnabled ? '开启' : '关闭',
      fontSize: DesignTokens.fontSize.xs,
      bgColor: this.bgmEnabled ? DesignTokens.colors.success : DesignTokens.colors.textTertiary,
      borderRadius: 16,
      onTap: () => this.toggleBgm(),
    });

    this.sfxToggle = new Button({
      x: w - 80,
      y: 128,
      width: 64,
      height: 32,
      text: this.sfxEnabled ? '开启' : '关闭',
      fontSize: DesignTokens.fontSize.xs,
      bgColor: this.sfxEnabled ? DesignTokens.colors.success : DesignTokens.colors.textTertiary,
      borderRadius: 16,
      onTap: () => this.toggleSfx(),
    });

    this.locationButton = new Button({
      x: w - 80,
      y: 176,
      width: 64,
      height: 32,
      text: '授权',
      fontSize: DesignTokens.fontSize.xs,
      bgColor: DesignTokens.colors.primary,
      borderRadius: 16,
      onTap: () => this.requestLocation(),
    });

    this.aboutButton = new Button({
      x: 12,
      y: 240,
      width: w - 24,
      height: 44,
      text: '关于云端气象局',
      fontSize: DesignTokens.fontSize.md,
      bgColor: DesignTokens.colors.surface,
      textColor: DesignTokens.colors.textPrimary,
      borderRadius: DesignTokens.borderRadius.md,
      onTap: () => this.showAbout(),
    });

    this.helpButton = new Button({
      x: 12,
      y: 296,
      width: w - 24,
      height: 44,
      text: '帮助与反馈',
      fontSize: DesignTokens.fontSize.md,
      bgColor: DesignTokens.colors.surface,
      textColor: DesignTokens.colors.textPrimary,
      borderRadius: DesignTokens.borderRadius.md,
      onTap: () => this.showHelp(),
    });

    this.loaded = true;
  }

  private toggleBgm(): void {
    this.bgmEnabled = !this.bgmEnabled;
    this.audioService.setBgmEnabled(this.bgmEnabled);
    this.bgmToggle.setText(this.bgmEnabled ? '开启' : '关闭');
    // Update button color would need a setBgColor method
  }

  private toggleSfx(): void {
    this.sfxEnabled = !this.sfxEnabled;
    this.audioService.setSfxEnabled(this.sfxEnabled);
    this.sfxToggle.setText(this.sfxEnabled ? '开启' : '关闭');
  }

  private async requestLocation(): Promise<void> {
    try {
      await this.wxService.getLocation();
      this.locationEnabled = true;
      this.toastManager.show({ text: '位置权限已开启' });
    } catch {
      this.locationEnabled = false;
      this.toastManager.show({ text: '位置权限被拒绝' });
    }
  }

  private showAbout(): void {
    this.wxService.showModal({
      title: '关于云端气象局',
      content: '云端气象局 v1.0.0\n一款基于真实天气的放置治愈小游戏\n让天气成为你生活的一部分',
      showCancel: false,
    });
  }

  private showHelp(): void {
    this.wxService.showModal({
      title: '帮助',
      content: '1. 种植植物，观察它们随天气变化\n2. 收集天气精灵，它们会出现在特定天气\n3. 步数可以转化为风力，驱动风车产币\n4. 和好友互送天气礼物',
      showCancel: false,
    });
  }

  private navigateBack(): void {
    // Navigate back to main scene
  }

  update(dt: number): void {
    this.backButton.update(dt);
    this.bgmToggle.update(dt);
    this.sfxToggle.update(dt);
    this.locationButton.update(dt);
    this.aboutButton.update(dt);
    this.helpButton.update(dt);
    this.toastManager.update(dt);
  }

  fixedUpdate(_dt: number): void {}

  render(): void {
    const w = this.renderer.width;
    const h = this.renderer.height;

    // Background
    this.renderer.drawGradientRect(0, 0, w, h, '#F0F4F8', '#E8ECF0', true, LAYERS.BACKGROUND);

    // Header
    this.renderer.fillRoundRect(0, 0, w, 52, 0, DesignTokens.colors.primary, LAYERS.UI);
    this.renderer.drawText(
      '设置',
      w / 2,
      26,
      '#FFFFFF',
      DesignTokens.fontSize.xl,
      'center',
      'middle',
      LAYERS.UI,
    );

    this.backButton.render(this.renderer);

    // Settings items
    this.renderSettingRow('背景音乐', 80);
    this.bgmToggle.render(this.renderer);

    this.renderSettingRow('音效', 128);
    this.sfxToggle.render(this.renderer);

    this.renderSettingRow('位置权限', 176);
    this.locationButton.render(this.renderer);

    // Divider
    this.renderer.fillRect(12, 220, w - 24, 1, DesignTokens.colors.neutral200, LAYERS.UI);

    // About & Help
    this.aboutButton.render(this.renderer);
    this.helpButton.render(this.renderer);

    // Version info
    this.renderer.drawText(
      'v1.0.0',
      w / 2,
      h - 40,
      DesignTokens.colors.textTertiary,
      DesignTokens.fontSize.xs,
      'center',
      'middle',
      LAYERS.UI,
    );

    this.toastManager.render(this.renderer);
  }

  private renderSettingRow(label: string, y: number): void {
    this.renderer.drawText(
      label,
      16,
      y + 16,
      DesignTokens.colors.textPrimary,
      DesignTokens.fontSize.md,
      'left',
      'middle',
      LAYERS.UI,
    );
  }

  onUnload(): void {
    this.audioService.destroy();
  }
}
