import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCacheStats } from "@/lib/subtitle/cache";
import { getUserIdFromHeader } from "@/lib/security/auth";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromHeader(request.headers.get("authorization"));
  if (!userId) {
    return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
  }

  try {
    const [
      totalAccessLogs,
      totalDownloads,
      totalBilingual,
      totalCacheEntries,
      cacheStats,
      uniqueIPs,
      recentLogs,
    ] = await Promise.all([
      prisma.accessLog.count(),
      prisma.accessLog.count({ where: { action: "download" } }),
      prisma.accessLog.count({ where: { action: "bilingual" } }),
      prisma.subtitleCache.count(),
      getCacheStats(),
      prisma.accessLog
        .groupBy({ by: ["ip"], _count: true })
        .then((r) => r.length),
      prisma.accessLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ip: true,
          platform: true,
          action: true,
          subtitleLang: true,
          cacheHit: true,
          createdAt: true,
        },
      }),
    ]);

    // Platform distribution
    const platformDistribution = await prisma.accessLog.groupBy({
      by: ["platform"],
      _count: true,
      where: { platform: { not: null } },
    });

    // Daily stats for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStats = await prisma.accessLog
      .findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, action: true },
      })
      .then((logs) => {
        const stats: Record<string, { total: number; download: number }> = {};
        for (const log of logs) {
          const day = log.createdAt.toISOString().split("T")[0];
          if (!stats[day]) stats[day] = { total: 0, download: 0 };
          stats[day].total++;
          if (log.action === "download") stats[day].download++;
        }
        return Object.entries(stats)
          .map(([date, s]) => ({ date, ...s }))
          .sort((a, b) => a.date.localeCompare(b.date));
      });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalAccessLogs,
          totalDownloads,
          totalBilingual,
          uniqueIPs,
          cacheHitRate:
            totalCacheEntries > 0
              ? ((cacheStats.totalHits / totalCacheEntries) * 100).toFixed(1) + "%"
              : "0%",
        },
        cache: cacheStats,
        platformDistribution,
        dailyStats,
        recentLogs,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json(
      { success: false, error: "获取统计数据失败" },
      { status: 500 }
    );
  }
}
