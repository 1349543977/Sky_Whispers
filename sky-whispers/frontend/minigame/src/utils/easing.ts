// ============================================================
// Easing Functions
// ============================================================

import { EasingFunction } from '../types';

export const linear: EasingFunction = (t: number) => t;

export const easeInQuad: EasingFunction = (t: number) => t * t;

export const easeOutQuad: EasingFunction = (t: number) => t * (2 - t);

export const easeInOutQuad: EasingFunction = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const easeInCubic: EasingFunction = (t: number) => t * t * t;

export const easeOutCubic: EasingFunction = (t: number) => {
  const t1 = t - 1;
  return t1 * t1 * t1 + 1;
};

export const easeInOutCubic: EasingFunction = (t: number) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export const easeInElastic: EasingFunction = (t: number) => {
  if (t === 0 || t === 1) return t;
  return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
};

export const easeOutElastic: EasingFunction = (t: number) => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
};

export const easeInOutElastic: EasingFunction = (t: number) => {
  if (t === 0 || t === 1) return t;
  const t1 = t * 2;
  if (t1 < 1) {
    return -0.5 * Math.pow(2, 10 * (t1 - 1)) * Math.sin((t1 - 1.1) * 5 * Math.PI);
  }
  return (
    0.5 * Math.pow(2, -10 * (t1 - 1)) * Math.sin((t1 - 1.1) * 5 * Math.PI) + 1
  );
};

export const easeInBounce: EasingFunction = (t: number) => 1 - easeOutBounce(1 - t);

export const easeOutBounce: EasingFunction = (t: number) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    const t1 = t - 1.5 / d1;
    return n1 * t1 * t1 + 0.75;
  } else if (t < 2.5 / d1) {
    const t1 = t - 2.25 / d1;
    return n1 * t1 * t1 + 0.9375;
  } else {
    const t1 = t - 2.625 / d1;
    return n1 * t1 * t1 + 0.984375;
  }
};

export const easeInOutBounce: EasingFunction = (t: number) =>
  t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2;

export const easeOutBack: EasingFunction = (t: number) => {
  const s = 1.70158;
  const t1 = t - 1;
  return t1 * t1 * ((s + 1) * t1 + s) + 1;
};

export const easeInBack: EasingFunction = (t: number) => {
  const s = 1.70158;
  return t * t * ((s + 1) * t - s);
};

export const easingMap: Record<string, EasingFunction> = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
  easeOutBack,
  easeInBack,
};
