"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("请输入用户名和密码");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "登录失败");
        return;
      }

      localStorage.setItem("admin_token", data.data.token);
      localStorage.setItem("admin_username", data.data.username);
      router.push("/admin");
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-orange text-white font-bold text-xl mb-4">
            SE
          </div>
          <h1 className="text-xl font-bold text-warm-text">管理面板登录</h1>
          <p className="text-sm text-warm-muted mt-1">SubExtract Admin</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl border border-warm-border bg-white p-6 shadow-card space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-text mb-1.5">
              用户名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-muted" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-warm-border pl-10 pr-3 py-2.5 text-sm text-warm-text outline-none focus:border-warm-orange focus:ring-1 focus:ring-warm-orange/30 transition-all"
                placeholder="admin"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-text mb-1.5">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-warm-border pl-10 pr-3 py-2.5 text-sm text-warm-text outline-none focus:border-warm-orange focus:ring-1 focus:ring-warm-orange/30 transition-all"
                placeholder="••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-medium text-white transition-all",
              isLoading
                ? "bg-warm-muted cursor-not-allowed"
                : "bg-warm-orange hover:bg-warm-orange-hover active:scale-[0.98]"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                登录中...
              </span>
            ) : (
              "登录"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-warm-muted">
          <a href="/" className="hover:text-warm-orange transition-colors">
            ← 返回首页
          </a>
        </p>
      </div>
    </div>
  );
}
