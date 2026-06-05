export declare class AdService {
    private rewardedVideoAd;
    private adUnitId;
    private adAvailable;
    private onRewardCallback;
    private onCloseCallback;
    private onErrorCallback;
    constructor(adUnitId: string);
    private initAd;
    show(onReward: () => void, onClose?: (isEnded: boolean) => void): Promise<boolean>;
    setOnError(callback: (err: Error) => void): void;
    isAdAvailable(): boolean;
    destroy(): void;
}
//# sourceMappingURL=AdService.d.ts.map