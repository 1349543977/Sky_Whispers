# Sky Whispers (云端气象局) - Technical Design Document

## 1. System Overview

Sky Whispers is a WeChat Mini Game combining idle-healing and social-mutual-aid gameplay, powered by real-time weather data and WeChat ecosystem integrations.

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WeChat Mini Game                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Island   │ │  Weather  │ │  Social   │ │  Shop     │  │
│  │  System   │ │  System   │ │  System   │ │  System   │  │
│  └─────┬────┘ └─────┬────┘ └─────┬────┘ └─────┬─────┘  │
│        └─────────────┴───────────┴─────────────┘        │
│                         │ Game SDK                       │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS/WSS
┌─────────────────────────┼───────────────────────────────┐
│                    API Gateway (Koa)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Auth    │ │  Rate    │ │  Logger  │ │  Error    │  │
│  │  MW      │ │  Limit   │ │  MW      │ │  Handler  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│                  Service Layer                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Island  │ │  Weather  │ │  Social  │ │  Payment  │  │
│  │  Service │ │  Service  │ │  Service │ │  Service  │  │
│  └─────┬────┘ └─────┬────┘ └─────┬────┘ └─────┬─────┘  │
│        └─────────────┴───────────┴─────────────┘        │
│                         │                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │  Plant   │ │  Sprite  │ │  Step    │                 │
│  │  Service │ │  Service │ │  Service │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│                Repository Layer                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  User    │ │  Island  │ │  Plant   │ │  Sprite   │  │
│  │  Repo    │ │  Repo    │ │  Repo    │ │  Repo     │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│              Data Layer                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │  MySQL   │ │  Redis   │ │   OSS    │                 │
│  │  (RDBMS) │ │  (Cache) │ │  (Files) │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mini Game | TypeScript + Phaser 3 | Type safety + mature game engine for WeChat |
| Admin Dashboard | React 18 + Next.js 14 + shadcn/ui | SSR, mobile-first, design system |
| Backend | Node.js 20 + Koa 2 | Lightweight, middleware-oriented |
| Database | MySQL 8.0 | Relational data, transactions |
| Cache | Redis 7 | Session, real-time data, leaderboards |
| ORM | Sequelize 6 | Repository pattern, migrations |
| API Docs | Swagger/OpenAPI 3.0 | Auto-generated, interactive |
| Testing | Jest + Supertest | Full-stack testing |
| CI/CD | GitHub Actions | Automated pipeline |
| Deployment | Docker + Kubernetes | Scalable, containerized |

## 3. Database Design

### 3.1 Core Tables

#### users
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | User ID |
| openid | VARCHAR(64) UNIQUE | WeChat OpenID |
| unionid | VARCHAR(64) | WeChat UnionID |
| nickname | VARCHAR(32) | Display name |
| avatar_url | VARCHAR(512) | Avatar URL |
| location_lat | DECIMAL(10,7) | Latitude |
| location_lng | DECIMAL(10,7) | Longitude |
| city_code | VARCHAR(16) | Weather city code |
| level | INT DEFAULT 1 | Player level |
| exp | INT DEFAULT 0 | Experience points |
| coins | BIGINT DEFAULT 0 | Gold coins |
| wind_power | INT DEFAULT 0 | Wind power from steps |
| total_steps | BIGINT DEFAULT 0 | Lifetime steps |
| last_login_at | DATETIME | Last login timestamp |
| created_at | DATETIME | Account creation |
| updated_at | DATETIME | Last update |

#### islands
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Island ID |
| user_id | BIGINT FK | Owner |
| name | VARCHAR(32) | Island name |
| skin_id | INT FK DEFAULT 1 | Active skin |
| level | INT DEFAULT 1 | Island level |
| expansion_slots | INT DEFAULT 1 | Unlocked expansion areas |
| weather_type | VARCHAR(16) | Current weather |
| light_level | INT DEFAULT 50 | Light level (0-100) |
| moisture_level | INT DEFAULT 50 | Moisture level (0-100) |
| windmill_level | INT DEFAULT 1 | Windmill upgrade level |
| auto_collect | BOOLEAN DEFAULT FALSE | Auto-collect enabled |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### plants
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Plant ID |
| island_id | BIGINT FK | Planted on island |
| plant_type_id | INT FK | Plant type reference |
| growth_stage | INT DEFAULT 0 | 0=seed,1=sprout,2=growing,3=mature |
| growth_progress | DECIMAL(5,2) DEFAULT 0 | 0-100% |
| planted_at | DATETIME | When planted |
| matured_at | DATETIME | When fully grown |
| is_collected | BOOLEAN DEFAULT FALSE | Harvested? |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### plant_types
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Type ID |
| name | VARCHAR(32) | Plant name |
| name_en | VARCHAR(32) | English name |
| description | TEXT | Description |
| rarity | ENUM('common','uncommon','rare','epic','legendary') | Rarity |
| growth_time_base | INT | Base growth time (seconds) |
| required_weather | JSON | Required weather conditions |
| required_light_min | INT DEFAULT 0 | Min light needed |
| required_moisture_min | INT DEFAULT 0 | Min moisture needed |
| coin_yield | INT DEFAULT 0 | Coins when harvested |
| sprite_url | VARCHAR(512) | Sprite asset URL |
| is_special | BOOLEAN DEFAULT FALSE | Special weather-only |
| created_at | DATETIME | |

