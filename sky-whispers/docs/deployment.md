# Sky Whispers 部署文档

## 1. 前置条件

| 组件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 20.0.0 | 20.x LTS | 后端运行时 |
| MySQL | 8.0 | 8.0.x | 主数据库（开发/测试/生产统一使用） |
| Redis | 7.0 | 7.x | 缓存与限流（本地安装） |

## 2. 本地环境安装

### 2.1 安装 MySQL

**macOS:**
```bash
brew install mysql
brew services start mysql
# 设置 root 密码（可选）
mysql_secure_installation
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

**CentOS/RHEL:**
```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo mysql_secure_installation
```

**Windows:**
下载 MySQL Installer: https://dev.mysql.com/downloads/installer/

### 2.2 安装 Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**CentOS/RHEL:**
```bash
sudo yum install redis
sudo systemctl start redis
sudo systemctl enable redis
```

**Windows:**
下载 Redis: https://github.com/tporadowski/redis/releases

### 2.3 验证安装

```bash
# 验证 MySQL
mysql --version
mysql -u root -p -e "SELECT VERSION();"

# 验证 Redis
redis-cli --version
redis-cli ping
# 应返回 PONG
```

## 3. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建开发数据库
CREATE DATABASE IF NOT EXISTS sky_whispers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建测试数据库（运行测试需要）
CREATE DATABASE IF NOT EXISTS sky_whispers_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 可选：创建专用用户
CREATE USER 'sky_whispers'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON sky_whispers.* TO 'sky_whispers'@'localhost';
GRANT ALL PRIVILEGES ON sky_whispers_test.* TO 'sky_whispers'@'localhost';
FLUSH PRIVILEGES;
```

## 4. 环境变量参考

### 后端服务环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | 否 | 3000 | 服务端口 |
| `NODE_ENV` | 是 | development | 运行环境 (development/production/test) |
| `DB_HOST` | 否 | localhost | MySQL 主机 |
| `DB_PORT` | 否 | 3306 | MySQL 端口 |
| `DB_NAME` | 否 | sky_whispers | 数据库名称 |
| `DB_USER` | 是 | root | 数据库用户 |
| `DB_PASSWORD` | 是 | - | 数据库密码 |
| `REDIS_HOST` | 否 | localhost | Redis 主机 |
| `REDIS_PORT` | 否 | 6379 | Redis 端口 |
| `JWT_SECRET` | 是 | - | JWT 签名密钥（生产环境必须修改） |
| `JWT_EXPIRES_IN` | 否 | 7d | Access Token 过期时间 |
| `JWT_REFRESH_EXPIRES_IN` | 否 | 30d | Refresh Token 过期时间 |
| `WECHAT_APP_ID` | 是 | - | 微信小程序 AppID |
| `WECHAT_APP_SECRET` | 是 | - | 微信小程序 AppSecret |
| `WEATHER_API_KEY` | 否 | - | 天气 API Key |
| `WEATHER_API_URL` | 否 | https://api.openweathermap.org/data/2.5 | 天气 API 地址 |
| `OSS_ACCESS_KEY` | 否 | - | 阿里云 OSS AccessKey |
| `OSS_SECRET_KEY` | 否 | - | 阿里云 OSS SecretKey |
| `OSS_BUCKET` | 否 | sky-whispers-assets | OSS Bucket 名称 |
| `OSS_REGION` | 否 | oss-cn-hangzhou | OSS 区域 |

### 管理后台环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `NEXT_PUBLIC_API_URL` | 是 | - | 后端 API 地址 |
| `NEXT_PUBLIC_APP_NAME` | 否 | Sky Whispers Admin | 应用名称 |

## 5. 本地开发启动

### 5.1 配置后端

```bash
cd backend

# 复制环境变量
cp .env.example .env

# 编辑 .env，填入数据库密码、微信密钥等
# 至少需要修改：
#   DB_PASSWORD=你的MySQL密码
#   JWT_SECRET=自定义安全密钥
#   WECHAT_APP_ID=你的微信AppID
#   WECHAT_APP_SECRET=你的微信AppSecret

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 后端运行在 http://localhost:3000
```

### 5.2 启动管理后台

```bash
cd frontend/admin

# 复制环境变量
cp .env.local.example .env.local

# 编辑 .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 后台运行在 http://localhost:3001
```

