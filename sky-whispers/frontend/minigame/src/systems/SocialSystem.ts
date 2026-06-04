// ============================================================
// SocialSystem - Social interactions management
// ============================================================

import { Friendship, Gift, GiftType, GameEvent } from '../types';
import { EventManager } from '../core/EventManager';
import { ApiClient } from '../services/ApiClient';

export class SocialSystem {
  private eventManager: EventManager;
  private apiClient: ApiClient;
  private friends: Friendship[] = [];
  private giftInbox: Gift[] = [];
  private initialized: boolean = false;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.eventManager = EventManager.getInstance();
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadFriends();
      await this.loadGiftInbox();
    } catch (err) {
      console.error('[SocialSystem] Init failed:', err);
    }

    this.initialized = true;
  }

  async loadFriends(): Promise<Friendship[]> {
    try {
      const response = await this.apiClient.getFriends();
      if (response.code === 0) {
        this.friends = response.data.items;
        this.eventManager.emit(GameEvent.FriendListLoaded, this.friends);
      }
      return this.friends;
    } catch (err) {
      console.error('[SocialSystem] Load friends failed:', err);
      return [];
    }
  }

  async loadGiftInbox(): Promise<Gift[]> {
    try {
      const response = await this.apiClient.getGifts({ status: 'pending' });
      if (response.code === 0) {
        this.giftInbox = response.data.items;
      }
      return this.giftInbox;
    } catch (err) {
      console.error('[SocialSystem] Load gift inbox failed:', err);
      return [];
    }
  }

  async sendGift(friendId: string, giftType: GiftType, message: string): Promise<boolean> {
    try {
      const response = await this.apiClient.sendGift({
        receiver_id: friendId,
        gift_type: giftType,
        message,
      });

      if (response.code === 0) {
        const gift = response.data;
        this.eventManager.emit(GameEvent.GiftSent, { gift });
        return true;
      }
      return false;
    } catch (err) {
      console.error('[SocialSystem] Send gift failed:', err);
      return false;
    }
  }

  async claimGift(giftId: string): Promise<boolean> {
    try {
      const response = await this.apiClient.claimGift(giftId);
      if (response.code === 0) {
        this.giftInbox = this.giftInbox.filter((g) => g.id !== giftId);
        this.eventManager.emit(GameEvent.GiftClaimed, { giftId });
        return true;
      }
      return false;
    } catch (err) {
      console.error('[SocialSystem] Claim gift failed:', err);
      return false;
    }
  }

  async visitIsland(friendId: string): Promise<boolean> {
    try {
      const response = await this.apiClient.visitIsland(friendId);
      if (response.code === 0) {
        this.eventManager.emit(GameEvent.IslandVisited, response.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[SocialSystem] Visit island failed:', err);
      return false;
    }
  }

  getFriends(): Friendship[] {
    return this.friends;
  }

  getGiftInbox(): Gift[] {
    return this.giftInbox;
  }

  getUnclaimedGiftCount(): number {
    return this.giftInbox.filter((g) => !g.is_claimed).length;
  }

  destroy(): void {
    this.initialized = false;
  }
}
