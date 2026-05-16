"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown01Icon,
  ArrowDownRight01Icon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  ChartLineData01Icon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useActivityVolume, type DashboardPeriod } from "@/lib/queries";
import { cn, formatNumber } from "@/lib/utils";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Este trimestre" },
];

type Row = { day: string; date: string; value: number };

/**
 * Card "Volumen de actividad": gráfico de barras con eje Y, línea de referencia
 * sobre la barra activa y dropdown de período propio (controla solo este chart).
 */
export function VolumeChart() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const { data, isLoading } = useActivityVolume(period);

  const rows: Row[] = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? 0;
  const deltaPct = data?.delta_pct ?? 0;

  const { max, ticks } = useMemo(
    () => niceScale(Math.max(...rows.map((r) => r.value), 0)),
    [rows],
  );

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon
            icon={ChartLineData01Icon}
            size={15}
            className="text-foreground-muted"
          />
          <h3 className="text-sm font-semibold">Volumen de actividad</h3>
        </div>
        <PeriodPicker value={period} onChange={setPeriod} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[32px] font-semibold leading-none tracking-tight tabular-nums">
          {isLoading ? "···" : formatNumber(total)}
        </span>
        <DeltaChip pct={deltaPct} />
        <span className="text-[11px] text-muted-foreground">
          vs período anterior
        </span>
      </div>

      <VolumeBars rows={rows} max={max} ticks={ticks} loading={isLoading} />
    </Card>
  );
}

// ============================================================
// Dropdown de período
// ============================================================
function PeriodPicker({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (p: DashboardPeriod) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = PERIODS.find((p) => p.value === value) ?? PERIODS[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:bg-surface-muted">
        <Icon icon={Calendar03Icon} size={13} />
        {current.label}
        <Icon
          icon={ArrowDown01Icon}
          size={13}
          className="text-muted-foreground"
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44">
        <div className="flex flex-col gap-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                onChange(p.value);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-surface-muted",
                p.value === value
                  ? "font-medium text-foreground"
                  : "text-foreground-muted",
              )}
            >
              {p.label}
              {p.value === value && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================
// Chip de delta
// ============================================================
function DeltaChip({ pct }: { pct: number }) {
  const flat = pct === 0;
  const up = pct > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        flat
          ? "bg-surface-muted text-foreground-muted"
          : up
            ? "bg-positive-soft text-positive"
            : "bg-negative-soft text-negative",
      )}
    >
      {!flat && (
        <Icon icon={up ? ArrowUpRight01Icon : ArrowDownRight01Icon} size={11} />
      )}
      {up ? "+" : ""}
      {pct}%
    </span>
  );
}

// ============================================================
// Barras + eje Y + grilla + línea de la barra activa
// ============================================================
function VolumeBars({
  rows,
  max,
  ticks,
  loading,
}: {
  rows: Row[];
  max: number;
  ticks: number[];
  loading: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);

  if (loading || rows.length === 0) {
    return (
      <div className="mt-6 h-[230px] animate-pulse rounded-2xl bg-surface-muted/40" />
    );
  }

  const peak = rows.reduce((b, r, i) => (r.value > rows[b].value ? i : b), 0);
  const activeIdx = hover ?? peak;
  const activeValue = rows[activeIdx]?.value ?? 0;

  return (
    <div className="mt-6">
      <div className="relative h-[230px]">
        {/* Región del gráfico (deja un canal a la derecha para el eje Y) */}
        <div className="absolute inset-y-0 left-0 right-10">
          {/* Trama diagonal decorativa en la mitad superior */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-60"
            style={{
              background:
                "repeating-linear-gradient(135deg, transparent 0 6px, var(--color-border-subtle) 6px 7px)",
            }}
          />

          {/* Líneas de grilla */}
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-border-subtle"
              style={{ bottom: `${(t / max) * 100}%` }}
            />
          ))}

          {/* Barras */}
          <div className="absolute inset-0 flex items-end gap-2 sm:gap-3">
            {rows.map((r, i) => {
              const h = r.value > 0 ? Math.max((r.value / max) * 100, 2) : 0;
              const active = i === activeIdx;
              return (
                <div
                  key={r.date}
                  className="relative flex h-full flex-1 items-end"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div
                    className={cn(
                      "mx-auto w-full max-w-[54px] rounded-t-md transition-colors duration-150",
                      active ? "bg-foreground" : "bg-surface-muted",
                    )}
                    style={{ height: `${h}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Línea de referencia sobre la barra activa */}
          <div
            className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-foreground/50"
            style={{ bottom: `${(activeValue / max) * 100}%` }}
          />

          {/* Tooltip de la barra activa, anclado a la línea */}
          {rows[activeIdx] && (
            <div
              className="pointer-events-none absolute z-20 flex"
              style={{
                left: `${((activeIdx + 0.5) / rows.length) * 100}%`,
                bottom: `calc(${(activeValue / max) * 100}% + 6px)`,
              }}
            >
              <span className="-translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[10px] font-medium text-accent-foreground">
                {rows[activeIdx].day} : {formatNumber(activeValue)}
              </span>
            </div>
          )}
        </div>

        {/* Eje Y (a la derecha) */}
        <div className="absolute inset-y-0 right-0 w-10">
          {ticks.map((t) =>
            t === 0 ? null : (
              <span
                key={t}
                className="absolute right-0 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground"
                style={{ bottom: `${(t / max) * 100}%` }}
              >
                {formatNumber(t)}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Etiquetas del eje X */}
      <div className="mt-2 flex gap-2 pr-10 sm:gap-3">
        {rows.map((r, i) => (
          <span
            key={r.date}
            className={cn(
              "flex-1 text-center text-[11px] tabular-nums",
              i === activeIdx
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            {r.day}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Escala "linda" para el eje Y: pasos de 1/2/5 × 10ⁿ, ~4 divisiones
// ============================================================
function niceScale(maxValue: number): { max: number; ticks: number[] } {
  const m = Math.max(maxValue, 1);
  const rough = m / 4;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const factor = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  const step = Math.max(1, factor * mag);
  const max = Math.ceil(m / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= max + step / 2; t += step) ticks.push(Math.round(t));
  return { max, ticks };
}
