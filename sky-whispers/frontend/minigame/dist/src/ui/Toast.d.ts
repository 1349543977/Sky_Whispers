import { Renderer } from '../core/Renderer';
export type ToastType = 'success' | 'warning' | 'error' | 'info';
export interface ToastOptions {
    text: string;
    icon?: string;
    type?: ToastType;
    duration?: number;
    bgColor?: string;
    textColor?: string;
    fontSize?: number;
}
export declare class Toast {
    private text;
    private icon;
    private type;
    private duration;
    private bgColor;
    private gradientEnd;
    private textColor;
    private fontSize;
    private visible;
    private elapsed;
    private slideProgress;
    private screenWidth;
    constructor(options: ToastOptions, screenWidth: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    show(): void;
    hide(): void;
    isVisible(): boolean;
}
export declare class ToastManager {
    private toasts;
    private screenWidth;
    constructor(screenWidth: number);
    show(options: ToastOptions): void;
    update(dt: number): void;
    render(renderer: Renderer): void;
}
