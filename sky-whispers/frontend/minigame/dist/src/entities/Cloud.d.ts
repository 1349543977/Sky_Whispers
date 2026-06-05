import { Renderer } from '../core/Renderer';
export type CloudVariant = 'normal' | 'rain' | 'gift';
export declare class Cloud {
    private x;
    private y;
    private baseY;
    private speed;
    private variant;
    private width;
    private height;
    private screenWidth;
    private time;
    private dripOffset;
    private puffs;
    private depth;
    private bobPhase;
    private bobAmplitude;
    private static readonly BOB_SPEED;
    private static readonly BOB_AMPLITUDE_MIN;
    private static readonly BOB_AMPLITUDE_MAX;
    private static readonly SHADOW_OFFSET_Y;
    private static readonly SHADOW_BLUR;
    private static readonly RAIN_DROP_COUNT;
    constructor(x: number, y: number, speed: number, variant: CloudVariant, screenWidth: number);
    private generatePuffs;
    update(dt: number): void;
    render(renderer: Renderer): void;
    private renderShadow;
    private renderCloudBody;
    private renderNormalCloud;
    private renderRainCloud;
    private renderGiftCloud;
    containsPoint(px: number, py: number): boolean;
    getVariant(): CloudVariant;
    getPosition(): {
        x: number;
        y: number;
    };
}
