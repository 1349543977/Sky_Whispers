// ============================================================
// BootScene - Loading & initialization
// ============================================================

import { Scene, SceneManager } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { Input } from '../core/Input';
import { SceneName, GameEvent } from '../types';
import { EventManager } from '../core/EventManager';
import { ApiClient } from '../services/ApiClient';
import { WxService } from '../services/WxService';
import { StorageService } from '../services/StorageService';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export class BootScene extends Scene {
  private apiClient: ApiClient;
  private wxService: WxService;
  private storageService: StorageService;

  private loadingProgress: number = 0;
  private loadingText: string = '正在初始化...';
  private loadingSteps: Array<{ text: string; action: () => Promise<void> }> = [];
  private currentStep: number = 0;

  constructor(renderer: Renderer, input: Input) {
    super(SceneName.Boot, renderer, input);
    this.storageService = new StorageService();
    this.apiClient = new ApiClient('', this.storageService);
    this.wxService = new WxService();
  }

  async onLoad(): Promise<void> {
    this.setupLoadingSteps();

    for (let i = 0; i < this.loadingSteps.length; i++) {
      this.currentStep = i;
      this.loadingText = this.loadingSteps[i].text;
      this.loadingProgress = i / this.loadingSteps.length;

      try {
        await this.loadingSteps[i].action();
      } catch (err) {
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
      await sceneManager.switchTo(SceneName.Main);
    }
  }

  private setupLoadingSteps(): void {
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
          } catch (err) {
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
          } catch (err) {
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
          } catch (err) {
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
          } catch (err) {
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
          } catch (err) {
            console.error('[BootScene] Sync steps failed:', err);
          }
        },
      },
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getSceneManager(): SceneManager | null {
    // Access scene manager through the game instance
    // This is a workaround since Scene doesn't directly hold a reference
    return null; // Will be set by Game class
  }

  update(_dt: number): void {
    // No continuous updates needed during boot
  }

  fixedUpdate(_dt: number): void {
    // No fixed updates needed during boot
  }

  render(): void {
    const w = this.renderer.width;
    const h = this.renderer.height;

    // Background
    this.renderer.drawGradientRect(0, 0, w, h, '#4A90D9', '#7ED6A8', true, LAYERS.BACKGROUND);

    // App title
    this.renderer.drawText(
      '云端气象局',
      w / 2,
      h * 0.3,
      '#FFFFFF',
      DesignTokens.fontSize.title,
      'center',
      'middle',
      LAYERS.UI,
    );

    // Subtitle
    this.renderer.drawText(
      'Sky Whispers',
      w / 2,
      h * 0.3 + 44,
      'rgba(255,255,255,0.7)',
      DesignTokens.fontSize.lg,
      'center',
      'middle',
      LAYERS.UI,
    );

    // Loading progress bar
    const barWidth = w * 0.6;
    const barHeight = 6;
    const barX = (w - barWidth) / 2;
    const barY = h * 0.55;

    this.renderer.fillRoundRect(barX, barY, barWidth, barHeight, 3, 'rgba(255,255,255,0.3)', LAYERS.UI);
    if (this.loadingProgress > 0) {
      this.renderer.fillRoundRect(
        barX,
        barY,
        barWidth * this.loadingProgress,
        barHeight,
        3,
        '#FFFFFF',
        LAYERS.UI,
      );
    }

    // Loading text
    this.renderer.drawText(
      this.loadingText,
      w / 2,
      barY + 24,
      'rgba(255,255,255,0.8)',
      DesignTokens.fontSize.sm,
      'center',
      'top',
      LAYERS.UI,
    );

    // Progress percentage
    this.renderer.drawText(
      `${Math.round(this.loadingProgress * 100)}%`,
      w / 2,
      barY - 16,
      'rgba(255,255,255,0.6)',
      DesignTokens.fontSize.xs,
      'center',
      'bottom',
      LAYERS.UI,
    );
  }

  onUnload(): void {
    // Cleanup
  }
}
