import { Friendship, Gift, GiftType } from '../types';
import { ApiClient } from '../services/ApiClient';
export declare class SocialSystem {
    private eventManager;
    private apiClient;
    private friends;
    private giftInbox;
    private initialized;
    constructor(apiClient: ApiClient);
    init(): Promise<void>;
    loadFriends(): Promise<Friendship[]>;
    loadGiftInbox(): Promise<Gift[]>;
    sendGift(friendId: string, giftType: GiftType, message: string): Promise<boolean>;
    claimGift(giftId: string): Promise<boolean>;
    visitIsland(friendId: string): Promise<boolean>;
    getFriends(): Friendship[];
    getGiftInbox(): Gift[];
    getUnclaimedGiftCount(): number;
    destroy(): void;
}
