import { Renderer } from '../core/Renderer';
import { ParticleSystemConfig } from '../types';
export declare class RainEffect {
    private particles;
    private splashes;
    private config;
    private emitAccumulator;
    private screenWidth;
    private screenHeight;
    private groundY;
    private active;
    private windAngle;
    constructor(screenWidth: number, screenHeight: number, groundY: number, config?: Partial<ParticleSystemConfig>);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private emitParticle;
    setWindAngle(angle: number): void;
    setActive(active: boolean): void;
    get isActive(): boolean;
}
//# sourceMappingURL=RainEffect.d.ts.map