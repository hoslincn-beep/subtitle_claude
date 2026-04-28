# SubExtract - Next.js 应用 Dockerfile
FROM node:20-alpine AS base

# 安装 Python 和 yt-dlp 依赖
RUN apk add --no-cache python3 py3-pip && \
    python3 -m pip install --break-system-packages yt-dlp

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules

# 确保 yt-dlp 可用
RUN python3 -m pip install --break-system-packages yt-dlp

RUN mkdir -p /app/data/tmp /app/data/subtitles && \
    chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