### 5.3 一键启动（使用 workspace 脚本）

```bash
# 在项目根目录
npm install

# 启动后端
npm run dev:backend

# 启动管理后台（新终端）
npm run dev:admin

# 运行测试
npm run test:backend
```

## 6. 运行测试

测试使用独立的 MySQL 测试数据库 `sky_whispers_test`，测试启动时自动创建。

```bash
cd backend

# 确保本地 MySQL 和 Redis 正在运行
mysql -u root -p -e "SELECT 1"   # 验证 MySQL
redis-cli ping                     # 验证 Redis

# 运行所有测试
npm test

# 运行特定测试
npx jest tests/services/gameCalculation.service.test.ts

# 监听模式
npm run test:watch
```

## 7. 生产部署

### 7.1 构建后端

```bash
cd backend
npm install --production
npm run build
NODE_ENV=production node dist/app.js
```

### 7.2 构建管理后台

```bash
cd frontend/admin
npm install
npm run build
npm start
```

### 7.3 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
pm2 start backend/dist/app.js --name sky-whispers-backend

# 启动管理后台
pm2 start frontend/admin/node_modules/.bin/next --name sky-whispers-admin -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 设置开机自启
pm2 startup
pm2 save
```

### 7.4 Nginx 反向代理

```nginx
# /etc/nginx/conf.d/sky-whispers.conf

# 后端 API
server {
    listen 80;
    server_name api.skywhispers.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 管理后台
server {
    listen 80;
    server_name admin.skywhispers.example.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7.5 SSL/TLS 配置（使用 Let's Encrypt）

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 签发证书
sudo certbot --nginx -d api.skywhispers.example.com
sudo certbot --nginx -d admin.skywhispers.example.com

# 自动续期
sudo certbot renew --dry-run
```

## 8. 监控设置

### 8.1 关键监控指标

| 指标 | 告警阈值 | 说明 |
|------|---------|------|
| HTTP 请求成功率 | < 99% | 服务可用性 |
| HTTP 响应时间 P99 | > 2s | 性能指标 |
| CPU 使用率 | > 80% | 资源指标 |
| 内存使用率 | > 85% | 资源指标 |
| MySQL 连接数 | > 80% 最大连接 | 数据库指标 |
| Redis 命中率 | < 90% | 缓存指标 |

## 9. 备份策略

### 9.1 数据库备份

```bash
#!/bin/bash
# 每日全量备份脚本
DATE=$(date +%Y%m%d)
BACKUP_DIR=/backups/mysql
MYSQL_HOST=localhost
MYSQL_DB=sky_whispers

# 全量备份
mysqldump -h $MYSQL_HOST -u root -p$DB_PASSWORD \
  --single-transaction --routines --triggers \
  $MYSQL_DB | gzip > $BACKUP_DIR/sky_whispers_$DATE.sql.gz

# 保留最近 30 天备份
find $BACKUP_DIR -name "sky_whispers_*.sql.gz" -mtime +30 -delete
```

### 9.2 Redis 备份

```bash
# Redis RDB 快照
redis-cli BGSAVE

# 复制 RDB 文件
cp /var/lib/redis/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

### 9.3 灾难恢复

```bash
# 恢复 MySQL
gunzip < sky_whispers_20260604.sql.gz | mysql -h localhost -u root -p$DB_PASSWORD sky_whispers

# 恢复 Redis
cp ./redis_backup_20260604.rdb /var/lib/redis/dump.rdb
sudo systemctl restart redis
```

## 10. 常见问题

### Q: MySQL 连接被拒绝
```bash
# 检查 MySQL 是否运行
sudo systemctl status mysql

# 检查端口
netstat -tlnp | grep 3306

# 检查用户权限
mysql -u root -p -e "SELECT user, host FROM mysql.user;"
```

### Q: Redis 连接失败
```bash
# 检查 Redis 是否运行
sudo systemctl status redis

# 测试连接
redis-cli ping

# 检查配置
redis-cli CONFIG GET bind
redis-cli CONFIG GET port
```

### Q: 测试数据库初始化失败
```bash
# 手动创建测试数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sky_whispers_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 确认权限
mysql -u root -p -e "SHOW GRANTS FOR CURRENT_USER();"
```
