"use client";

import { SubtitleItem } from "./SubtitleItem";
import type { SubtitleTrack, SubtitleFormat } from "@/types/subtitle";

interface SubtitleListProps {
  ccSubtitles: SubtitleTrack[];
  autoTranslated: SubtitleTrack[];
  onDownload: (track: SubtitleTrack, format: SubtitleFormat) => void;
  downloadingLang?: string;
}

export function SubtitleList({
  ccSubtitles,
  autoTranslated,
  onDownload,
  downloadingLang,
}: SubtitleListProps) {
  if (ccSubtitles.length === 0 && autoTranslated.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {ccSubtitles.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-warm-text uppercase tracking-wide mb-3">
            CC 字幕
            <span className="ml-2 text-xs font-normal text-warm-muted normal-case tracking-normal">
              ({ccSubtitles.length} 个语言)
            </span>
          </h3>
          <div className="space-y-2">
            {ccSubtitles.map((track) => (
              <SubtitleItem
                key={`cc-${track.langCode}`}
                track={track}
                onDownload={onDownload}
                isLoading={downloadingLang === track.langCode}
              />
            ))}
          </div>
        </section>
      )}

      {autoTranslated.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-warm-text uppercase tracking-wide mb-3">
            自动翻译字幕
            <span className="ml-2 text-xs font-normal text-warm-muted normal-case tracking-normal">
              ({autoTranslated.length} 个语言)
            </span>
          </h3>
          <div className="space-y-2">
            {autoTranslated.map((track) => (
              <SubtitleItem
                key={`auto-${track.langCode}`}
                track={track}
                onDownload={onDownload}
                isLoading={downloadingLang === track.langCode}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
