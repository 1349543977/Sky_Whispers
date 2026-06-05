import { Renderer } from '../core/Renderer';
export interface ProgressBarOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    min?: number;
    max?: number;
    value: number;
    fillColor?: string;
    fillGradientEnd?: string;
    bgColor?: string;
    borderColor?: string;
    borderRadius?: number;
    showText?: boolean;
    textColor?: string;
    fontSize?: number;
}
export declare class ProgressBar {
    private x;
    private y;
    private width;
    private height;
    private min;
    private max;
    private value;
    private displayValue;
    private fillColor;
    private fillGradientEnd;
    private bgColor;
    private borderColor;
    private borderRadius;
    private showText;
    private textColor;
    private fontSize;
    private shimmerOffset;
    private glowPulse;
    constructor(options: ProgressBarOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private renderShimmer;
    private renderLeadingGlow;
    setValue(value: number): void;
    getValue(): number;
    setPosition(x: number, y: number): void;
    setFillColor(color: string): void;
}
