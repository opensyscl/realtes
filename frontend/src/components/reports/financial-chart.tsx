"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Row {
  month: string;
  label: string;
  issued: number;
  collected: number;
  pending: number;
  collection_rate: number;
}

interface CustomTooltipPayload {
  payload?: Row;
  name?: string;
  value?: number;
  color?: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: CustomTooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 text-xs shadow-card">
      <div className="mb-2 font-semibold capitalize">{row.label}</div>
      <div className="space-y-1 tabular-numbers">
        <Row label="Emitido" value={formatCurrency(row.issued)} />
        <Row
          label="Cobrado"
          value={formatCurrency(row.collected)}
          color="text-positive"
        />
        <Row
          label="% Cobro"
          value={`${row.collection_rate}%`}
          color="text-info"
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={color ?? ""}>{value}</span>
    </div>
  );
}

export function FinancialChart({ data, loading }: { data: Row[]; loading: boolean }) {
  if (loading) {
    return <div className="h-72 animate-pulse rounded-2xl bg-surface-muted/50" />;
  }
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-surface-muted)" }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
          />
          <Bar
            yAxisId="left"
            dataKey="issued"
            name="Emitido"
            fill="var(--color-border)"
            radius={[6, 6, 0, 0]}
            barSize={24}
          />
          <Bar
            yAxisId="left"
            dataKey="collected"
            name="Cobrado"
            fill="var(--color-foreground)"
            radius={[6, 6, 0, 0]}
            barSize={24}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="collection_rate"
            name="% Cobro"
            stroke="var(--color-positive)"
            strokeWidth={2}
            dot={{ fill: "var(--color-positive)", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
