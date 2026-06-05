import { Renderer } from '../core/Renderer';
import { Button } from './Button';
export interface DialogOptions {
    title: string;
    content: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}
export declare class Dialog {
    private title;
    private content;
    private confirmText;
    private cancelText;
    private onConfirm?;
    private onCancel?;
    private visible;
    private fadeProgress;
    private animStartTime;
    private confirmButton;
    private cancelButton;
    private dialogWidth;
    private dialogHeight;
    constructor(options: DialogOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    show(): void;
    hide(): void;
    private confirm;
    private cancel;
    isVisible(): boolean;
    getButtons(): Button[];
}
