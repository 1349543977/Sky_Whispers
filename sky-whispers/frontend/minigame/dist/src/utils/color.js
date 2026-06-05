"use strict";
// ============================================================
// Color Utilities
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignTokens = void 0;
exports.hexToRgb = hexToRgb;
exports.rgbToHex = rgbToHex;
exports.colorToString = colorToString;
exports.lerpColor = lerpColor;
exports.withAlpha = withAlpha;
exports.lighten = lighten;
exports.darken = darken;
exports.hexWithAlpha = hexWithAlpha;
function hexToRgb(hex) {
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
function rgbToHex(r, g, b) {
    const toHex = (c) => {
        const clamped = Math.max(0, Math.min(255, Math.round(c)));
        return clamped.toString(16).padStart(2, '0');
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function colorToString(color) {
    return `rgba(${Math.round(color.r)},${Math.round(color.g)},${Math.round(color.b)},${color.a})`;
}
function lerpColor(a, b, t) {
    return {
        r: a.r + (b.r - a.r) * t,
        g: a.g + (b.g - a.g) * t,
        b: a.b + (b.b - a.b) * t,
        a: a.a + (b.a - a.a) * t,
    };
}
function withAlpha(color, alpha) {
    return Object.assign(Object.assign({}, color), { a: Math.max(0, Math.min(1, alpha)) });
}
function lighten(color, amount) {
    return {
        r: color.r + (255 - color.r) * amount,
        g: color.g + (255 - color.g) * amount,
        b: color.b + (255 - color.b) * amount,
        a: color.a,
    };
}
function darken(color, amount) {
    return {
        r: color.r * (1 - amount),
        g: color.g * (1 - amount),
        b: color.b * (1 - amount),
        a: color.a,
    };
}
function hexWithAlpha(hex, alpha) {
    const c = hexToRgb(hex);
    return colorToString(withAlpha(c, alpha));
}
// Design tokens for consistent theming
exports.DesignTokens = {
    colors: {
        primary: '#4A90D9',
        primaryLight: '#6BA8E8',
        primaryDark: '#3570B0',
        secondary: '#7ED6A8',
        secondaryLight: '#A0E6C4',
        secondaryDark: '#5BB888',
        accent: '#F5A623',
        accentLight: '#F7BC5C',
        accentDark: '#D48B1A',
        danger: '#E74C3C',
        dangerLight: '#F1948A',
        dangerDark: '#C0392B',
        success: '#2ECC71',
        warning: '#F39C12',
        background: '#F0F4F8',
        backgroundDark: '#1A1F2E',
        surface: '#FFFFFF',
        surfaceDark: '#2D3348',
        text: '#2C3E50',
        textLight: '#95A5A6',
        textDark: '#ECF0F1',
        textSecondary: '#7F8C8D',
        border: '#E0E6ED',
        borderDark: '#3D4560',
        coin: '#F5A623',
        coinDark: '#D48B1A',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        round: 999,
    },
    fontSize: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 20,
        xxl: 28,
        title: 36,
    },
    animation: {
        fast: 150,
        normal: 300,
        slow: 500,
    },
};
//# sourceMappingURL=color.js.map