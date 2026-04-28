import { NextResponse } from "next/server";
import { generateSitemapXml } from "@/lib/seo/sitemap";

export async function GET() {
  const xml = generateSitemapXml();
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
