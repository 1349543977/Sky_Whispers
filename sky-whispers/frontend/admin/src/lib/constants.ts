// ============================================================
// Sky Whispers Admin - Constants
// ============================================================

export const APP_NAME = "云端气象局";
export const APP_NAME_EN = "Sky Whispers";
export const APP_VERSION = "1.0.0";

export const API_PREFIX = "/api/v1/admin";

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const CHART_PERIODS = [
  { label: "7天", value: "7d" as const },
  { label: "30天", value: "30d" as const },
  { label: "90天", value: "90d" as const },
];

export const USER_STATUS_LABELS: Record<string, string> = {
  active: "活跃",
  inactive: "不活跃",
  banned: "封禁",
};

export const USER_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  banned: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const SHOP_CATEGORY_LABELS: Record<string, string> = {
  plant: "植物",
  sprite: "精灵",
  decoration: "装饰",
  weather_theme: "天气主题",
  gift: "礼物",
  bundle: "礼包",
};

export const SHOP_STATUS_LABELS: Record<string, string> = {
  available: "上架",
  unavailable: "下架",
  hidden: "隐藏",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  double_coins: "双倍金币",
  special_weather: "特殊天气",
  sprite_spawn_boost: "精灵刷新加成",
  limited_shop: "限时商店",
  community_challenge: "社区挑战",
  seasonal_festival: "季节庆典",
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  scheduled: "已排期",
  active: "进行中",
  ended: "已结束",
  cancelled: "已取消",
};

export const EVENT_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  ended: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const WEATHER_TYPE_LABELS: Record<string, string> = {
  sunny: "晴天",
  cloudy: "多云",
  rainy: "雨天",
  snowy: "雪天",
  foggy: "雾天",
  stormy: "暴风雨",
  rainbow: "彩虹",
  starry: "星空",
};

export const WEATHER_TYPE_COLORS: Record<string, string> = {
  sunny: "#fbbf24",
  cloudy: "#9ca3af",
  rainy: "#60a5fa",
  snowy: "#e0f2fe",
  foggy: "#d1d5db",
  stormy: "#6366f1",
  rainbow: "#c084fc",
  starry: "#1e3a8a",
};

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  super_admin: "超级管理员",
  admin: "管理员",
  operator: "运营",
  viewer: "只读",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  user_registration: "新用户注册",
  purchase: "购买",
  gift_exchange: "礼物交换",
  error_alert: "错误告警",
  level_up: "升级",
  event_start: "活动开始",
};

export const SIDEBAR_NAV_ITEMS = [
  { title: "仪表盘", href: "/", icon: "LayoutDashboard" },
  { title: "用户管理", href: "/users", icon: "Users" },
  { title: "岛屿管理", href: "/islands", icon: "Palmtree" },
  { title: "商店管理", href: "/shop", icon: "ShoppingBag" },
  { title: "活动管理", href: "/events", icon: "CalendarDays" },
  { title: "数据分析", href: "/analytics", icon: "BarChart3" },
  { title: "赛季通行证", href: "/season-pass", icon: "Ticket" },
  { title: "系统设置", href: "/settings", icon: "Settings" },
];

export const TOKEN_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
export const DEBOUNCE_DELAY_MS = 300;
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
