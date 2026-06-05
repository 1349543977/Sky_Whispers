import { Renderer } from '../core/Renderer';
export declare class ThunderEffect {
    private screenWidth;
    private screenHeight;
    private active;
    private bolts;
    private flashAlpha;
    private shakeOffset;
    private nextStrikeTimer;
    private strikeInterval;
    private onThunderSound;
    constructor(screenWidth: number, screenHeight: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private strike;
    private generateBolt;
    setOnThunderSound(callback: () => void): void;
    getShakeOffset(): {
        x: number;
        y: number;
    };
    setActive(active: boolean): void;
    get isActive(): boolean;
}
//# sourceMappingURL=ThunderEffect.d.ts.map