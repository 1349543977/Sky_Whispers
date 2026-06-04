# Sky Whispers 部署文档

## 1. 前置条件

| 组件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 20.0.0 | 20.x LTS | 后端运行时 |
| MySQL | 8.0 | 8.0.x | 主数据库 |
| Redis | 7.0 | 7.x | 缓存与限流 |
| Docker | 24.0 | 最新 | 容器化部署 |
| Docker Compose | 2.20 | 最新 | 本地开发编排 |
| kubectl | 1.28 | 最新 | Kubernetes 命令行 |
| Helm | 3.12 | 最新 | Kubernetes 包管理 |

## 2. 环境变量参考

### 后端服务环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | 否 | 3000 | 服务端口 |
| `NODE_ENV` | 是 | development | 运行环境 (development/production/test) |
| `DB_HOST` | 是 | localhost | MySQL 主机 |
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

## 3. Docker Compose 本地开发

### 启动所有服务

```bash
# 克隆项目
git clone https://github.com/your-org/sky-whispers.git
cd sky-whispers

# 复制环境变量
cp backend/.env.example backend/.env
# 编辑 .env 填入实际配置

# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f backend

# 停止所有服务
docker compose down
```

### 单独启动基础设施

```bash
# 仅启动 MySQL 和 Redis
docker compose up -d mysql redis

# 启动后端（本地开发模式）
cd backend
npm run dev
```

## 4. 生产部署（Kubernetes）

### 4.1 构建 Docker 镜像

```bash
# 构建后端镜像
docker build -t sky-whispers-backend:latest ./backend

# 构建管理后台镜像
docker build -t sky-whispers-admin:latest ./frontend/admin

# 推送到镜像仓库
docker tag sky-whispers-backend:latest registry.example.com/sky-whispers-backend:latest
docker push registry.example.com/sky-whispers-backend:latest
```

### 4.2 Kubernetes 部署

```bash
# 创建命名空间
kubectl create namespace sky-whispers

# 创建 Secret（敏感配置）
kubectl create secret generic sky-whispers-secrets \
  --from-literal=JWT_SECRET=$(openssl rand -hex 32) \
  --from-literal=DB_PASSWORD=your_db_password \
  --from-literal=WECHAT_APP_SECRET=your_wechat_secret \
  --from-literal=OSS_SECRET_KEY=your_oss_secret \
  -n sky-whispers

# 创建 ConfigMap（非敏感配置）
kubectl create configmap sky-whispers-config \
  --from-literal=NODE_ENV=production \
  --from-literal=DB_HOST=mysql-service \
  --from-literal=DB_PORT=3306 \
  --from-literal=DB_NAME=sky_whispers \
  --from-literal=DB_USER=sky_whispers \
  --from-literal=REDIS_HOST=redis-service \
  --from-literal=REDIS_PORT=6379 \
  -n sky-whispers

# 部署应用
kubectl apply -f k8s/ -n sky-whispers

# 检查部署状态
kubectl get pods -n sky-whispers
kubectl get services -n sky-whispers
```

### 4.3 数据库迁移

```bash
# 在 Kubernetes 中运行迁移 Job
kubectl apply -f k8s/migration-job.yaml -n sky-whispers

# 或在运行中的 Pod 内执行
kubectl exec -it deployment/sky-whispers-backend -n sky-whispers -- \
  npx sequelize db:migrate

# 回滚迁移
kubectl exec -it deployment/sky-whispers-backend -n sky-whispers -- \
  npx sequelize db:migrate:undo
```

### 4.4 HPA 自动扩缩容

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sky-whispers-backend-hpa
  namespace: sky-whispers
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sky-whispers-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## 5. SSL/TLS 配置

### 5.1 使用 cert-manager 自动签发证书

```bash
# 安装 cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# 创建 ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@skywhispers.example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### 5.2 Ingress 配置

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sky-whispers-ingress
  namespace: sky-whispers
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
    - hosts:
        - api.skywhispers.example.com
      secretName: sky-whispers-tls
  rules:
    - host: api.skywhispers.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: sky-whispers-backend
                port:
                  number: 3000
```

## 6. 监控设置

### 6.1 Prometheus + Grafana

```bash
# 安装 Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace

# 添加后端服务监控
cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sky-whispers-backend
  namespace: sky-whispers
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: sky-whispers-backend
  endpoints:
    - port: http
      path: /metrics
      interval: 15s
EOF
```

### 6.2 关键监控指标

| 指标 | 告警阈值 | 说明 |
|------|---------|------|
| HTTP 请求成功率 | < 99% | 服务可用性 |
| HTTP 响应时间 P99 | > 2s | 性能指标 |
| CPU 使用率 | > 80% | 资源指标 |
| 内存使用率 | > 85% | 资源指标 |
| MySQL 连接数 | > 80% 最大连接 | 数据库指标 |
| Redis 命中率 | < 90% | 缓存指标 |
| Pod 重启次数 | > 3 次/小时 | 稳定性指标 |

### 6.3 日志收集

```bash
# 使用 EFK (Elasticsearch + Fluentd + Kibana)
helm install elasticsearch elastic/elasticsearch -n logging --create-namespace
helm install kibana elastic/kibana -n logging
helm install fluentd stable/fluentd -n logging
```

## 7. 备份策略

### 7.1 数据库备份

```bash
# 每日全量备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR=/backups/mysql
MYSQL_HOST=mysql-service
MYSQL_DB=sky_whispers

# 全量备份
mysqldump -h $MYSQL_HOST -u root -p$DB_PASSWORD \
  --single-transaction --routines --triggers \
  $MYSQL_DB | gzip > $BACKUP_DIR/sky_whispers_$DATE.sql.gz

# 保留最近 30 天备份
find $BACKUP_DIR -name "sky_whispers_*.sql.gz" -mtime +30 -delete

# 上传到 OSS
ossutil cp $BACKUP_DIR/sky_whispers_$DATE.sql.gz \
  oss://sky-whispers-backups/mysql/$DATE/
```

### 7.2 Kubernetes CronJob 自动备份

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mysql-backup
  namespace: sky-whispers
spec:
  schedule: "0 2 * * *"  # 每天凌晨 2 点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: mysql:8.0
              command:
                - /bin/bash
                - -c
                - |
                  mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD \
                    --single-transaction $MYSQL_DB | gzip > /backup/sky_whispers_$(date +%Y%m%d).sql.gz
              envFrom:
                - secretRef:
                    name: sky-whispers-secrets
          restartPolicy: OnFailure
```

### 7.3 Redis 备份

```bash
# Redis RDB 快照
redis-cli -h redis-service BGSAVE

# 复制 RDB 文件
kubectl cp sky-whispers/redis-pod:/data/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

### 7.4 灾难恢复

```bash
# 恢复 MySQL
gunzip < sky_whispers_20260604.sql.gz | mysql -h $MYSQL_HOST -u root -p$DB_PASSWORD sky_whispers

# 恢复 Redis
kubectl cp ./redis_backup_20260604.rdb sky-whispers/redis-pod:/data/dump.rdb
kubectl exec -it redis-pod -n sky-whispers -- redis-cli SHUTDOWN NOSAVE
```
