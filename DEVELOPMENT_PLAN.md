# 多语言在线视频字幕下载网站 — 详细开发计划

> 项目代号：SubExtract
> 制定日期：2026-04-27
> 目标：实现类似 downsub.com 的全功能字幕下载网站，面向全球用户

---

## 一、项目概览

### 1.1 核心功能
- 用户输入视频链接 → 解析视频页面 → 提取多语言字幕 → 提供多格式下载
- 支持平台：YouTube、Bilibili、Viki、Viu、WeTV、爱奇艺、Hotstar、Dailymotion 等 50+ 视频网站
- 支持格式：SRT、TXT、VTT、ASS、HTML
- 双语字幕合并下载
- 完整后台管理面板 + 缓存系统 + 反限流机制

### 1.2 技术栈选型

| 层级 | 技术选择 | 理由 |
|------|---------|------|
| **前端** | Next.js 14 (App Router) + TypeScript + Tailwind CSS | SSR/SSG 支持 SEO；React 生态丰富；Tailwind 快速开发 |
| **UI 组件** | shadcn/ui + Radix UI | 无障碍、可定制、Claude 风格易实现 |
| **后端** | Next.js API Routes (Node.js) | 前后端统一，部署简单 |
| **字幕提取核心** | yt-dlp (Python) + youtube-closed-captions + 自研解析器 | yt-dlp 支持 1800+ 网站，优先第三方库方案 |
| **Python 桥接** | python-shell / 子进程调用 | Node.js 调用 yt-dlp Python 库 |
| **浏览器模拟** | Playwright (Chromium) | 应对 JS 渲染页面和反爬场景 |
| **数据库** | PostgreSQL | 可靠的关系型数据库，适合统计和缓存管理 |
| **ORM** | Prisma | 类型安全，迁移方便 |
| **缓存** | Redis | 字幕文件缓存 + 限流计数 + 会话管理 |
| **对象存储** | 本地文件系统 / MinIO | 缓存字幕文件 |
| **管理面板** | 自建 (Next.js) + Recharts 图表 | 完全可控，无需依赖第三方 |
| **反向代理** | Nginx | 宝塔面板标配 |
| **进程管理** | PM2 | Node.js 生产环境进程守护 |
| **部署环境** | Ubuntu 22.04 + 宝塔面板 | 用户要求 |

