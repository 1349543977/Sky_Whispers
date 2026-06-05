import { Vector2 } from '../types';
export declare function clamp(value: number, min: number, max: number): number;
export declare function lerp(a: number, b: number, t: number): number;
export declare function lerpAngle(a: number, b: number, t: number): number;
export declare function randomRange(min: number, max: number): number;
export declare function randomInt(min: number, max: number): number;
export declare function randomPick<T>(arr: T[]): T;
export declare function distance(a: Vector2, b: Vector2): number;
export declare function distanceSq(a: Vector2, b: Vector2): number;
export declare function normalize(v: Vector2): Vector2;
export declare function dot(a: Vector2, b: Vector2): number;
export declare function degToRad(deg: number): number;
export declare function radToDeg(rad: number): number;
export declare function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
export declare function smoothStep(edge0: number, edge1: number, x: number): number;
export declare function pointInRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean;
export declare function pointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean;
export declare function rectIntersect(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean;
//# sourceMappingURL=math.d.ts.map