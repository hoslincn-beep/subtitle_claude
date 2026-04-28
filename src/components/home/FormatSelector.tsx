"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubtitleFormat } from "@/types/subtitle";
import { SUBTITLE_FORMATS, SUBTITLE_FORMAT_LABELS } from "@/types/subtitle";

interface FormatSelectorProps {
  value: SubtitleFormat;
  onChange: (format: SubtitleFormat) => void;
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md border border-warm-border bg-white px-2.5 py-1.5 text-xs font-medium text-warm-text hover:bg-warm-accent transition-colors"
      >
        {SUBTITLE_FORMAT_LABELS[value]}
        <ChevronDown className="h-3 w-3 text-warm-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-warm-border bg-white py-1 shadow-card">
            {SUBTITLE_FORMATS.map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  onChange(fmt);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-warm-accent transition-colors",
                  value === fmt ? "font-medium text-warm-orange" : "text-warm-text"
                )}
              >
                {SUBTITLE_FORMAT_LABELS[fmt]}
                {value === fmt && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
