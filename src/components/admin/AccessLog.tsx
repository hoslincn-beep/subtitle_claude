"use client";

import { Activity, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  ip: string;
  platform?: string;
  action: string;
  subtitleLang?: string;
  cacheHit: boolean;
  createdAt: string;
}

interface AccessLogProps {
  logs: LogEntry[];
}

export function AccessLog({ logs }: AccessLogProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-warm-orange" />
        <h2 className="text-lg font-semibold text-warm-text">访问日志</h2>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-warm-border bg-white shadow-subtle">
        <table className="w-full text-sm">
          <thead className="border-b border-warm-border bg-warm-accent/30 text-left text-xs text-warm-muted">
            <tr>
              <th className="px-4 py-3">时间</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">操作</th>
              <th className="px-4 py-3">平台</th>
              <th className="px-4 py-3">语言</th>
              <th className="px-4 py-3">缓存</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-warm-border/50 hover:bg-warm-accent/20 transition-colors">
                <td className="px-4 py-2.5 text-xs text-warm-muted whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("zh-CN")}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-warm-text">{log.ip}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                      log.action === "download"
                        ? "bg-green-50 text-green-700"
                        : log.action === "bilingual"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-blue-50 text-blue-700"
                    )}
                  >
                    {log.action === "download" ? "下载" : log.action === "bilingual" ? "双语" : "分析"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-warm-text">{log.platform || "-"}</td>
                <td className="px-4 py-2.5 text-xs text-warm-muted">{log.subtitleLang || "-"}</td>
                <td className="px-4 py-2.5 text-xs">
                  {log.cacheHit ? (
                    <span className="text-green-600 font-medium">命中</span>
                  ) : (
                    <span className="text-warm-muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
