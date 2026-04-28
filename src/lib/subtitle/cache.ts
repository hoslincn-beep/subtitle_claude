import { prisma } from "@/lib/db";
import type { SubtitleFormat } from "@/types/subtitle";

let redisClient: import("ioredis").Redis | null = null;

async function getRedis() {
  if (redisClient) return redisClient;
  try {
    const { default: Redis } = await import("ioredis");
    redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // fail fast
    });
    return redisClient;
  } catch {
    return null;
  }
}

function cacheKey(
  videoId: string,
  platform: string,
  language: string,
  type: string,
  format: string
): string {
  return `sub:${platform}:${videoId}:${language}:${type}:${format}`;
}

export async function getCachedSubtitle(
  videoId: string,
  platform: string,
  language: string,
  subtitleType: string,
  format: SubtitleFormat
): Promise<string | null> {
  try {
    // L1: Redis
    const redis = await getRedis();
    if (redis) {
      const cached = await redis.get(cacheKey(videoId, platform, language, subtitleType, format));
      if (cached) return cached;
    }

    // L2: PostgreSQL
    const dbCache = await prisma.subtitleCache.findUnique({
      where: {
        videoId_platform_language_subtitleType_format: {
          videoId,
          platform,
          language,
          subtitleType,
          format,
        },
      },
    });

    if (dbCache && (!dbCache.expiresAt || dbCache.expiresAt > new Date())) {
      // Increment hit count
      await prisma.subtitleCache.update({
        where: { id: dbCache.id },
        data: { hitCount: { increment: 1 } },
      });

      const content = dbCache.content;

      // Write back to Redis
      if (redis) {
        await redis.setex(
          cacheKey(videoId, platform, language, subtitleType, format),
          86400, // 24h
          content
        );
      }

      return content;
    }
  } catch {
    // Cache miss or error, return null
  }

  return null;
}

export async function setCachedSubtitle(
  videoId: string,
  platform: string,
  videoUrl: string,
  language: string,
  subtitleType: string,
  format: SubtitleFormat,
  content: string
): Promise<void> {
  try {
    const fileSize = Buffer.byteLength(content, "utf-8");

    // Write to PostgreSQL
    await prisma.subtitleCache.upsert({
      where: {
        videoId_platform_language_subtitleType_format: {
          videoId,
          platform,
          language,
          subtitleType,
          format,
        },
      },
      create: {
        videoId,
        platform,
        videoUrl,
        language,
        subtitleType,
        format,
        content,
        fileSize,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      update: {
        content,
        fileSize,
        videoUrl,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Write to Redis
    const redis = await getRedis();
    if (redis) {
      await redis.setex(
        cacheKey(videoId, platform, language, subtitleType, format),
        86400,
        content
      );
    }
  } catch {
    // Silently fail cache writes
  }
}

export async function cleanExpiredCache(): Promise<number> {
  const result = await prisma.subtitleCache.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}

export async function getCacheStats() {
  const [totalCache, totalSize, hitSum] = await Promise.all([
    prisma.subtitleCache.count(),
    prisma.subtitleCache.aggregate({ _sum: { fileSize: true } }),
    prisma.subtitleCache.aggregate({ _sum: { hitCount: true } }),
  ]);

  return {
    totalEntries: totalCache,
    totalSize: totalSize._sum.fileSize || 0,
    totalHits: hitSum._sum.hitCount || 0,
  };
}
