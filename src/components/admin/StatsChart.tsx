"use client";

interface StatsChartProps {
  data: { date: string; total: number; download: number }[];
  title?: string;
}

export function StatsChart({ data, title = "7天趋势" }: StatsChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => Math.max(d.total, d.download)), 1);

  return (
    <div className="rounded-2xl border border-warm-border bg-white p-5 shadow-subtle">
      <h3 className="font-semibold text-warm-text mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((day) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse items-center gap-0.5">
              {/* Download bar */}
              <div
                className="w-full rounded-t bg-warm-orange/70 transition-all"
                style={{
                  height: `${(day.download / maxValue) * 120}px`,
                }}
                title={`${day.download} 下载`}
              />
              {/* Total bar */}
              <div
                className="w-full rounded-t bg-warm-accent transition-all"
                style={{
                  height: `${((day.total - day.download) / maxValue) * 120}px`,
                }}
                title={`${day.total} 访问`}
              />
            </div>
            <span className="text-[10px] text-warm-muted">{day.date.slice(5)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-warm-accent" />
          <span className="text-xs text-warm-muted">访问</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-warm-orange/70" />
          <span className="text-xs text-warm-muted">下载</span>
        </div>
      </div>
    </div>
  );
}
