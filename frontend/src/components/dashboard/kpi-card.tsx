"use client";

import { ResponsiveContainer, LineChart, Line } from "recharts";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { IconSvgElement } from "@hugeicons/react";

interface KpiCardProps {
  label: string;
  value: string;
  delta: { value: string; positive: boolean };
  trend: number[];
  icon: IconSvgElement;
  loading?: boolean;
}

export function KpiCard({ label, value, delta, trend, icon, loading }: KpiCardProps) {
  const data = (trend ?? []).map((y, i) => ({ i, y }));
  const stroke = delta.positive ? "var(--color-positive)" : "var(--color-negative)";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground-muted">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle text-foreground-muted">
          <Icon icon={icon} size={14} />
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <div
            className={cn(
              "text-3xl font-semibold tracking-tight tabular-numbers",
              loading && "animate-pulse text-muted-foreground/50",
            )}
          >
            {loading ? "···" : value}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "font-medium",
                delta.positive ? "text-positive" : "text-negative",
              )}
            >
              {delta.positive ? "+" : ""}
              {delta.value}
            </span>
            <span className="text-muted-foreground">vs mes anterior</span>
          </div>
        </div>

        <div className="h-12 w-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 0, bottom: 4, left: 0 }}>
              <Line
                type="monotone"
                dataKey="y"
                stroke={stroke}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
