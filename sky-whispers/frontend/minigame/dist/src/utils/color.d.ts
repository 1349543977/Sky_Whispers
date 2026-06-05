import { Color } from '../types';
export declare function hexToRgb(hex: string): Color;
export declare function rgbToHex(r: number, g: number, b: number): string;
export declare function colorToString(color: Color): string;
export declare function lerpColor(a: Color, b: Color, t: number): Color;
export declare function withAlpha(color: Color, alpha: number): Color;
export declare function lighten(color: Color, amount: number): Color;
export declare function darken(color: Color, amount: number): Color;
export declare function hexWithAlpha(hex: string, alpha: number): string;
export declare const DesignTokens: {
    readonly colors: {
        readonly primary: "#4A90D9";
        readonly primaryLight: "#6BA8E8";
        readonly primaryDark: "#3570B0";
        readonly secondary: "#7ED6A8";
        readonly secondaryLight: "#A0E6C4";
        readonly secondaryDark: "#5BB888";
        readonly accent: "#F5A623";
        readonly accentLight: "#F7BC5C";
        readonly accentDark: "#D48B1A";
        readonly danger: "#E74C3C";
        readonly dangerLight: "#F1948A";
        readonly dangerDark: "#C0392B";
        readonly success: "#2ECC71";
        readonly warning: "#F39C12";
        readonly background: "#F0F4F8";
        readonly backgroundDark: "#1A1F2E";
        readonly surface: "#FFFFFF";
        readonly surfaceDark: "#2D3348";
        readonly text: "#2C3E50";
        readonly textLight: "#95A5A6";
        readonly textDark: "#ECF0F1";
        readonly textSecondary: "#7F8C8D";
        readonly border: "#E0E6ED";
        readonly borderDark: "#3D4560";
        readonly coin: "#F5A623";
        readonly coinDark: "#D48B1A";
    };
    readonly spacing: {
        readonly xs: 4;
        readonly sm: 8;
        readonly md: 12;
        readonly lg: 16;
        readonly xl: 24;
        readonly xxl: 32;
    };
    readonly borderRadius: {
        readonly sm: 4;
        readonly md: 8;
        readonly lg: 12;
        readonly xl: 16;
        readonly round: 999;
    };
    readonly fontSize: {
        readonly xs: 10;
        readonly sm: 12;
        readonly md: 14;
        readonly lg: 16;
        readonly xl: 20;
        readonly xxl: 28;
        readonly title: 36;
    };
    readonly animation: {
        readonly fast: 150;
        readonly normal: 300;
        readonly slow: 500;
    };
};
//# sourceMappingURL=color.d.ts.map