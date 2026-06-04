// ============================================================
// WeChat Mini Game Type Declarations
// Supplements minigame-api-typings with Canvas and rendering types
// ============================================================

interface Canvas {
  width: number;
  height: number;
  getContext(contextId: '2d'): CanvasRenderingContext2D;
}

interface CanvasRenderingContext2D {
  canvas: Canvas;
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
  font: string;
  textAlign: string;
  textBaseline: string;
  globalAlpha: number;
  globalCompositeOperation: string;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;

  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): TextMetrics;
  fill(): void;
  stroke(): void;
  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  rect(x: number, y: number, w: number, h: number): void;
  clip(fillRule?: string): void;
  drawImage(image: Canvas | ImageBitmap, dx: number, dy: number): void;
  drawImage(image: Canvas | ImageBitmap, dx: number, dy: number, dw: number, dh: number): void;
  drawImage(image: Canvas | ImageBitmap, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
  createPattern(image: Canvas, repetition: string): CanvasPattern | null;
  save(): void;
  restore(): void;
  scale(x: number, y: number): void;
  rotate(angle: number): void;
  translate(x: number, y: number): void;
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  resetTransform(): void;
  set font(value: string);
  get font(): string;
}

interface CanvasGradient {
  addColorStop(offset: number, color: string): void;
}

interface CanvasPattern {}

interface TextMetrics {
  width: number;
}

interface ImageBitmap {
  width: number;
  height: number;
}

type CanvasTextAlign = 'left' | 'right' | 'center' | 'start' | 'end';
type CanvasTextBaseline = 'top' | 'bottom' | 'middle' | 'alphabetic' | 'hanging' | 'ideographic';

// WeChat Mini Game specific globals
declare function wx_createCanvas(): Canvas;
