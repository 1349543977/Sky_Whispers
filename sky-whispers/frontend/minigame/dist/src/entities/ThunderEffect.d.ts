import { Renderer } from '../core/Renderer';
export declare class ThunderEffect {
    private screenWidth;
    private screenHeight;
    private active;
    private branches;
    private flashAlpha;
    private shakeOffset;
    private nextStrikeTimer;
    private onThunderSound;
    private static readonly STRIKE_INTERVAL_MIN;
    private static readonly STRIKE_INTERVAL_MAX;
    private static readonly BOLT_LIFE;
    private static readonly FLASH_DURATION;
    private static readonly FLASH_MAX_ALPHA;
    private static readonly SHAKE_INTENSITY;
    private static readonly SHAKE_DAMPING;
    private static readonly SHAKE_THRESHOLD;
    private static readonly BRANCH_COUNT_MIN;
    private static readonly BRANCH_COUNT_MAX;
    private static readonly GLOW_RADIUS;
    constructor(screenWidth: number, screenHeight: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private strike;
    private generateBolt;
    setOnThunderSound(callback: () => void): void;
    getShakeOffset(): {
        x: number;
        y: number;
    };
    setActive(active: boolean): void;
    get isActive(): boolean;
}
