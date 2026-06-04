# Sky Whispers 数据库 Schema 文档

## 概述

Sky Whispers 使用 MySQL 8.0 作为主数据库，Sequelize 6 作为 ORM，采用 Repository Pattern 隔离数据访问层。

## 实体关系图

```
┌──────────┐     1:1     ┌──────────┐
│   User   │◄───────────►│  Island  │
│          │             │          │
└────┬─────┘             └────┬─────┘
     │                        │
     │ 1:N                    │ 1:N
     ▼                        ▼
┌──────────┐           ┌──────────┐
│ Weather  │           │  Plant   │
│ Sprite   │           │          │
└────┬─────┘           └────┬─────┘
     │                      │
     │ N:1                  │ N:1
     ▼                      ▼
┌──────────┐           ┌──────────┐
│ Sprite   │           │ PlantType│
│ Type     │           │          │
└──────────┘           └──────────┘

┌──────────┐     N:N     ┌──────────┐
│   User   │◄───────────►│   User   │
│          │  Friendship │          │
└────┬─────┘             └──────────┘
     │
     │ 1:N
     ▼
┌──────────┐
│   Gift   │
│          │
└──────────┘

┌──────────┐     1:N     ┌──────────────┐
│   User   │◄───────────►│ UserInventory│
│          │             │              │
└──────────┘             └──────┬───────┘
                                │
                                │ N:1
                                ▼
                         ┌──────────┐
                         │ ShopItem │
                         │          │
                         └──────────┘

┌──────────┐     1:N     ┌──────────────────┐
│SeasonPass│◄───────────►│SeasonPassProgress│
│          │             │                  │
└──────────┘             └──────────────────┘

┌──────────┐     1:N     ┌──────────────┐
│   User   │◄───────────►│ AdInteraction│
│          │             │              │
└──────────┘             └──────────────┘

┌──────────┐     1:N     ┌──────────┐
│   User   │◄───────────►│StepRecord│
│          │             │          │
└──────────┘             └──────────┘

┌──────────┐     1:N     ┌─────────────┐
│  Island  │◄───────────►│IslandVisit  │
│          │             │             │
└──────────┘             └─────────────┘
```

## 数据表详情

### users - 用户表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 用户 ID |
| openid | VARCHAR(64) | UNIQUE, NOT NULL | 微信 openid |
| unionid | VARCHAR(64) | UNIQUE, NULL | 微信 unionid |
| nickname | VARCHAR(50) | NOT NULL, DEFAULT '旅行者' | 昵称 |
| avatar_url | VARCHAR(512) | NOT NULL, DEFAULT '' | 头像 URL |
| location_lat | DECIMAL(10,7) | NULL | 纬度 |
| location_lng | DECIMAL(10,7) | NULL | 经度 |
| city_code | VARCHAR(20) | NULL | 城市编码 |
| level | INT UNSIGNED | NOT NULL, DEFAULT 1 | 等级 |
| exp | INT UNSIGNED | NOT NULL, DEFAULT 0 | 经验值 |
| coins | INT UNSIGNED | NOT NULL, DEFAULT 0 | 金币 |
| wind_power | INT UNSIGNED | NOT NULL, DEFAULT 0 | 风之力 |
| total_steps | INT UNSIGNED | NOT NULL, DEFAULT 0 | 总步数 |
| last_login_at | DATETIME | NULL | 最后登录时间 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

**索引：**
- `uk_openid` UNIQUE (openid)
- `uk_unionid` UNIQUE (unionid)

---

### islands - 岛屿表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 岛屿 ID |
| user_id | INT UNSIGNED | UNIQUE, NOT NULL, FK | 所属用户 ID |
| name | VARCHAR(50) | NOT NULL, DEFAULT '我的浮岛' | 岛屿名称 |
| skin_id | INT UNSIGNED | NOT NULL, DEFAULT 1 | 皮肤 ID |
| level | INT UNSIGNED | NOT NULL, DEFAULT 1 | 岛屿等级 |
| expansion_slots | INT UNSIGNED | NOT NULL, DEFAULT 6 | 扩展槽位数 |
| weather_type | VARCHAR(20) | NOT NULL, DEFAULT 'sunny' | 当前天气类型 |
| light_level | INT UNSIGNED | NOT NULL, DEFAULT 50 | 光照等级 (0-100) |
| moisture_level | INT UNSIGNED | NOT NULL, DEFAULT 50 | 湿度等级 (0-100) |
| windmill_level | INT UNSIGNED | NOT NULL, DEFAULT 1 | 风车等级 |
| auto_collect | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否自动收集 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

**索引：**
- `uk_user_id` UNIQUE (user_id)

---

### plants - 植物表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 植物 ID |
| island_id | INT UNSIGNED | NOT NULL, FK | 所属岛屿 ID |
| plant_type_id | INT UNSIGNED | NOT NULL, FK | 植物类型 ID |
| growth_stage | TINYINT UNSIGNED | NOT NULL, DEFAULT 0, CHECK(0-3) | 生长阶段 |
| growth_progress | INT UNSIGNED | NOT NULL, DEFAULT 0, CHECK(0-100) | 生长进度 |
| planted_at | DATETIME | NOT NULL, DEFAULT NOW | 种植时间 |
| matured_at | DATETIME | NULL | 成熟时间 |
| is_collected | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否已收获 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

