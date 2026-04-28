"use client";

import { HardDrive, Trash2, RefreshCw } from "lucide-react";

interface CacheData {
  stats: { totalEntries: number; totalSize: number; totalHits: number };
  caches: {
    id: string;
    videoId: string;
    platform: string;
    language: string;
    subtitleType: string;
    format: string;
    fileSize: number;
    hitCount: number;
    expiresAt: string | null;
    createdAt: string;
  }[];
}

interface CacheManagerProps {
  data: CacheData | null;
  onClear: () => void;
  onRefresh: () => void;
}

export function CacheManager({ data, onClear, onRefresh }: CacheManagerProps) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-warm-text">
          缓存管理 ({data.stats.totalEntries} 条)
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 rounded-lg border border-warm-border px-3 py-1.5 text-xs text-warm-muted hover:bg-warm-accent"
          >
            <RefreshCw className="h-3.5 w-3.5" /> 刷新
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" /> 清理过期
          </button>
        </div>
      </div>

      <p className="text-sm text-warm-muted">
        总大小: {(data.stats.totalSize / (1024 * 1024)).toFixed(2)} MB | 总命中: {data.stats.totalHits}
      </p>

      {data.caches.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-warm-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-warm-accent/50 text-left text-xs text-warm-muted">
              <tr>
                <th className="px-4 py-2">视频ID</th>
                <th className="px-4 py-2">平台</th>
                <th className="px-4 py-2">语言</th>
                <th className="px-4 py-2">类型</th>
                <th className="px-4 py-2">格式</th>
                <th className="px-4 py-2">大小</th>
                <th className="px-4 py-2">命中</th>
              </tr>
            </thead>
            <tbody>
              {data.caches.map((c) => (
                <tr key={c.id} className="border-t border-warm-border">
                  <td className="px-4 py-2 font-mono text-xs">{c.videoId.substring(0, 12)}...</td>
                  <td className="px-4 py-2 text-xs">{c.platform}</td>
                  <td className="px-4 py-2 text-xs">{c.language}</td>
                  <td className="px-4 py-2 text-xs">{c.subtitleType}</td>
                  <td className="px-4 py-2 text-xs">{c.format}</td>
                  <td className="px-4 py-2 text-xs">{(c.fileSize / 1024).toFixed(1)} KB</td>
                  <td className="px-4 py-2 text-xs">{c.hitCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
