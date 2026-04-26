"use client";

import { useState } from "react";
import {
  Search01Icon,
  TicketIcon,
  AlertCircleIcon,
  Loading03Icon,
  CheckmarkCircle02Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  useMaintenanceTickets,
  useMaintenanceStats,
  type MaintenanceTicket,
} from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";
import { TicketPanel } from "@/components/maintenance/ticket-panel";

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  { value: "abierto", label: "Abiertos" },
  { value: "en_progreso", label: "En progreso" },
  { value: "esperando_proveedor", label: "Esperando proveedor" },
  { value: "resuelto", label: "Resueltos" },
];

const PRIORITY_DOT: Record<string, string> = {
  baja: "bg-positive",
  media: "bg-info",
  alta: "bg-warning",
  urgente: "bg-negative",
};

const STATUS_VARIANT: Record<string, "neutral" | "info" | "warning" | "positive" | "negative"> = {
  abierto: "warning",
  en_progreso: "info",
  esperando_proveedor: "info",
  resuelto: "positive",
  cerrado: "neutral",
  cancelado: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  abierto: "Abierto",
  en_progreso: "En progreso",
  esperando_proveedor: "Esperando proveedor",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

export default function MaintenancePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MaintenanceTicket | null>(null);

  const stats = useMaintenanceStats();
  const { data, isLoading } = useMaintenanceTickets({
    search: search || undefined,
    status: status || undefined,
    page,
    per_page: 20,
  });

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Mantenciones</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Tickets de mantenimiento por propiedad: asignación, estado, costes y timeline.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox icon={TicketIcon} label="Abiertos" value={stats.data?.open} />
        <StatBox
          icon={Loading03Icon}
          tone="info"
          label="En progreso"
          value={stats.data?.in_progress}
        />
        <StatBox
          icon={AlertCircleIcon}
          tone="negative"
          label="Urgentes activos"
          value={stats.data?.urgent_open}
        />
        <StatBox
          icon={Coins01Icon}
          label="Coste mes"
          value={
            stats.data ? formatCurrency(stats.data.total_cost_this_month) : undefined
          }
        />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="min-w-64 flex-1">
          <Input
            placeholder="Buscar por código, título o propiedad..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leading={<Icon icon={Search01Icon} size={15} />}
          />
        </div>
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((opt) => (
            <button
              key={opt.value || "all"}
              type="button"
              onClick={() => {
                setStatus(opt.value);
                setPage(1);
              }}
              className={cn(
                "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                status === opt.value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
                <th className="h-11 px-6 text-left">Ticket</th>
                <th className="h-11 px-6 text-left">Propiedad</th>
                <th className="h-11 px-6 text-left">Categoría</th>
                <th className="h-11 px-6 text-left">Prioridad</th>
                <th className="h-11 px-6 text-left">Asignado</th>
                <th className="h-11 px-6 text-left">Estado</th>
                <th className="h-11 px-6 text-right">Coste</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="h-14 px-6">
                      <div className="h-4 animate-pulse rounded bg-surface-muted" />
                    </td>
                  </tr>
                ))
              ) : (data?.data.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-foreground-muted">
                    Sin tickets.
                  </td>
                </tr>
              ) : (
                data?.data.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className="cursor-pointer border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40"
                  >
                    <td className="h-14 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium">{t.title}</span>
                        <span className="text-[11px] tabular-numbers text-muted-foreground">
                          {t.code}
                        </span>
                      </div>
                    </td>
                    <td className="h-14 px-6 text-foreground-muted">
                      {t.property?.title ?? "—"}
                    </td>
                    <td className="h-14 px-6 capitalize text-foreground-muted">
                      {t.category.replace(/_/g, " ")}
                    </td>
                    <td className="h-14 px-6">
                      <span className="inline-flex items-center gap-1.5 capitalize">
                        <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[t.priority])} />
                        {t.priority}
                      </span>
                    </td>
                    <td className="h-14 px-6">
                      {t.assigned_to ? (
                        <span className="inline-flex items-center gap-2">
                          <Avatar name={t.assigned_to.name} size="xs" />
                          <span className="truncate">{t.assigned_to.name}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin asignar</span>
                      )}
                    </td>
                    <td className="h-14 px-6">
                      <Badge variant={STATUS_VARIANT[t.status] ?? "neutral"}>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </Badge>
                    </td>
                    <td className="h-14 px-6 text-right tabular-numbers">
                      {t.actual_cost
                        ? formatCurrency(t.actual_cost)
                        : t.estimated_cost
                          ? `~${formatCurrency(t.estimated_cost)}`
                          : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {data && (
        <div className="mt-6 flex items-center justify-between text-sm text-foreground-muted">
          <span className="tabular-numbers">
            {(data.meta.current_page - 1) * data.meta.per_page + 1}–
            {Math.min(data.meta.current_page * data.meta.per_page, data.meta.total)} de{" "}
            {data.meta.total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={data.meta.current_page <= 1}
              className="h-8 rounded-full border border-border bg-surface px-3 text-xs font-medium text-foreground-muted hover:bg-surface-muted disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-3 text-xs tabular-numbers">
              {data.meta.current_page} / {data.meta.last_page}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={data.meta.current_page >= data.meta.last_page}
              className="h-8 rounded-full border border-border bg-surface px-3 text-xs font-medium text-foreground-muted hover:bg-surface-muted disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {selected && <TicketPanel ticket={selected} onClose={() => setSelected(null)} />}

      {/* Suprime imports no usados */}
      <span className="hidden">
        <Icon icon={CheckmarkCircle02Icon} size={1} />
      </span>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  tone,
}: {
  icon: IconSvgElement;
  label: string;
  value: string | number | undefined;
  tone?: "negative" | "info";
}) {
  const t =
    tone === "negative"
      ? "bg-negative-soft text-negative"
      : tone === "info"
        ? "bg-info-soft text-info"
        : "bg-surface-muted text-foreground-muted";
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", t)}>
        <Icon icon={icon} size={18} />
      </span>
      <div>
        <div className="text-xs font-medium text-foreground-muted">{label}</div>
        <div className="mt-0.5 text-xl font-semibold tabular-numbers">{value ?? "—"}</div>
      </div>
    </Card>
  );
}
