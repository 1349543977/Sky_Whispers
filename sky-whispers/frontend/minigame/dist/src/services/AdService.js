"use strict";
// ============================================================
// AdService - Rewarded video ad wrapper
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdService = void 0;
class AdService {
    constructor(adUnitId) {
        this.rewardedVideoAd = null;
        this.adAvailable = false;
        this.onRewardCallback = null;
        this.onCloseCallback = null;
        this.onErrorCallback = null;
        this.adUnitId = adUnitId;
        this.initAd();
    }
    initAd() {
        if (!this.adUnitId) {
            console.warn('[AdService] No ad unit ID configured');
            return;
        }
        try {
            this.rewardedVideoAd = wx.createRewardedVideoAd({
                adUnitId: this.adUnitId,
            });
            this.rewardedVideoAd.onLoad(() => {
                this.adAvailable = true;
            });
            this.rewardedVideoAd.onError((err) => {
                var _a;
                this.adAvailable = false;
                console.error('[AdService] Ad error:', err);
                (_a = this.onErrorCallback) === null || _a === void 0 ? void 0 : _a.call(this, new Error(err.errMsg));
            });
            this.rewardedVideoAd.onClose((res) => {
                var _a, _b;
                const isEnded = res && res.isEnded;
                if (isEnded) {
                    (_a = this.onRewardCallback) === null || _a === void 0 ? void 0 : _a.call(this);
                }
                (_b = this.onCloseCallback) === null || _b === void 0 ? void 0 : _b.call(this, isEnded !== null && isEnded !== void 0 ? isEnded : false);
            });
            // Pre-load
            this.rewardedVideoAd.load().catch(() => {
                this.adAvailable = false;
            });
        }
        catch (err) {
            console.error('[AdService] Init failed:', err);
            this.adAvailable = false;
        }
    }
    async show(onReward, onClose) {
        if (!this.rewardedVideoAd || !this.adAvailable) {
            console.warn('[AdService] Ad not available');
            return false;
        }
        this.onRewardCallback = onReward;
        this.onCloseCallback = onClose !== null && onClose !== void 0 ? onClose : null;
        try {
            await this.rewardedVideoAd.show();
            return true;
        }
        catch (err) {
            console.error('[AdService] Show ad failed:', err);
            // Try to reload
            try {
                await this.rewardedVideoAd.load();
                await this.rewardedVideoAd.show();
                return true;
            }
            catch (_a) {
                this.adAvailable = false;
                return false;
            }
        }
    }
    setOnError(callback) {
        this.onErrorCallback = callback;
    }
    isAdAvailable() {
        return this.adAvailable;
    }
    destroy() {
        this.rewardedVideoAd = null;
    }
}
exports.AdService = AdService;
//# sourceMappingURL=AdService.js.map