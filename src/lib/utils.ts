import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
    youtube: "YouTube",
    bilibili: "Bilibili",
    viki: "Viki",
    viu: "Viu",
    wetv: "WeTV",
    iqiyi: "爱奇艺",
    hotstar: "Hotstar",
    dailymotion: "Dailymotion",
  };
  return names[platform] || platform;
}

export function getLangFlag(langCode: string): string {
  const flags: Record<string, string> = {
    en: "🇬🇧",
    zh: "🇨🇳",
    "zh-CN": "🇨🇳",
    "zh-TW": "🇹🇼",
    "zh-Hans": "🇨🇳",
    "zh-Hant": "🇹🇼",
    ja: "🇯🇵",
    ko: "🇰🇷",
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    pt: "🇵🇹",
    ru: "🇷🇺",
    ar: "🇸🇦",
    hi: "🇮🇳",
    th: "🇹🇭",
    vi: "🇻🇳",
    id: "🇮🇩",
    it: "🇮🇹",
    nl: "🇳🇱",
    tr: "🇹🇷",
    pl: "🇵🇱",
  };
  return flags[langCode] || "🌐";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
