import { Renderer } from '../core/Renderer';
export interface ScrollViewOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    contentHeight: number;
    bgColor?: string;
    scrollbarColor?: string;
    scrollbarWidth?: number;
    momentum?: boolean;
    onPullRefresh?: () => void;
}
export declare class ScrollView {
    private x;
    private y;
    private width;
    private height;
    private contentHeight;
    private bgColor;
    private scrollbarColor;
    private scrollbarWidth;
    private momentum;
    private onPullRefresh?;
    private scrollY;
    private velocity;
    private lastTouchY;
    private isDragging;
    private isRefreshing;
    private refreshProgress;
    private friction;
    private scrollbarAlpha;
    private scrollbarFadeTimer;
    private pullArrowRotation;
    private pullDistance;
    constructor(options: ScrollViewOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    handleTouchStart(x: number, y: number): boolean;
    handleTouchMove(x: number, y: number): void;
    handleTouchEnd(): void;
    setContentHeight(height: number): void;
    getScrollY(): number;
    scrollTo(y: number): void;
    containsPoint(px: number, py: number): boolean;
}
