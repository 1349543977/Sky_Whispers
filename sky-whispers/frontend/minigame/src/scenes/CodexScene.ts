// ============================================================
// CodexScene - Sprite/plant collection
// ============================================================

import { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { Input } from '../core/Input';
import { SceneName, PlantType, SpriteType } from '../types';
import { EventManager } from '../core/EventManager';
import { ApiClient } from '../services/ApiClient';
import { StorageService } from '../services/StorageService';
import { PlantCard } from '../ui/PlantCard';
import { SpriteCard } from '../ui/SpriteCard';
import { Button } from '../ui/Button';
import { ScrollView } from '../ui/ScrollView';
import { Skeleton } from '../ui/Skeleton';
import { ToastManager } from '../ui/Toast';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export class CodexScene extends Scene {
  private apiClient: ApiClient;
  private storageService: StorageService;

  private currentTab: 'plants' | 'sprites' = 'plants';
  private plantTypes: PlantType[] = [];
  private spriteTypes: SpriteType[] = [];
  private discoveredPlants: Set<string> = new Set();
  private discoveredSprites: Set<string> = new Set();
  private loading: boolean = true;

  // UI
  private plantCards: PlantCard[] = [];
  private spriteCards: SpriteCard[] = [];
  private scrollView!: ScrollView;
  private skeleton!: Skeleton;
  private toastManager!: ToastManager;
  private backButton!: Button;
  private plantsTabButton!: Button;
  private spritesTabButton!: Button;

  constructor(renderer: Renderer, input: Input) {
    super(SceneName.Codex, renderer, input);
    this.storageService = new StorageService();
    this.apiClient = new ApiClient('', this.storageService);
  }

  async onLoad(): Promise<void> {
    const w = this.renderer.width;
    const h = this.renderer.height;

    this.toastManager = new ToastManager(w);
    this.skeleton = new Skeleton({
      x: 12,
      y: 100,
      width: w - 24,
      height: h - 160,
      rows: 6,
      rowHeight: 20,
      rowGap: 16,
    });

    this.scrollView = new ScrollView({
      x: 0,
      y: 100,
      width: w,
      height: h - 156,
      contentHeight: 0,
    });

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

    this.plantsTabButton = new Button({
      x: w / 2 - 80,
      y: 56,
      width: 72,
      height: 32,
      text: '植物',
      fontSize: DesignTokens.fontSize.sm,
      bgColor: DesignTokens.colors.primary,
      borderRadius: 16,
      onTap: () => this.switchTab('plants'),
    });

    this.spritesTabButton = new Button({
      x: w / 2 + 8,
      y: 56,
      width: 72,
      height: 32,
      text: '精灵',
      fontSize: DesignTokens.fontSize.sm,
      bgColor: 'rgba(0,0,0,0.1)',
      textColor: DesignTokens.colors.textSecondary,
      borderRadius: 16,
      onTap: () => this.switchTab('sprites'),
    });

    await this.loadData();
    this.loaded = true;
  }

  private async loadData(): Promise<void> {
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
    } catch (err) {
      console.error('[CodexScene] Load data failed:', err);
      this.toastManager.show({ text: '加载图鉴失败' });
    }
    this.loading = false;
  }

  private createPlantCards(): void {
    const w = this.renderer.width;
    const cols = 3;
    const cardWidth = (w - 48) / cols;
    const cardHeight = cardWidth + 20;

    this.plantCards = this.plantTypes.map((pt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return new PlantCard({
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

  private createSpriteCards(): void {
    const w = this.renderer.width;
    const cols = 3;
    const cardWidth = (w - 48) / cols;
    const cardHeight = cardWidth + 20;

    this.spriteCards = this.spriteTypes.map((st, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return new SpriteCard({
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

  private switchTab(tab: 'plants' | 'sprites'): void {
    this.currentTab = tab;
    // Update tab button styles
    if (tab === 'plants') {
      this.plantsTabButton.setDisabled(false);
      this.spritesTabButton.setDisabled(false);
    } else {
      this.plantsTabButton.setDisabled(false);
      this.spritesTabButton.setDisabled(false);
    }
  }

  private showPlantDetail(pt: PlantType): void {
    this.toastManager.show({ text: `${pt.name}: ${pt.description}` });
  }

  private showSpriteDetail(st: SpriteType): void {
    this.toastManager.show({ text: `${st.name}: ${st.description}` });
  }

  private navigateBack(): void {
    // Navigate back to main scene
  }

  update(dt: number): void {
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

  fixedUpdate(_dt: number): void {}

  render(): void {
    const w = this.renderer.width;
    const h = this.renderer.height;

    // Background
    this.renderer.drawGradientRect(0, 0, w, h, '#F0F4F8', '#E8ECF0', true, LAYERS.BACKGROUND);

    // Header
    this.renderer.fillRoundRect(0, 0, w, 52, 0, DesignTokens.colors.primary, LAYERS.UI);
    this.renderer.drawText(
      '图鉴',
      w / 2,
      26,
      '#FFFFFF',
      DesignTokens.fontSize.xl,
      'center',
      'middle',
      LAYERS.UI,
    );

    this.backButton.render(this.renderer);

    // Tab buttons
    this.plantsTabButton.render(this.renderer);
    this.spritesTabButton.render(this.renderer);

    if (this.loading) {
      this.skeleton.render(this.renderer);
    } else {
      this.scrollView.render(this.renderer);

      if (this.currentTab === 'plants') {
        for (const card of this.plantCards) {
          card.render(this.renderer);
        }
      } else {
        for (const card of this.spriteCards) {
          card.render(this.renderer);
        }
      }
    }

    this.toastManager.render(this.renderer);
  }

  onUnload(): void {}
}
