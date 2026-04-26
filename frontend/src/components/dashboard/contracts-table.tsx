"use client";

import Link from "next/link";
import {
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  ClockIcon,
  AlertCircleIcon,
  FilterIcon,
  MoreHorizontalIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { useContracts } from "@/lib/queries";

const STATUS_META: Record<
  string,
  { label: string; icon: IconSvgElement; tone: string }
> = {
  vigente: { label: "Vigente", icon: CheckmarkCircle02Icon, tone: "text-positive" },
  borrador: { label: "Borrador", icon: Loading03Icon, tone: "text-warning" },
  vencido: { label: "Vencido", icon: AlertCircleIcon, tone: "text-negative" },
  finalizado: { label: "Finalizado", icon: ClockIcon, tone: "text-foreground-muted" },
  renovado: { label: "Renovado", icon: CheckmarkCircle02Icon, tone: "text-info" },
  cancelado: { label: "Cancelado", icon: AlertCircleIcon, tone: "text-foreground-muted" },
};

export function ContractsTable() {
  const { data, isLoading } = useContracts({ per_page: 5 });
  const rows = data?.data ?? [];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <span className="block h-2 w-2 rounded-full border-2 border-current" />
          </span>
          <h3 className="text-sm font-semibold">Últimos contratos</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-56">
            <Input placeholder="Contrato" leading={<Icon icon={Search01Icon} size={15} />} />
          </div>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-foreground-muted hover:bg-surface-muted">
            <Icon icon={FilterIcon} size={13} />
            Filtrar
          </button>
          <Link
            href="/contratos"
            className="inline-flex h-9 items-center rounded-full border border-border bg-surface px-3 text-xs font-medium text-foreground-muted hover:bg-surface-muted"
          >
            Ver todos
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
              <Th>Código</Th>
              <Th>Propiedad</Th>
              <Th>Arrendatario</Th>
              <Th>Renta</Th>
              <Th>Estado</Th>
              <Th>Inicio</Th>
              <Th>Vencimiento</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border-subtle">
                  <td colSpan={8} className="h-14 px-6">
                    <div className="h-4 animate-pulse rounded bg-surface-muted" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-foreground-muted">
                  Sin contratos todavía.
                </td>
              </tr>
            ) : (
              rows.map((c) => {
                const meta = STATUS_META[c.status] ?? STATUS_META.borrador;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40"
                  >
                    <Td className="font-medium tabular-numbers">{c.code}</Td>
                    <Td>
                      <div className="flex flex-col">
                        <span className="truncate">{c.property?.title ?? "—"}</span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {c.property?.address}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      {c.tenant ? (
                        <span className="inline-flex items-center gap-2">
                          <Avatar name={c.tenant.full_name} size="xs" />
                          <span className="truncate">{c.tenant.full_name}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="tabular-numbers">
                      {formatCurrency(c.monthly_rent)}
                    </Td>
                    <Td>
                      <span className={cn("inline-flex items-center gap-1.5", meta.tone)}>
                        <Icon icon={meta.icon} size={14} />
                        <span>{meta.label}</span>
                      </span>
                    </Td>
                    <Td className="tabular-numbers text-foreground-muted">
                      {c.start_date}
                    </Td>
                    <Td className="tabular-numbers text-foreground-muted">
                      {c.end_date}
                    </Td>
                    <Td className="text-right">
                      <Link
                        href={`/contratos/${c.id}`}
                        className="rounded-full p-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                        aria-label="Acciones"
                      >
                        <Icon icon={MoreHorizontalIcon} size={16} />
                      </Link>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("h-11 px-6 text-left font-medium first:pl-6 last:pr-6", className)}>
      <span className="inline-flex items-center gap-1">
        {children}
        {children ? <Icon icon={ArrowDown01Icon} size={12} /> : null}
      </span>
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("h-14 px-6 align-middle", className)}>{children}</td>;
}
