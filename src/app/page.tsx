"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UrlInput } from "@/components/home/UrlInput";
import { ProgressBar } from "@/components/home/ProgressBar";
import { SubtitleList } from "@/components/home/SubtitleList";
import { VideoInfo } from "@/components/home/VideoInfo";
import { BilingualSelector } from "@/components/home/BilingualSelector";
import { useAnalyze } from "@/hooks/useAnalyze";
import { useDownload } from "@/hooks/useDownload";
import type { SubtitleTrack, SubtitleFormat } from "@/types/subtitle";
import { AlertCircle, Film, FileText, Globe, Download, Languages } from "lucide-react";

const SUPPORTED_PLATFORMS = [
  "YouTube",
  "Bilibili",
  "Viki",
  "Dailymotion",
  "iQiyi",
  "WeTV",
  "Hotstar",
  "Viu",
  "TikTok",
  "Twitch",
];

export default function HomePage() {
  const { isLoading, data, error, analyze, reset } = useAnalyze();
  const { downloadingLang, download, downloadBilingual } = useDownload();

  const [currentUrl, setCurrentUrl] = useState("");

  const handleAnalyze = useCallback(
    (url: string) => {
      setCurrentUrl(url);
      analyze(url);
    },
    [analyze]
  );

  const handleDownload = useCallback(
    (track: SubtitleTrack, format: SubtitleFormat) => {
      if (!data?.videoInfo) return;
      download(
        currentUrl,
        data.videoInfo.platform,
        data.videoInfo.videoId,
        track,
        format
      );
    },
    [currentUrl, data, download]
  );

  const handleBilingualDownload = useCallback(
    (first: SubtitleTrack, second: SubtitleTrack, format: SubtitleFormat) => {
      if (!data?.videoInfo) return;
      downloadBilingual(
        currentUrl,
        data.videoInfo.platform,
        data.videoInfo.videoId,
        first,
        second,
        format
      );
    },
    [currentUrl, data, downloadBilingual]
  );

  const allTracks = [
    ...(data?.ccSubtitles || []),
    ...(data?.autoTranslated || []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-warm-text mb-4 tracking-tight">
              在线视频字幕下载
            </h1>
            <p className="text-warm-muted text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              从 YouTube、Bilibili、Viki 等 50+ 视频平台提取多语言字幕，支持 SRT/VTT/ASS/TXT/HTML 格式
            </p>
          </div>

          <UrlInput
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />

          {/* Supported platforms pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SUPPORTED_PLATFORMS.slice(0, 8).map((p) => (
              <span
                key={p}
                className="inline-block rounded-full border border-warm-border bg-white px-3 py-1 text-xs text-warm-muted"
              >
                {p}
              </span>
            ))}
            <span className="inline-block rounded-full border border-warm-border bg-warm-accent px-3 py-1 text-xs text-warm-orange font-medium">
              +40+
            </span>
          </div>
        </section>

        {/* Progress Bar */}
        <ProgressBar isLoading={isLoading} />

        {/* Results Section */}
        <section className="px-4 pb-8">
          <div className="mx-auto max-w-6xl">
            {/* Error */}
            {error && (
              <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-3" />
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={reset}
                  className="mt-4 text-sm text-red-600 underline hover:text-red-800"
                >
                  重新尝试
                </button>
              </div>
            )}

            {/* Results */}
            {data && data.success && (
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Subtitle List */}
                <div className="lg:col-span-2 space-y-6">
                  {data.message && !data.ccSubtitles.length && !data.autoTranslated.length ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
                      <FileText className="mx-auto h-10 w-10 text-amber-400 mb-3" />
                      <p className="text-amber-700 font-medium">{data.message}</p>
                    </div>
                  ) : (
                    <>
                      <SubtitleList
                        ccSubtitles={data.ccSubtitles}
                        autoTranslated={data.autoTranslated}
                        onDownload={handleDownload}
                        downloadingLang={downloadingLang || undefined}
                      />

                      {/* Bilingual */}
                      {allTracks.length >= 2 && (
                        <BilingualSelector
                          availableTracks={allTracks}
                          onDownloadBilingual={handleBilingualDownload}
                          isLoading={!!downloadingLang}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Video Info Sidebar */}
                <div className="lg:col-span-1">
                  {data.videoInfo && (
                    <div className="sticky top-20">
                      <VideoInfo info={data.videoInfo} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !data && !error && (
              <div className="mt-8">
                {/* How it works */}
                <div className="text-center mb-10">
                  <h2 className="text-xl font-semibold text-warm-text mb-2">使用说明</h2>
                  <p className="text-sm text-warm-muted">三步轻松获取字幕文件</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      icon: Globe,
                      title: "粘贴链接",
                      desc: "复制您想下载字幕的视频链接",
                    },
                    {
                      icon: FileText,
                      title: "分析视频",
                      desc: "自动检测并提取可用字幕",
                    },
                    {
                      icon: Languages,
                      title: "选择格式",
                      desc: "SRT/VTT/ASS/TXT/HTML",
                    },
                    {
                      icon: Download,
                      title: "下载字幕",
                      desc: "一键下载字幕文件",
                    },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-warm-border bg-white p-6 text-center shadow-subtle hover:shadow-card transition-shadow"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-warm-accent mb-4">
                        <step.icon className="h-6 w-6 text-warm-orange" />
                      </div>
                      <h3 className="font-semibold text-warm-text mb-1.5">{step.title}</h3>
                      <p className="text-xs text-warm-muted">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
