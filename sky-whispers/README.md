# Sky Whispers (云端气象局)

一款结合放置养成与社交互助的微信小游戏，让你在繁忙的生活中拥有一片宁静的云端岛屿。

## 项目结构

```
sky-whispers/
├── backend/            # 后端服务 (Node.js + Koa + MySQL + Redis)
├── frontend/
│   ├── admin/         # 运营管理后台 (Next.js)
│   └── minigame/      # 微信小游戏
├── docs/              # 项目文档
└── LOCAL_SETUP.md     # 本地开发环境搭建指南
```

## 快速开始

### 前置要求

- Node.js 20+
- MySQL 8.0+
- Redis 7.0+

### 1. 本地环境搭建

详细步骤请查看 [LOCAL_SETUP.md](./LOCAL_SETUP.md)。

### 2. 安装依赖

```bash
# 后端
cd backend
npm install

# 运营后台（可选）
cd ../frontend/admin
npm install

# 小游戏（需要在微信开发者工具中打开）
```

### 3. 配置数据库

```bash
cd backend
node setup-db.js
```

### 4. 启动服务

```bash
# 后端
cd backend
npm run dev

# 运营后台（另一个终端）
cd frontend/admin
npm run dev
```

### 5. 打开小游戏

使用微信开发者工具打开 `frontend/minigame` 目录。

## 技术栈

### 后端
- Node.js + TypeScript
- Koa 框架
- Sequelize ORM
- MySQL 数据库
- Redis 缓存
- JWT 认证

### 微信小游戏
- TypeScript
- Canvas 2D 渲染
- 微信开放平台 API

### 运营后台
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui

## 文档

- [游戏设计文档](./docs/game-design.md)
- [API 文档](./docs/api/swagger.yaml)
- [数据库设计](./docs/db/schema.md)
- [部署指南](./docs/deployment.md)

## 开发规范

- 所有代码遵循 ESLint + Prettier 规范
- 所有接口包含 Swagger 文档
- 包含完整的单元测试和集成测试
- 使用 Clean Architecture + Repository Pattern

## License

MIT
