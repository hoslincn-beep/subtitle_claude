export const locales = ["zh-CN", "en", "ja", "ko", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh-CN";

export const localeLabels: Record<Locale, string> = {
  "zh-CN": "中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
};
