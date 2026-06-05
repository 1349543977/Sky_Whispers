// ============================================================
// Renderer - Canvas 2D rendering with layered support
// ============================================================

import { GAME, LAYERS } from '../utils/constants';

export interface RenderCommand {
  layer: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export class Renderer {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private screenWidth: number = 0;
  private screenHeight: number = 0;
  private dpr: number = 1;
  private commands: RenderCommand[] = [];

  constructor() {
    this.canvas = wx.createCanvas();
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.dpr = wx.getSystemInfoSync().pixelRatio;
    this.updateScreenSize();
  }

  private updateScreenSize(): void {
    const info = wx.getSystemInfoSync();
    this.screenWidth = info.windowWidth;
    this.screenHeight = info.windowHeight;
    this.canvas.width = this.screenWidth * this.dpr;
    this.canvas.height = this.screenHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  get width(): number {
    return this.screenWidth;
  }

  get height(): number {
    return this.screenHeight;
  }

  get pixelRatio(): number {
    return this.dpr;
  }

  get context(): CanvasRenderingContext2D {
    return this.ctx;
  }

  get mainCanvas(): Canvas {
    return this.canvas;
  }

  addCommand(command: RenderCommand): void {
    this.commands.push(command);
  }

  clear(): void {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);
  }

  render(): void {
    this.clear();

    // Sort commands by layer (ascending)
    this.commands.sort((a, b) => a.layer - b.layer);

    for (const cmd of this.commands) {
      this.ctx.save();
      cmd.draw(this.ctx);
      this.ctx.restore();
    }

    this.commands = [];
  }

  // Convenience drawing methods

  fillRect(
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    layer: number = LAYERS.UI,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
      },
    });
  }

  strokeRect(
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    lineWidth: number = 1,
    layer: number = LAYERS.UI,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x, y, w, h);
      },
    });
  }

  fillRoundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
    color: string,
    layer: number = LAYERS.UI,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.fillStyle = color;
        this.drawRoundRectPath(ctx, x, y, w, h, radius);
        ctx.fill();
      },
    });
  }

  strokeRoundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
    color: string,
    lineWidth: number = 1,
    layer: number = LAYERS.UI,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        this.drawRoundRectPath(ctx, x, y, w, h, radius);
        ctx.stroke();
      },
    });
  }

  fillText(
    text: string,
    x: number,
    y: number,
    color: string,
    fontSize: number = 14,
    align: CanvasTextAlign = 'left',
    baseline: CanvasTextBaseline = 'top',
    layer: number = LAYERS.UI,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif`;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
      },
    });
  }

  // Alias for fillText - commonly used name in game code
  drawText(
    text: string,
    x: number,
    y: number,
    color: string,
    fontSize: number = 14,
    align: CanvasTextAlign = 'left',
    baseline: CanvasTextBaseline = 'top',
    layer: number = LAYERS.UI,
  ): void {
    this.fillText(text, x, y, color, fontSize, align, baseline, layer);
  }

  drawCircle(
    cx: number,
    cy: number,
    radius: number,
    color: string,
    fill: boolean = true,
    layer: number = LAYERS.UI,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        if (fill) {
          ctx.fillStyle = color;
          ctx.fill();
        } else {
          ctx.strokeStyle = color;
          ctx.stroke();
        }
      },
    });
  }

  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    lineWidth: number = 1,
    layer: number = LAYERS.UI,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      },
    });
  }

  drawImage(
    image: Canvas | ImageBitmap,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    layer: number = LAYERS.ENTITIES,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
      },
    });
  }

  drawGradientRect(
    x: number,
    y: number,
    w: number,
    h: number,
    colorStart: string,
    colorEnd: string,
    vertical: boolean = true,
    layer: number = LAYERS.BACKGROUND,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        const gradient = vertical
          ? ctx.createLinearGradient(x, y, x, y + h)
          : ctx.createLinearGradient(x, y, x + w, y);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);
      },
    });
  }

  setAlpha(alpha: number, layer: number, drawFn: (ctx: CanvasRenderingContext2D) => void): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.globalAlpha = alpha;
        drawFn(ctx);
        ctx.globalAlpha = 1;
      },
    });
  }

  /** Draw a soft shadow beneath an element */
  drawSoftShadow(
    cx: number, cy: number, rx: number, ry: number,
    blur: number, color: string, layer: number = LAYERS.ENTITIES,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.save();
        ctx.filter = `blur(${blur}px)`;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
    });
  }

  /** Draw a radial gradient circle (for glows, halos) */
  drawRadialGlow(
    cx: number, cy: number, innerRadius: number, outerRadius: number,
    innerColor: string, outerColor: string, layer: number = LAYERS.EFFECTS,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        const gradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, outerColor);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
        ctx.fill();
      },
    });
  }

  /** Draw a gradient-filled rounded rectangle */
  fillGradientRoundRect(
    x: number, y: number, w: number, h: number, radius: number,
    colorStart: string, colorEnd: string, vertical: boolean = true,
    layer: number = LAYERS.UI,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        const gradient = vertical
          ? ctx.createLinearGradient(x, y, x, y + h)
          : ctx.createLinearGradient(x, y, x + w, y);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        ctx.fillStyle = gradient;
        this.drawRoundRectPath(ctx, x, y, w, h, radius);
        ctx.fill();
      },
    });
  }

  /** Draw text with a soft shadow */
  fillTextWithShadow(
    text: string, x: number, y: number,
    color: string, shadowColor: string = 'rgba(26, 39, 56, 0.15)',
    fontSize: number = 14, shadowBlur: number = 4, shadowOffsetY: number = 2,
    align: CanvasTextAlign = 'left', baseline: CanvasTextBaseline = 'top',
    layer: number = LAYERS.UI,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.save();
        ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif`;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetY = shadowOffsetY;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
      },
    });
  }

  /** Draw a star/sparkle shape */
  drawSparkle(
    cx: number, cy: number, size: number, color: string, alpha: number,
    layer: number = LAYERS.EFFECTS,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        const spikes = 4;
        const outerRadius = size;
        const innerRadius = size * 0.4;
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / spikes - Math.PI / 2;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      },
    });
  }

  /** Draw a heart shape */
  drawHeart(
    cx: number, cy: number, size: number, color: string, alpha: number,
    layer: number = LAYERS.EFFECTS,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx, cy + size * 0.3);
        ctx.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy + size * 0.3);
        ctx.bezierCurveTo(cx - size, cy + size * 0.7, cx, cy + size, cx, cy + size * 1.2);
        ctx.bezierCurveTo(cx, cy + size, cx + size, cy + size * 0.7, cx + size, cy + size * 0.3);
        ctx.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size * 0.3);
        ctx.fill();
        ctx.restore();
      },
    });
  }

  /** Draw a wavy/organic shape (for clouds, bushes) */
  drawOrganicBlob(
    cx: number, cy: number, rx: number, ry: number,
    wobble: number, color: string, alpha: number = 1,
    layer: number = LAYERS.ENTITIES,
  ): void {
    this.addCommand({
      layer,
      draw: (ctx) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wobbleOffset = Math.sin(angle * 3) * wobble;
          const px = cx + Math.cos(angle) * (rx + wobbleOffset);
          const py = cy + Math.sin(angle) * (ry + wobbleOffset);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      },
    });
  }

  private drawRoundRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
  ): void {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}
