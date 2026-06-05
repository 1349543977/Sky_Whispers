export interface RenderCommand {
    layer: number;
    draw: (ctx: CanvasRenderingContext2D) => void;
}
export declare class Renderer {
    private canvas;
    private ctx;
    private screenWidth;
    private screenHeight;
    private dpr;
    private commands;
    constructor();
    private updateScreenSize;
    get width(): number;
    get height(): number;
    get pixelRatio(): number;
    get context(): CanvasRenderingContext2D;
    get mainCanvas(): Canvas;
    addCommand(command: RenderCommand): void;
    clear(): void;
    render(): void;
    fillRect(x: number, y: number, w: number, h: number, color: string, layer?: number): void;
    strokeRect(x: number, y: number, w: number, h: number, color: string, lineWidth?: number, layer?: number): void;
    fillRoundRect(x: number, y: number, w: number, h: number, radius: number, color: string, layer?: number): void;
    strokeRoundRect(x: number, y: number, w: number, h: number, radius: number, color: string, lineWidth?: number, layer?: number): void;
    fillText(text: string, x: number, y: number, color: string, fontSize?: number, align?: CanvasTextAlign, baseline?: CanvasTextBaseline, layer?: number): void;
    drawText(text: string, x: number, y: number, color: string, fontSize?: number, align?: CanvasTextAlign, baseline?: CanvasTextBaseline, layer?: number): void;
    drawCircle(cx: number, cy: number, radius: number, color: string, fill?: boolean, layer?: number): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, color: string, lineWidth?: number, layer?: number): void;
    drawImage(image: Canvas | ImageBitmap, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number, layer?: number): void;
    drawGradientRect(x: number, y: number, w: number, h: number, colorStart: string, colorEnd: string, vertical?: boolean, layer?: number): void;
    setAlpha(alpha: number, layer: number, drawFn: (ctx: CanvasRenderingContext2D) => void): void;
    private drawRoundRectPath;
}
//# sourceMappingURL=Renderer.d.ts.map