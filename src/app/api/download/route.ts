import { NextRequest, NextResponse } from "next/server";
import { downloadSubtitle } from "@/lib/subtitle/extractor";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { SubtitleFormat } from "@/types/subtitle";
import { SUBTITLE_FORMATS } from "@/types/subtitle";

const downloadSchema = z.object({
  videoId: z.string().min(1),
  platform: z.string().min(1),
  lang: z.string().min(1),
  type: z.enum(["cc", "auto-generated", "translated"]).default("cc"),
  format: z.enum(["srt", "vtt", "ass", "txt", "html"]).default("srt"),
  videoUrl: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      videoId: searchParams.get("videoId") || "",
      platform: searchParams.get("platform") || "",
      lang: searchParams.get("lang") || "",
      type: searchParams.get("type") || "cc",
      format: searchParams.get("format") || "srt",
      videoUrl: searchParams.get("videoUrl") || "",
    };

    const parsed = downloadSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "参数错误" },
        { status: 400 }
      );
    }

    const { videoUrl, lang, format, type } = parsed.data;

    // Log access
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    prisma.accessLog
      .create({
        data: {
          ip,
          userAgent: request.headers.get("user-agent") || undefined,
          videoUrl,
          platform: parsed.data.platform,
          action: "download",
          subtitleLang: lang,
          subtitleFormat: format,
        },
      })
      .catch(() => {});

    const { content, cached } = await downloadSubtitle(
      videoUrl,
      lang,
      format as SubtitleFormat,
      type
    );

    if (!content) {
      return NextResponse.json(
        { success: false, error: "字幕下载失败，请尝试其他格式" },
        { status: 404 }
      );
    }

    // Determine MIME type
    const mimeTypes: Record<string, string> = {
      srt: "text/plain; charset=utf-8",
      vtt: "text/vtt; charset=utf-8",
      ass: "text/plain; charset=utf-8",
      txt: "text/plain; charset=utf-8",
      html: "text/html; charset=utf-8",
    };

    const fileExtensions: Record<string, string> = {
      srt: ".srt",
      vtt: ".vtt",
      ass: ".ass",
      txt: ".txt",
      html: ".html",
    };

    const filename = `subtitle_${lang}_${type}${fileExtensions[format] || ".srt"}`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": mimeTypes[format] || "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Cache-Hit": cached ? "true" : "false",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Download API error:", err);
    return NextResponse.json(
      { success: false, error: "服务器处理错误" },
      { status: 500 }
    );
  }
}
