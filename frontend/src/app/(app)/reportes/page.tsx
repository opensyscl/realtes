"use client";

import { useState } from "react";
import {
  AnalyticsUpIcon,
  Coins01Icon,
  AlertCircleIcon,
  PropertyNewIcon,
  RankingIcon,
  UserGroup02Icon,
  ZapIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import {
  useFinancialReport,
  useAgingReport,
  usePropertiesRevenueReport,
  usePipelineConversionReport,
  useAgentsPerformanceReport,
  useGenerateCharges,
} from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";
import { FinancialChart } from "@/components/reports/financial-chart";
import { AgingChart } from "@/components/reports/aging-chart";
import { PipelineFunnel } from "@/components/reports/pipeline-funnel";

type TabId = "financial" | "morosidad" | "propiedades" | "pipeline" | "agentes";

const TABS: { id: TabId; label: string; icon: Parameters<typeof Icon>[0]["icon"] }[] = [
  { id: "financial", label: "Financiero", icon: Coins01Icon },
  { id: "morosidad", label: "Morosidad", icon: AlertCircleIcon },
  { id: "propiedades", label: "Propiedades", icon: PropertyNewIcon },
  { id: "pipeline", label: "Pipeline", icon: RankingIcon },
  { id: "agentes", label: "Agentes", icon: UserGroup02Icon },
];

export default function ReportsPage() {
  const [tab, setTab] = useState<TabId>("financial");

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Icon icon={AnalyticsUpIcon} size={13} />
            Reportes
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Inteligencia operacional
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Flujo financiero, morosidad, ocupación, conversión y rendimiento de agentes.
          </p>
        </div>
        {tab === "financial" && <GenerateChargesButton />}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground",
            )}
          >
            <Icon icon={t.icon} size={14} />
            {t.label}
            {tab === t.id && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {tab === "financial" && <FinancialTab />}
      {tab === "morosidad" && <MorosidadTab />}
      {tab === "propiedades" && <PropertiesTab />}
      {tab === "pipeline" && <PipelineTab />}
      {tab === "agentes" && <AgentsTab />}
    </div>
  );
}

