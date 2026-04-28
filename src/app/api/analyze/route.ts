import { NextRequest, NextResponse } from "next/server";
import { analyzeVideo } from "@/lib/subtitle/extractor";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateCsrfToken } from "@/lib/security/csrf";

const analyzeSchema = z.object({
  url: z.string().min(1, "URL is required").max(2048),
  csrf: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "请提供有效的视频链接" },
        { status: 400 }
      );
    }

    const { url } = parsed.data;

    // Log access (async, don't block)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    prisma.accessLog
      .create({
        data: {
          ip,
          userAgent: request.headers.get("user-agent") || undefined,
          videoUrl: url,
          action: "analyze",
        },
      })
      .catch(() => {});

    const result = await analyzeVideo(url);

    // Generate new CSRF token for next request
    const csrfToken = generateCsrfToken();

    return NextResponse.json(
      { ...result, csrf: csrfToken },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=300", // 5 min cache
        },
      }
    );
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { success: false, error: "服务器处理错误，请稍后再试" },
      { status: 500 }
    );
  }
}