#### weather_sprites
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Instance ID |
| user_id | BIGINT FK | Owner |
| sprite_type_id | INT FK | Sprite type |
| nickname | VARCHAR(32) | Custom name |
| level | INT DEFAULT 1 | Sprite level |
| happiness | INT DEFAULT 100 | Happiness (0-100) |
| last_fed_at | DATETIME | Last interaction |
| created_at | DATETIME | |

#### sprite_types
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Type ID |
| name | VARCHAR(32) | Name |
| name_en | VARCHAR(32) | English name |
| description | TEXT | Description |
| rarity | ENUM('common','uncommon','rare','epic','legendary') | |
| weather_condition | VARCHAR(32) | Spawn weather |
| catch_rate | DECIMAL(3,2) | Base catch rate |
| ability | JSON | Special abilities |
| sprite_url | VARCHAR(512) | Asset URL |
| created_at | DATETIME | |

#### friendships
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | |
| user_id | BIGINT FK | Requester |
| friend_id | BIGINT FK | Accepter |
| status | ENUM('pending','accepted','blocked') | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### gifts
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | |
| sender_id | BIGINT FK | Sender |
| receiver_id | BIGINT FK | Receiver |
| gift_type | ENUM('rain_cloud','breeze','plant_seed','sprite_food') | |
| gift_data | JSON | Type-specific data |
| message | VARCHAR(128) | Optional message |
| is_claimed | BOOLEAN DEFAULT FALSE | |
| claimed_at | DATETIME | |
| created_at | DATETIME | |
| expires_at | DATETIME | |

#### island_visits
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | |
| visitor_id | BIGINT FK | Visitor |
| island_id | BIGINT FK | Visited island |
| interaction_type | ENUM('water','breeze','gift','view') | |
| created_at | DATETIME | |

#### shop_items
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | |
| name | VARCHAR(32) | Item name |
| category | ENUM('skin','effect','prop','pass') | Category |
| price_coins | INT DEFAULT 0 | Coin price |
| price_rmb | DECIMAL(10,2) DEFAULT 0 | RMB price (cents) |
| item_data | JSON | Item-specific data |
| is_seasonal | BOOLEAN DEFAULT FALSE | Seasonal item? |
| season_id | INT FK NULL | Season reference |
| available_from | DATETIME | Sale start |
| available_until | DATETIME | Sale end |
| created_at | DATETIME | |

#### user_inventory
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | |
| user_id | BIGINT FK | Owner |
| item_id | INT FK | Shop item |
| quantity | INT DEFAULT 1 | Count |
| is_active | BOOLEAN DEFAULT FALSE | Equipped? |
| acquired_at | DATETIME | |

#### season_passes
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | |
| name | VARCHAR(32) | Season name |
| season | ENUM('spring','summer','autumn','winter') | |
| year | INT | Year |
| start_date | DATE | Season start |
| end_date | DATE | Season end |
| max_level | INT DEFAULT 50 | Max pass level |
| created_at | DATETIME | |

#### season_pass_progress
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | |
| user_id | BIGINT FK | |
| pass_id | INT FK | Season pass |
| level | INT DEFAULT 0 | Current level |
| exp | INT DEFAULT 0 | Current exp |
| is_premium | BOOLEAN DEFAULT FALSE | Premium purchased? |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### ad_interactions
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | |
| user_id | BIGINT FK | |
| ad_type | ENUM('meteor_shower','weather_boost','daily_bonus') | |
| reward_data | JSON | Reward details |
| watched_at | DATETIME | |
| expires_at | DATETIME | Effect expiry |

#### step_records
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | |
| user_id | BIGINT FK | |
| date | DATE | Record date |
| steps | INT | Step count |
| wind_power_earned | INT | Converted wind power |
| created_at | DATETIME | |

## 4. API Design

