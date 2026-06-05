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
    private time;
    constructor(data: IslandData, x: number, y: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
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
//# sourceMappingURL=Island.d.ts.map