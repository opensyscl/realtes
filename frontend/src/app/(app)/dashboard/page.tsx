"use client";

import Link from "next/link";
import {
  PropertyNewIcon,
  AnalyticsUpIcon,
  ClockIcon,
  Building03Icon,
  Mail01Icon,
  PlayCircleIcon,
  ArrowRight01Icon,
  CallIcon,
  CheckmarkCircle02Icon,
  Wallet01Icon,
  Coins01Icon,
  CashbackIcon,
  AlertCircleIcon,
  CalendarSetting01Icon,
  ChartLineData01Icon,
  ArrowUpRight01Icon,
  ArrowDownRight01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useAuthStore } from "@/store/auth";
import {
  useDashboardOverview,
  useActivityFeed,
  useContracts,
  useMarketplaceStats,
  useCommissionStats,
  useChargeStats,
} from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: overview, isLoading } = useDashboardOverview();
  const { data: activity } = useActivityFeed();
  const { data: contracts } = useContracts({ per_page: 4 });
  const marketplace = useMarketplaceStats();
  const commissions = useCommissionStats();
  const charges = useChargeStats();

  const k = overview?.kpis;
  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-8">
      {/* Greeting */}
      <div className="mb-7">
        <h1 className="text-3xl font-semibold tracking-tight">
          Hola {firstName} <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Este es tu resumen en{" "}
          <span className="font-medium text-foreground">
            {user?.agency?.name ?? "tu agencia"}
          </span>
          .
        </p>
      </div>

      {/* Promo banner verde estilo AlterEstate */}
      <div className="mb-7 overflow-hidden rounded-3xl border border-positive/20 bg-gradient-to-r from-positive/10 via-positive/5 to-transparent">
        <div className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-positive text-white">
            <Icon icon={Mail01Icon} size={22} />
            <span className="absolute -mt-8 ml-8 h-2.5 w-2.5 rounded-full bg-positive ring-2 ring-surface" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                Comunicación: emails con plantillas y merge tags
              </h3>
              <span className="inline-flex items-center rounded-full bg-positive/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-positive">
                Nuevo
              </span>
            </div>
            <p className="mt-0.5 text-sm text-foreground-muted">
              Conecta plantillas a contratos, cargos y leads. Envío con un click + log
              de cada email.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-surface px-3 py-2 text-xs font-medium text-positive hover:bg-positive/5">
              <Icon icon={PlayCircleIcon} size={13} />
              Ver tutorial
            </button>
            <Link
              href="/comunicacion"
              className="inline-flex items-center gap-1.5 rounded-full bg-positive px-4 py-2 text-xs font-semibold text-white hover:bg-positive/90"
            >
              Ir al módulo
              <Icon icon={ArrowRight01Icon} size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats top — 5 columnas con sparkline, delta chip y gradiente tonal */}
      <div className="mb-3">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            icon={PropertyNewIcon}
            value={k?.properties_active.value}
            label="Propiedades activas"
            sub={k ? `${k.properties_active.value} en cartera` : undefined}
            deltaPct={k?.properties_active.delta_pct}
            trend={k?.properties_active.trend}
            href="/propiedades"
            loading={isLoading}
            tone="neutral"
          />
          <StatCard
            icon={Building03Icon}
            value={k?.properties_active.available}
            label="Disponibles"
            sub="Listas para alquilar"
            href="/propiedades?status=disponible"
            loading={isLoading}
            tone="info"
          />
          <StatCard
            icon={AnalyticsUpIcon}
            value={k?.properties_active.rented ?? k?.active_contracts.value}
            label="Arrendadas"
            sub={k ? `${k.active_contracts.value} contratos vigentes` : undefined}
            deltaPct={k?.active_contracts.delta_pct}
            trend={k?.active_contracts.trend}
            href="/propiedades?status=ocupada"
            loading={isLoading}
            tone="positive"
          />
          <StatCard
            icon={ChartLineData01Icon}
            value={k ? `${k.collection_rate.value}%` : undefined}
            label="Tasa de cobro"
            sub="Cobrado vs facturado"
            deltaPct={k?.collection_rate.delta_pct}
            trend={k?.collection_rate.trend}
            href="/cargos"
            loading={isLoading}
            tone="info"
          />
          <StatCard
            icon={ClockIcon}
            value={charges.data?.overdue_count}
            label="Cargos vencidos"
            sub={
              charges.data
                ? `${formatCurrency(charges.data.total_pending_amount)} pendientes`
                : undefined
            }
            href="/cargos?status=vencido"
            loading={!charges.data}
            tone={charges.data?.overdue_count ? "negative" : "warning"}
          />
        </div>
      </div>

      {/* Sección Colaboraciones (Marketplace cross-broker) */}
      <div className="mb-7">
        <div className="mb-3 mt-7 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Colaboraciones</h2>
          <Link
            href="/marketplace"
            className="text-xs font-medium text-foreground-muted hover:text-foreground"
          >
            Ver red de colaboraciones →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Building03Icon}
            value={marketplace.data?.agencies_sharing}
            label="Agencias colaborando"
            href="/marketplace"
            loading={!marketplace.data}
            tone="info"
          />
          <StatCard
            icon={PropertyNewIcon}
            value={marketplace.data?.available_count}
            label="Propiedades en colaboración"
            sub={
              marketplace.data
                ? `${marketplace.data.my_shared_count} compartidas por ti`
                : undefined
            }
            href="/marketplace"
            loading={!marketplace.data}
            tone="info"
          />
          <StatCard
            icon={CashbackIcon}
            value={commissions.data?.pending_count}
            label="Comisiones pendientes"
            sub={
              commissions.data
                ? formatCurrency(commissions.data.total_pending)
                : undefined
            }
            href="/comisiones"
            loading={!commissions.data}
            tone="warning"
          />
        </div>
      </div>

      {/* Bottom grid: actividades + negocios ganados */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Actividades para hoy */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h3 className="text-sm font-semibold">Actividades para hoy</h3>
            <Link
              href="/visitas"
              className="text-[11px] font-medium text-foreground-muted hover:text-foreground"
            >
              Calendario →
            </Link>
          </div>
          <ul className="max-h-[340px] overflow-y-auto">
            {!activity ? (
              Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="h-16 animate-pulse border-b border-border-subtle bg-surface-muted/30"
                />
              ))
            ) : (activity?.data ?? []).length === 0 ? (
              <li className="px-6 py-12 text-center text-sm text-foreground-muted">
                Sin actividades para hoy.
              </li>
            ) : (
              (activity?.data ?? []).slice(0, 6).map((a, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 border-b border-border-subtle px-6 py-3 last:border-b-0 hover:bg-surface-muted/40"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      a.type === "payment"
                        ? "bg-positive text-white"
                        : a.type === "overdue"
                          ? "bg-negative text-white"
                          : "bg-info text-white",
                    )}
                  >
                    <Icon
                      icon={
                        a.type === "payment"
                          ? Wallet01Icon
                          : a.type === "overdue"
                            ? AlertCircleIcon
                            : CallIcon
                      }
                      size={14}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{a.title}</div>
                    <div className="truncate text-[11px] text-foreground-muted">
                      {a.description}
                    </div>
                  </div>
                  <span className="text-[11px] tabular-numbers text-muted-foreground">
                    {a.time}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>

        {/* Negocios ganados / cierres */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h3 className="text-sm font-semibold">Mis negocios ganados</h3>
            <Link
              href="/contratos?status=vigente"
              className="text-[11px] font-medium text-foreground-muted hover:text-foreground"
            >
              Ver todos →
            </Link>
          </div>
          {!contracts ? (
            <div className="p-6">
              <div className="h-32 animate-pulse rounded-2xl bg-surface-muted/40" />
            </div>
          ) : contracts.data.length === 0 ? (
            <EmptyClosings />
          ) : (
            <ul>
              {contracts.data.slice(0, 4).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 border-b border-border-subtle px-6 py-3.5 last:border-b-0 hover:bg-surface-muted/40"
                >
                  <Avatar
                    name={c.tenant?.full_name ?? "?"}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/contratos/${c.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {c.code} · {c.property?.title}
                    </Link>
                    <div className="truncate text-[11px] text-foreground-muted">
                      {c.tenant?.full_name ?? "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-numbers">
                      {formatCurrency(c.monthly_rent)}
                    </div>
                    <div className="text-[10px] text-positive">/mes</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Suprime warning */}
      <span className="hidden">
        <Icon icon={Coins01Icon} size={1} />
        <Icon icon={CheckmarkCircle02Icon} size={1} />
        <Icon icon={CalendarSetting01Icon} size={1} />
      </span>
    </div>
  );
}

// ---------------- StatCard estilo AlterEstate ----------------
type Tone = "neutral" | "positive" | "warning" | "info" | "negative";

function StatCard({
  icon,
  value,
  label,
  sub,
  href,
  loading,
  tone = "neutral",
  deltaPct,
  trend,
}: {
  icon: IconSvgElement;
  value: number | string | undefined;
  label: string;
  sub?: string;
  href?: string;
  loading?: boolean;
  tone?: Tone;
  deltaPct?: number;
  trend?: number[];
}) {
  const toneVar = {
    neutral: "var(--color-foreground-muted)",
    positive: "var(--color-positive)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
    negative: "var(--color-negative)",
  }[tone];

  const iconBg = {
    neutral: "bg-surface-muted text-foreground",
    positive: "bg-positive-soft text-positive",
    warning: "bg-warning-soft text-warning",
    info: "bg-info-soft text-info",
    negative: "bg-negative-soft text-negative",
  }[tone];

  const ringHover = {
    neutral: "group-hover:ring-foreground-muted/20",
    positive: "group-hover:ring-positive/30",
    warning: "group-hover:ring-warning/30",
    info: "group-hover:ring-info/30",
    negative: "group-hover:ring-negative/30",
  }[tone];

  const card = (
    <Card
      className={cn(
        "group relative isolate overflow-hidden p-5",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.18)]",
        "ring-1 ring-transparent",
        ringHover,
      )}
    >
      {/* glow tonal en esquina */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 z-0 h-32 w-32 rounded-full opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: toneVar, opacity: 0.08 }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${toneVar}55, transparent)`,
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div
            className={cn(
              "mt-2 text-[28px] font-semibold leading-none tracking-tight tabular-numbers",
              loading && "animate-pulse text-muted-foreground/40",
            )}
          >
            {loading ? "···" : (value ?? 0)}
          </div>
          {sub && (
            <div className="mt-1.5 line-clamp-1 text-[11px] text-muted-foreground tabular-numbers">
              {sub}
            </div>
          )}
        </div>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:-rotate-3 group-hover:scale-110",
            iconBg,
          )}
        >
          <Icon icon={icon} size={18} />
        </span>
      </div>

      {(deltaPct !== undefined || trend) && (
        <div className="relative z-10 mt-4 flex items-end justify-between gap-3">
          {deltaPct !== undefined ? (
            <DeltaChip pct={deltaPct} />
          ) : (
            <span />
          )}
          {trend && trend.length > 1 && (
            <Sparkline values={trend} color={toneVar} />
          )}
        </div>
      )}
    </Card>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

// ---------------- Sparkline inline SVG ----------------
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 64;
  const h = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`)
    .join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  const id = `sg-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill={`url(#${id})`} stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------- Delta chip con flecha ----------------
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

function EmptyClosings() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="relative mb-4 h-24 w-24">
        {/* Illustration simple inline */}
        <div className="absolute inset-x-3 bottom-0 h-12 rounded-2xl bg-positive-soft" />
        <div className="absolute left-1/2 top-3 h-12 w-12 -translate-x-1/2 rounded-full bg-warning/30" />
        <div className="absolute left-1/2 top-5 h-8 w-8 -translate-x-1/2 rounded-full bg-warning" />
        <div className="absolute left-1/2 top-7 -translate-x-1/2 text-base font-bold text-warning-foreground">
          €
        </div>
      </div>
      <h4 className="font-semibold">Aún no has registrado tu primer cierre</h4>
      <p className="mt-1 max-w-xs text-sm text-foreground-muted">
        Cuando firmes un contrato y el lead se convierta en cliente, aparecerá aquí.
      </p>
      <Link
        href="/leads"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-accent-foreground hover:bg-foreground/90"
      >
        Ver leads
        <Icon icon={ArrowRight01Icon} size={12} />
      </Link>
    </div>
  );
}
