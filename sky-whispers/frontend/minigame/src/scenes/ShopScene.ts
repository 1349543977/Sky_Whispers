// ============================================================
// ShopScene - Shop & items
// ============================================================

import { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { Input } from '../core/Input';
import { SceneName, ShopItem, ItemType, Rarity } from '../types';
import { EventManager } from '../core/EventManager';
import { ApiClient } from '../services/ApiClient';
import { StorageService } from '../services/StorageService';
import { Button } from '../ui/Button';
import { ScrollView } from '../ui/ScrollView';
import { Skeleton } from '../ui/Skeleton';
import { ToastManager } from '../ui/Toast';
import { LAYERS, RARITY_COLORS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export class ShopScene extends Scene {
  private apiClient: ApiClient;
  private storageService: StorageService;

  private items: ShopItem[] = [];
  private currentCategory: ItemType = ItemType.Skin;
  private loading: boolean = true;

  // UI
  private categoryButtons: Button[] = [];
  private scrollView!: ScrollView;
  private skeleton!: Skeleton;
  private toastManager!: ToastManager;
  private backButton!: Button;
  private coinDisplay!: import('../ui/CoinDisplay').CoinDisplay;

  constructor(renderer: Renderer, input: Input) {
    super(SceneName.Shop, renderer, input);
    this.storageService = new StorageService();
    this.apiClient = new ApiClient('', this.storageService);
  }

  async onLoad(): Promise<void> {
    const w = this.renderer.width;
    const h = this.renderer.height;

    this.toastManager = new ToastManager(w);
    this.skeleton = new Skeleton({
      x: 12,
      y: 140,
      width: w - 24,
      height: h - 200,
      rows: 4,
      rowHeight: 80,
      rowGap: 12,
    });

    this.scrollView = new ScrollView({
      x: 0,
      y: 140,
      width: w,
      height: h - 196,
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

    // Category tabs
    const categories: ItemType[] = [ItemType.Skin, ItemType.Effect, ItemType.Prop, ItemType.Pass];
    const categoryLabels: Record<string, string> = {
      skin: '皮肤',
      effect: '特效',
      prop: '道具',
      pass: '通行证',
    };

    this.categoryButtons = categories.map((cat, i) => {
      return new Button({
        x: 12 + i * 88,
        y: 56,
        width: 80,
        height: 32,
        text: categoryLabels[cat] ?? cat,
        fontSize: DesignTokens.fontSize.xs,
        bgColor: cat === this.currentCategory ? DesignTokens.colors.primary : 'rgba(0,0,0,0.1)',
        textColor: cat === this.currentCategory ? '#FFFFFF' : DesignTokens.colors.textSecondary,
        borderRadius: 16,
        onTap: () => this.switchCategory(cat),
      });
    });

    await this.loadShopItems();
    this.loaded = true;
  }

  private async loadShopItems(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.apiClient.getShopItems({
        item_type: this.currentCategory,
      });
      if (response.code === 0) {
        this.items = response.data.items;
        this.scrollView.setContentHeight(this.items.length * 96 + 20);
      }
    } catch (err) {
      console.error('[ShopScene] Load items failed:', err);
      this.toastManager.show({ text: '加载商店失败' });
    }
    this.loading = false;
  }

  private async switchCategory(category: ItemType): Promise<void> {
    this.currentCategory = category;
    // Update button styles
    this.categoryButtons.forEach((btn, i) => {
      const categories: ItemType[] = [ItemType.Skin, ItemType.Effect, ItemType.Prop, ItemType.Pass];
      const isActive = categories[i] === category;
      btn.setDisabled(false); // Reset
      // We'd need a setBgColor method for dynamic style changes
    });
    await this.loadShopItems();
  }

  private async purchaseItem(item: ShopItem): Promise<void> {
    try {
      const response = await this.apiClient.purchaseItem({
        item_id: item.id,
        quantity: 1,
      });
      if (response.code === 0) {
        this.toastManager.show({ text: '购买成功!' });
      } else {
        this.toastManager.show({ text: response.message || '购买失败' });
      }
    } catch {
      this.toastManager.show({ text: '购买失败' });
    }
  }

  private navigateBack(): void {
    // Navigate back to main scene
  }

  update(dt: number): void {
    this.skeleton.update(dt);
    this.scrollView.update(dt);
    this.backButton.update(dt);
    this.toastManager.update(dt);

    for (const btn of this.categoryButtons) {
      btn.update(dt);
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
      '商店',
      w / 2,
      26,
      '#FFFFFF',
      DesignTokens.fontSize.xl,
      'center',
      'middle',
      LAYERS.UI,
    );

    this.backButton.render(this.renderer);

    // Category tabs
    for (const btn of this.categoryButtons) {
      btn.render(this.renderer);
    }

    // Divider
    this.renderer.fillRect(0, 96, w, 1, DesignTokens.colors.neutral200, LAYERS.UI);

    if (this.loading) {
      this.skeleton.render(this.renderer);
    } else {
      this.scrollView.render(this.renderer);

      // Shop items
      for (let i = 0; i < this.items.length; i++) {
        this.renderShopItem(this.items[i], 140 + i * 96);
      }
    }

    this.toastManager.render(this.renderer);
  }

  private renderShopItem(item: ShopItem, y: number): void {
    const w = this.renderer.width;
    const rarityColor = RARITY_COLORS[item.rarity] ?? RARITY_COLORS[Rarity.Common];

    // Item card
    this.renderer.fillRoundRect(12, y, w - 24, 84, DesignTokens.borderRadius.md, DesignTokens.colors.surface, LAYERS.UI);
    this.renderer.strokeRoundRect(12, y, w - 24, 84, DesignTokens.borderRadius.md, rarityColor, 1, LAYERS.UI);

    // Item icon placeholder
    this.renderer.fillRoundRect(20, y + 8, 60, 60, DesignTokens.borderRadius.sm, 'rgba(0,0,0,0.05)', LAYERS.UI);
    this.renderer.drawText(
      '📦',
      50,
      y + 38,
      '#000000',
      24,
      'center',
      'middle',
      LAYERS.UI,
    );

    // Item name
    this.renderer.drawText(
      item.name,
      92,
      y + 16,
      DesignTokens.colors.textPrimary,
      DesignTokens.fontSize.md,
      'left',
      'top',
      LAYERS.UI,
    );

    // Item description (truncated)
    const desc = item.description.length > 20 ? item.description.substring(0, 20) + '...' : item.description;
    this.renderer.drawText(
      desc,
      92,
      y + 36,
      DesignTokens.colors.textSecondary,
      DesignTokens.fontSize.xs,
      'left',
      'top',
      LAYERS.UI,
    );

    // Price
    const priceText = item.currency === 'rmb' ? `¥${item.price}` : `${item.price}金币`;
    this.renderer.drawText(
      priceText,
      w - 24,
      y + 60,
      item.currency === 'rmb' ? DesignTokens.colors.danger : DesignTokens.colors.accent,
      DesignTokens.fontSize.md,
      'right',
      'top',
      LAYERS.UI,
    );

    // Rarity badge
    this.renderer.fillRoundRect(92, y + 56, 36, 16, 8, rarityColor, LAYERS.UI);
    this.renderer.drawText(
      item.rarity.charAt(0).toUpperCase(),
      110,
      y + 64,
      '#FFFFFF',
      8,
      'center',
      'middle',
      LAYERS.UI,
    );
  }

  onUnload(): void {}
}
