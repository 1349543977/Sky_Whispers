import { Renderer } from '../core/Renderer';
import { TabConfig } from '../types';
export declare class TabBar {
    private tabs;
    private activeTabId;
    private x;
    private y;
    private width;
    private height;
    private onTabChange?;
    constructor(tabs: TabConfig[], screenWidth: number, screenHeight: number, onTabChange?: (tabId: string) => void);
    update(_dt: number): void;
    render(renderer: Renderer): void;
    handleTap(x: number, y: number): boolean;
    setActiveTab(tabId: string): void;
    getActiveTab(): string;
    setBadge(tabId: string, count: number): void;
    getHeight(): number;
    getPosition(): {
        x: number;
        y: number;
    };
}
//# sourceMappingURL=TabBar.d.ts.map