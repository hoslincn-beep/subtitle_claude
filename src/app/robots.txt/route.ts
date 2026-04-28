import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://subextract.com";

  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

Sitemap: ${baseUrl}/sitemap.xml`;

  return new NextResponse(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
