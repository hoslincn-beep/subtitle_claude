import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCacheStats, cleanExpiredCache } from "@/lib/subtitle/cache";
import { getUserIdFromHeader } from "@/lib/security/auth";

export async function GET(request: NextRequest) {
  if (!getUserIdFromHeader(request.headers.get("authorization"))) {
    return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
  }

  try {
    const stats = await getCacheStats();
    const caches = await prisma.subtitleCache.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        videoId: true,
        platform: true,
        language: true,
        subtitleType: true,
        format: true,
        fileSize: true,
        hitCount: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { stats, caches },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "获取缓存信息失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!getUserIdFromHeader(request.headers.get("authorization"))) {
    return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await prisma.subtitleCache.delete({ where: { id } });
    } else {
      // Clean expired
      const count = await cleanExpiredCache();
      return NextResponse.json({
        success: true,
        data: { cleaned: count },
        message: `已清理 ${count} 条过期缓存`,
      });
    }

    return NextResponse.json({ success: true, message: "缓存已删除" });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "清理缓存失败" },
      { status: 500 }
    );
  }
}
