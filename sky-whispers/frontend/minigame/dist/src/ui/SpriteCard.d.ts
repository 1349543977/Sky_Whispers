import { Renderer } from '../core/Renderer';
import { SpriteType } from '../types';
export interface SpriteCardOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    spriteType: SpriteType;
    discovered: boolean;
    level?: number;
    happiness?: number;
    onTap?: () => void;
}
export declare class SpriteCard {
    private x;
    private y;
    private width;
    private height;
    private spriteType;
    private discovered;
    private level;
    private happiness;
    private onTap?;
    constructor(options: SpriteCardOptions);
    update(_dt: number): void;
    render(renderer: Renderer): void;
    handleTap(x: number, y: number): boolean;
    setPosition(x: number, y: number): void;
}
