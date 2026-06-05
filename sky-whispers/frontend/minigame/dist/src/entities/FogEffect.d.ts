import { Renderer } from '../core/Renderer';
export declare class FogEffect {
    private layers;
    private screenWidth;
    private screenHeight;
    private active;
    private globalAlpha;
    constructor(screenWidth: number, screenHeight: number);
    private initLayers;
    update(dt: number): void;
    render(renderer: Renderer): void;
    setGlobalAlpha(alpha: number): void;
    setActive(active: boolean): void;
    get isActive(): boolean;
}
//# sourceMappingURL=FogEffect.d.ts.map