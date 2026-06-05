import { Renderer } from '../core/Renderer';
export declare class Windmill {
    private x;
    private y;
    private level;
    private windPower;
    private rotation;
    private coinParticles;
    private time;
    private width;
    private height;
    constructor(x: number, y: number, level: number, windPower: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private renderBlades;
    emitCoin(): void;
    setWindPower(power: number): void;
    setLevel(level: number): void;
    containsPoint(px: number, py: number): boolean;
    getPosition(): {
        x: number;
        y: number;
    };
}
//# sourceMappingURL=Windmill.d.ts.map