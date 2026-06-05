import { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { Input } from '../core/Input';
export declare class ShopScene extends Scene {
    private apiClient;
    private storageService;
    private items;
    private currentCategory;
    private loading;
    private categoryButtons;
    private scrollView;
    private skeleton;
    private toastManager;
    private backButton;
    private coinDisplay;
    constructor(renderer: Renderer, input: Input);
    onLoad(): Promise<void>;
    private loadShopItems;
    private switchCategory;
    private purchaseItem;
    private navigateBack;
    update(dt: number): void;
    fixedUpdate(_dt: number): void;
    render(): void;
    private renderShopItem;
    onUnload(): void;
}
