import { Island as IslandData, IslandSkin } from '../types';
import { Renderer } from '../core/Renderer';
export declare class Island {
    private data;
    private skin;
    private x;
    private y;
    private baseY;
    private width;
    private height;
    private bobOffset;
    private breatheOffset;
    private time;
    private decors;
    private decorsInitialized;
    constructor(data: IslandData, x: number, y: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    /** Render subtle horizontal bands on the dirt for texture */
    private renderDirtBands;
    /** Render organic grass bumps along the top edge of the island */
    private renderGrassBumps;
    /** Render a subtle waterfall mist on the right edge of the island */
    private renderWaterfallMist;
    /** Initialize decorative elements with deterministic positions */
    private initDecorations;
    /** Render all decorative elements */
    private renderDecorations;
    /** Render a small flower */
    private renderFlower;
    /** Render a small pebble */
    private renderPebble;
    /** Render a small grass tuft */
    private renderGrassTuft;
    private renderSlots;
    private renderLockedSlots;
    setData(data: IslandData): void;
    setSkin(skin: IslandSkin): void;
    getPosition(): {
        x: number;
        y: number;
    };
    getSlotPosition(slotIndex: number): {
        x: number;
        y: number;
    };
    containsPoint(px: number, py: number): boolean;
}
