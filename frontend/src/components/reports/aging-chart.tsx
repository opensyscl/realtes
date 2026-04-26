"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Bucket {
  label: string;
  count: number;
  amount: number;
}

const COLORS = [
  "var(--color-foreground)",
  "var(--color-info)",
  "var(--color-warning)",
  "var(--color-negative)",
  "var(--color-negative)",
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: Bucket }[];
}) {
  if (!active || !payload?.length) return null;
  const b = payload[0]?.payload;
  if (!b) return null;
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 text-xs shadow-card">
      <div className="mb-1 font-semibold">{b.label}</div>
      <div className="tabular-numbers">{b.count} cargos</div>
      <div className="font-semibold tabular-numbers">{formatCurrency(b.amount)}</div>
    </div>
  );
}

export function AgingChart({
  data,
  loading,
}: {
  data: Bucket[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface-muted/50" />;
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-surface-muted)" }} />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={40}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i] ?? "var(--color-foreground)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
