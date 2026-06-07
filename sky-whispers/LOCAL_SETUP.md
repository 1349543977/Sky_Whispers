# 本地开发环境搭建指南

## 前置要求

在您的本地电脑上需要安装以下软件：

1. **Node.js** (v20.0.0 或更高版本)
2. **MySQL** (8.0 或更高版本)
3. **Redis** (7.0 或更高版本)
4. **Git**

## 第一步：克隆项目

```bash
git clone <your-repository-url>
cd sky-whispers
```

## 第二步：配置MySQL

### 2.1 确保MySQL服务正在运行

**Windows:**
```bash
# 使用服务管理器启动MySQL
# 或使用命令
net start MySQL80
```

**macOS:**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
```

### 2.2 创建数据库

我们已经准备好了数据库初始化脚本，在 `backend/setup-db.js`。

先进入后端目录：
```bash
cd backend
npm install
```

然后运行数据库初始化脚本：
```bash
node setup-db.js
```

该脚本会创建：
- `sky_whispers` - 开发数据库
- `sky_whispers_test` - 测试数据库

## 第三步：配置Redis

### 3.1 确保Redis服务正在运行

**Windows:**
```bash
# 如果安装了Redis，启动服务
redis-server
```

**macOS:**
```bash
brew services start redis
```

**Linux:**
```bash
sudo systemctl start redis
```

### 3.2 验证Redis连接
```bash
redis-cli ping
# 应该返回 PONG
```

## 第四步：配置环境变量

后端的 `.env` 文件已经为您配置好了（基于您提供的MySQL信息）：

```bash
# 确认 backend/.env 配置正确
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sky_whispers
DB_USER=root
DB_PASSWORD=sxl712712

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## 第五步：启动后端服务

```bash
cd backend
npm run dev
```

后端服务将在 `http://localhost:3000` 启动。

## 第六步：初始化数据库表结构

后端服务启动后，Sequelize会自动创建所有必要的数据库表。

## 第七步：启动运营管理后台（可选）

```bash
cd ../admin
npm install
npm run dev
```

## 第八步：配置和启动微信小游戏

1. 打开微信开发者工具
2. 导入项目，选择 `minigame` 目录
3. 在微信开发者工具中配置您的 AppID
4. 修改 `minigame/src/config/index.ts` 中的后端API地址：
   ```typescript
   export const config = {
     apiBaseUrl: 'http://localhost:3000/api',
     // ...
   };
   ```
5. 点击编译运行

## 常用命令

### 后端
```bash
cd backend
npm run dev          # 开发模式启动
npm run build        # 构建生产版本
npm start            # 生产模式启动
npm run test         # 运行测试
npm run lint         # 代码检查
```

### 运营后台
```bash
cd admin
npm run dev          # 开发模式启动
npm run build        # 构建生产版本
```

## 故障排查

### MySQL连接失败
- 确认MySQL服务正在运行
- 检查用户名和密码是否正确
- 检查防火墙设置

### Redis连接失败
- 确认Redis服务正在运行
- 检查Redis端口是否被占用

### 端口被占用
如果 3000 端口被占用，可以修改 `backend/.env` 中的 `PORT` 变量。

## 开发工作流

1. 确保MySQL和Redis正在运行
2. 启动后端服务：`npm run dev`（backend目录）
3. 在微信开发者工具中打开小游戏项目
4. 开始开发！