### 4.1 Authentication
- `POST /api/v1/auth/login` - WeChat login
- `POST /api/v1/auth/refresh` - Refresh token

### 4.2 User
- `GET /api/v1/user/profile` - Get profile
- `PUT /api/v1/user/profile` - Update profile
- `PUT /api/v1/user/location` - Update location
- `POST /api/v1/user/steps` - Submit step data

### 4.3 Island
- `GET /api/v1/island` - Get own island
- `GET /api/v1/island/:userId` - Visit other island
- `PUT /api/v1/island/skin` - Change skin
- `POST /api/v1/island/expand` - Unlock expansion
- `POST /api/v1/island/visit` - Record visit

### 4.4 Weather
- `GET /api/v1/weather/current` - Current weather
- `GET /api/v1/weather/forecast` - 3-day forecast
- `POST /api/v1/weather/sync` - Force sync weather

### 4.5 Plants
- `GET /api/v1/plants/types` - All plant types
- `GET /api/v1/plants/island` - Island plants
- `POST /api/v1/plants/plant` - Plant seed
- `POST /api/v1/plants/:id/water` - Water plant
- `POST /api/v1/plants/:id/harvest` - Harvest plant

### 4.6 Sprites
- `GET /api/v1/sprites/types` - All sprite types
- `GET /api/v1/sprites/collection` - User collection
- `POST /api/v1/sprites/catch` - Attempt catch
- `POST /api/v1/sprites/:id/feed` - Feed sprite
- `GET /api/v1/sprites/codex` - Full codex

### 4.7 Social
- `GET /api/v1/social/friends` - Friend list
- `POST /api/v1/social/friend-request` - Send request
- `PUT /api/v1/social/friend-request/:id` - Accept/reject
- `POST /api/v1/social/gift` - Send gift
- `POST /api/v1/social/gift/:id/claim` - Claim gift
- `GET /api/v1/social/gifts` - Received gifts

### 4.8 Shop
- `GET /api/v1/shop/items` - Shop catalog
- `POST /api/v1/shop/purchase` - Purchase item
- `GET /api/v1/shop/inventory` - User inventory
- `POST /api/v1/shop/equip` - Equip item

### 4.9 Season Pass
- `GET /api/v1/pass/current` - Current season
- `GET /api/v1/pass/progress` - User progress
- `POST /api/v1/pass/upgrade` - Purchase premium

### 4.10 Ads
- `POST /api/v1/ads/watch` - Record ad watch
- `GET /api/v1/ads/available` - Available ad slots

### 4.11 Admin
- `GET /api/v1/admin/dashboard` - Dashboard stats
- `GET /api/v1/admin/users` - User management
- `CRUD /api/v1/admin/items` - Shop item management
- `CRUD /api/v1/admin/events` - Event management
- `GET /api/v1/admin/analytics` - Analytics data

## 5. Game Mechanics

### 5.1 Weather-Plant Growth Formula
```
growth_rate = base_rate * weather_multiplier * light_factor * moisture_factor

weather_multiplier:
  - sunny: 1.0
  - cloudy: 0.8
  - rainy: 1.5 (moisture plants), 0.6 (sun plants)
  - thunderstorm: 2.0 (special plants), 0.5 (normal)
  - snowy: 1.8 (winter plants), 0.3 (others)
  - foggy: 1.2 (mystic plants), 0.7 (others)

light_factor = current_light / 100  (0.0 - 1.0)
moisture_factor = current_moisture / 100  (0.0 - 1.0)
```

### 5.2 Step-to-Wind Conversion
```
wind_power = floor(daily_steps / 100)
max_daily_wind = 500
```

### 5.3 Windmill Coin Generation
```
coins_per_minute = windmill_level * wind_power * 0.1
max_accumulation_hours = 8
```

### 5.4 Sprite Catch Rate
```
catch_chance = sprite_type.catch_rate * weather_bonus * item_bonus
weather_bonus = 1.5 if current_weather matches sprite_type.weather_condition
item_bonus = 1.0 - 2.0 based on items used
```

### 5.5 Island Level Progression
```
level_up_exp = level * 100 + (level ^ 1.5) * 50
max_level = 30
exp_sources:
  - harvest plant: 10-50 (by rarity)
  - catch sprite: 20-100 (by rarity)
  - friend interaction: 5
  - daily login: 20
  - gift sent/received: 10
```

## 6. Security

- JWT token authentication with refresh rotation
- Rate limiting: 100 req/min per user
- Input validation with Joi schemas
- SQL injection prevention via Sequelize parameterized queries
- XSS prevention via output encoding
- CORS configuration for WeChat domains only
- Sensitive data encryption at rest
- API key rotation strategy
