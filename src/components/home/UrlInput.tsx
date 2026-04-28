"use client";

import { useState } from "react";
import { Link2, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  placeholder?: string;
  buttonText?: string;
  loadingText?: string;
}

export function UrlInput({
  onAnalyze,
  isLoading,
  placeholder = "粘贴视频链接...",
  buttonText = "开始分析",
  loadingText = "分析中...",
}: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("请输入视频链接");
      return;
    }
    // Basic URL validation
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setError("请输入有效的URL（以 http:// 或 https:// 开头）");
      return;
    }
    setError("");
    onAnalyze(trimmed);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border-2 bg-white p-2 shadow-subtle transition-all",
            error
              ? "border-red-300 focus-within:border-red-400"
              : "border-warm-border focus-within:border-warm-orange/50 focus-within:shadow-card"
          )}
        >
          <Link2 className="ml-3 h-5 w-5 shrink-0 text-warm-muted" />
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 border-none bg-transparent py-3.5 text-warm-text outline-none text-sm sm:text-base placeholder:text-warm-muted/60"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 shrink-0 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all",
              isLoading
                ? "bg-warm-muted cursor-not-allowed"
                : "bg-warm-orange hover:bg-warm-orange-hover active:scale-[0.97]"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">{loadingText}</span>
              </>
            ) : (
              <>
                <span>{buttonText}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500 pl-4">{error}</p>}
      </form>
    </div>
  );
}
