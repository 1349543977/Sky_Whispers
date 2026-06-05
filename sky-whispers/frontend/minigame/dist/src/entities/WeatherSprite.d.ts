import { WeatherSprite as SpriteData, SpriteType } from '../types';
import { Renderer } from '../core/Renderer';
export declare class WeatherSprite {
    private data;
    private type;
    private x;
    private y;
    private baseY;
    private time;
    private floatOffset;
    private heartParticles;
    private width;
    private height;
    constructor(data: SpriteData, type: SpriteType, x: number, y: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private renderAccessory;
    emitHearts(): void;
    containsPoint(px: number, py: number): boolean;
    getData(): SpriteData;
    updateData(data: SpriteData): void;
    getType(): SpriteType;
    getPosition(): {
        x: number;
        y: number;
    };
}
//# sourceMappingURL=WeatherSprite.d.ts.map