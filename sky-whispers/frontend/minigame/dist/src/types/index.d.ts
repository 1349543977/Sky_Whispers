export declare enum WeatherType {
    Sunny = "sunny",
    Cloudy = "cloudy",
    Rainy = "rainy",
    Snowy = "snowy",
    Thunderstorm = "thunderstorm",
    Foggy = "foggy",
    Windy = "windy"
}
export declare enum PlantGrowthStage {
    Seed = 0,
    Sprout = 1,
    Growing = 2,
    Mature = 3
}
export declare enum Rarity {
    Common = "common",
    Rare = "rare",
    Epic = "epic",
    Legendary = "legendary"
}
export declare enum ItemType {
    Skin = "skin",
    Effect = "effect",
    Prop = "prop",
    Pass = "pass"
}
export declare enum GiftType {
    RainCloud = "rain_cloud",
    Breeze = "breeze",
    Sunlight = "sunlight",
    Snowflake = "snowflake"
}
export declare enum FriendshipStatus {
    Pending = "pending",
    Accepted = "accepted",
    Blocked = "blocked"
}
export declare enum SceneName {
    Boot = "boot",
    Main = "main",
    Social = "social",
    Shop = "shop",
    Codex = "codex",
    Settings = "settings"
}
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
}
export interface User {
    id: string;
    openid: string;
    nickname: string;
    avatar_url: string;
    coins: number;
    level: number;
    experience: number;
    current_island_id: string;
    created_at: string;
    updated_at: string;
}
export interface Island {
    id: string;
    user_id: string;
    name: string;
    skin_id: string;
    level: number;
    expansion_slots: number;
    windmill_level: number;
    plant_slots: PlantSlot[];
    created_at: string;
    updated_at: string;
}
export interface PlantSlot {
    slot_index: number;
    plant_id: string | null;
    is_unlocked: boolean;
}
export interface IslandSkin {
    id: string;
    name: string;
    description: string;
    rarity: Rarity;
    base_color: string;
    accent_color: string;
    grass_color: string;
    price: number;
    currency: 'coins' | 'rmb';
}
export interface Plant {
    id: string;
    island_id: string;
    plant_type_id: string;
    slot_index: number;
    growth_stage: PlantGrowthStage;
    growth_progress: number;
    planted_at: string;
    last_watered_at: string | null;
    is_watered: boolean;
    times_harvested: number;
}
export interface PlantType {
    id: string;
    name: string;
    description: string;
    rarity: Rarity;
    growth_duration_hours: number;
    water_requirement: number;
    preferred_weather: WeatherType[];
    coin_yield: number;
    sprite_attract_chance: number;
    seed_price: number;
    stages: PlantStageVisual[];
}
export interface PlantStageVisual {
    stage: PlantGrowthStage;
    width: number;
    height: number;
    color_primary: string;
    color_secondary: string;
    shape_type: string;
}
export interface WeatherSprite {
    id: string;
    owner_id: string;
    sprite_type_id: string;
    nickname: string;
    level: number;
    happiness: number;
    caught_at: string;
    last_fed_at: string | null;
}
export interface SpriteType {
    id: string;
    name: string;
    description: string;
    rarity: Rarity;
    weather_condition: WeatherType;
    catch_rate: number;
    max_level: number;
    happiness_decay_rate: number;
    color_primary: string;
    color_secondary: string;
    shape_type: string;
}
export interface Friendship {
    id: string;
    user_id: string;
    friend_id: string;
    friend_info: User;
    status: FriendshipStatus;
    created_at: string;
}
export interface Gift {
    id: string;
    sender_id: string;
    sender_info: User;
    receiver_id: string;
    gift_type: GiftType;
    message: string;
    is_claimed: boolean;
    claimed_at: string | null;
    created_at: string;
    expires_at: string;
}
export interface ShopItem {
    id: string;
    name: string;
    description: string;
    item_type: ItemType;
    rarity: Rarity;
    price: number;
    currency: 'coins' | 'rmb';
    icon_key: string;
    is_available: boolean;
    stock: number | null;
    metadata: Record<string, unknown>;
}
export interface UserInventory {
    id: string;
    user_id: string;
    item_id: string;
    item_info: ShopItem;
    quantity: number;
    acquired_at: string;
}
export interface SeasonPass {
    id: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    price_rmb: number;
    free_rewards: PassReward[];
    premium_rewards: PassReward[];
}
export interface PassReward {
    level: number;
    item_id: string;
    item_info: ShopItem;
    quantity: number;
}
export interface SeasonPassProgress {
    user_id: string;
    pass_id: string;
    is_premium: boolean;
    current_level: number;
    experience: number;
    claimed_free_levels: number[];
    claimed_premium_levels: number[];
}
export interface AdInteraction {
    id: string;
    user_id: string;
    ad_type: 'rewarded_video' | 'interstitial' | 'banner';
    reward_type: 'coins' | 'water' | 'speed_up';
    reward_amount: number;
    watched_at: string;
}
export interface StepRecord {
    id: string;
    user_id: string;
    date: string;
    steps: number;
    wind_power: number;
    converted_at: string;
}
export interface WeatherData {
    location: string;
    city: string;
    weather_code: string;
    weather_type: WeatherType;
    temperature: number;
    humidity: number;
    wind_speed: number;
    wind_direction: string;
    description: string;
    updated_at: string;
}
export interface GameConfig {
    version: string;
    max_plant_slots: number;
    max_windmill_level: number;
    max_sprite_level: number;
    coin_generation_rate: number;
    max_idle_hours: number;
    growth_weather_multiplier: Record<WeatherType, number>;
    step_to_wind_ratio: number;
    sprite_spawn_interval_minutes: number;
    weather_poll_interval_minutes: number;
    gift_expiry_hours: number;
}
export interface TouchPoint {
    identifier: number;
    x: number;
    y: number;
}
export interface TouchEvent {
    type: 'touchstart' | 'touchmove' | 'touchend';
    touches: TouchPoint[];
    changedTouches: TouchPoint[];
    timeStamp: number;
}
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface Vector2 {
    x: number;
    y: number;
}
export interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface RenderLayer {
    name: string;
    z_index: number;
    visible: boolean;
}
export interface TweenConfig {
    target: Record<string, number>;
    properties: Record<string, number>;
    duration: number;
    easing: EasingFunction;
    delay: number;
    repeat: number;
    yoyo: boolean;
    onComplete?: () => void;
    onUpdate?: (progress: number) => void;
}
export type EasingFunction = (t: number) => number;
export interface UIComponentConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    interactive: boolean;
    alpha: number;
}
export interface ButtonConfig extends UIComponentConfig {
    text: string;
    fontSize: number;
    textColor: string;
    bgColor: string;
    pressedBgColor: string;
    disabledBgColor: string;
    borderRadius: number;
    loading: boolean;
    disabled: boolean;
    onTap?: () => void;
}
export interface PanelConfig extends UIComponentConfig {
    title: string;
    titleColor: string;
    bgColor: string;
    borderRadius: number;
    showClose: boolean;
    onClose?: () => void;
}
export interface ProgressBarConfig extends UIComponentConfig {
    min: number;
    max: number;
    value: number;
    fillColor: string;
    bgColor: string;
    borderColor: string;
    borderRadius: number;
    showText: boolean;
    textColor: string;
    fontSize: number;
}
export interface ScrollViewConfig extends UIComponentConfig {
    contentHeight: number;
    bgColor: string;
    scrollbarColor: string;
    scrollbarWidth: number;
    momentum: boolean;
    onPullRefresh?: () => void;
}
export interface DialogConfig extends UIComponentConfig {
    title: string;
    content: string;
    confirmText: string;
    cancelText: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}
