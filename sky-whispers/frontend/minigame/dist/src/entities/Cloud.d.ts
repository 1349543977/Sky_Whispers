import { Renderer } from '../core/Renderer';
export type CloudVariant = 'normal' | 'rain' | 'gift';
export declare class Cloud {
    private x;
    private y;
    private speed;
    private variant;
    private width;
    private height;
    private screenWidth;
    private time;
    private dripOffset;
    constructor(x: number, y: number, speed: number, variant: CloudVariant, screenWidth: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
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
//# sourceMappingURL=Cloud.d.ts.map