// ============================================================
// SocialScene - Friends & social interactions
// ============================================================

import { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { Input } from '../core/Input';
import { SceneName, Friendship, Gift, GiftType } from '../types';
import { EventManager } from '../core/EventManager';
import { SocialSystem } from '../systems/SocialSystem';
import { FriendItem } from '../ui/FriendItem';
import { GiftPopup } from '../ui/GiftPopup';
import { ScrollView } from '../ui/ScrollView';
import { Skeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';
import { TabBar } from '../ui/TabBar';
import { ToastManager } from '../ui/Toast';
import { ApiClient } from '../services/ApiClient';
import { StorageService } from '../services/StorageService';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export class SocialScene extends Scene {
  private socialSystem!: SocialSystem;
  private storageService: StorageService;
  private apiClient: ApiClient;

  // UI
  private friendItems: FriendItem[] = [];
  private giftPopup!: GiftPopup;
  private scrollView!: ScrollView;
  private skeleton!: Skeleton;
  private tabBar!: TabBar;
  private toastManager!: ToastManager;
  private backButton!: Button;
  private giftInboxButton!: Button;

  private loading: boolean = true;
  private selectedFriendId: string = '';
  private giftInbox: Gift[] = [];

  constructor(renderer: Renderer, input: Input) {
    super(SceneName.Social, renderer, input);
    this.storageService = new StorageService();
    this.apiClient = new ApiClient('', this.storageService);
  }

  async onLoad(): Promise<void> {
    this.socialSystem = new SocialSystem(this.apiClient);

    const w = this.renderer.width;
    const h = this.renderer.height;

    // UI setup
    this.toastManager = new ToastManager(w);
    this.skeleton = new Skeleton({
      x: 12,
      y: 60,
      width: w - 24,
      height: h - 120,
      rows: 6,
      rowHeight: 20,
      rowGap: 16,
    });

    this.scrollView = new ScrollView({
      x: 0,
      y: 56,
      width: w,
      height: h - 112,
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

    this.giftInboxButton = new Button({
      x: w - 92,
      y: 12,
      width: 80,
      height: 32,
      text: '🎁 收件箱',
      fontSize: DesignTokens.fontSize.xs,
      bgColor: DesignTokens.colors.accent,
      borderRadius: 16,
      onTap: () => this.showGiftInbox(),
    });

    this.giftPopup = new GiftPopup({
      screenWidth: w,
      screenHeight: h,
      friends: [],
      onSend: (friendId, giftType, message) => this.sendGift(friendId, giftType, message),
      onClose: () => {},
    });

    // Load data
    await this.loadFriends();
    this.loaded = true;
  }

  private async loadFriends(): Promise<void> {
    this.loading = true;
    try {
      await this.socialSystem.init();
      const friends = this.socialSystem.getFriends();
      this.createFriendItems(friends);
      this.giftInbox = this.socialSystem.getGiftInbox();

      // Update gift inbox badge
      const unclaimed = this.socialSystem.getUnclaimedGiftCount();
      this.giftInboxButton.setText(`🎁 收件箱${unclaimed > 0 ? `(${unclaimed})` : ''}`);
    } catch (err) {
      console.error('[SocialScene] Load friends failed:', err);
      this.toastManager.show({ text: '加载好友列表失败' });
    }
    this.loading = false;
  }

  private createFriendItems(friends: Friendship[]): void {
    const w = this.renderer.width;
    this.friendItems = friends.map((friend, i) => {
      return new FriendItem({
        x: 12,
        y: 60 + i * 64,
        width: w - 24,
        height: 56,
        friendship: friend,
        onVisit: (friendId) => this.visitFriend(friendId),
        onGift: (friendId) => this.showGiftPopup(friendId),
      });
    });

    this.scrollView.setContentHeight(60 + friends.length * 64 + 20);
  }

  private async visitFriend(friendId: string): Promise<void> {
    try {
      await this.socialSystem.visitIsland(friendId);
      this.toastManager.show({ text: '拜访成功!' });
    } catch {
      this.toastManager.show({ text: '拜访失败' });
    }
  }

  private showGiftPopup(friendId: string): void {
    this.selectedFriendId = friendId;
    this.giftPopup.setFriends(this.socialSystem.getFriends());
    this.giftPopup.show();
  }

  private async sendGift(friendId: string, giftType: GiftType, message: string): Promise<void> {
    const success = await this.socialSystem.sendGift(friendId, giftType, message);
    this.toastManager.show({
      text: success ? '礼物已送出!' : '送礼失败',
    });
  }

  private showGiftInbox(): void {
    // Show gift inbox as a simple dialog
    this.toastManager.show({ text: `收到 ${this.giftInbox.length} 个礼物` });
  }

  private navigateBack(): void {
    // Navigate back to main scene
  }

  update(dt: number): void {
    this.skeleton.update(dt);
    this.scrollView.update(dt);
    this.backButton.update(dt);
    this.giftInboxButton.update(dt);
    this.giftPopup.update(dt);
    this.toastManager.update(dt);

    for (const item of this.friendItems) {
      item.update(dt);
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
      '好友',
      w / 2,
      26,
      '#FFFFFF',
      DesignTokens.fontSize.xl,
      'center',
      'middle',
      LAYERS.UI,
    );

    // Back button
    this.backButton.render(this.renderer);

    // Gift inbox button
    this.giftInboxButton.render(this.renderer);

    if (this.loading) {
      this.skeleton.render(this.renderer);
    } else {
      this.scrollView.render(this.renderer);

      for (const item of this.friendItems) {
        item.render(this.renderer);
      }
    }

    // Gift popup
    this.giftPopup.render(this.renderer);

    // Toasts
    this.toastManager.render(this.renderer);
  }

  onUnload(): void {
    this.socialSystem.destroy();
  }
}