export interface ToastConfig {
    text: string;
    icon?: string;
    duration: number;
    bgColor: string;
    textColor: string;
    fontSize: number;
}
export interface TabConfig {
    id: string;
    label: string;
    icon: string;
    activeIcon: string;
    badge?: number;
}
export interface SkeletonConfig extends UIComponentConfig {
    rows: number;
    rowHeight: number;
    rowGap: number;
    shimmerColor: string;
    baseColor: string;
}
export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    alpha: number;
    gravity: number;
    friction: number;
}
export interface ParticleSystemConfig {
    maxParticles: number;
    emitRate: number;
    lifetime: {
        min: number;
        max: number;
    };
    speed: {
        min: number;
        max: number;
    };
    size: {
        min: number;
        max: number;
    };
    gravity: number;
    friction: number;
    colors: string[];
    angle: {
        min: number;
        max: number;
    };
}
export declare enum GameEvent {
    GameInit = "game:init",
    GamePause = "game:pause",
    GameResume = "game:resume",
    SceneChange = "scene:change",
    ScenePush = "scene:push",
    ScenePop = "scene:pop",
    WeatherUpdated = "weather:updated",
    WeatherEffectStart = "weather:effect_start",
    WeatherEffectStop = "weather:effect_stop",
    PlantPlanted = "plant:planted",
    PlantWatered = "plant:watered",
    PlantGrew = "plant:grew",
    PlantMatured = "plant:matured",
    PlantHarvested = "plant:harvested",
    SpriteSpawned = "sprite:spawned",
    SpriteCaught = "sprite:caught",
    SpriteFed = "sprite:fed",
    SpriteHappinessChanged = "sprite:happiness_changed",
    CoinEarned = "coin:earned",
    CoinSpent = "coin:spent",
    CoinCollected = "coin:collected",
    StepsUpdated = "steps:updated",
    WindPowerChanged = "wind_power:changed",
    FriendListLoaded = "social:friend_list_loaded",
    GiftSent = "social:gift_sent",
    GiftReceived = "social:gift_received",
    GiftClaimed = "social:gift_claimed",
    IslandVisited = "social:island_visited",
    ItemPurchased = "shop:item_purchased",
    ToastShow = "ui:toast_show",
    DialogShow = "ui:dialog_show",
    DialogClose = "ui:dialog_close",
    TabChanged = "ui:tab_changed",
    LoadingStart = "ui:loading_start",
    LoadingEnd = "ui:loading_end"
}
export interface EventPayloads {
    [GameEvent.GameInit]: undefined;
    [GameEvent.GamePause]: undefined;
    [GameEvent.GameResume]: undefined;
    [GameEvent.SceneChange]: {
        from: SceneName;
        to: SceneName;
    };
    [GameEvent.ScenePush]: SceneName;
    [GameEvent.ScenePop]: SceneName;
    [GameEvent.WeatherUpdated]: WeatherData;
    [GameEvent.WeatherEffectStart]: WeatherType;
    [GameEvent.WeatherEffectStop]: WeatherType;
    [GameEvent.PlantPlanted]: {
        plant: Plant;
        plantType: PlantType;
    };
    [GameEvent.PlantWatered]: {
        plantId: string;
    };
    [GameEvent.PlantGrew]: {
        plantId: string;
        stage: PlantGrowthStage;
    };
    [GameEvent.PlantMatured]: {
        plantId: string;
    };
    [GameEvent.PlantHarvested]: {
        plantId: string;
        coinsEarned: number;
    };
    [GameEvent.SpriteSpawned]: {
        spriteType: SpriteType;
    };
    [GameEvent.SpriteCaught]: {
        sprite: WeatherSprite;
    };
    [GameEvent.SpriteFed]: {
        spriteId: string;
    };
    [GameEvent.SpriteHappinessChanged]: {
        spriteId: string;
        happiness: number;
    };
    [GameEvent.CoinEarned]: {
        amount: number;
        source: string;
    };
    [GameEvent.CoinSpent]: {
        amount: number;
        item: string;
    };
    [GameEvent.CoinCollected]: {
        amount: number;
    };
    [GameEvent.StepsUpdated]: {
        steps: number;
        date: string;
    };
    [GameEvent.WindPowerChanged]: {
        windPower: number;
    };
    [GameEvent.FriendListLoaded]: Friendship[];
    [GameEvent.GiftSent]: {
        gift: Gift;
    };
    [GameEvent.GiftReceived]: {
        gift: Gift;
    };
    [GameEvent.GiftClaimed]: {
        giftId: string;
    };
    [GameEvent.IslandVisited]: {
        island: Island;
        owner: User;
    };
    [GameEvent.ItemPurchased]: {
        item: ShopItem;
        quantity: number;
    };
    [GameEvent.ToastShow]: ToastConfig;
    [GameEvent.DialogShow]: DialogConfig;
    [GameEvent.DialogClose]: undefined;
    [GameEvent.TabChanged]: {
        tabId: string;
    };
    [GameEvent.LoadingStart]: string;
    [GameEvent.LoadingEnd]: string;
}
