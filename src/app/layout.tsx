import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubExtract - 多语言在线视频字幕下载工具",
  description:
    "从 YouTube、Bilibili、Viki 等 50+ 视频平台提取多语言字幕。支持 SRT、VTT、ASS、TXT、HTML 格式下载。免费在线字幕下载工具。",
  keywords: [
    "字幕下载",
    "YouTube字幕",
    "Bilibili字幕",
    "subtitle download",
    "字幕提取",
    "在线工具",
  ],
  openGraph: {
    title: "SubExtract - 多语言在线视频字幕下载工具",
    description: "从 YouTube、Bilibili 等 50+ 平台提取字幕",
    url: "https://subextract.com",
    siteName: "SubExtract",
    locale: "zh-CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SubExtract - 在线视频字幕下载",
    description: "从 YouTube、Bilibili 等 50+ 平台提取字幕",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-warm-bg text-warm-text antialiased">
        {children}
      </body>
    </html>
  );
}
