import { prisma } from "@/lib/db";
import type { VideoInfo } from "@/types/video";

export async function getVideoInfo(
  videoId: string,
  platform: string,
  videoUrl: string
): Promise<VideoInfo | null> {
  // Check cache first
  const cached = await prisma.videoInfoCache.findUnique({
    where: { videoId_platform: { videoId, platform } },
  });

  if (cached && (!cached.expiresAt || cached.expiresAt > new Date())) {
    return {
      videoId: cached.videoId,
      platform: cached.platform,
      title: cached.title,
      author: cached.author,
      duration: cached.duration ?? undefined,
      thumbnail: cached.thumbnail ?? undefined,
      uploadDate: cached.uploadDate ?? undefined,
      description: cached.description ?? undefined,
    };
  }

  // For now, return minimal info - will be enhanced by yt-dlp
  return null;
}

export async function cacheVideoInfo(info: VideoInfo): Promise<void> {
  await prisma.videoInfoCache.upsert({
    where: {
      videoId_platform: { videoId: info.videoId, platform: info.platform },
    },
    create: {
      videoId: info.videoId,
      platform: info.platform,
      title: info.title,
      author: info.author,
      duration: info.duration,
      thumbnail: info.thumbnail,
      uploadDate: info.uploadDate,
      description: info.description,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    update: {
      title: info.title,
      author: info.author,
      duration: info.duration,
      thumbnail: info.thumbnail,
      uploadDate: info.uploadDate,
      description: info.description,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}