### 1.3 设计风格
- 参考 Claude.ai (claude.ai)：暖白背景 (#FAF9F6)、深棕文字 (#1A1A1A)、橙色强调 (#E07A2F)
- 简洁大方，留白充足，圆角卡片，微阴影
- 响应式设计，支持移动端
- 多语言界面 (i18n)：中文、英文、日文、韩文、西班牙文等

---

## 二、项目目录结构

```
subtitle_claude/
├── DEVELOPMENT_PLAN.md          # 本开发计划
├── CONTEXT_SNAPSHOT.md          # 上下文快照（AI开发时使用）
├── DEPLOYMENT_GUIDE.md          # 部署指南
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── prisma/
│   ├── schema.prisma            # 数据库模型
│   └── migrations/              # 数据库迁移
├── public/
│   ├── locales/                 # 国际化翻译文件
│   │   ├── zh-CN.json
│   │   ├── en.json
│   │   ├── ja.json
│   │   ├── ko.json
│   │   └── es.json
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页
│   │   ├── globals.css          # 全局样式
│   │   ├── api/
│   │   │   ├── analyze/         # 视频分析接口
│   │   │   │   └── route.ts
│   │   │   ├── download/        # 字幕下载接口
│   │   │   │   └── route.ts
│   │   │   ├── bilingual/       # 双语字幕接口
│   │   │   │   └── route.ts
│   │   │   ├── video-info/      # 视频信息接口
│   │   │   │   └── route.ts
│   │   │   └── admin/           # 管理面板 API
│   │   │       ├── stats/route.ts
│   │   │       ├── cache/route.ts
│   │   │       └── users/route.ts
│   │   └── [locale]/            # 国际化路由
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 基础组件
│   │   ├── layout/
│   │   │   ├── Header.tsx       # 顶部导航
│   │   │   └── Footer.tsx       # 底部信息
│   │   ├── home/
│   │   │   ├── UrlInput.tsx     # URL 输入框 + 分析按钮
│   │   │   ├── SubtitleList.tsx # 字幕列表
│   │   │   ├── SubtitleItem.tsx # 单条字幕项
│   │   │   ├── BilingualSelector.tsx # 双语字幕选择器
│   │   │   ├── VideoInfo.tsx    # 视频信息卡片
│   │   │   ├── ProgressBar.tsx  # 进度条组件
│   │   │   └── FormatSelector.tsx # 格式选择器
│   │   └── admin/
│   │       ├── Dashboard.tsx    # 管理面板首页
│   │       ├── StatsChart.tsx   # 统计图表
│   │       ├── CacheManager.tsx # 缓存管理
│   │       └── AccessLog.tsx    # 访问日志
│   ├── lib/
│   │   ├── subtitle/
│   │   │   ├── extractor.ts     # 字幕提取调度器
│   │   │   ├── ytdlp.ts         # yt-dlp 方案（优先）
│   │   │   ├── api.ts           # 官方 API 方案
│   │   │   ├── browser.ts       # 浏览器模拟方案
│   │   │   ├── converter.ts     # 格式转换器 (SRT↔VTT↔ASS↔TXT↔HTML)
│   │   │   ├── bilingual.ts     # 双语字幕合并
│   │   │   └── cache.ts         # 字幕缓存管理
│   │   ├── video/
│   │   │   ├── parser.ts        # 视频页面解析
│   │   │   ├── info.ts          # 视频信息提取
│   │   │   └── validator.ts     # URL 合法性验证
│   │   ├── platform/
│   │   │   ├── youtube.ts       # YouTube 专用逻辑
│   │   │   ├── bilibili.ts      # Bilibili 专用逻辑
│   │   │   ├── viki.ts          # Viki 专用逻辑
│   │   │   └── ...              # 其他平台
│   │   ├── anti-limit/
│   │   │   ├── proxy-pool.ts    # 代理池管理
│   │   │   ├── cookie-manager.ts # Cookie 管理
│   │   │   ├── rate-limiter.ts  # 请求限流
│   │   │   └── rotator.ts       # 请求轮转策略
│   │   ├── security/
│   │   │   ├── sanitizer.ts     # 输入净化
│   │   │   ├── csrf.ts          # CSRF 防护
│   │   │   └── rate-limit.ts    # API 限流
│   │   ├── seo/
│   │   │   ├── metadata.ts      # SEO 元数据
│   │   │   └── sitemap.ts       # 站点地图生成
│   │   ├── i18n/
│   │   │   └── config.ts        # 国际化配置
│   │   └── db/
│   │       └── index.ts         # Prisma 客户端
│   ├── hooks/
│   │   ├── useAnalyze.ts        # 视频分析 Hook
│   │   ├── useDownload.ts       # 下载 Hook
│   │   └── useProgress.ts       # 进度条 Hook
│   ├── types/
│   │   ├── subtitle.ts          # 字幕类型定义
│   │   ├── video.ts             # 视频类型定义
│   │   └── api.ts               # API 类型定义
│   └── middleware.ts             # 中间件（安全、限流、i18n）
├── scripts/
│   ├── setup-ytdlp.sh           # 安装 yt-dlp
│   ├── setup-playwright.sh      # 安装 Playwright
│   └── seed-db.ts               # 数据库初始化
├── docker-compose.yml            # Docker 编排（可选）
└── .env.example                  # 环境变量模板
```

---

## 三、数据库模型设计

### 3.1 核心表结构

```prisma
// 访问记录
model AccessLog {
  id            String   @id @default(cuid())
  ip            String
  country       String?
  userAgent     String?
  videoUrl      String?
  platform      String?   // youtube, bilibili, etc.
  action        String    // analyze, download, bilingual
  subtitleLang  String?
  subtitleFormat String?
  cacheHit      Boolean  @default(false)
  createdAt     DateTime @default(now())
}

// 字幕缓存
model SubtitleCache {
  id           String   @id @default(cuid())
  videoId      String   // 平台视频ID
  platform     String
  videoUrl     String
  language     String
  subtitleType String   // cc, auto-generated, translated
  format       String   // srt, vtt, txt, ass, html
  content      String   @db.Text
  fileSize     Int
  filePath     String?  // 文件存储路径（大文件）
  hitCount     Int      @default(0)
  expiresAt    DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([videoId, platform, language, subtitleType, format])
}

// 视频信息缓存
model VideoInfoCache {
  id          String   @id @default(cuid())
  videoId     String
  platform    String
  title       String
  author      String
  duration    Int?
  thumbnail   String?
  uploadDate  String?
  description String?  @db.Text
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([videoId, platform])
}

// 系统配置
model SystemConfig {
  id    String @id @default(cuid())
  key   String @unique
  value String @db.Text
}

// 管理员
model Admin {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // bcrypt hash
  role      String   @default("admin")
  createdAt DateTime @default(now())
}

// 代理池
model ProxyNode {
  id        String   @id @default(cuid())
  host      String
  port      Int
  protocol  String   @default("http")
  username  String?
  password  String?
  country   String?
  isActive  Boolean  @default(true)
  failCount Int      @default(0)
  lastCheck DateTime?
  createdAt DateTime @default(now())
}

// Cookie 存储
model CookieStore {
  id        String   @id @default(cuid())
  platform  String   @unique
  cookies   String   @db.Text
  isActive  Boolean  @default(true)
  updatedAt DateTime @updatedAt
}
```

---

## 四、功能模块详细设计

### 4.1 前端页面设计

#### 4.1.1 首页布局

```
┌─────────────────────────────────────────────────────┐
│  Header: Logo + 语言切换 + 暗色模式切换              │
├─────────────────────────────────────────────────────┤
│                                                     │
│            🎬 SubExtract — 字幕下载工具              │
│     从 YouTube、Bilibili 等 50+ 平台提取字幕         │
│                                                     │
│  ┌──────────────────────────────┐ ┌──────────┐      │
│  │ 粘贴视频链接...               │ │ 开始分析  │      │
│  └──────────────────────────────┘ └──────────┘      │
│                                                     │
│  支持平台: YouTube Bilibili Viki ...                 │
│                                                     │
├─────────────────────────┬───────────────────────────┤
│   字幕列表区域           │   视频信息区域             │
│                         │                           │
│   ── CC 字幕 ──         │  ┌─────────────────┐      │
│   🌐 English  [格式▼][↓]│  │   视频封面       │      │
│   🌐 中文     [格式▼][↓]│  │                 │      │
│                         │  └─────────────────┘      │
│   ── 自动翻译字幕 ──     │  标题: xxx                 │
│   🌐 日本語  [格式▼][↓] │  作者: xxx                 │
│   🌐 한국어  [格式▼][↓] │  时长: 10:30              │
│   🌐 Español [格式▼][↓] │  上传: 2026-01-15         │
│   ...                   │                           │
│                         │                           │
│   ── 双语字幕 ──         │                           │
│   第一语言: [English ▼]  │                           │
│   第二语言: [中文    ▼]  │                           │
│        [下载双语字幕]     │                           │
│                         │                           │
├─────────────────────────┴───────────────────────────┤
│  Footer: 版权信息 | 使用条款 | 隐私政策               │
└─────────────────────────────────────────────────────┘
```

#### 4.1.2 组件说明

| 组件 | 功能 | 关键属性 |
|------|------|---------|
| `UrlInput` | 视频链接输入 + 分析按钮 | URL 验证、粘贴自动填充、回车触发 |
| `ProgressBar` | 分析/下载进度动画 | 百分比、脉冲动画、状态文字 |
| `SubtitleList` | 字幕列表容器 | CC 区块、自动翻译区块分隔显示 |
| `SubtitleItem` | 单条字幕行 | 语言名、国旗图标、格式选择、下载按钮 |
| `FormatSelector` | 格式下拉选择 | srt/txt/vtt/ass/html |
| `BilingualSelector` | 双语字幕选择 | 两个语言下拉框 + 激活逻辑 |
| `VideoInfo` | 视频信息卡片 | 封面、标题、作者、时长、上传时间 |

### 4.2 字幕提取核心架构

#### 4.2.1 三级提取策略（优先级从高到低）

```
用户请求 → 提取调度器 (extractor.ts)
              │
              ├─ 1️⃣ 缓存检查 → 命中则直接返回
              │
              ├─ 2️⃣ 第三方库方案 (ytdlp.ts) ← 优先使用
              │     └─ yt-dlp --list-subs --write-sub
              │        --sub-format vtt --skip-download
              │
              ├─ 3️⃣ 官方 API 方案 (api.ts)
              │     └─ YouTube Data API v3 / Bilibili API
              │
              └─ 4️⃣ 浏览器模拟方案 (browser.ts) ← 兜底
                    └─ Playwright 渲染页面 → 提取字幕轨道
```

#### 4.2.2 yt-dlp 集成方案（核心）

```typescript
// ytdlp.ts 核心逻辑伪代码
interface SubtitleTrack {
  langCode: string;      // "en", "zh-Hans", "ja"
  langName: string;      // "English", "中文(简体)"
  url: string;           // 字幕文件 URL
  isAutoGenerated: boolean;
  isTranslation: boolean;
}

// 调用 yt-dlp 获取字幕列表
async function listSubtitles(videoUrl: string): Promise<SubtitleTrack[]> {
  // yt-dlp --list-subs --dump-json <url>
  // 解析 JSON 输出中的 subtitles 和 automatic_captions
}

// 下载指定字幕
async function downloadSubtitle(
  videoUrl: string,
  langCode: string,
  format: string,
  options?: { cookieFile?: string; proxy?: string }
): Promise<string> {
  // yt-dlp --write-sub --sub-lang <lang> --sub-format <fmt>
  //        --skip-download -o "<temp_path>" <url>
}
```

#### 4.2.3 字幕格式转换器

```
输入格式 → 中间表示 (IR) → 输出格式

SRT ──→ ┐                    ┌──→ SRT
VTT ──→ ├── SubtitleIR ─────┤──→ VTT
ASS ──→ ┤  { segments: [{   ├──→ ASS
JSON ──→┤    start, end,    ├──→ TXT (纯文本)
        │    text }] }      ├──→ HTML (表格形式)
        └───────────────────┘──→ 双语合并格式
```

### 4.3 双语字幕合并逻辑

```
步骤1: 获取两种语言的字幕文件
步骤2: 解析为 SubtitleIR 中间表示
步骤3: 时间轴对齐算法:
  - 精确匹配: start/end 完全一致
  - 模糊匹配: 时间重叠度 > 80% 时合并
  - 插入匹配: 一方时间范围内包含另一方多条
步骤4: 合并文本 (语言1 \n 语言2)
步骤5: 输出指定格式
```

### 4.4 反限流与 Cookie 管理架构

```
请求进入
    │
    ├─ 限流检测 (rate-limiter.ts)
    │   └─ IP 级 + 全局级双重限流
    │
    ├─ 代理轮转 (rotator.ts)
    │   ├─ 策略1: 顺序轮转
    │   ├─ 策略2: 随机选择
    │   ├─ 策略3: 按地区选择
    │   └─ 策略4: 失败自动切换
    │
    ├─ Cookie 管理 (cookie-manager.ts)
    │   ├─ 从数据库加载平台 Cookie
    │   ├─ Cookie 过期自动刷新 (Playwright 登录)
    │   └─ 多账号 Cookie 轮转
    │
    └─ 请求重试机制
        ├─ 指数退避: 1s → 2s → 4s → 8s
        ├─ 最大重试: 3 次
        └─ 降级策略: yt-dlp → API → Playwright
```

### 4.5 缓存策略

```
缓存键: {platform}:{videoId}:{lang}:{type}:{format}
缓存层级:
  L1: Redis 内存缓存 (TTL: 24h, 热门字幕)
  L2: PostgreSQL 数据库 (TTL: 7d, 全量缓存)
  L3: 本地文件系统 (原始字幕文件, 按需读取)

缓存命中流程:
  请求 → Redis 查询 → 命中返回
                    → 未命中 → DB 查询 → 命中 → 回写 Redis → 返回
                                       → 未命中 → 文件系统 → 命中 → 回写 Redis+DB → 返回
                                                           → 未命中 → 远程提取 → 写入三级缓存
```

### 4.6 管理面板功能

| 模块 | 功能 | 展示形式 |
|------|------|---------|
| 仪表盘 | 核心指标概览 | 数字卡片 + 趋势图 |
| 访问统计 | PV/UV、国家分布、平台分布 | 折线图 + 饼图 + 地图 |
| 下载统计 | 下载量、格式偏好、语言偏好 | 柱状图 + 饼图 |
| 缓存管理 | 缓存命中率、缓存大小、过期清理 | 表格 + 进度条 |
| 代理管理 | 代理列表、健康检查、添加/删除 | 表格 + 状态指示 |
| Cookie 管理 | 各平台 Cookie 状态、刷新 | 表格 + 操作按钮 |
| 系统配置 | 全局参数、限流阈值 | 表单 |
| 访问日志 | 请求详情、IP、操作记录 | 可搜索表格 |

---

## 五、API 接口设计

### 5.1 核心接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 视频分析 | POST | `/api/analyze` | 解析视频，返回字幕列表+视频信息 |
| 字幕下载 | GET | `/api/download` | 下载指定字幕文件 |
| 双语字幕 | POST | `/api/bilingual` | 生成并下载双语字幕 |
| 视频信息 | GET | `/api/video-info` | 获取视频详细信息 |

### 5.2 接口详细设计

#### POST `/api/analyze`

```typescript
// 请求
{
  "url": "https://www.youtube.com/watch?v=xxxxx"
}

// 响应 - 情况1: 有CC字幕
{
  "success": true,
  "videoInfo": {
    "title": "Video Title",
    "author": "Channel Name",
    "duration": 630,
    "thumbnail": "https://...",
    "uploadDate": "2026-01-15"
  },
  "ccSubtitles": [
    { "langCode": "en", "langName": "English", "isAutoGenerated": false }
  ],
  "autoTranslated": [
    { "langCode": "zh-Hans", "langName": "中文(简体)", "isAutoGenerated": true }
  ],
  "hasVoice": true
}

// 响应 - 情况2_2_2: 无任何字幕
{
  "success": true,
  "videoInfo": { ... },
  "ccSubtitles": [],
  "autoTranslated": [],
  "hasVoice": true,
  "message": "该视频未检测到任何字幕文件，无法下载"
}

// 响应 - 情况2_2_3: 无人声
{
  "success": true,
  "videoInfo": { ... },
  "ccSubtitles": [],
  "autoTranslated": [],
  "hasVoice": false,
  "message": "该视频未检测到人声语音，无可供下载的字幕"
}

// 响应 - 情况2_4: URL不合法
{
  "success": false,
  "error": "您请求的视频不存在，请检查视频链接是否正确"
}
```

#### GET `/api/download`

```typescript
// 查询参数
?videoId=xxxxx&platform=youtube&lang=en&type=cc&format=srt

// 响应: 直接返回文件流
Content-Type: text/plain; charset=utf-8
Content-Disposition: attachment; filename="video_en_cc.srt"
```

---

## 六、安全设计

### 6.1 前端安全
- URL 输入净化：白名单域名验证 + XSS 过滤
- CSRF Token 验证
- 请求频率限制（前端节流 + 后端限流）
- Content-Security-Policy 头

### 6.2 后端安全
- API 限流：IP 级 60次/分钟，全局 1000次/分钟
- 输入验证：Zod schema 验证所有请求
- SQL 注入防护：Prisma 参数化查询
- 敏感信息：环境变量管理，不暴露内部错误
- 管理面板：JWT 认证 + bcrypt 密码哈希
- Helmet.js 安全头

### 6.3 反滥用
- 验证码：高频请求触发 Cloudflare Turnstile
- IP 黑名单：自动封禁恶意 IP
- 请求签名：防止 API 被直接调用

---

## 七、SEO 设计

### 7.1 技术 SEO
- Next.js SSR/SSG：页面服务端渲染
- 结构化数据：VideoObject + WebApplication Schema
- Meta 标签：动态 title/description/og 标签
- Sitemap.xml：自动生成
- Robots.txt：正确配置
- 多语言 hreflang 标签

### 7.2 内容 SEO
- 每个支持平台独立页面：/youtube-subtitle-downloader, /bilibili-subtitle-downloader
- FAQ 页面：常见问题解答
- 博客/教程页面（可选）

---

## 八、开发阶段规划

### 阶段 0: 环境搭建（1天）

| 任务 | 说明 |
|------|------|
| 初始化 Next.js 项目 | `npx create-next-app@latest` + TypeScript + Tailwind |
| 安装核心依赖 | shadcn/ui, Prisma, ioredis, zod, etc. |
| 配置 Prisma + PostgreSQL | 数据库模型 + 迁移 |
| 安装 yt-dlp | Python 3.8+ + pip install yt-dlp |
| 安装 Playwright | `npx playwright install chromium` |
| 配置 Redis | 本地开发用 Docker |
| Git 仓库初始化 | .gitignore, .env.example |

### 阶段 1: 核心字幕提取功能（3-4天）

| 任务 | 优先级 | 说明 |
|------|--------|------|
| URL 验证器 | P0 | 识别平台、提取视频ID、验证合法性 |
| yt-dlp 集成 | P0 | 字幕列表获取 + 字幕下载 |
| 格式转换器 | P0 | SRT/VTT/TXT/ASS/HTML 互转 |
| 提取调度器 | P0 | 缓存→yt-dlp→API→Playwright 降级链 |
| YouTube 适配 | P0 | CC字幕 + 自动生成 + 自动翻译 |
| Bilibili 适配 | P1 | API + yt-dlp 双方案 |
| 其他平台适配 | P2 | Viki, Dailymotion 等 |

### 阶段 2: 前端页面开发（3-4天）

| 任务 | 优先级 | 说明 |
|------|--------|------|
| 全局布局 + 样式 | P0 | Header/Footer/Claude 风格主题 |
| URL 输入组件 | P0 | 输入框 + 分析按钮 + 验证 |
| 进度条组件 | P0 | 分析/下载进度动画 |
| 字幕列表组件 | P0 | CC区块 + 自动翻译区块 + 格式选择 + 下载 |
| 视频信息组件 | P0 | 封面/标题/作者/时长/上传时间 |
| 双语字幕选择器 | P1 | 语言下拉 + 合并下载 |
| 错误提示组件 | P0 | 各种无字幕/无效链接提示 |
| 响应式适配 | P1 | 移动端布局 |

### 阶段 3: 后端 API 开发（2-3天）

| 任务 | 优先级 | 说明 |
|------|--------|------|
| /api/analyze | P0 | 视频分析完整逻辑 |
| /api/download | P0 | 字幕下载 + 格式转换 |
| /api/bilingual | P1 | 双语字幕合并 |
| /api/video-info | P1 | 视频信息获取 |
| 安全中间件 | P0 | 限流 + 验证 + CSRF |
| 缓存逻辑 | P0 | Redis + DB + 文件三级缓存 |

### 阶段 4: 管理面板（2-3天）

| 任务 | 优先级 | 说明 |
|------|--------|------|
| 管理员认证 | P0 | 登录 + JWT |
| 仪表盘 | P0 | 核心指标 + 图表 |
| 访问统计 | P1 | PV/UV + 国家/平台分布 |
| 下载统计 | P1 | 下载量 + 格式/语言偏好 |
| 缓存管理 | P1 | 查看/清理缓存 |
| 代理管理 | P2 | 代理增删 + 健康检查 |
| Cookie 管理 | P2 | Cookie 状态 + 刷新 |
| 系统配置 | P2 | 全局参数配置 |

### 阶段 5: 反限流与高可用（2天）

| 任务 | 优先级 | 说明 |
|------|--------|------|
| 代理池管理 | P0 | 代理轮转 + 失败切换 |
| Cookie 轮转 | P0 | 多账号 Cookie 管理 |
| 请求重试 | P0 | 指数退避 + 降级策略 |
| Playwright 兜底 | P1 | JS 渲染 + Cookie 刷新 |

### 阶段 6: SEO + 国际化（1-2天）

| 任务 | 优先级 | 说明 |
|------|--------|------|
| i18n 配置 | P0 | next-intl 集成 |
| 翻译文件 | P0 | 中/英/日/韩/西 5种语言 |
| Meta 标签 | P0 | 动态 SEO 元数据 |
| Sitemap | P1 | 自动生成站点地图 |
| 平台专属页面 | P2 | SEO 落地页 |

### 阶段 7: 测试 + 部署（2天）

| 任务 | 说明 |
|------|------|
| 功能测试 | 各平台字幕提取测试 |
| 压力测试 | 并发下载性能测试 |
| 安全测试 | XSS/SQL注入/CSRF 测试 |
| 宝塔部署 | Nginx + PM2 + PostgreSQL + Redis |
| 域名 + SSL | Let's Encrypt 证书 |
| 监控告警 | 日志 + 健康检查 |

---

## 九、关键技术难点与解决方案

### 9.1 YouTube 自动翻译字幕获取

**难点**: YouTube 的自动翻译字幕不是预生成的，需要通过特定 API 参数触发翻译。

**方案**:
1. yt-dlp 支持 `--sub-langs "zh-Hans.*"` 获取翻译字幕
2. 备选：直接调用 YouTube 内部 `timedtext` API，添加 `tlang=zh-Hans` 参数
3. 兜底：Playwright 模拟点击字幕菜单获取翻译

### 9.2 双语字幕时间轴对齐

**难点**: 不同语言的字幕时间轴可能不完全一致。

**方案**:
- 实现基于时间重叠度的对齐算法
- 阈值设定：重叠度 > 80% 视为匹配
- 无法匹配的段落：保留原文，另一语言留空

### 9.3 大规模并发下的限流应对

**难点**: 视频平台对高频请求会限流或封禁。

**方案**:
- 代理池：维护 10-50 个代理节点，自动轮转
- Cookie 池：每个平台维护 3-5 个账号 Cookie
- 请求队列：并发请求排队处理，控制 QPS
- 智能降级：检测到限流自动切换方案/代理

### 9.4 多平台适配

**难点**: 不同平台页面结构、API 接口各不相同。

**方案**:
- 统一抽象层：每个平台实现 `PlatformAdapter` 接口
- yt-dlp 已支持 1800+ 网站，大部分平台无需单独适配
- 仅对 yt-dlp 不支持或支持不好的平台做专用适配器

---

## 十、部署架构

```
用户 → Cloudflare CDN (DDoS防护 + 缓存)
         │
         ↓
      Nginx (反向代理 + SSL)
         │
         ├→ Next.js App (PM2 集群模式, 2+ 实例)
         │     │
         │     ├→ Node.js API Routes
         │     └→ SSR 页面渲染
         │
         ├→ PostgreSQL (数据存储)
         │
         ├→ Redis (缓存 + 限流 + 会话)
         │
         └→ 字幕文件存储 (/data/subtitles/)

服务器最低配置:
  - CPU: 2核
  - 内存: 4GB
  - 硬盘: 50GB SSD
  - 带宽: 5Mbps+

推荐配置:
  - CPU: 4核
  - 内存: 8GB
  - 硬盘: 100GB SSD
  - 带宽: 10Mbps+
```

---

## 十一、AI 开发上下文快照机制

### 11.1 触发条件
- 上下文使用量达到 60% 时
- 完成一个完整阶段时
- 遇到重大技术决策时

### 11.2 快照内容模板

```markdown
# CONTEXT_SNAPSHOT.md

## 快照信息
- 创建时间: YYYY-MM-DD HH:mm
- 上下文使用量: XX%
- 当前阶段: Phase X

## 已完成工作
- [x] 任务1
- [x] 任务2

## 当前进行中
- [ ] 任务3 (进度 50%)

## 待完成工作
- [ ] 任务4
- [ ] 任务5

## 关键技术决策
- 决策1: 原因及理由
- 决策2: 原因及理由

## 遇到的问题
- 问题1: 描述 + 当前状态

## 文件变更记录
- 新增: file1.ts, file2.ts
- 修改: file3.ts (添加XX功能)
- 删除: 无

## 下一步计划
1. 具体任务A
2. 具体任务B
```

### 11.3 恢复流程
1. 新对话开始时读取 CONTEXT_SNAPSHOT.md
2. 确认已完成工作和当前进度
3. 从断点继续开发

---

## 十二、核心依赖清单

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.10.0",
    "ioredis": "^5.3.0",
    "zod": "^3.22.0",
    "next-intl": "^3.10.0",
    "playwright": "^1.42.0",
    "python-shell": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "helmet": "^7.1.0",
    "recharts": "^2.12.0",
    "lucide-react": "^0.350.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "prisma": "^5.10.0",
    "tailwindcss": "^3.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## 十三、风险与应对

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| YouTube API 配额不足 | 高 | 中 | 优先 yt-dlp，API 作为辅助 |
| 代理 IP 被批量封禁 | 中 | 高 | 多渠道代理源 + 自建代理 |
| yt-dlp 停止维护 | 低 | 高 | 保留 API + Playwright 兜底 |
| 服务器资源不足 | 中 | 高 | CDN 缓存 + 字幕文件压缩 |
| 法律合规风险 | 中 | 高 | 用户协议 + DMCA 响应机制 |

---

## 十四、验收标准

### 功能验收
- [ ] 支持至少 5 个主流视频平台字幕下载
- [ ] 支持 5 种字幕格式输出 (SRT/TXT/VTT/ASS/HTML)
- [ ] CC 字幕和自动翻译字幕正确区分显示
- [ ] 双语字幕合并功能正常工作
- [ ] 无字幕/无人声/无效链接三种异常正确提示
- [ ] 视频信息正确展示
- [ ] 进度条动画流畅
- [ ] 缓存命中时无需请求视频网站
- [ ] 管理面板功能完整

### 性能验收
- [ ] 首页加载 < 2s
- [ ] 字幕分析 < 10s (缓存命中 < 1s)
- [ ] 字幕下载 < 5s
- [ ] 支持 100 并发用户

### 安全验收
- [ ] 无 XSS/SQL注入/CSRF 漏洞
- [ ] API 限流正常工作
- [ ] 管理面板需认证访问

---

> 本文档将随项目开发持续更新。开发过程中每完成一个阶段，更新对应状态并创建上下文快照。