**索引：**
- `idx_island_id` (island_id)
- `idx_plant_type_id` (plant_type_id)

---

### plant_types - 植物类型表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 类型 ID |
| name | VARCHAR(50) | NOT NULL | 植物名称 |
| name_en | VARCHAR(50) | NOT NULL | 英文名称 |
| description | VARCHAR(200) | NOT NULL, DEFAULT '' | 描述 |
| rarity | ENUM('common','uncommon','rare','epic','legendary') | NOT NULL, DEFAULT 'common' | 稀有度 |
| growth_time_base | INT UNSIGNED | NOT NULL | 基础生长时间（秒） |
| required_weather | JSON | NOT NULL, DEFAULT [] | 所需天气条件 |
| required_light_min | INT UNSIGNED | NOT NULL, DEFAULT 0 | 最低光照需求 |
| required_moisture_min | INT UNSIGNED | NOT NULL, DEFAULT 0 | 最低湿度需求 |
| coin_yield | INT UNSIGNED | NOT NULL, DEFAULT 10 | 金币产出 |
| sprite_url | VARCHAR(512) | NOT NULL, DEFAULT '' | 精灵图 URL |
| is_special | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否特殊植物 |
| created_at | DATETIME | NOT NULL | 创建时间 |

**索引：**
- `idx_rarity` (rarity)

---

### weather_sprites - 天气精灵表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 实例 ID |
| user_id | INT UNSIGNED | NOT NULL, FK | 所属用户 ID |
| sprite_type_id | INT UNSIGNED | NOT NULL, FK | 精灵类型 ID |
| nickname | VARCHAR(50) | NOT NULL, DEFAULT '' | 精灵昵称 |
| level | INT UNSIGNED | NOT NULL, DEFAULT 1 | 精灵等级 |
| happiness | INT UNSIGNED | NOT NULL, DEFAULT 80, CHECK(0-100) | 幸福度 |
| last_fed_at | DATETIME | NULL | 最后喂食时间 |
| created_at | DATETIME | NOT NULL | 创建时间 |

**索引：**
- `idx_user_id` (user_id)
- `idx_sprite_type_id` (sprite_type_id)

---

### sprite_types - 精灵类型表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 类型 ID |
| name | VARCHAR(50) | NOT NULL | 精灵名称 |
| name_en | VARCHAR(50) | NOT NULL | 英文名称 |
| description | VARCHAR(200) | NOT NULL, DEFAULT '' | 描述 |
| rarity | ENUM('common','uncommon','rare','epic','legendary') | NOT NULL, DEFAULT 'common' | 稀有度 |
| weather_condition | VARCHAR(20) | NOT NULL | 出现天气条件 |
| catch_rate | DECIMAL(5,4) | NOT NULL, DEFAULT 0.5, CHECK(0-1) | 捕获率 |
| ability | JSON | NOT NULL, DEFAULT {} | 能力数据 |
| sprite_url | VARCHAR(512) | NOT NULL, DEFAULT '' | 精灵图 URL |
| created_at | DATETIME | NOT NULL | 创建时间 |

**索引：**
- `idx_rarity` (rarity)
- `idx_weather_condition` (weather_condition)

---

### friendships - 好友关系表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 关系 ID |
| user_id | INT UNSIGNED | NOT NULL, FK | 发起者 ID |
| friend_id | INT UNSIGNED | NOT NULL, FK | 目标用户 ID |
| status | ENUM('pending','accepted','blocked') | NOT NULL, DEFAULT 'pending' | 好友状态 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

**索引：**
- `uk_user_friend` UNIQUE (user_id, friend_id)
- `idx_status` (status)

---

### gifts - 礼物表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 礼物 ID |
| sender_id | INT UNSIGNED | NOT NULL, FK | 发送者 ID |
| receiver_id | INT UNSIGNED | NOT NULL, FK | 接收者 ID |
| gift_type | ENUM('rain_cloud','breeze','plant_seed','sprite_food') | NOT NULL | 礼物类型 |
| gift_data | JSON | NOT NULL, DEFAULT {} | 礼物数据 |
| message | VARCHAR(200) | NOT NULL, DEFAULT '' | 留言 |
| is_claimed | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否已领取 |
| claimed_at | DATETIME | NULL | 领取时间 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 创建时间 |
| expires_at | DATETIME | NOT NULL | 过期时间 |

**索引：**
- `idx_receiver_unclaimed` (receiver_id, is_claimed)
- `idx_sender_id` (sender_id)

---

### island_visits - 岛屿访问记录表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 记录 ID |
| visitor_id | INT UNSIGNED | NOT NULL, FK | 访问者 ID |
| island_id | INT UNSIGNED | NOT NULL, FK | 岛屿 ID |
| interaction_type | ENUM('water','breeze','gift','view') | NOT NULL | 交互类型 |
| created_at | DATETIME | NOT NULL | 创建时间 |

