import { Renderer } from '../core/Renderer';
import { TouchTarget } from '../core/Input';
export interface ButtonOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontSize?: number;
    textColor?: string;
    bgColor?: string;
    pressedBgColor?: string;
    disabledBgColor?: string;
    borderRadius?: number;
    disabled?: boolean;
    loading?: boolean;
    onTap?: () => void;
}
export declare class Button {
    private x;
    private y;
    private width;
    private height;
    private text;
    private fontSize;
    private textColor;
    private bgColor;
    private pressedBgColor;
    private disabledBgColor;
    private borderRadius;
    private disabled;
    private loading;
    private pressed;
    private onTap?;
    private scale;
    private targetScale;
    constructor(options: ButtonOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private renderSpinner;
    handleTouchStart(x: number, y: number): boolean;
    handleTouchEnd(x: number, y: number): boolean;
    handleTouchMove(x: number, y: number): void;
    getTouchTarget(): TouchTarget;
    setLoading(loading: boolean): void;
    setDisabled(disabled: boolean): void;
    setText(text: string): void;
    setPosition(x: number, y: number): void;
    containsPoint(px: number, py: number): boolean;
}
//# sourceMappingURL=Button.d.ts.map