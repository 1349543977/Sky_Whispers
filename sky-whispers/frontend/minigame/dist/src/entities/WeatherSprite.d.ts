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
    private sparkleTrails;
    private width;
    private height;
    private lastTrailTime;
    constructor(data: SpriteData, type: SpriteType, x: number, y: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    /** Render small feet/limbs beneath the body */
    private renderLimbs;
    /** Render the sprite's face with expressive eyes and mouth */
    private renderFace;
    /** Render weather-themed accessory on top of the sprite */
    private renderAccessory;
    /** Render level badge with gradient background */
    private renderLevelBadge;
    /** Render sparkle trail particles behind the sprite */
    private renderSparkleTrail;
    /** Render floating heart particles */
    private renderHeartParticles;
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
