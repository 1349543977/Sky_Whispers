import { Renderer } from '../core/Renderer';
export declare class CoinDisplay {
    private x;
    private y;
    private coins;
    private displayCoins;
    private width;
    private height;
    private coinShineAngle;
    private sparkles;
    private lastCoins;
    private glowPulse;
    constructor(x: number, y: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private spawnSparkles;
    private formatNumber;
    setCoins(coins: number): void;
    getCoins(): number;
    setPosition(x: number, y: number): void;
}
