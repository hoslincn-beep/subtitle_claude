import { NextRequest, NextResponse } from "next/server";
import { getVideoInfo } from "@/lib/video/info";

export const dynamic = "force-dynamic";
import { validateAndParseUrl } from "@/lib/video/validator";
import { z } from "zod";

const videoInfoSchema = z.object({
  url: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url") || "";
    const parsed = videoInfoSchema.safeParse({ url });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "请提供有效的视频链接" },
        { status: 400 }
      );
    }

    const validation = validateAndParseUrl(url);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: "无效的视频链接" },
        { status: 400 }
      );
    }

    const info = await getVideoInfo(
      validation.videoId!,
      validation.platform!,
      validation.sanitizedUrl
    );

    if (!info) {
      return NextResponse.json(
        { success: true, data: null, message: "暂无缓存视频信息" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, data: info },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=600" },
      }
    );
  } catch (err) {
    console.error("Video info API error:", err);
    return NextResponse.json(
      { success: false, error: "服务器处理错误" },
      { status: 500 }
    );
  }
}
