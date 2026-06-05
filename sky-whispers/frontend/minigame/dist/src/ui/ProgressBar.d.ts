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
    private bgColor;
    private borderColor;
    private borderRadius;
    private showText;
    private textColor;
    private fontSize;
    constructor(options: ProgressBarOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    setValue(value: number): void;
    getValue(): number;
    setPosition(x: number, y: number): void;
    setFillColor(color: string): void;
}
//# sourceMappingURL=ProgressBar.d.ts.map