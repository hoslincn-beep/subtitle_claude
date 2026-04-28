# SubExtract 部署指南

## 服务器要求

| 配置 | 最低 | 推荐 |
|------|------|------|
| CPU | 2核 | 4核 |
| 内存 | 4GB | 8GB |
| 硬盘 | 50GB SSD | 100GB SSD |
| 带宽 | 5Mbps | 10Mbps+ |
| OS | Ubuntu 22.04 | Ubuntu 22.04 |

## 部署步骤

### 1. 安装基础环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Python 3 和 yt-dlp
sudo apt install -y python3 python3-pip
python3 -m pip install -U yt-dlp

# 验证
node --version
python3 --version
yt-dlp --version
```

### 2. 安装数据库

```bash
# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 创建数据库和用户
sudo -u postgres psql -c "CREATE USER subextract WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE subextract OWNER subextract;"

# Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 3. 克隆并配置项目

```bash
cd /www/wwwroot
git clone <your-repo-url> subextract
cd subextract

# 复制环境变量
cp .env.example .env
# 编辑 .env 配置数据库连接等信息

# 安装依赖
npm ci

# 生成 Prisma 客户端并执行迁移
npx prisma generate
npx prisma db push

# 初始化数据库
npm run db:seed
```

### 4. 构建并启动

```bash
# 构建
npm run build

# 使用 PM2 启动
npm install -g pm2
pm2 start npm --name "subextract" -- start
pm2 save
pm2 startup
```

### 5. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6. 配置 SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7. 安装 Playwright（可选，用于兜底方案）

```bash
npx playwright install chromium
npx playwright install-deps chromium
```

## Docker 部署（可选）

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止
docker-compose down
```

## 宝塔面板部署

1. 在宝塔面板中安装：Nginx, PostgreSQL, Redis, PM2
2. 创建网站，设置反向代理到 http://127.0.0.1:3000
3. 在网站目录中克隆项目
4. 通过宝塔终端执行上述步骤 3-4
5. 在 PM2 管理器中添加项目

## 监控

```bash
# 查看 PM2 状态
pm2 status
pm2 logs subextract
pm2 monit

# 检查服务
curl http://localhost:3000/api/analyze -X POST -H "Content-Type: application/json" -d '{"url": "https://www.youtube.com/watch?v=jNQXAC9IVRw"}'
```
