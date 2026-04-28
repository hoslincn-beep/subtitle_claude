import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PlatformSEOContent } from "@/components/home/PlatformSEOContent";

const PLATFORM_INFO: Record<
  string,
  { name: string; title: string; description: string }
> = {
  "youtube-subtitle-downloader": {
    name: "YouTube",
    title: "YouTube 字幕下载器 - 在线提取 YouTube 多语言字幕",
    description:
      "免费在线 YouTube 字幕下载工具。支持 CC 字幕、自动生成字幕和翻译字幕。支持 SRT、VTT、TXT、ASS、HTML 格式下载。",
  },
  "bilibili-subtitle-downloader": {
    name: "Bilibili",
    title: "Bilibili 字幕下载器 - 在线提取B站多语言字幕",
    description:
      "免费在线 Bilibili/B站 字幕下载工具。支持CC字幕自动检测，多格式下载。快速提取B站视频字幕文件。",
  },
  "viki-subtitle-downloader": {
    name: "Viki",
    title: "Viki 字幕下载器 - 在线提取 Viki 多语言字幕",
    description:
      "免费在线 Viki 字幕下载工具。支持 Viki 平台多语言字幕提取，SRT/VTT/TXT/ASS/HTML 格式下载。",
  },
};

export async function generateStaticParams() {
  return Object.keys(PLATFORM_INFO).map((platform) => ({ platform }));
}

export async function generateMetadata({
  params,
}: {
  params: { platform: string };
}): Promise<Metadata> {
  const info = PLATFORM_INFO[params.platform];
  if (!info) {
    return { title: "页面未找到 - SubExtract" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://subextract.com";

  return {
    title: info.title,
    description: info.description,
    alternates: {
      canonical: `${baseUrl}/${params.platform}`,
    },
    openGraph: {
      title: info.title,
      description: info.description,
      url: `${baseUrl}/${params.platform}`,
      siteName: "SubExtract",
      type: "website",
    },
  };
}

export default function PlatformPage({
  params,
}: {
  params: { platform: string };
}) {
  const info = PLATFORM_INFO[params.platform];

  if (!info) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center">
            <h1 className="text-2xl font-bold text-warm-text">页面未找到</h1>
            <a href="/" className="text-sm text-warm-orange hover:underline mt-4 inline-block">
              返回首页
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PlatformSEOContent info={info} />
      </main>
      <Footer />
    </div>
  );
}
