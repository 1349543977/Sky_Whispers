import { Vector2 } from '../types';
export declare class Camera {
    private position;
    private zoomLevel;
    private targetPosition;
    private targetZoom;
    private followTarget;
    private bounds;
    private smoothing;
    private screenWidth;
    private screenHeight;
    constructor(screenWidth: number, screenHeight: number);
    get x(): number;
    get y(): number;
    get zoom(): number;
    setBounds(minX: number, minY: number, maxX: number, maxY: number): void;
    setPosition(x: number, y: number): void;
    setZoom(zoom: number): void;
    panTo(x: number, y: number, smooth?: boolean): void;
    zoomTo(zoom: number, smooth?: boolean): void;
    follow(target: Vector2): void;
    stopFollow(): void;
    update(dt: number): void;
    applyTransform(ctx: CanvasRenderingContext2D): void;
    screenToWorld(screenX: number, screenY: number): Vector2;
    worldToScreen(worldX: number, worldY: number): Vector2;
    updateScreenSize(width: number, height: number): void;
    private clampPosition;
}
