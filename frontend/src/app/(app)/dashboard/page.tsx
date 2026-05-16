"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PropertyNewIcon,
  ChartLineData01Icon,
  Calendar03Icon,
  ArrowUpRight01Icon,
  ArrowDownRight01Icon,
  Wallet01Icon,
  AlertCircleIcon,
  Agreement02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { EconomicIndicators } from "@/components/dashboard/economic-indicators";
import { useAuthStore } from "@/store/auth";
import {
  useDashboardOverview,
  useActivityVolume,
  useActivityFeed,
  useCharges,
} from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: overview, isLoading } = useDashboardOverview();
  const { data: volume } = useActivityVolume();
  const { data: feed } = useActivityFeed();
  const { data: charges } = useCharges({ per_page: 6 });

  const k = overview?.kpis;
  const firstName = user?.name?.split(" ")[0] ?? "";
  const periodo = new Date().toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-8">
      {/* Indicadores económicos chilenos (UF, UTM, USD, EUR) */}
      <EconomicIndicators />

      {/* Greeting */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Hola {firstName} <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Este es el resumen de{" "}
            <span className="font-medium text-foreground">
              {user?.agency?.name ?? "tu agencia"}
            </span>
            .
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium capitalize text-foreground-muted">
          <Icon icon={Calendar03Icon} size={13} />
          {periodo}
        </span>
      </div>

      {/* Grid principal: izq (KPIs + gráfico) · der (novedades) */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-3">
          {/* 3 KPI cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              icon={PropertyNewIcon}
              label="Propiedades"
              value={k?.properties_active.value}
              sub={
                k ? `${k.properties_active.available} disponibles` : undefined
              }
              deltaPct={k?.properties_active.delta_pct}
              trend={k?.properties_active.trend}
              loading={isLoading}
              href="/propiedades"
            />
            <KpiCard
              icon={Agreement02Icon}
              label="Contratos vigentes"
              value={k?.active_contracts.value}
              sub="Arriendos activos"
              deltaPct={k?.active_contracts.delta_pct}
              trend={k?.active_contracts.trend}
              loading={isLoading}
              href="/contratos?status=vigente"
            />
            <KpiCard
              icon={ChartLineData01Icon}
              label="Tasa de cobro"
              value={k ? `${k.collection_rate.value}%` : undefined}
              sub="Cobrado vs facturado"
              deltaPct={k?.collection_rate.delta_pct}
              trend={k?.collection_rate.trend}
              loading={isLoading}
              href="/cargos"
            />
          </div>

          {/* Gráfico de actividad semanal */}
          <ActivityChart
            data={volume?.data}
            total={volume?.total}
          />
        </div>

        {/* Panel lateral: últimas novedades */}
        <UpdatesPanel items={feed?.data} />
      </div>

      {/* Tabla: seguimiento de cobros */}
      <ChargesTable charges={charges?.data} />
    </div>
  );
}

