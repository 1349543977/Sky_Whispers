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
    /** Draw a soft shadow beneath an element */
    drawSoftShadow(cx: number, cy: number, rx: number, ry: number, blur: number, color: string, layer?: number): void;
    /** Draw a radial gradient circle (for glows, halos) */
    drawRadialGlow(cx: number, cy: number, innerRadius: number, outerRadius: number, innerColor: string, outerColor: string, layer?: number): void;
    /** Draw a gradient-filled rounded rectangle */
    fillGradientRoundRect(x: number, y: number, w: number, h: number, radius: number, colorStart: string, colorEnd: string, vertical?: boolean, layer?: number): void;
    /** Draw text with a soft shadow */
    fillTextWithShadow(text: string, x: number, y: number, color: string, shadowColor?: string, fontSize?: number, shadowBlur?: number, shadowOffsetY?: number, align?: CanvasTextAlign, baseline?: CanvasTextBaseline, layer?: number): void;
    /** Draw a star/sparkle shape */
    drawSparkle(cx: number, cy: number, size: number, color: string, alpha: number, layer?: number): void;
    /** Draw a heart shape */
    drawHeart(cx: number, cy: number, size: number, color: string, alpha: number, layer?: number): void;
    /** Draw a wavy/organic shape (for clouds, bushes) */
    drawOrganicBlob(cx: number, cy: number, rx: number, ry: number, wobble: number, color: string, alpha?: number, layer?: number): void;
    private drawRoundRectPath;
}
