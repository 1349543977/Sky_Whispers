"use strict";
// ============================================================
// SocialSystem - Social interactions management
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialSystem = void 0;
const types_1 = require("../types");
const EventManager_1 = require("../core/EventManager");
class SocialSystem {
    constructor(apiClient) {
        this.friends = [];
        this.giftInbox = [];
        this.initialized = false;
        this.apiClient = apiClient;
        this.eventManager = EventManager_1.EventManager.getInstance();
    }
    async init() {
        if (this.initialized)
            return;
        try {
            await this.loadFriends();
            await this.loadGiftInbox();
        }
        catch (err) {
            console.error('[SocialSystem] Init failed:', err);
        }
        this.initialized = true;
    }
    async loadFriends() {
        try {
            const response = await this.apiClient.getFriends();
            if (response.code === 0) {
                this.friends = response.data.items;
                this.eventManager.emit(types_1.GameEvent.FriendListLoaded, this.friends);
            }
            return this.friends;
        }
        catch (err) {
            console.error('[SocialSystem] Load friends failed:', err);
            return [];
        }
    }
    async loadGiftInbox() {
        try {
            const response = await this.apiClient.getGifts({ status: 'pending' });
            if (response.code === 0) {
                this.giftInbox = response.data.items;
            }
            return this.giftInbox;
        }
        catch (err) {
            console.error('[SocialSystem] Load gift inbox failed:', err);
            return [];
        }
    }
    async sendGift(friendId, giftType, message) {
        try {
            const response = await this.apiClient.sendGift({
                receiver_id: friendId,
                gift_type: giftType,
                message,
            });
            if (response.code === 0) {
                const gift = response.data;
                this.eventManager.emit(types_1.GameEvent.GiftSent, { gift });
                return true;
            }
            return false;
        }
        catch (err) {
            console.error('[SocialSystem] Send gift failed:', err);
            return false;
        }
    }
    async claimGift(giftId) {
        try {
            const response = await this.apiClient.claimGift(giftId);
            if (response.code === 0) {
                this.giftInbox = this.giftInbox.filter((g) => g.id !== giftId);
                this.eventManager.emit(types_1.GameEvent.GiftClaimed, { giftId });
                return true;
            }
            return false;
        }
        catch (err) {
            console.error('[SocialSystem] Claim gift failed:', err);
            return false;
        }
    }
    async visitIsland(friendId) {
        try {
            const response = await this.apiClient.visitIsland(friendId);
            if (response.code === 0) {
                this.eventManager.emit(types_1.GameEvent.IslandVisited, response.data);
                return true;
            }
            return false;
        }
        catch (err) {
            console.error('[SocialSystem] Visit island failed:', err);
            return false;
        }
    }
    getFriends() {
        return this.friends;
    }
    getGiftInbox() {
        return this.giftInbox;
    }
    getUnclaimedGiftCount() {
        return this.giftInbox.filter((g) => !g.is_claimed).length;
    }
    destroy() {
        this.initialized = false;
    }
}
exports.SocialSystem = SocialSystem;
//# sourceMappingURL=SocialSystem.js.map