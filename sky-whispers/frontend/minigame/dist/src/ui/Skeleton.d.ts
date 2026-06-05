import { Renderer } from '../core/Renderer';
export interface SkeletonOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    rows?: number;
    rowHeight?: number;
    rowGap?: number;
}
export declare class Skeleton {
    private x;
    private y;
    private width;
    private height;
    private rows;
    private rowHeight;
    private rowGap;
    private shimmerOffset;
    private active;
    constructor(options: SkeletonOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private drawRoundRectPath;
    setActive(active: boolean): void;
    setPosition(x: number, y: number): void;
}
//# sourceMappingURL=Skeleton.d.ts.map