import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/security/rate-limit";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;"
  );

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const rateResult = checkRateLimit(`api:${ip}`, 60, 60_000);

    if (!rateResult.allowed) {
      const rateHeaders = getRateLimitHeaders(rateResult);
      return new NextResponse(
        JSON.stringify({ success: false, error: "请求过于频繁，请稍后再试" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...rateHeaders,
          },
        }
      );
    }

    // Add rate limit headers to response
    const rateHeaders = getRateLimitHeaders(rateResult);
    for (const [key, value] of Object.entries(rateHeaders)) {
      response.headers.set(key, String(value));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|locales).*)",
  ],
};
