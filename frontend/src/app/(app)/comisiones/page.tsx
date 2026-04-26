"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CashIcon,
  ClockIcon,
  CheckmarkCircle02Icon,
  RankingIcon,
  Coins01Icon,
  CashbackIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  useCommissions,
  useCommissionStats,
  type CommissionSplit,
} from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";
import { PayCommissionDialog } from "@/components/commissions/pay-commission-dialog";

const STATUS_FILTERS = [
  { value: "", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "paid", label: "Pagadas" },
  { value: "cancelled", label: "Canceladas" },
];

const ROLE_LABEL: Record<string, string> = {
  captador: "Captador",
  vendedor: "Vendedor",
  broker: "Broker",
  otros: "Otros",
};

const STATUS_VARIANT: Record<string, "neutral" | "warning" | "positive" | "negative"> = {
  pending: "warning",
  paid: "positive",
  cancelled: "neutral",
};

export default function CommissionsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [paying, setPaying] = useState<CommissionSplit | null>(null);

  const stats = useCommissionStats();
  const { data, isLoading } = useCommissions({
    status: status || undefined,
    page,
    per_page: 25,
  });

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Icon icon={CashbackIcon} size={13} />
          Comisiones
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Comisiones de agentes</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Splits automáticos por contrato. Marca como pagadas las que ya transferiste.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_2fr]">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <Icon icon={ClockIcon} size={18} />
            </span>
            <div>
              <div className="text-xs font-medium text-foreground-muted">
                Pendientes de pago
              </div>
              <div className="mt-0.5 text-xl font-semibold tabular-numbers">
                {stats.data ? formatCurrency(stats.data.total_pending) : "—"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground tabular-numbers">
                {stats.data?.pending_count ?? 0} comisiones
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-positive-soft text-positive">
              <Icon icon={CheckmarkCircle02Icon} size={18} />
            </span>
            <div>
              <div className="text-xs font-medium text-foreground-muted">
                Pagadas este mes
              </div>
              <div className="mt-0.5 text-xl font-semibold tabular-numbers">
                {stats.data ? formatCurrency(stats.data.paid_this_month) : "—"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground tabular-numbers">
                {stats.data?.paid_this_month_count ?? 0} pagos
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Icon icon={RankingIcon} size={12} />
            Top agentes (todos los tiempos)
          </div>
          <ul className="mt-3 space-y-2">
            {(stats.data?.top_agents ?? []).slice(0, 3).map((a, i) => (
              <li
                key={a.user_id}
                className="flex items-center gap-3 rounded-xl border border-border-subtle px-2 py-1.5"
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold tabular-numbers",
                    i === 0
                      ? "bg-warning-soft text-warning"
                      : "bg-surface-muted text-foreground-muted",
                  )}
                >
                  {i + 1}
                </span>
                <Avatar name={a.name ?? "?"} src={a.avatar_url} size="xs" />
                <span className="flex-1 truncate text-sm font-medium">{a.name}</span>
                <span className="text-xs tabular-numbers font-semibold">
                  {formatCurrency(a.total)}
                </span>
                <span className="text-[10px] tabular-numbers text-muted-foreground">
                  {a.count}
                </span>
              </li>
            ))}
            {(stats.data?.top_agents.length ?? 0) === 0 && (
              <li className="py-4 text-center text-xs text-foreground-muted">
                Sin datos
              </li>
            )}
          </ul>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={cn(
              "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
              status === f.value
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </Card>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
                <th className="h-11 px-6 text-left">Agente</th>
                <th className="h-11 px-6 text-left">Rol</th>
                <th className="h-11 px-6 text-left">Contrato</th>
                <th className="h-11 px-6 text-right">%</th>
                <th className="h-11 px-6 text-right">Importe</th>
                <th className="h-11 px-6 text-left">Estado</th>
                <th className="h-11 px-6 text-left">Pago</th>
                <th className="h-11 px-6 text-right" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="h-12 px-6">
                      <div className="h-4 animate-pulse rounded bg-surface-muted" />
                    </td>
                  </tr>
                ))
              ) : (data?.data.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-foreground-muted">
                    Sin comisiones.
                  </td>
                </tr>
              ) : (
                data?.data.map((c) => (
                  <CommissionRow
                    key={c.id}
                    commission={c}
                    onPay={() => setPaying(c)}
                  />
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
            <Button
              variant="outline"
              size="sm"
              disabled={data.meta.current_page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span className="px-3 text-xs tabular-numbers">
              {data.meta.current_page} / {data.meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={data.meta.current_page >= data.meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <PayCommissionDialog
        commission={paying}
        open={!!paying}
        onClose={() => setPaying(null)}
      />

      {/* Suprime warning */}
      <span className="hidden">
        <Icon icon={CashIcon} size={1} />
        <Icon icon={Coins01Icon} size={1} />
      </span>
    </div>
  );
}

function CommissionRow({
  commission: c,
  onPay,
}: {
  commission: CommissionSplit;
  onPay: () => void;
}) {
  const canPay = c.status === "pending";
  return (
    <tr className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40">
      <td className="h-12 px-6">
        {c.user ? (
          <span className="inline-flex items-center gap-2">
            <Avatar name={c.user.name} src={c.user.avatar_url} size="xs" />
            <span className="truncate font-medium">{c.user.name}</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Sin agente</span>
        )}
      </td>
      <td className="h-12 px-6">
        <Badge variant="outline" className="capitalize">
          {ROLE_LABEL[c.role] ?? c.role}
        </Badge>
      </td>
      <td className="h-12 px-6 tabular-numbers">
        {c.contract ? (
          <Link
            href={`/contratos/${c.contract.id}`}
            className="text-foreground-muted hover:text-foreground hover:underline"
          >
            {c.contract.code}
          </Link>
        ) : (
          "—"
        )}
      </td>
      <td className="h-12 px-6 text-right tabular-numbers text-foreground-muted">
        {c.pct}%
      </td>
      <td className="h-12 px-6 text-right tabular-numbers font-semibold">
        {formatCurrency(c.amount)}
      </td>
      <td className="h-12 px-6">
        <Badge variant={STATUS_VARIANT[c.status] ?? "neutral"} className="capitalize">
          {c.status === "pending" ? "Pendiente" : c.status === "paid" ? "Pagada" : c.status}
        </Badge>
      </td>
      <td className="h-12 px-6 text-xs tabular-numbers text-foreground-muted">
        {c.paid_at ? (
          <>
            {c.paid_at}
            {c.payment_reference && (
              <span className="ml-1 text-[10px] opacity-70">· {c.payment_reference}</span>
            )}
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="h-12 px-6 text-right">
        {canPay && (
          <Button size="sm" variant="outline" onClick={onPay}>
            <Icon icon={CheckmarkCircle02Icon} size={13} />
            Marcar pagada
          </Button>
        )}
      </td>
    </tr>
  );
}
