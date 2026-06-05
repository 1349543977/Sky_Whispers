export declare class CoinSystem {
    private eventManager;
    private coins;
    private windmillLevel;
    private windPower;
    private idleAccumulator;
    private maxIdleSeconds;
    private autoCollect;
    private uncollectedCoins;
    private lastCollectTime;
    constructor();
    init(coins: number, windmillLevel: number, windPower: number): void;
    update(dt: number): void;
    private calculateGenerationRate;
    collectCoins(): number;
    spendCoins(amount: number): boolean;
    earnCoins(amount: number, source: string): void;
    setWindmillLevel(level: number): void;
    setWindPower(power: number): void;
    setAutoCollect(enabled: boolean): void;
    getCoins(): number;
    getUncollectedCoins(): number;
    getGenerationRate(): number;
    calculateOfflineEarnings(offlineSeconds: number): number;
}
//# sourceMappingURL=CoinSystem.d.ts.map