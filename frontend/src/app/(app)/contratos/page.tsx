"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ClockIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useContracts } from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS = [
  { value: "", label: "Todos" },
  { value: "vigente", label: "Vigentes" },
  { value: "borrador", label: "Borrador" },
  { value: "vencido", label: "Vencidos" },
  { value: "finalizado", label: "Finalizados" },
];

const STATUS_META: Record<string, { label: string; tone: string; icon: IconSvgElement }> = {
  vigente: { label: "Vigente", tone: "text-positive", icon: CheckmarkCircle02Icon },
  borrador: { label: "Borrador", tone: "text-warning", icon: Loading03Icon },
  vencido: { label: "Vencido", tone: "text-negative", icon: AlertCircleIcon },
  finalizado: { label: "Finalizado", tone: "text-foreground-muted", icon: ClockIcon },
  renovado: { label: "Renovado", tone: "text-info", icon: CheckmarkCircle02Icon },
  cancelado: { label: "Cancelado", tone: "text-foreground-muted", icon: AlertCircleIcon },
};

export default function ContractsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useContracts({
    search: search || undefined,
    status: status || undefined,
    page,
    per_page: 20,
  });

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Contratos</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Gestión de contratos vigentes, borradores y renovaciones.
        </p>
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="min-w-64 flex-1">
          <Input
            placeholder="Buscar por código o propiedad..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leading={<Icon icon={Search01Icon} size={15} />}
          />
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
                <th className="h-11 px-6 text-left">Código</th>
                <th className="h-11 px-6 text-left">Propiedad</th>
                <th className="h-11 px-6 text-left">Arrendatario</th>
                <th className="h-11 px-6 text-right">Renta</th>
                <th className="h-11 px-6 text-left">Estado</th>
                <th className="h-11 px-6 text-left">Inicio</th>
                <th className="h-11 px-6 text-left">Fin</th>
                <th className="h-11 px-6 text-right" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="h-14 px-6">
                      <div className="h-4 animate-pulse rounded bg-surface-muted" />
                    </td>
                  </tr>
                ))
              ) : (data?.data.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-foreground-muted">
                    Sin contratos.
                  </td>
                </tr>
              ) : (
                data?.data.map((c) => {
                  const meta = STATUS_META[c.status] ?? STATUS_META.borrador;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40"
                    >
                      <td className="h-14 px-6 font-medium tabular-numbers">
                        <Link href={`/contratos/${c.id}`}>{c.code}</Link>
                      </td>
                      <td className="h-14 px-6">
                        <div className="flex flex-col">
                          <span className="truncate">{c.property?.title ?? "—"}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {c.property?.address}
                          </span>
                        </div>
                      </td>
                      <td className="h-14 px-6">
                        {c.tenant ? (
                          <span className="inline-flex items-center gap-2">
                            <Avatar name={c.tenant.full_name} size="xs" />
                            <span className="truncate">{c.tenant.full_name}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="h-14 px-6 text-right tabular-numbers font-medium">
                        {formatCurrency(c.monthly_rent)}
                      </td>
                      <td className="h-14 px-6">
                        <span className={cn("inline-flex items-center gap-1.5", meta.tone)}>
                          <Icon icon={meta.icon} size={13} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="h-14 px-6 tabular-numbers text-foreground-muted">
                        {c.start_date}
                      </td>
                      <td className="h-14 px-6 tabular-numbers text-foreground-muted">
                        {c.end_date}
                      </td>
                      <td className="h-14 px-6 text-right">
                        <Link
                          href={`/contratos/${c.id}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                        >
                          <Icon icon={ArrowRight01Icon} size={14} />
                        </Link>
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
    </div>
  );
}
