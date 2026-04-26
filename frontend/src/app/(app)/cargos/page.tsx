"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ClockIcon,
  Loading03Icon,
  Wallet01Icon,
  CashIcon,
  DollarSquareIcon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useCharges, useChargeStats, type Charge } from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";
import { RegisterPaymentDialog } from "@/components/charges/register-payment-dialog";

const STATUS = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "vencido", label: "Vencidos" },
  { value: "parcial", label: "Parciales" },
  { value: "pagado", label: "Pagados" },
];

const STATUS_META: Record<string, { label: string; tone: string; icon: IconSvgElement }> = {
  pendiente: { label: "Pendiente", tone: "text-warning", icon: ClockIcon },
  parcial: { label: "Parcial", tone: "text-info", icon: Loading03Icon },
  pagado: { label: "Pagado", tone: "text-positive", icon: CheckmarkCircle02Icon },
  vencido: { label: "Vencido", tone: "text-negative", icon: AlertCircleIcon },
  anulado: { label: "Anulado", tone: "text-foreground-muted", icon: AlertCircleIcon },
};

export default function ChargesPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [paying, setPaying] = useState<Charge | null>(null);

  const { data, isLoading } = useCharges({
    status: status || undefined,
    page,
    per_page: 30,
    sort: "due_date",
    dir: "desc",
  });
  const stats = useChargeStats();

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Cargos</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Generación, cobro y conciliación de cargos por contrato.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox
          icon={ClockIcon}
          label="Pendientes"
          value={stats.data?.pending_count}
        />
        <StatBox
          icon={AlertCircleIcon}
          tone="negative"
          label="Vencidos"
          value={stats.data?.overdue_count}
        />
        <StatBox
          icon={Coins01Icon}
          label="Importe pendiente"
          value={
            stats.data ? formatCurrency(stats.data.total_pending_amount) : undefined
          }
        />
        <StatBox
          icon={Wallet01Icon}
          tone="positive"
          label="Cobrado este mes"
          value={
            stats.data ? formatCurrency(stats.data.collected_this_month) : undefined
          }
        />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        {STATUS.map((opt) => (
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
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
                <Th>Código</Th>
                <Th>Contrato</Th>
                <Th>Persona</Th>
                <Th>Concepto</Th>
                <Th>Vencimiento</Th>
                <Th align="right">Importe</Th>
                <Th align="right">Pendiente</Th>
                <Th>Estado</Th>
                <Th align="right" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="h-12 px-6">
                      <div className="h-4 animate-pulse rounded bg-surface-muted" />
                    </td>
                  </tr>
                ))
              ) : (data?.data.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-foreground-muted">
                    Sin cargos en este filtro.
                  </td>
                </tr>
              ) : (
                data?.data.map((c) => {
                  const meta = STATUS_META[c.status] ?? STATUS_META.pendiente;
                  const canPay = c.status !== "pagado" && c.status !== "anulado";
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40"
                    >
                      <td className="h-12 px-6 tabular-numbers font-medium">{c.code}</td>
                      <td className="h-12 px-6 tabular-numbers text-foreground-muted">
                        {c.contract ? (
                          <Link
                            href={`/contratos/${c.contract.id}`}
                            className="hover:underline"
                          >
                            {c.contract.code}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="h-12 px-6">{c.person?.full_name ?? "—"}</td>
                      <td className="h-12 px-6 capitalize">{c.concept}</td>
                      <td className="h-12 px-6 tabular-numbers text-foreground-muted">
                        {c.due_date}
                      </td>
                      <td className="h-12 px-6 text-right tabular-numbers">
                        {formatCurrency(c.amount)}
                      </td>
                      <td className="h-12 px-6 text-right tabular-numbers font-medium">
                        {formatCurrency(c.pending)}
                      </td>
                      <td className="h-12 px-6">
                        <span className={cn("inline-flex items-center gap-1.5", meta.tone)}>
                          <Icon icon={meta.icon} size={13} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="h-12 px-6 text-right">
                        {canPay && (
                          <Button size="sm" variant="outline" onClick={() => setPaying(c)}>
                            <Icon icon={CashIcon} size={13} />
                            Cobrar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      <RegisterPaymentDialog
        charge={paying}
        open={!!paying}
        onClose={() => setPaying(null)}
      />
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "h-11 px-6 font-medium",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1",
          align === "right" && "justify-end",
        )}
      >
        {children}
        {children ? <Icon icon={ArrowDown01Icon} size={12} /> : null}
      </span>
    </th>
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
  tone?: "positive" | "negative";
}) {
  const t = tone === "positive"
    ? "bg-positive-soft text-positive"
    : tone === "negative"
      ? "bg-negative-soft text-negative"
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

// Suprime warning de variable no usada DollarSquareIcon
void DollarSquareIcon;
