import { NextRequest, NextResponse } from "next/server";
import { analyzeVideo, downloadSubtitle } from "@/lib/subtitle/extractor";
import { mergeBilingual } from "@/lib/subtitle/bilingual";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { SubtitleFormat } from "@/types/subtitle";

const bilingualSchema = z.object({
  videoUrl: z.string().min(1),
  firstLang: z.string().min(1),
  secondLang: z.string().min(1),
  firstLangCode: z.string().min(1),
  secondLangCode: z.string().min(1),
  format: z.enum(["srt", "vtt", "ass", "txt", "html"]).default("srt"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bilingualSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "参数错误" },
        { status: 400 }
      );
    }

    const {
      videoUrl,
      firstLangCode,
      secondLangCode,
      format,
    } = parsed.data;

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
          action: "bilingual",
          subtitleLang: `${firstLangCode}+${secondLangCode}`,
          subtitleFormat: format,
        },
      })
      .catch(() => {});

    // Download both subtitle tracks
    const [firstResult, secondResult] = await Promise.all([
      downloadSubtitle(videoUrl, firstLangCode, "vtt" as SubtitleFormat, "cc"),
      downloadSubtitle(videoUrl, secondLangCode, "vtt" as SubtitleFormat, "cc"),
    ]);

    if (!firstResult.content || !secondResult.content) {
      // Try auto-generated captions
      const [firstAlt, secondAlt] = await Promise.all([
        firstResult.content
          ? Promise.resolve(firstResult)
          : downloadSubtitle(videoUrl, firstLangCode, "vtt" as SubtitleFormat, "auto-generated"),
        secondResult.content
          ? Promise.resolve(secondResult)
          : downloadSubtitle(videoUrl, secondLangCode, "vtt" as SubtitleFormat, "auto-generated"),
      ]);

      if (!firstAlt.content || !secondAlt.content) {
        return NextResponse.json(
          {
            success: false,
            error: "无法获取所需语言的字幕，请确认两种语言的字幕均存在",
          },
          { status: 404 }
        );
      }

      firstResult.content = firstAlt.content;
      secondResult.content = secondAlt.content;
    }

    // Merge into bilingual
    const merged = mergeBilingual(
      firstResult.content,
      secondResult.content,
      "vtt",
      "vtt",
      format as SubtitleFormat
    );

    const filename = `bilingual_${firstLangCode}_${secondLangCode}.${format}`;
    const mimeType = format === "html"
      ? "text/html; charset=utf-8"
      : "text/plain; charset=utf-8";

    return new NextResponse(merged, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Bilingual API error:", err);
    return NextResponse.json(
      { success: false, error: "服务器处理错误" },
      { status: 500 }
    );
  }
}
