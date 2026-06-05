import { Renderer } from '../core/Renderer';
export declare class CoinDisplay {
    private x;
    private y;
    private coins;
    private displayCoins;
    private width;
    private height;
    constructor(x: number, y: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private formatNumber;
    setCoins(coins: number): void;
    getCoins(): number;
    setPosition(x: number, y: number): void;
}
//# sourceMappingURL=CoinDisplay.d.ts.map