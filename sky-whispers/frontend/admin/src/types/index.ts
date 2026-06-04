// ============================================================
// Sky Whispers Admin - TypeScript Type Definitions
// ============================================================

// ---- Auth ----
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: AdminRole;
  createdAt: string;
}

export type AdminRole = "super_admin" | "admin" | "operator" | "viewer";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminUser;
}

export interface TokenPayload {
  sub: string;
  role: AdminRole;
  exp: number;
  iat: number;
}

// ---- User (Game Player) ----
export interface User {
  id: string;
  nickname: string;
  avatar?: string;
  level: number;
  coins: number;
  steps: number;
  islandId: string;
  status: UserStatus;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = "active" | "inactive" | "banned";

export interface UserDetail extends User {
  island: Island;
  inventory: InventoryItem[];
  purchaseHistory: PurchaseRecord[];
  giftHistory: GiftRecord[];
  stepRecords: StepRecord[];
  stats: UserStats;
}

export interface UserStats {
  totalSteps: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  plantsGrown: number;
  spritesCollected: number;
  giftsSent: number;
  giftsReceived: number;
  avgDailySteps: number;
}

export interface UserFilterParams {
  search?: string;
  levelMin?: number;
  levelMax?: number;
  status?: UserStatus | "all";
  registeredAfter?: string;
  registeredBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---- Island ----
export interface Island {
  id: string;
  userId: string;
  name: string;
  weatherType: WeatherType;
  plants: Plant[];
  sprites: Sprite[];
  decorations: Decoration[];
  layout: IslandLayout;
  createdAt: string;
}

export type WeatherType =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "foggy"
  | "stormy"
  | "rainbow"
  | "starry";

export interface Plant {
  id: string;
  type: string;
  position: { x: number; y: number };
  growthStage: number;
  plantedAt: string;
}

export interface Sprite {
  id: string;
  type: string;
  position: { x: number; y: number };
  collectedAt: string;
}

export interface Decoration {
  id: string;
  type: string;
  position: { x: number; y: number };
  placedAt: string;
}

export interface IslandLayout {
  width: number;
  height: number;
  theme: string;
}

// ---- Shop ----
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopItemCategory;
  coinPrice: number;
  rmbPrice?: number | null;
  imageData?: string;
  itemData: Record<string, unknown>;
  isSeasonal: boolean;
  seasonalStart?: string;
  seasonalEnd?: string;
  status: ShopItemStatus;
  createdAt: string;
  updatedAt: string;
}

export type ShopItemCategory =
  | "plant"
  | "sprite"
  | "decoration"
  | "weather_theme"
  | "gift"
  | "bundle";

export type ShopItemStatus = "available" | "unavailable" | "hidden";

export interface ShopItemFormValues {
  name: string;
  description?: string;
  category: ShopItemCategory;
  coinPrice: number;
  rmbPrice?: number | null;
  imageData?: string;
  itemData: string;
  isSeasonal: boolean;
  seasonalStart?: string;
  seasonalEnd?: string;
  status: ShopItemStatus;
}

export interface ShopFilterParams {
  category?: ShopItemCategory | "all";
  status?: ShopItemStatus | "all";
  search?: string;
  page: number;
  pageSize: number;
}

// ---- Events ----
export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  config: EventConfig;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export type EventType =
  | "double_coins"
  | "special_weather"
  | "sprite_spawn_boost"
  | "limited_shop"
  | "community_challenge"
  | "seasonal_festival";

export type EventStatus = "draft" | "scheduled" | "active" | "ended" | "cancelled";

export interface EventConfig {
  multiplier?: number;
  weatherType?: WeatherType;
  spawnRate?: number;
  shopItems?: string[];
  targetSteps?: number;
  rewards?: EventReward[];
}

export interface EventReward {
  tier: number;
  itemId: string;
  quantity: number;
}

export interface EventFilterParams {
  type?: EventType | "all";
  status?: EventStatus | "all";
  startDateAfter?: string;
  startDateBefore?: string;
  page: number;
  pageSize: number;
}

// ---- Analytics ----
export interface DashboardStats {
  totalUsers: number;
  totalUsersGrowth: number;
  dau: number;
  dauGrowth: number;
  revenueToday: number;
  revenueGrowth: number;
  avgSessionDuration: number;
  avgSessionGrowth: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface ActiveUsersData {
  period: "7d" | "30d" | "90d";
  data: TimeSeriesPoint[];
}

export interface RevenueData {
  date: string;
  adRevenue: number;
  iapRevenue: number;
  total: number;
}

export interface WeatherDistributionData {
  weatherType: WeatherType;
  count: number;
  percentage: number;
}

export interface RetentionData {
  cohort: string;
  day0: number;
  day1: number;
  day3: number;
  day7: number;
  day14: number;
  day30: number;
}

export interface EngagementMetrics {
  avgPlantsPerUser: number;
  avgSpritesCollected: number;
  giftExchangeRate: number;
  stepConversionRate: number;
}

export interface RevenueBreakdown {
  adRevenue: number;
  iapRevenue: number;
  topSellingItems: TopSellingItem[];
  seasonPassConversionRate: number;
  arpu: number;
  arppu: number;
}

export interface TopSellingItem {
  itemId: string;
  itemName: string;
  quantity: number;
  revenue: number;
}

export interface RecentActivity {
  id: string;
  type: RecentActivityType;
  message: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export type RecentActivityType =
  | "user_registration"
  | "purchase"
  | "gift_exchange"
  | "error_alert"
  | "level_up"
  | "event_start";

// ---- Season Pass ----
export interface SeasonPass {
  id: string;
  name: string;
  season: string;
  startDate: string;
  endDate: string;
  freeTiers: SeasonPassTier[];
  premiumTiers: SeasonPassTier[];
  premiumPrice: number;
  totalSubscribers: number;
  premiumSubscribers: number;
  conversionRate: number;
}

export interface SeasonPassTier {
  level: number;
  requiredExp: number;
  freeReward?: TierReward;
  premiumReward?: TierReward;
}

export interface TierReward {
  itemId: string;
  itemName: string;
  quantity: number;
  itemData: Record<string, unknown>;
}

// ---- Inventory / Purchase / Gift ----
export interface InventoryItem {
  id: string;
  itemId: string;
  itemName: string;
  itemType: ShopItemCategory;
  quantity: number;
  acquiredAt: string;
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  price: number;
  currency: "coins" | "rmb";
  purchasedAt: string;
}

export interface GiftRecord {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  itemId: string;
  itemName: string;
  sentAt: string;
}

export interface StepRecord {
  date: string;
  steps: number;
  coinsEarned: number;
}

// ---- Settings ----
export interface SystemSettings {
  weatherApi: WeatherApiSettings;
  wechatApp: WechatAppSettings;
  notificationTemplates: NotificationTemplate[];
  maintenanceMode: boolean;
  cacheStatus: CacheStatus;
}

export interface WeatherApiSettings {
  provider: string;
  apiKey: string;
  refreshInterval: number;
  fallbackWeather: WeatherType;
}

export interface WechatAppSettings {
  appId: string;
  appSecret: string;
  mchId: string;
  apiVersion: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  updatedAt: string;
}

export interface CacheStatus {
  lastCleared: string;
  totalSize: string;
  entryCount: number;
}

// ---- API Response ----
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, string[]>;
}

// ---- Navigation ----
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

// ---- Chart ----
export interface ChartPeriod {
  label: string;
  value: "7d" | "30d" | "90d";
}
