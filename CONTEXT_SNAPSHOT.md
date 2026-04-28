# CONTEXT_SNAPSHOT.md

## 快照信息
- 创建时间: 2026-04-27 10:30
- 当前阶段: Phase 0-4 完成, Phase 5-7 待收尾
- 项目状态: 核心功能全部实现，可进行下一步

## 已完成工作
- [x] 阶段 0: 项目环境搭建（package.json, tsconfig, tailwind, prisma schema, i18n 翻译文件）
- [x] 阶段 1: 核心字幕提取功能（yt-dlp 集成, 三级降级链, 格式转换器 SRT/VTT/ASS/TXT/HTML, 双语字幕合并）
- [x] 阶段 2: 前端页面开发（Header/Footer/UrlInput/SubtitleList/SubtitleItem/BilingualSelector/VideoInfo/ProgressBar/FormatSelector, Claude风格主题）
- [x] 阶段 3: API 开发（/api/analyze, /api/download, /api/bilingual, /api/video-info, 安全中间件/限流, 三级缓存）
- [x] 阶段 4: 管理面板（管理员登录, 仪表盘, 访问日志, 缓存管理, API路由）
- [x] 阶段 5: 反限流模块（代理池, Cookie管理, 请求轮转, 指数退避重试）
- [x] 平台适配器: YouTube (timedtext API), Bilibili (API + JSON转SRT)
- [x] Docker Compose + Dockerfile
- [x] SEO 落地页 (/[platform]-subtitle-downloader)
- [x] 部署脚本 (yt-dlp, Playwright setup)
- [x] 数据库初始化脚本 (seed-db.ts)

## 待完成工作
- [ ] npm install 安装依赖
- [ ] npm run build 验证编译
- [ ] 配置 .env 文件
- [ ] 创建 Prisma 迁移并初始化数据库
- [ ] 测试各平台字幕提取
- [ ] 生产环境部署 (Nginx + PM2)

## 关键技术决策
- 字幕提取采用三级降级链: yt-dlp → Platform API → Playwright Browser
- 字幕格式转换采用中间表示 (SubtitleIR) 架构: 所有格式先解析为IR再输出目标格式
- 缓存采用三级: Redis (L1, 24h) → PostgreSQL (L2, 7d) → 文件系统 (L3)
- 前端采用 Claude.ai 风格设计: 暖白背景 #FAF9F6, 橙色强调 #E07A2F
- TypeScript 全栈类型安全，前后端类型定义共享

## 文件变更记录
- 新增: 50+ 文件（完整项目结构）
- 核心文件:
  - src/lib/subtitle/extractor.ts - 字幕提取调度器
  - src/lib/subtitle/converter.ts - 格式转换器
  - src/lib/subtitle/ytdlp.ts - yt-dlp 集成
  - src/lib/subtitle/bilingual.ts - 双语合并
  - src/app/page.tsx - 首页
  - src/app/admin/page.tsx - 管理面板

## 下一步计划
1. 运行 npm install 安装依赖
2. 配置 .env 为本地开发环境
3. 运行 prisma db push 创建数据库
4. npm run dev 测试项目
