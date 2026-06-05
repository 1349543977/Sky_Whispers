import { Renderer } from '../core/Renderer';
import { Friendship } from '../types';
import { Button } from './Button';
export interface FriendItemOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    friendship: Friendship;
    onVisit?: (friendId: string) => void;
    onGift?: (friendId: string) => void;
}
export declare class FriendItem {
    private x;
    private y;
    private width;
    private height;
    private friendship;
    private visitButton;
    private giftButton;
    constructor(options: FriendItemOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    setPosition(x: number, y: number): void;
    getButtons(): Button[];
}
//# sourceMappingURL=FriendItem.d.ts.map