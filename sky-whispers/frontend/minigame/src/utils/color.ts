// ============================================================
// Color Utilities
// ============================================================

import { Color } from '../types';

export function hexToRgb(hex: string): Color {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: result[4] ? parseInt(result[4], 16) / 255 : 1,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(c)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function colorToString(color: Color): string {
  return `rgba(${Math.round(color.r)},${Math.round(color.g)},${Math.round(color.b)},${color.a})`;
}

export function lerpColor(a: Color, b: Color, t: number): Color {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t,
  };
}

export function withAlpha(color: Color, alpha: number): Color {
  return { ...color, a: Math.max(0, Math.min(1, alpha)) };
}

export function lighten(color: Color, amount: number): Color {
  return {
    r: color.r + (255 - color.r) * amount,
    g: color.g + (255 - color.g) * amount,
    b: color.b + (255 - color.b) * amount,
    a: color.a,
  };
}

export function darken(color: Color, amount: number): Color {
  return {
    r: color.r * (1 - amount),
    g: color.g * (1 - amount),
    b: color.b * (1 - amount),
    a: color.a,
  };
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const c = hexToRgb(hex);
  return colorToString(withAlpha(c, alpha));
}

// Design tokens for consistent theming
export const DesignTokens = {
  colors: {
    // === Primary Palette: Dawn Sky ===
    primary: '#7EB5D6',           // Soft sky blue
    primaryLight: '#A8D4EC',      // Morning mist blue
    primaryDark: '#5A94B8',       // Twilight blue
    primarySubtle: '#D6EAF5',     // Barely-there blue

    // === Secondary Palette: Meadow ===
    secondary: '#8CC6A5',         // Soft sage green
    secondaryLight: '#B0DCC2',    // Mint foam
    secondaryDark: '#6BA886',     // Forest whisper
    secondarySubtle: '#D5EDE1',   // Barely-there green

    // === Accent Palette: Warm Light ===
    accent: '#F2C57C',           // Golden hour
    accentLight: '#F7DBA0',      // Sunbeam
    accentDark: '#E5A84D',       // Amber glow
    accentSubtle: '#FBECD0',     // Barely-there gold

    // === Tertiary: Blossom ===
    tertiary: '#D4A0C0',         // Soft pink blossom
    tertiaryLight: '#E6C0D6',    // Petal pink
    tertiaryDark: '#B87FA0',     // Rose dust
    tertiarySubtle: '#F0DCE8',   // Barely-there pink

    // === Semantic Colors ===
    success: '#7ECBA1',
    successLight: '#A8DCC0',
    warning: '#F2C57C',
    warningLight: '#F7DBA0',
    danger: '#E09191',
    dangerLight: '#EDB5B5',
    info: '#7EB5D6',
    infoLight: '#A8D4EC',

    // === Neutral Palette: Cloud ===
    neutral50: '#FAFBFD',
    neutral100: '#F0F3F7',
    neutral200: '#E1E6EE',
    neutral300: '#C8D0DC',
    neutral400: '#A3AEBF',
    neutral500: '#7B8AA0',
    neutral600: '#5A6A80',
    neutral700: '#3D4F65',
    neutral800: '#2A3A4E',
    neutral900: '#1A2738',

    // === Surface ===
    surface: '#FFFFFF',
    surfaceWarm: '#FFFCF8',
    surfaceElevated: '#FFFFFF',
    surfaceOverlay: 'rgba(26, 39, 56, 0.5)',

    // === Text ===
    textPrimary: '#2A3A4E',
    textSecondary: '#5A6A80',
    textTertiary: '#A3AEBF',
    textInverse: '#FAFBFD',
    textLink: '#5A94B8',

    // === Game-specific ===
    coin: '#F2C57C',
    coinShine: '#F7DBA0',
    windPower: '#7EB5D6',
    rainDrop: '#A8D4EC',
    snowFlake: '#E8EDF2',
    thunder: '#F7DBA0',
    fog: '#C8D0DC',

    // === Rarity ===
    rarityCommon: '#A3AEBF',
    rarityUncommon: '#8CC6A5',
    rarityRare: '#7EB5D6',
    rarityEpic: '#D4A0C0',
    rarityLegendary: '#F2C57C',

    // === Weather Sky Gradients ===
    skySunnyTop: '#87CEEB',
    skySunnyBottom: '#E0F7FA',
    skyCloudyTop: '#90A4AE',
    skyCloudyBottom: '#CFD8DC',
    skyRainyTop: '#78909C',
    skyRainyBottom: '#B0BEC5',
    skySnowyTop: '#B0BEC5',
    skySnowyBottom: '#ECEFF1',
    skyThunderTop: '#546E7A',
    skyThunderBottom: '#78909C',
    skyFoggyTop: '#90A4AE',
    skyFoggyBottom: '#CFD8DC',
    skyNightTop: '#1A2738',
    skyNightBottom: '#2A3A4E',
  },

  spacing: {
    micro: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  borderRadius: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    xxl: 28,
    round: 999,
  },

  fontSize: {
    micro: 8,
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    title: 36,
    hero: 48,
  },

  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Shadow system
  shadow: {
    sm: { color: 'rgba(26, 39, 56, 0.06)', blur: 4, offsetX: 0, offsetY: 2 },
    md: { color: 'rgba(26, 39, 56, 0.1)', blur: 8, offsetX: 0, offsetY: 4 },
    lg: { color: 'rgba(26, 39, 56, 0.14)', blur: 16, offsetX: 0, offsetY: 8 },
    xl: { color: 'rgba(26, 39, 56, 0.18)', blur: 24, offsetX: 0, offsetY: 12 },
    glow: { color: 'rgba(126, 181, 214, 0.3)', blur: 12, offsetX: 0, offsetY: 0 },
    coinGlow: { color: 'rgba(242, 197, 124, 0.4)', blur: 12, offsetX: 0, offsetY: 0 },
  },

  animation: {
    instant: 80,
    fast: 150,
    normal: 250,
    slow: 400,
    gentle: 600,
    dreamy: 1000,
  },

  // Typography scale
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Noto Sans SC", sans-serif',
    rounded: 'ui-rounded, "Hiragino Maru Gothic ProN", "PingFang SC", sans-serif',
  },
} as const;