// ============================================================
// KPI card estilo Kravio
// ============================================================
function KpiCard({
  icon,
  label,
  value,
  sub,
  deltaPct,
  trend,
  loading,
  href,
}: {
  icon: IconSvgElement;
  label: string;
  value: number | string | undefined;
  sub?: string;
  deltaPct?: number;
  trend?: number[];
  loading?: boolean;
  href?: string;
}) {
  const tone =
    deltaPct === undefined || deltaPct === 0
      ? "neutral"
      : deltaPct > 0
        ? "positive"
        : "negative";
  const sparkColor = {
    neutral: "var(--color-foreground-muted)",
    positive: "var(--color-positive)",
    negative: "var(--color-negative)",
  }[tone];

  const card = (
    <Card
      className={cn(
        "group h-full p-5 transition-all duration-300 ease-out",
        href && "hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.16)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
          <Icon icon={icon} size={15} />
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div
            className={cn(
              "text-[32px] font-semibold leading-none tracking-tight tabular-numbers",
              loading && "animate-pulse text-muted-foreground/40",
            )}
          >
            {loading ? "···" : (value ?? 0)}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {deltaPct !== undefined && <DeltaChip pct={deltaPct} />}
            <span className="text-[11px] text-muted-foreground">
              {sub ?? "vs mes pasado"}
            </span>
          </div>
        </div>
        {trend && trend.length > 1 && (
          <Sparkline values={trend} color={sparkColor} width={104} height={42} />
        )}
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

// ============================================================
// Sparkline SVG (área + línea)
// ============================================================
function Sparkline({
  values,
  color,
  width = 64,
  height = 22,
}: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  const pad = 2;
  const points = values
    .map((v, i) => {
      const x = (i * step).toFixed(1);
      const y = (
        height - pad - ((v - min) / range) * (height - pad * 2)
      ).toFixed(1);
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const id = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill={`url(#${id})`} stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================
// Delta chip con flecha
// ============================================================
function DeltaChip({ pct }: { pct: number }) {
  const isUp = pct > 0;
  const isFlat = pct === 0;
  const cls = isFlat
    ? "bg-surface-muted text-foreground-muted"
    : isUp
      ? "bg-positive-soft text-positive"
      : "bg-negative-soft text-negative";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-numbers",
        cls,
      )}
    >
      {!isFlat && (
        <Icon icon={isUp ? ArrowUpRight01Icon : ArrowDownRight01Icon} size={10} />
      )}
      {isUp ? "+" : ""}
      {pct}%
    </span>
  );
}

// ============================================================
// Gráfico de actividad semanal (barras)
// ============================================================
function ActivityChart({
  data,
  total,
}: {
  data?: { day: string; date: string; value: number }[];
  total?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const rows = data ?? [];
  const max = Math.max(...rows.map((r) => r.value), 1);
  const peakIdx = rows.reduce(
    (best, r, i) => (r.value > (rows[best]?.value ?? -1) ? i : best),
    0,
  );

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Icon
              icon={ChartLineData01Icon}
              size={15}
              className="text-foreground-muted"
            />
            <h3 className="text-sm font-semibold">Actividad de la semana</h3>
          </div>
          <div className="mt-3 text-[28px] font-semibold leading-none tracking-tight tabular-numbers">
            {total ?? 0}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Cargos, pagos y contratos de los últimos 7 días
          </p>
        </div>
      </div>

      {/* Barras */}
      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="h-[200px] animate-pulse rounded-2xl bg-surface-muted/40" />
        ) : (
          <div className="flex h-[200px] items-end gap-2 sm:gap-3">
            {rows.map((r, i) => {
              const pct = Math.max((r.value / max) * 100, 3);
              const active = hover === i || (hover === null && i === peakIdx);
              return (
                <div
                  key={r.date}
                  className="flex flex-1 flex-col items-center gap-2"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div className="relative flex w-full flex-1 items-end">
                    {active && (
                      <span className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[10px] font-medium text-accent-foreground">
                        {r.day}: {r.value}
                      </span>
                    )}
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-colors duration-150",
                        active
                          ? "bg-foreground"
                          : "bg-surface-muted group-hover:bg-surface-muted",
                      )}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] tabular-numbers",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {r.day}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// Panel lateral: últimas novedades
// ============================================================
type FeedItem = {
  type: string;
  title: string;
  description: string;
  time: string | null;
};

function UpdatesPanel({ items }: { items?: FeedItem[] }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden lg:col-span-1">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <h3 className="text-sm font-semibold">Últimas novedades</h3>
        <Link
          href="/notificaciones"
          className="text-[11px] font-medium text-foreground-muted hover:text-foreground"
        >
          Ver todo →
        </Link>
      </div>
      {!items ? (
        <div className="space-y-px">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse border-b border-border-subtle bg-surface-muted/30"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-foreground-muted">
          Sin novedades recientes.
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {items.map((a, i) => (
            <li
              key={i}
              className="flex items-start gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0 hover:bg-surface-muted/40"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  a.type === "payment"
                    ? "bg-positive-soft text-positive"
                    : a.type === "overdue"
                      ? "bg-negative-soft text-negative"
                      : "bg-info-soft text-info",
                )}
              >
                <Icon
                  icon={
                    a.type === "payment"
                      ? Wallet01Icon
                      : a.type === "overdue"
                        ? AlertCircleIcon
                        : Agreement02Icon
                  }
                  size={14}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">{a.title}</div>
                <div className="truncate text-[11px] text-foreground-muted">
                  {a.description}
                </div>
              </div>
              {a.time && (
                <span className="shrink-0 text-[11px] tabular-numbers text-muted-foreground">
                  {a.time}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ============================================================
// Tabla: seguimiento de cobros
// ============================================================
type ChargeRow = {
  id: number;
  code: string;
  concept: string;
  description: string | null;
  amount: number;
  due_date: string;
  status: string;
  contract?: { id: number; code: string };
  person?: { id: number; full_name: string };
};

const CHARGE_STATUS: Record<
  string,
  { label: string; cls: string }
> = {
  pagado: { label: "Pagado", cls: "bg-positive-soft text-positive" },
  pendiente: { label: "Pendiente", cls: "bg-surface-muted text-foreground-muted" },
  vencido: { label: "Vencido", cls: "bg-negative-soft text-negative" },
  parcial: { label: "Parcial", cls: "bg-warning-soft text-warning" },
};

function ChargesTable({ charges }: { charges?: ChargeRow[] }) {
  return (
    <Card className="mt-4 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <h3 className="text-sm font-semibold">Seguimiento de cobros</h3>
        <Link
          href="/cargos"
          className="text-[11px] font-medium text-foreground-muted hover:text-foreground"
        >
          Ver todos los cargos →
        </Link>
      </div>

      {!charges ? (
        <div className="p-6">
          <div className="h-40 animate-pulse rounded-2xl bg-surface-muted/40" />
        </div>
      ) : charges.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-foreground-muted">
          No hay cargos registrados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Concepto</th>
                <th className="px-6 py-3">Inquilino</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Vencimiento</th>
                <th className="px-6 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((c) => {
                const st = CHARGE_STATUS[c.status] ?? CHARGE_STATUS.pendiente;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40"
                  >
                    <td className="px-6 py-3.5 font-mono text-[12px] text-foreground-muted">
                      {c.code}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium capitalize">{c.concept}</div>
                      {c.description && (
                        <div className="truncate text-[11px] text-foreground-muted">
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-foreground-muted">
                      {c.person?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                          st.cls,
                        )}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 tabular-numbers text-foreground-muted">
                      {formatDate(c.due_date)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold tabular-numbers">
                      {formatCurrency(c.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
