"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Trash2,
  LogOut,
  Users,
  TrendingUp,
  HardDrive,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStats {
  overview: {
    totalAccessLogs: number;
    totalDownloads: number;
    totalBilingual: number;
    uniqueIPs: number;
    cacheHitRate: string;
  };
  cache: {
    totalEntries: number;
    totalSize: number;
    totalHits: number;
  };
  platformDistribution: { platform: string; _count: number }[];
  dailyStats: { date: string; total: number; download: number }[];
  recentLogs: {
    id: string;
    ip: string;
    platform: string;
    action: string;
    subtitleLang?: string;
    cacheHit: boolean;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "cache" | "logs">("dashboard");

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("admin_token");
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    router.push("/admin/login");
  };

  const fetchStats = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || "获取数据失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, router]);

  const clearCache = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch("/api/admin/cache", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message || "缓存已清理");
      fetchStats();
    } catch {
      alert("清理缓存失败");
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-bg">
        <div className="flex gap-1.5">
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-warm-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-orange text-white font-bold text-xs">
              SE
            </div>
            <span className="font-semibold text-sm text-warm-text">管理面板</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-lg px-3 py-1.5 text-xs text-warm-muted hover:text-warm-text transition-colors"
            >
              返回首页
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6">
          {[
            { key: "dashboard", label: "仪表盘", icon: LayoutDashboard },
            { key: "cache", label: "缓存管理", icon: HardDrive },
            { key: "logs", label: "访问日志", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-warm-orange text-white"
                  : "text-warm-muted hover:bg-warm-accent"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "总访问量", value: stats.overview.totalAccessLogs, icon: Users, color: "text-blue-500" },
                { label: "总下载量", value: stats.overview.totalDownloads, icon: TrendingUp, color: "text-green-500" },
                { label: "双语字幕", value: stats.overview.totalBilingual, icon: BarChart3, color: "text-purple-500" },
                { label: "独立IP", value: stats.overview.uniqueIPs, icon: Activity, color: "text-orange-500" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-warm-border bg-white p-5 shadow-subtle"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-warm-muted">{card.label}</span>
                    <card.icon className={cn("h-5 w-5", card.color)} />
                  </div>
                  <p className="text-2xl font-bold text-warm-text">
                    {card.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Cache status */}
            <div className="rounded-2xl border border-warm-border bg-white p-5 shadow-subtle">
              <h3 className="font-semibold text-warm-text mb-4">缓存状态</h3>
              <div className="grid gap-4 sm:grid-cols-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-warm-orange">{stats.cache.totalEntries}</p>
                  <p className="text-xs text-warm-muted">缓存条目</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warm-text">
                    {(stats.cache.totalSize / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-warm-muted">总大小</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.overview.cacheHitRate}</p>
                  <p className="text-xs text-warm-muted">命中率</p>
                </div>
              </div>
            </div>

            {/* Daily Stats */}
            {stats.dailyStats.length > 0 && (
              <div className="rounded-2xl border border-warm-border bg-white p-5 shadow-subtle">
                <h3 className="font-semibold text-warm-text mb-4">最近7天趋势</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-warm-muted">
                        <th className="pb-3 pr-4">日期</th>
                        <th className="pb-3 pr-4">访问量</th>
                        <th className="pb-3 pr-4">下载量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.dailyStats.map((day) => (
                        <tr key={day.date} className="border-t border-warm-border">
                          <td className="py-2.5 pr-4 font-medium">{day.date}</td>
                          <td className="py-2.5 pr-4">{day.total}</td>
                          <td className="py-2.5 pr-4">{day.download}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cache Tab */}
        {activeTab === "cache" && stats && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-warm-text">缓存列表 ({stats.cache.totalEntries})</h3>
              <button
                onClick={clearCache}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                清理过期缓存
              </button>
            </div>
            <p className="text-sm text-warm-muted">
              缓存命中率: {stats.overview.cacheHitRate} | 总大小: {(stats.cache.totalSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && stats && (
          <div className="space-y-4">
            <h3 className="font-semibold text-warm-text">最近访问日志</h3>
            <div className="overflow-x-auto rounded-2xl border border-warm-border bg-white shadow-subtle">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-warm-muted bg-warm-accent/50">
                    <th className="px-4 py-3">时间</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">操作</th>
                    <th className="px-4 py-3">平台</th>
                    <th className="px-4 py-3">语言</th>
                    <th className="px-4 py-3">缓存</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLogs.map((log) => (
                    <tr key={log.id} className="border-t border-warm-border">
                      <td className="px-4 py-2.5 text-xs text-warm-muted whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("zh-CN")}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs">{log.ip}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn(
                          "inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                          log.action === "download"
                            ? "bg-green-50 text-green-700"
                            : log.action === "bilingual"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-blue-700"
                        )}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs">{log.platform || "-"}</td>
                      <td className="px-4 py-2.5 text-xs">{log.subtitleLang || "-"}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn(
                          "text-[10px]",
                          log.cacheHit ? "text-green-600" : "text-warm-muted"
                        )}>
                          {log.cacheHit ? "✓ 命中" : "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
