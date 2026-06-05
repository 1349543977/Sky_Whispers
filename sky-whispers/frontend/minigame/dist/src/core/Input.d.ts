import { TouchPoint, TouchEvent as GameTouchEvent } from '../types';
export interface TouchTarget {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
    onTouchStart?: (point: TouchPoint) => void;
    onTouchEnd?: (point: TouchPoint) => void;
    onTouchMove?: (point: TouchPoint) => void;
    onTap?: (point: TouchPoint) => void;
    onLongPress?: (point: TouchPoint) => void;
}
type InputCallback = (event: GameTouchEvent) => void;
export declare class Input {
    private targets;
    private activeTouches;
    private longPressTimers;
    private touchStartPoints;
    private globalListeners;
    private longPressThreshold;
    private tapDistanceThreshold;
    private isDragging;
    private dragStartPoint;
    private dragThreshold;
    constructor();
    private bindWxEvents;
    private convertWxEvent;
    addTarget(target: TouchTarget): void;
    removeTarget(id: string): void;
    clearTargets(): void;
    on(event: string, callback: InputCallback): () => void;
    private emitGlobal;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private handleTap;
    private handleLongPress;
    private cancelLongPress;
    get isPressed(): boolean;
    getActiveTouches(): TouchPoint[];
}
export {};
//# sourceMappingURL=Input.d.ts.map