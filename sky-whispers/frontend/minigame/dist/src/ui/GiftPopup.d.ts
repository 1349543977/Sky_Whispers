import { Renderer } from '../core/Renderer';
import { GiftType, Friendship } from '../types';
import { Button } from './Button';
export interface GiftPopupOptions {
    screenWidth: number;
    screenHeight: number;
    friends: Friendship[];
    onSend?: (friendId: string, giftType: GiftType, message: string) => void;
    onClose?: () => void;
}
export declare class GiftPopup {
    private screenWidth;
    private screenHeight;
    private friends;
    private onSend?;
    private onClose?;
    private visible;
    private fadeProgress;
    private animStartTime;
    private selectedGiftType;
    private selectedFriendIndex;
    private message;
    private sendButton;
    private closeButton;
    private giftTypeButtons;
    private popupWidth;
    private popupHeight;
    private giftShakePhase;
    private giftOpened;
    private sparkles;
    constructor(options: GiftPopupOptions);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private renderGiftBox;
    private triggerGiftShake;
    private spawnSparkles;
    private send;
    show(): void;
    hide(): void;
    isVisible(): boolean;
    setFriends(friends: Friendship[]): void;
    getAllButtons(): Button[];
}
