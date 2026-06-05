import { Renderer } from '../core/Renderer';
import { Button } from './Button';
export interface PanelOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    titleColor?: string;
    bgColor?: string;
    borderRadius?: number;
    showClose?: boolean;
    onClose?: () => void;
}
export declare class Panel {
    private x;
    private y;
    private width;
    private height;
    private title;
    private titleColor;
    private bgColor;
    private borderRadius;
    private showClose;
    private onClose?;
    private visible;
    private slideProgress;
    private slideStartTime;
    private isShowing;
    private closeButton;
    constructor(options: PanelOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    show(): void;
    hide(): void;
    isVisible(): boolean;
    getCloseButton(): Button | null;
    getContentArea(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
