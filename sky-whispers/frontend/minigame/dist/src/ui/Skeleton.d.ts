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
    private pulsePhase;
    constructor(options: SkeletonOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    setActive(active: boolean): void;
    setPosition(x: number, y: number): void;
}
