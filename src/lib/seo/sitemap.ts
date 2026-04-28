const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://subextract.com";

const SUPPORTED_PLATFORMS = [
  "youtube",
  "bilibili",
  "viki",
  "dailymotion",
  "iqiyi",
  "wetv",
  "hotstar",
  "viu",
];

const LOCALES = ["zh-CN", "en", "ja", "ko", "es"];

function generateUrl(
  path: string,
  priority: number = 0.5,
  changefreq: string = "weekly"
): string {
  const loc = `${BASE_URL}${path}`;
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export function generateSitemapXml(): string {
  const urls: string[] = [];

  // Homepage
  urls.push(generateUrl("/", 1.0, "daily"));

  // Localized homepages
  for (const locale of LOCALES) {
    urls.push(generateUrl(`/${locale}`, 0.9, "daily"));
  }

  // Platform-specific pages
  for (const platform of SUPPORTED_PLATFORMS) {
    urls.push(generateUrl(`/${platform}-subtitle-downloader`, 0.8, "weekly"));
    for (const locale of LOCALES) {
      urls.push(
        generateUrl(`/${locale}/${platform}-subtitle-downloader`, 0.7, "weekly")
      );
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;
}