// ----------------- Financial Tab -----------------
function FinancialTab() {
  const [months, setMonths] = useState(12);
  const { data, isLoading } = useFinancialReport(months);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={Coins01Icon}
          label="Total emitido"
          value={data ? formatCurrency(data.summary.total_issued) : "—"}
          loading={isLoading}
        />
        <KpiCard
          icon={CheckmarkCircle02Icon}
          tone="positive"
          label="Total cobrado"
          value={data ? formatCurrency(data.summary.total_collected) : "—"}
          loading={isLoading}
        />
        <KpiCard
          icon={AnalyticsUpIcon}
          tone="info"
          label="Tasa de cobro media"
          value={data ? `${data.summary.avg_collection_rate}%` : "—"}
          loading={isLoading}
        />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Flujo mensual</h3>
          <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs">
            {[6, 12, 24].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-medium",
                  months === m
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground-muted hover:text-foreground",
                )}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
        <FinancialChart data={data?.data ?? []} loading={isLoading} />
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border-subtle px-6 py-4">
          <h3 className="text-sm font-semibold">Detalle</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
                <th className="h-11 px-6 text-left">Mes</th>
                <th className="h-11 px-6 text-right">Emitido</th>
                <th className="h-11 px-6 text-right">Cobrado</th>
                <th className="h-11 px-6 text-right">Pendiente</th>
                <th className="h-11 px-6 text-right">Cobro</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((row) => (
                <tr
                  key={row.month}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="h-12 px-6 capitalize">{row.label}</td>
                  <td className="h-12 px-6 text-right tabular-numbers">
                    {formatCurrency(row.issued)}
                  </td>
                  <td className="h-12 px-6 text-right tabular-numbers text-positive">
                    {formatCurrency(row.collected)}
                  </td>
                  <td className="h-12 px-6 text-right tabular-numbers">
                    {formatCurrency(row.pending)}
                  </td>
                  <td className="h-12 px-6 text-right">
                    <Badge
                      variant={
                        row.collection_rate >= 90
                          ? "positive"
                          : row.collection_rate >= 70
                            ? "info"
                            : "warning"
                      }
                    >
                      {row.collection_rate}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ----------------- Morosidad Tab -----------------
function MorosidadTab() {
  const { data, isLoading } = useAgingReport();

  return (
    <div className="space-y-4">
      <KpiCard
        icon={AlertCircleIcon}
        tone="negative"
        label="Total pendiente de cobro"
        value={data ? formatCurrency(data.total_pending) : "—"}
        loading={isLoading}
        big
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold">Aging — días desde vencimiento</h3>
          <AgingChart data={data?.buckets ?? []} loading={isLoading} />
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border-subtle px-6 py-4">
            <h3 className="text-sm font-semibold">Top deudores</h3>
          </div>
          <ul className="divide-y divide-border-subtle">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="h-14 animate-pulse bg-surface-muted/40" />
                ))
              : (data?.top_debtors ?? []).slice(0, 8).map((d) => (
                  <li key={d.person_id} className="flex items-center gap-3 px-6 py-3">
                    <Avatar name={d.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{d.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {d.email ?? d.phone ?? "—"} · {d.charges_count} cargos
                      </div>
                    </div>
                    <span className="text-sm font-semibold tabular-numbers text-negative">
                      {formatCurrency(d.total_owed)}
                    </span>
                  </li>
                ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ----------------- Properties Tab -----------------
function PropertiesTab() {
  const { data, isLoading } = usePropertiesRevenueReport();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <KpiCard
          icon={PropertyNewIcon}
          label="Total propiedades"
          value={data ? data.occupancy.total.toString() : "—"}
          loading={isLoading}
        />
        <KpiCard
          icon={PropertyNewIcon}
          tone="positive"
          label="Disponibles"
          value={data ? data.occupancy.available.toString() : "—"}
          loading={isLoading}
        />
        <KpiCard
          icon={PropertyNewIcon}
          tone="info"
          label="Ocupadas"
          value={data ? data.occupancy.occupied.toString() : "—"}
          loading={isLoading}
        />
        <KpiCard
          icon={AnalyticsUpIcon}
          label="Ocupación"
          value={data ? `${data.occupancy.occupancy_rate}%` : "—"}
          loading={isLoading}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border-subtle px-6 py-4">
          <h3 className="text-sm font-semibold">Top propiedades por ingresos (12 meses)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
                <th className="h-11 px-6 text-left">#</th>
                <th className="h-11 px-6 text-left">Propiedad</th>
                <th className="h-11 px-6 text-left">Ciudad</th>
                <th className="h-11 px-6 text-right">Pagos</th>
                <th className="h-11 px-6 text-right">Cobrado</th>
              </tr>
            </thead>
            <tbody>
              {(data?.top_properties ?? []).map((p, i) => (
                <tr
                  key={p.id}
                  className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40"
                >
                  <td className="h-12 px-6 tabular-numbers font-medium text-foreground-muted">
                    {i + 1}
                  </td>
                  <td className="h-12 px-6">
                    <div className="flex flex-col">
                      <span className="font-medium">{p.title}</span>
                      <span className="text-[11px] tabular-numbers text-muted-foreground">
                        {p.code}
                      </span>
                    </div>
                  </td>
                  <td className="h-12 px-6 text-foreground-muted">{p.city}</td>
                  <td className="h-12 px-6 text-right tabular-numbers text-foreground-muted">
                    {p.payments_count}
                  </td>
                  <td className="h-12 px-6 text-right tabular-numbers font-semibold">
                    {formatCurrency(p.collected)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ----------------- Pipeline Tab -----------------
function PipelineTab() {
  const { data, isLoading } = usePipelineConversionReport();
  const lastMonth = data?.monthly[data.monthly.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <KpiCard
          icon={ZapIcon}
          label="Leads creados (mes)"
          value={lastMonth ? lastMonth.created.toString() : "—"}
          loading={isLoading}
        />
        <KpiCard
          icon={CheckmarkCircle02Icon}
          tone="positive"
          label="Ganados (mes)"
          value={lastMonth ? lastMonth.won.toString() : "—"}
          loading={isLoading}
        />
        <KpiCard
          icon={AlertCircleIcon}
          tone="negative"
          label="Perdidos (mes)"
          value={lastMonth ? lastMonth.lost.toString() : "—"}
          loading={isLoading}
        />
        <KpiCard
          icon={AnalyticsUpIcon}
          tone="info"
          label="Conversión (mes)"
          value={lastMonth ? `${lastMonth.conversion_rate}%` : "—"}
          loading={isLoading}
        />
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold">Funnel actual</h3>
        <PipelineFunnel data={data?.funnel ?? []} loading={isLoading} />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-border-subtle px-6 py-4">
            <h3 className="text-sm font-semibold">Conversión mensual</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
                  <th className="h-11 px-6 text-left">Mes</th>
                  <th className="h-11 px-6 text-right">Creados</th>
                  <th className="h-11 px-6 text-right">Ganados</th>
                  <th className="h-11 px-6 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {(data?.monthly ?? []).map((m) => (
                  <tr key={m.month} className="border-b border-border-subtle last:border-b-0">
                    <td className="h-11 px-6 capitalize">{m.label}</td>
                    <td className="h-11 px-6 text-right tabular-numbers">{m.created}</td>
                    <td className="h-11 px-6 text-right tabular-numbers text-positive">
                      {m.won}
                    </td>
                    <td className="h-11 px-6 text-right tabular-numbers">
                      <Badge variant={m.conversion_rate >= 30 ? "positive" : "neutral"}>
                        {m.conversion_rate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border-subtle px-6 py-4">
            <h3 className="text-sm font-semibold">Tiempo promedio en cada stage (días)</h3>
          </div>
          <ul className="divide-y divide-border-subtle">
            {(data?.avg_days_in_stage ?? []).map((s) => (
              <li
                key={s.stage_id}
                className="flex items-center justify-between gap-3 px-6 py-3"
              >
                <span className="text-sm font-medium">{s.name}</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium tabular-numbers",
                    s.avg_days >= 14
                      ? "bg-negative-soft text-negative"
                      : s.avg_days >= 7
                        ? "bg-warning-soft text-warning"
                        : "bg-positive-soft text-positive",
                  )}
                >
                  {s.avg_days} d
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ----------------- Agents Tab -----------------
function AgentsTab() {
  const { data, isLoading } = useAgentsPerformanceReport();

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border-subtle px-6 py-4">
        <h3 className="text-sm font-semibold">Rendimiento de agentes</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
              <th className="h-11 px-6 text-left">Agente</th>
              <th className="h-11 px-6 text-left">Rol</th>
              <th className="h-11 px-6 text-right">Leads abiertos</th>
              <th className="h-11 px-6 text-right">Leads ganados</th>
              <th className="h-11 px-6 text-right">Contratos</th>
              <th className="h-11 px-6 text-right">Renta gestionada</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="h-12 px-6">
                    <div className="h-4 animate-pulse rounded bg-surface-muted" />
                  </td>
                </tr>
              ))
            ) : (data?.data ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-foreground-muted">
                  Sin datos.
                </td>
              </tr>
            ) : (
              data!.data.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40"
                >
                  <td className="h-12 px-6">
                    <span className="flex items-center gap-2.5">
                      <Avatar name={a.name} size="sm" />
                      <span>
                        <span className="block font-medium">{a.name}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {a.email}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="h-12 px-6">
                    <Badge variant="outline" className="capitalize">
                      {a.role}
                    </Badge>
                  </td>
                  <td className="h-12 px-6 text-right tabular-numbers">{a.leads_open}</td>
                  <td className="h-12 px-6 text-right tabular-numbers text-positive">
                    {a.leads_won}
                  </td>
                  <td className="h-12 px-6 text-right tabular-numbers">{a.contracts_count}</td>
                  <td className="h-12 px-6 text-right tabular-numbers font-medium">
                    {formatCurrency(a.managed_rent)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ----------------- Helpers -----------------
function KpiCard({
  icon,
  label,
  value,
  loading,
  tone,
  big,
}: {
  icon: Parameters<typeof Icon>[0]["icon"];
  label: string;
  value: string;
  loading?: boolean;
  tone?: "positive" | "negative" | "info";
  big?: boolean;
}) {
  const t =
    tone === "positive"
      ? "bg-positive-soft text-positive"
      : tone === "negative"
        ? "bg-negative-soft text-negative"
        : tone === "info"
          ? "bg-info-soft text-info"
          : "bg-surface-muted text-foreground-muted";

  return (
    <Card className={cn("flex items-center gap-4 p-5", big && "p-6")}>
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl",
          t,
          big ? "h-12 w-12" : "h-10 w-10",
        )}
      >
        <Icon icon={icon} size={big ? 22 : 18} />
      </span>
      <div>
        <div className="text-xs font-medium text-foreground-muted">{label}</div>
        <div
          className={cn(
            "mt-0.5 font-semibold tabular-numbers",
            big ? "text-3xl" : "text-xl",
            loading && "animate-pulse text-muted-foreground/50",
          )}
        >
          {loading ? "···" : value}
        </div>
      </div>
    </Card>
  );
}

function GenerateChargesButton() {
  const gen = useGenerateCharges();
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const res = await gen.mutateAsync(undefined);
        alert(
          `Mes ${res.data.month}: ${res.data.created} cargos creados, ${res.data.skipped} ya existían.`,
        );
      }}
      disabled={gen.isPending}
    >
      <Icon icon={ZapIcon} size={14} />
      {gen.isPending ? "Generando..." : "Generar cargos del mes"}
    </Button>
  );
}
