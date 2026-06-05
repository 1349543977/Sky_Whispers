import { Renderer } from '../core/Renderer';
import { ParticleSystemConfig } from '../types';
export declare class SnowEffect {
    private particles;
    private config;
    private emitAccumulator;
    private screenWidth;
    private screenHeight;
    private active;
    private windSpeed;
    constructor(screenWidth: number, screenHeight: number, config?: Partial<ParticleSystemConfig>);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private emitParticle;
    setWindSpeed(speed: number): void;
    setActive(active: boolean): void;
    get isActive(): boolean;
}
//# sourceMappingURL=SnowEffect.d.ts.map