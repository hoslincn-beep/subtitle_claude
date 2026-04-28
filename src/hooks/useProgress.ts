"use client";

import { useState, useCallback } from "react";

interface ProgressState {
  isActive: boolean;
  status: string;
  percent: number;
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>({
    isActive: false,
    status: "",
    percent: 0,
  });

  const start = useCallback((statusText: string = "处理中...") => {
    setProgress({ isActive: true, status: statusText, percent: 0 });
  }, []);

  const update = useCallback((percent: number, statusText?: string) => {
    setProgress((prev) => ({
      ...prev,
      percent: Math.min(100, percent),
      status: statusText || prev.status,
    }));
  }, []);

  const complete = useCallback((statusText: string = "完成") => {
    setProgress({ isActive: false, status: statusText, percent: 100 });
  }, []);

  const reset = useCallback(() => {
    setProgress({ isActive: false, status: "", percent: 0 });
  }, []);

  return { progress, start, update, complete, reset };
}
