"use client";

import { useState } from "react";
import { ArrowDownUp, Download } from "lucide-react";
import { cn, getLangFlag } from "@/lib/utils";
import type { SubtitleTrack, SubtitleFormat } from "@/types/subtitle";
import { FormatSelector } from "./FormatSelector";

interface BilingualSelectorProps {
  availableTracks: SubtitleTrack[];
  onDownloadBilingual: (
    first: SubtitleTrack,
    second: SubtitleTrack,
    format: SubtitleFormat
  ) => void;
  isLoading?: boolean;
}

export function BilingualSelector({
  availableTracks,
  onDownloadBilingual,
  isLoading,
}: BilingualSelectorProps) {
  const [firstLang, setFirstLang] = useState<string>("");
  const [secondLang, setSecondLang] = useState<string>("");
  const [format, setFormat] = useState<SubtitleFormat>("srt");
  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);

  const firstTrack = availableTracks.find((t) => t.langCode === firstLang);
  const secondTrack = availableTracks.find((t) => t.langCode === secondLang);

  const canDownload = firstTrack && secondTrack;

  if (availableTracks.length < 2) return null;

  return (
    <section className="rounded-2xl border border-warm-border bg-white p-5 shadow-subtle">
      <h3 className="text-sm font-semibold text-warm-text uppercase tracking-wide mb-4">
        双语字幕合并
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
        {/* First language */}
        <div className="relative w-full sm:flex-1">
          <button
            onClick={() => setFirstOpen(!firstOpen)}
            className="flex w-full items-center gap-2 rounded-lg border border-warm-border bg-white px-3 py-2.5 text-sm hover:bg-warm-accent transition-colors"
          >
            {firstTrack ? (
              <>
                <span>{getLangFlag(firstTrack.langCode)}</span>
                <span>{firstTrack.langName}</span>
              </>
            ) : (
              <span className="text-warm-muted">第一语言</span>
            )}
          </button>
          {firstOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFirstOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-warm-border bg-white py-1 shadow-card">
                {availableTracks.map((t) => (
                  <button
                    key={t.langCode}
                    onClick={() => {
                      setFirstLang(t.langCode);
                      setFirstOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-warm-accent",
                      firstLang === t.langCode ? "text-warm-orange font-medium" : "text-warm-text"
                    )}
                  >
                    <span>{getLangFlag(t.langCode)}</span>
                    <span>{t.langName}</span>
                    <span className="text-xs text-warm-muted">({t.langCode})</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <ArrowDownUp className="h-4 w-4 text-warm-muted shrink-0 rotate-90 sm:rotate-0" />

        {/* Second language */}
        <div className="relative w-full sm:flex-1">
          <button
            onClick={() => setSecondOpen(!secondOpen)}
            className="flex w-full items-center gap-2 rounded-lg border border-warm-border bg-white px-3 py-2.5 text-sm hover:bg-warm-accent transition-colors"
          >
            {secondTrack ? (
              <>
                <span>{getLangFlag(secondTrack.langCode)}</span>
                <span>{secondTrack.langName}</span>
              </>
            ) : (
              <span className="text-warm-muted">第二语言</span>
            )}
          </button>
          {secondOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSecondOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-warm-border bg-white py-1 shadow-card">
                {availableTracks.map((t) => (
                  <button
                    key={t.langCode}
                    onClick={() => {
                      setSecondLang(t.langCode);
                      setSecondOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-warm-accent",
                      secondLang === t.langCode ? "text-warm-orange font-medium" : "text-warm-text"
                    )}
                  >
                    <span>{getLangFlag(t.langCode)}</span>
                    <span>{t.langName}</span>
                    <span className="text-xs text-warm-muted">({t.langCode})</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FormatSelector value={format} onChange={setFormat} />
        <button
          onClick={() => {
            if (firstTrack && secondTrack) {
              onDownloadBilingual(firstTrack, secondTrack, format);
            }
          }}
          disabled={!canDownload || isLoading}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all active:scale-[0.97]",
            canDownload && !isLoading
              ? "bg-warm-orange hover:bg-warm-orange-hover"
              : "bg-warm-muted cursor-not-allowed"
          )}
        >
          <Download className="h-4 w-4" />
          下载双语字幕
        </button>
      </div>
    </section>
  );
}
