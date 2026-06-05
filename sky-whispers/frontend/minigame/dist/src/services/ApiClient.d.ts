import { ApiResponse, PaginatedResponse, User, Island, Plant, PlantType, WeatherSprite, SpriteType, Friendship, Gift, ShopItem, UserInventory, SeasonPass, SeasonPassProgress, StepRecord, WeatherData, GiftType } from '../types';
import { StorageService } from './StorageService';
export declare class ApiClient {
    private baseUrl;
    private storageService;
    private retryCount;
    private retryDelay;
    constructor(baseUrl: string, storageService: StorageService);
    private request;
    private wxRequest;
    private buildUrl;
    private delay;
    login(code: string): Promise<ApiResponse<{
        token: string;
        user: User;
    }>>;
    getUser(): Promise<ApiResponse<User>>;
    updateUser(data: Partial<User>): Promise<ApiResponse<User>>;
    getIsland(): Promise<ApiResponse<Island>>;
    updateIsland(data: Partial<Island>): Promise<ApiResponse<Island>>;
    visitIsland(friendId: string): Promise<ApiResponse<{
        island: Island;
        owner: User;
    }>>;
    getPlants(params?: {
        island_id?: string;
    }): Promise<ApiResponse<Plant[]>>;
    plantSeed(data: {
        plant_type_id: string;
        slot_index: number;
    }): Promise<ApiResponse<Plant>>;
    waterPlant(plantId: string): Promise<ApiResponse<Plant>>;
    harvestPlant(plantId: string): Promise<ApiResponse<{
        plant: Plant;
        coins_earned: number;
    }>>;
    getPlantTypes(params?: {
        page?: number;
        page_size?: number;
    }): Promise<ApiResponse<PaginatedResponse<PlantType>>>;
    getSprites(): Promise<ApiResponse<WeatherSprite[]>>;
    catchSprite(data: {
        sprite_type_id: string;
    }): Promise<ApiResponse<WeatherSprite>>;
    feedSprite(spriteId: string): Promise<ApiResponse<WeatherSprite>>;
    getSpriteTypes(params?: {
        page?: number;
        page_size?: number;
    }): Promise<ApiResponse<PaginatedResponse<SpriteType>>>;
    getWeather(params?: {
        latitude?: number;
        longitude?: number;
    }): Promise<ApiResponse<WeatherData>>;
    getFriends(params?: {
        page?: number;
        page_size?: number;
    }): Promise<ApiResponse<PaginatedResponse<Friendship>>>;
    sendGift(data: {
        receiver_id: string;
        gift_type: GiftType;
        message: string;
    }): Promise<ApiResponse<Gift>>;
    getGifts(params?: {
        status?: string;
    }): Promise<ApiResponse<PaginatedResponse<Gift>>>;
    claimGift(giftId: string): Promise<ApiResponse<Gift>>;
    getShopItems(params?: {
        item_type?: string;
        page?: number;
        page_size?: number;
    }): Promise<ApiResponse<PaginatedResponse<ShopItem>>>;
    purchaseItem(data: {
        item_id: string;
        quantity: number;
    }): Promise<ApiResponse<UserInventory>>;
    getInventory(params?: {
        page?: number;
        page_size?: number;
    }): Promise<ApiResponse<PaginatedResponse<UserInventory>>>;
    getSeasonPass(): Promise<ApiResponse<SeasonPass>>;
    getSeasonPassProgress(): Promise<ApiResponse<SeasonPassProgress>>;
    claimSeasonPassReward(data: {
        level: number;
        is_premium: boolean;
    }): Promise<ApiResponse<UserInventory>>;
    syncSteps(data: {
        encrypted_data: string;
        iv: string;
    }): Promise<ApiResponse<StepRecord>>;
    reportAdWatch(data: {
        ad_type: string;
        reward_type: string;
    }): Promise<ApiResponse<{
        reward_amount: number;
    }>>;
}
