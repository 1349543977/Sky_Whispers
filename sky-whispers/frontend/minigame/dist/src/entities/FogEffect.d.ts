import { Renderer } from '../core/Renderer';
export declare class FogEffect {
    private layers;
    private screenWidth;
    private screenHeight;
    private active;
    private globalAlpha;
    private time;
    private static readonly LAYER_COUNT;
    private static readonly ALPHA_MIN;
    private static readonly ALPHA_MAX;
    private static readonly BOB_AMPLITUDE_MIN;
    private static readonly BOB_AMPLITUDE_MAX;
    private static readonly BOB_SPEED_MIN;
    private static readonly BOB_SPEED_MAX;
    private static readonly SPEED_MIN;
    private static readonly SPEED_MAX;
    private static readonly ORGANIC_POINTS;
    private static readonly WOBBLE_AMOUNT;
    constructor(screenWidth: number, screenHeight: number);
    private initLayers;
    update(dt: number): void;
    render(renderer: Renderer): void;
    setGlobalAlpha(alpha: number): void;
    setActive(active: boolean): void;
    get isActive(): boolean;
}
