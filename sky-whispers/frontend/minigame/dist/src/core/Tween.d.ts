import { EasingFunction } from '../types';
interface TweenAction {
    type: 'to' | 'from' | 'delay' | 'call' | 'repeat' | 'yoyo';
    properties?: Record<string, number>;
    duration?: number;
    easing?: EasingFunction;
    callback?: () => void;
    times?: number;
}
interface ActiveTween {
    target: Record<string, number>;
    actions: TweenAction[];
    currentActionIndex: number;
    elapsed: number;
    startValues: Record<string, number>;
    active: boolean;
    yoyoing: boolean;
    repeatCount: number;
    repeatMax: number;
}
export declare class Tween {
    private static tweens;
    private target;
    private actions;
    constructor(target: Record<string, number>);
    static create(target: Record<string, number>): Tween;
    to(properties: Record<string, number>, duration: number, easing?: EasingFunction): Tween;
    from(properties: Record<string, number>, duration: number, easing?: EasingFunction): Tween;
    delay(duration: number): Tween;
    call(callback: () => void): Tween;
    repeat(times: number): Tween;
    yoyo(): Tween;
    start(): ActiveTween;
    static update(dt: number): void;
    private static updateTween;
    static remove(tween: ActiveTween): void;
    static removeAll(): void;
    static getActiveCount(): number;
}
export declare function tween(target: Record<string, number>): Tween;
export {};
//# sourceMappingURL=Tween.d.ts.map