**索引：**
- `idx_island_id` (island_id)
- `idx_visitor_id` (visitor_id)

---

### shop_items - 商店物品表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 物品 ID |
| name | VARCHAR(100) | NOT NULL | 物品名称 |
| category | ENUM('skin','effect','prop','pass') | NOT NULL | 物品类别 |
| price_coins | INT UNSIGNED | NOT NULL, DEFAULT 0 | 金币价格 |
| price_rmb | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | 人民币价格 |
| item_data | JSON | NOT NULL, DEFAULT {} | 物品数据 |
| is_seasonal | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否季节限定 |
| season_id | INT UNSIGNED | NULL | 关联季节 ID |
| available_from | DATETIME | NULL | 上架时间 |
| available_until | DATETIME | NULL | 下架时间 |
| created_at | DATETIME | NOT NULL | 创建时间 |

**索引：**
- `idx_category` (category)
- `idx_is_seasonal` (is_seasonal)

---

### user_inventories - 用户背包表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 记录 ID |
| user_id | INT UNSIGNED | NOT NULL, FK | 用户 ID |
| item_id | INT UNSIGNED | NOT NULL, FK | 物品 ID |
| quantity | INT UNSIGNED | NOT NULL, DEFAULT 1 | 数量 |
| is_active | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否装备中 |
| acquired_at | DATETIME | NOT NULL, DEFAULT NOW | 获取时间 |

**索引：**
- `uk_user_item` UNIQUE (user_id, item_id)

---

### season_passes - 季票表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 季票 ID |
| name | VARCHAR(100) | NOT NULL | 季票名称 |
| season | ENUM('spring','summer','autumn','winter') | NOT NULL | 季节 |
| year | INT UNSIGNED | NOT NULL | 年份 |
| start_date | DATE | NOT NULL | 开始日期 |
| end_date | DATE | NOT NULL | 结束日期 |
| max_level | INT UNSIGNED | NOT NULL, DEFAULT 50 | 最大等级 |
| created_at | DATETIME | NOT NULL | 创建时间 |

**索引：**
- `idx_season_year` (season, year)

---

### season_pass_progress - 季票进度表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 记录 ID |
| user_id | INT UNSIGNED | NOT NULL, FK | 用户 ID |
| pass_id | INT UNSIGNED | NOT NULL, FK | 季票 ID |
| level | INT UNSIGNED | NOT NULL, DEFAULT 1 | 当前等级 |
| exp | INT UNSIGNED | NOT NULL, DEFAULT 0 | 当前经验 |
| is_premium | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否高级版 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

**索引：**
- `uk_user_pass` UNIQUE (user_id, pass_id)

---

### ad_interactions - 广告交互表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 记录 ID |
| user_id | INT UNSIGNED | NOT NULL, FK | 用户 ID |
| ad_type | ENUM('meteor_shower','weather_boost','daily_bonus') | NOT NULL | 广告类型 |
| reward_data | JSON | NOT NULL, DEFAULT {} | 奖励数据 |
| watched_at | DATETIME | NOT NULL, DEFAULT NOW | 观看时间 |
| expires_at | DATETIME | NOT NULL | 过期时间 |

**索引：**
- `idx_user_ad_type` (user_id, ad_type)

---

### step_records - 步数记录表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | 记录 ID |
| user_id | INT UNSIGNED | NOT NULL, FK | 用户 ID |
| date | DATE | NOT NULL | 日期 |
| steps | INT UNSIGNED | NOT NULL, DEFAULT 0 | 步数 |
| wind_power_earned | INT UNSIGNED | NOT NULL, DEFAULT 0 | 获得的风之力 |
| created_at | DATETIME | NOT NULL | 创建时间 |

**索引：**
- `uk_user_date` UNIQUE (user_id, date)

---

## 迁移策略

### 初始化迁移

1. **创建基础表结构**：按依赖顺序创建所有表（先创建被引用的表，再创建引用表）
2. **创建索引**：在表创建后添加索引
3. **种子数据**：插入初始植物类型、精灵类型、商店物品等数据

### 迁移顺序

```
001_create_users.js
002_create_islands.js
003_create_plant_types.js
004_create_plants.js
005_create_sprite_types.js
006_create_weather_sprites.js
007_create_friendships.js
008_create_gifts.js
009_create_island_visits.js
010_create_shop_items.js
011_create_user_inventories.js
012_create_season_passes.js
013_create_season_pass_progress.js
014_create_ad_interactions.js
015_create_step_records.js
016_seed_plant_types.js
017_seed_sprite_types.js
018_seed_shop_items.js
```

### 线上迁移注意事项

- 所有迁移脚本必须可回滚（包含 `down` 方法）
- 新增列必须设置默认值或允许 NULL
- 删除列前确认无代码引用
- 大表变更使用分批迁移避免锁表
- 迁移前备份数据库
- 使用 `sequelize db:migrate` 执行迁移
- 使用 `sequelize db:migrate:undo` 回滚最近一次迁移
