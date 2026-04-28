"use client";

import { useState, useCallback } from "react";
import type { AnalyzeResponse } from "@/types/video";
import type { SubtitleTrack, SubtitleFormat } from "@/types/subtitle";

interface AnalyzeState {
  isLoading: boolean;
  data: AnalyzeResponse | null;
  error: string | null;
}

export function useAnalyze() {
  const [state, setState] = useState<AnalyzeState>({
    isLoading: false,
    data: null,
    error: null,
  });

  const analyze = useCallback(async (url: string) => {
    setState({ isLoading: true, data: null, error: null });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data: AnalyzeResponse = await res.json();

      if (!res.ok || !data.success) {
        setState({
          isLoading: false,
          data: null,
          error: data.message || data.error || "分析失败",
        });
        return;
      }

      setState({ isLoading: false, data, error: null });
    } catch (err) {
      setState({
        isLoading: false,
        data: null,
        error: "网络连接失败，请稍后重试",
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, data: null, error: null });
  }, []);

  return { ...state, analyze, reset };
}
