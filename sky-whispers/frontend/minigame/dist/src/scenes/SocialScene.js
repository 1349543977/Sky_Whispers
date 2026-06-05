"use strict";
// ============================================================
// SocialScene - Friends & social interactions
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialScene = void 0;
const Scene_1 = require("../core/Scene");
const types_1 = require("../types");
const SocialSystem_1 = require("../systems/SocialSystem");
const FriendItem_1 = require("../ui/FriendItem");
const GiftPopup_1 = require("../ui/GiftPopup");
const ScrollView_1 = require("../ui/ScrollView");
const Skeleton_1 = require("../ui/Skeleton");
const Button_1 = require("../ui/Button");
const Toast_1 = require("../ui/Toast");
const ApiClient_1 = require("../services/ApiClient");
const StorageService_1 = require("../services/StorageService");
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
class SocialScene extends Scene_1.Scene {
    constructor(renderer, input) {
        super(types_1.SceneName.Social, renderer, input);
        // UI
        this.friendItems = [];
        this.loading = true;
        this.selectedFriendId = '';
        this.giftInbox = [];
        this.storageService = new StorageService_1.StorageService();
        this.apiClient = new ApiClient_1.ApiClient('', this.storageService);
    }
    async onLoad() {
        this.socialSystem = new SocialSystem_1.SocialSystem(this.apiClient);
        const w = this.renderer.width;
        const h = this.renderer.height;
        // UI setup
        this.toastManager = new Toast_1.ToastManager(w);
        this.skeleton = new Skeleton_1.Skeleton({
            x: 12,
            y: 60,
            width: w - 24,
            height: h - 120,
            rows: 6,
            rowHeight: 20,
            rowGap: 16,
        });
        this.scrollView = new ScrollView_1.ScrollView({
            x: 0,
            y: 56,
            width: w,
            height: h - 112,
            contentHeight: 0,
        });
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
        this.giftInboxButton = new Button_1.Button({
            x: w - 92,
            y: 12,
            width: 80,
            height: 32,
            text: '🎁 收件箱',
            fontSize: color_1.DesignTokens.fontSize.xs,
            bgColor: color_1.DesignTokens.colors.accent,
            borderRadius: 16,
            onTap: () => this.showGiftInbox(),
        });
        this.giftPopup = new GiftPopup_1.GiftPopup({
            screenWidth: w,
            screenHeight: h,
            friends: [],
            onSend: (friendId, giftType, message) => this.sendGift(friendId, giftType, message),
            onClose: () => { },
        });
        // Load data
        await this.loadFriends();
        this.loaded = true;
    }
    async loadFriends() {
        this.loading = true;
        try {
            await this.socialSystem.init();
            const friends = this.socialSystem.getFriends();
            this.createFriendItems(friends);
            this.giftInbox = this.socialSystem.getGiftInbox();
            // Update gift inbox badge
            const unclaimed = this.socialSystem.getUnclaimedGiftCount();
            this.giftInboxButton.setText(`🎁 收件箱${unclaimed > 0 ? `(${unclaimed})` : ''}`);
        }
        catch (err) {
            console.error('[SocialScene] Load friends failed:', err);
            this.toastManager.show({ text: '加载好友列表失败' });
        }
        this.loading = false;
    }
    createFriendItems(friends) {
        const w = this.renderer.width;
        this.friendItems = friends.map((friend, i) => {
            return new FriendItem_1.FriendItem({
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
    async visitFriend(friendId) {
        try {
            await this.socialSystem.visitIsland(friendId);
            this.toastManager.show({ text: '拜访成功!' });
        }
        catch (_a) {
            this.toastManager.show({ text: '拜访失败' });
        }
    }
    showGiftPopup(friendId) {
        this.selectedFriendId = friendId;
        this.giftPopup.setFriends(this.socialSystem.getFriends());
        this.giftPopup.show();
    }
    async sendGift(friendId, giftType, message) {
        const success = await this.socialSystem.sendGift(friendId, giftType, message);
        this.toastManager.show({
            text: success ? '礼物已送出!' : '送礼失败',
        });
    }
    showGiftInbox() {
        // Show gift inbox as a simple dialog
        this.toastManager.show({ text: `收到 ${this.giftInbox.length} 个礼物` });
    }
    navigateBack() {
        // Navigate back to main scene
    }
    update(dt) {
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
    fixedUpdate(_dt) { }
    render() {
        const w = this.renderer.width;
        const h = this.renderer.height;
        // Background
        this.renderer.drawGradientRect(0, 0, w, h, '#F0F4F8', '#E8ECF0', true, constants_1.LAYERS.BACKGROUND);
        // Header
        this.renderer.fillRoundRect(0, 0, w, 52, 0, color_1.DesignTokens.colors.primary, constants_1.LAYERS.UI);
        this.renderer.drawText('好友', w / 2, 26, '#FFFFFF', color_1.DesignTokens.fontSize.xl, 'center', 'middle', constants_1.LAYERS.UI);
        // Back button
        this.backButton.render(this.renderer);
        // Gift inbox button
        this.giftInboxButton.render(this.renderer);
        if (this.loading) {
            this.skeleton.render(this.renderer);
        }
        else {
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
    onUnload() {
        this.socialSystem.destroy();
    }
}
exports.SocialScene = SocialScene;
//# sourceMappingURL=SocialScene.js.map