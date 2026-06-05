export declare class Scheduler {
    private lastTime;
    private accumulator;
    private fixedTimestep;
    private running;
    private rafId;
    private updateCallback;
    private fixedUpdateCallback;
    private renderCallback;
    private maxDelta;
    constructor();
    setUpdateCallback(cb: (dt: number) => void): void;
    setFixedUpdateCallback(cb: (dt: number) => void): void;
    setRenderCallback(cb: () => void): void;
    start(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    get isRunning(): boolean;
    private tick;
}
