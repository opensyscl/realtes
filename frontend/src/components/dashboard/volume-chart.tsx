"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Tooltip,
} from "recharts";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  Calendar01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { useActivityVolume } from "@/lib/queries";

interface TooltipPayload {
  payload?: { day?: string; value?: number };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const { day, value } = payload[0].payload ?? {};
  return (
    <div className="rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-medium text-accent-foreground tabular-numbers">
      {day} : {value}
    </div>
  );
}

export function VolumeChart() {
  const { data, isLoading } = useActivityVolume();
  const [hovered, setHovered] = useState<number | null>(null);

  const rows = data?.data ?? [];
  const maxIdx = rows.reduce(
    (m, r, i) => (r.value > (rows[m]?.value ?? -Infinity) ? i : m),
    0,
  );
  const visualHovered = hovered ?? (rows.length ? maxIdx : null);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground-muted">
          Volumen de actividad
        </h3>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-surface-muted">
          <Icon icon={Calendar01Icon} size={13} />
          Última semana
          <Icon icon={ArrowDown01Icon} size={12} />
        </button>
      </div>

      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-3xl font-semibold tracking-tight tabular-numbers">
          {isLoading
            ? "···"
            : (data?.total ?? 0).toLocaleString("es-ES")}
        </div>
        <span className="text-xs font-medium text-foreground-muted">
          eventos (cargos · pagos · contratos)
        </span>
      </div>

      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 24, right: 8, bottom: 0, left: -16 }}
            onMouseLeave={() => setHovered(null)}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
              orientation="right"
              domain={[0, "dataMax + 50"]}
              allowDecimals={false}
            />
            <Tooltip
              cursor={false}
              content={<CustomTooltip />}
              wrapperStyle={{ outline: "none" }}
            />
            {visualHovered !== null && rows[visualHovered] && (
              <ReferenceLine
                y={rows[visualHovered].value}
                stroke="var(--color-foreground)"
                strokeDasharray="3 3"
                strokeOpacity={0.6}
              />
            )}
            <Bar
              dataKey="value"
              radius={[8, 8, 8, 8]}
              barSize={36}
              onMouseEnter={(_, i) => setHovered(i)}
            >
              {rows.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    visualHovered === i
                      ? "var(--color-foreground)"
                      : "var(--color-border)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
