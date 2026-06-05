import { Plant as PlantData, PlantType } from '../types';
import { Renderer } from '../core/Renderer';
export declare class Plant {
    private data;
    private type;
    private x;
    private y;
    private time;
    private swayOffset;
    private swayAngle;
    private sparkleTime;
    private highlightAlpha;
    private bounceOffset;
    private bounceVelocity;
    private prevGrowthStage;
    private width;
    private height;
    constructor(data: PlantData, type: PlantType, x: number, y: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private renderSeed;
    private renderSprout;
    private renderGrowing;
    private renderMature;
    private renderProgressBar;
    private renderSparkle;
    /** Render a water droplet with glow for watered indicator */
    private renderWaterDrop;
    setHighlight(): void;
    containsPoint(px: number, py: number): boolean;
    getData(): PlantData;
    updateData(data: PlantData): void;
    getType(): PlantType;
    getPosition(): {
        x: number;
        y: number;
    };
}
