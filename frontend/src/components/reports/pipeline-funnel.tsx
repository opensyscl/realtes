"use client";

import { cn, formatCurrency } from "@/lib/utils";

interface Stage {
  stage_id: number;
  name: string;
  is_won: boolean;
  is_lost: boolean;
  count: number;
  value: number;
}

export function PipelineFunnel({
  data,
  loading,
}: {
  data: Stage[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="h-44 animate-pulse rounded-2xl bg-surface-muted/50" />;
  }
  if (data.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-foreground-muted">Sin datos.</div>
    );
  }
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      {data.map((s) => {
        const widthPct = Math.max(8, Math.round((s.count / max) * 100));
        const color = s.is_won
          ? "bg-positive"
          : s.is_lost
            ? "bg-negative/60"
            : "bg-foreground";
        return (
          <div key={s.stage_id} className="flex items-center gap-3">
            <div className="w-32 shrink-0 truncate text-xs font-medium text-foreground-muted">
              {s.name}
            </div>
            <div className="relative h-8 flex-1 overflow-hidden rounded-full bg-surface-muted/60">
              <div
                className={cn("h-full rounded-full transition-all", color)}
                style={{ width: `${widthPct}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-3 text-xs">
                <span className="font-semibold tabular-numbers text-accent-foreground mix-blend-difference">
                  {s.count}
                </span>
                <span className="font-medium tabular-numbers text-foreground-muted mix-blend-difference">
                  {formatCurrency(s.value)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
