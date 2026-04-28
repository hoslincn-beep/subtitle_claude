import { sanitizeUrl, isValidUrl } from "@/lib/security/sanitizer";

export interface ValidationResult {
  isValid: boolean;
  platform: string | null;
  videoId: string | null;
  sanitizedUrl: string;
  error?: string;
}

const PLATFORM_PATTERNS: Record<string, RegExp[]> = {
  youtube: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ],
  bilibili: [
    /bilibili\.com\/video\/(BV[a-zA-Z0-9]{10})/,
    /bilibili\.com\/bangumi\/play\/ep(\d+)/,
    /b23\.tv\/([a-zA-Z0-9]+)/,
  ],
  viki: [/viki\.com\/videos\/(\d+)/, /viki\.com\/movies\/(\d+)/],
  dailymotion: [/dailymotion\.com\/video\/([a-zA-Z0-9]+)/],
  iqiyi: [/iqiyi\.com\/v_[a-zA-Z0-9]+\.html/, /iq\.com\/play\/(\w+)/],
  wetv: [/wetv\.vip\/.*[?&]vid=(\w+)/, /wetv\.vip\/play\?cid=(\w+)/],
  hotstar: [/hotstar\.com\/.*\/(\d+)/],
  viu: [/viu\.com\/.*\/video\/\d+/],
  tiktok: [/tiktok\.com\/@[\w.-]+\/video\/(\d+)/],
  twitch: [/twitch\.tv\/videos\/(\d+)/, /twitch\.tv\/(\w+)\/clip\/(\w+)/],
  facebook: [/facebook\.com\/.*\/videos\/(\d+)/, /fb\.watch\/(\w+)/],
};

export function validateAndParseUrl(rawUrl: string): ValidationResult {
  const sanitizedUrl = sanitizeUrl(rawUrl);

  if (!isValidUrl(sanitizedUrl)) {
    return { isValid: false, platform: null, videoId: null, sanitizedUrl, error: "UNPARSEABLE_URL" };
  }

  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    for (const pattern of patterns) {
      const match = sanitizedUrl.match(pattern);
      if (match) {
        return {
          isValid: true,
          platform,
          videoId: match[1],
          sanitizedUrl,
        };
      }
    }
  }

  // Generic: accept any URL and try yt-dlp
  return {
    isValid: true,
    platform: "generic",
    videoId: sanitizedUrl,
    sanitizedUrl,
  };
}
