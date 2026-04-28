import { validateAndParseUrl } from "./validator";

export interface PageParseResult {
  platform: string;
  videoId: string;
  videoUrl: string;
  htmlTitle?: string;
  subtitles?: { langCode: string; langName: string; url: string }[];
}

export async function parseVideoPage(url: string): Promise<PageParseResult> {
  const validation = validateAndParseUrl(url);

  if (!validation.isValid) {
    throw new Error(validation.error || "Invalid URL");
  }

  return {
    platform: validation.platform!,
    videoId: validation.videoId!,
    videoUrl: validation.sanitizedUrl,
  };
}
