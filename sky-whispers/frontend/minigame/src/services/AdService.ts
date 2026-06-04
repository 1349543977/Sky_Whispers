// ============================================================
// AdService - Rewarded video ad wrapper
// ============================================================

interface RewardedVideoAdCloseResult {
  isEnded: boolean;
}

interface RewardedVideoAdError {
  errMsg: string;
}

interface RewardedVideoAd {
  load(): Promise<void>;
  show(): Promise<void>;
  onLoad(callback: () => void): void;
  onError(callback: (err: RewardedVideoAdError) => void): void;
  onClose(callback: (res: RewardedVideoAdCloseResult) => void): void;
}

declare function wx_createRewardedVideoAd(options: { adUnitId: string }): RewardedVideoAd;

export class AdService {
  private rewardedVideoAd: RewardedVideoAd | null = null;
  private adUnitId: string;
  private adAvailable: boolean = false;
  private onRewardCallback: (() => void) | null = null;
  private onCloseCallback: ((isEnded: boolean) => void) | null = null;
  private onErrorCallback: ((err: Error) => void) | null = null;

  constructor(adUnitId: string) {
    this.adUnitId = adUnitId;
    this.initAd();
  }

  private initAd(): void {
    if (!this.adUnitId) {
      console.warn('[AdService] No ad unit ID configured');
      return;
    }

    try {
      this.rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: this.adUnitId,
      }) as unknown as RewardedVideoAd;

      this.rewardedVideoAd.onLoad(() => {
        this.adAvailable = true;
      });

      this.rewardedVideoAd.onError((err: RewardedVideoAdError) => {
        this.adAvailable = false;
        console.error('[AdService] Ad error:', err);
        this.onErrorCallback?.(new Error(err.errMsg));
      });

      this.rewardedVideoAd.onClose((res: RewardedVideoAdCloseResult) => {
        const isEnded = res && res.isEnded;
        if (isEnded) {
          this.onRewardCallback?.();
        }
        this.onCloseCallback?.(isEnded ?? false);
      });

      // Pre-load
      this.rewardedVideoAd.load().catch(() => {
        this.adAvailable = false;
      });
    } catch (err) {
      console.error('[AdService] Init failed:', err);
      this.adAvailable = false;
    }
  }

  async show(onReward: () => void, onClose?: (isEnded: boolean) => void): Promise<boolean> {
    if (!this.rewardedVideoAd || !this.adAvailable) {
      console.warn('[AdService] Ad not available');
      return false;
    }

    this.onRewardCallback = onReward;
    this.onCloseCallback = onClose ?? null;

    try {
      await this.rewardedVideoAd.show();
      return true;
    } catch (err) {
      console.error('[AdService] Show ad failed:', err);
      // Try to reload
      try {
        await this.rewardedVideoAd.load();
        await this.rewardedVideoAd.show();
        return true;
      } catch {
        this.adAvailable = false;
        return false;
      }
    }
  }

  setOnError(callback: (err: Error) => void): void {
    this.onErrorCallback = callback;
  }

  isAdAvailable(): boolean {
    return this.adAvailable;
  }

  destroy(): void {
    this.rewardedVideoAd = null;
  }
}
