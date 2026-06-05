import { Renderer } from '../core/Renderer';
import { PlantType } from '../types';
export interface PlantCardOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    plantType: PlantType;
    discovered: boolean;
    growthProgress?: number;
    onTap?: () => void;
}
export declare class PlantCard {
    private x;
    private y;
    private width;
    private height;
    private plantType;
    private discovered;
    private growthProgress;
    private onTap?;
    private progressBar;
    constructor(options: PlantCardOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    handleTap(x: number, y: number): boolean;
    setGrowthProgress(progress: number): void;
    setPosition(x: number, y: number): void;
}
//# sourceMappingURL=PlantCard.d.ts.map