export declare class Timer {
    private elapsed;
    private duration;
    private callback;
    private recurring;
    private active;
    constructor(duration: number, callback: () => void, recurring?: boolean);
    update(dt: number): void;
    get progress(): number;
    get isActive(): boolean;
    reset(): void;
    cancel(): void;
}
export declare class TimerManager {
    private timers;
    addTimer(duration: number, callback: () => void, recurring?: boolean): Timer;
    update(dt: number): void;
    clear(): void;
    removeTimer(timer: Timer): void;
}
export declare function formatTime(seconds: number): string;
export declare function formatDuration(ms: number): string;
export declare function now(): number;
export declare function todayDateString(): string;
