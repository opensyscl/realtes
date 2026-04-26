"use client";

import Link from "next/link";
import { use, useState } from "react";
import {
  ArrowLeft01Icon,
  PropertyNewIcon,
  UserIcon,
  UserStar01Icon,
  CashIcon,
  Calendar03Icon,
  CalendarSetting01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ClockIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import {
  useContract,
  useCharges,
  useContractCommissions,
  type Charge,
  type CommissionSplit,
} from "@/lib/queries";
import { DocumentDropZone } from "@/components/documents/document-dropzone";
import { PayCommissionDialog } from "@/components/commissions/pay-commission-dialog";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_META: Record<string, { label: string; tone: "positive"|"warning"|"negative"|"info"|"neutral" }> = {
  vigente: { label: "Vigente", tone: "positive" },
  borrador: { label: "Borrador", tone: "warning" },
  vencido: { label: "Vencido", tone: "negative" },
  finalizado: { label: "Finalizado", tone: "neutral" },
  renovado: { label: "Renovado", tone: "info" },
  cancelado: { label: "Cancelado", tone: "neutral" },
};

const CHARGE_STATUS: Record<string, { label: string; tone: string; icon: IconSvgElement }> = {
  pendiente: { label: "Pendiente", tone: "text-warning", icon: ClockIcon },
  parcial: { label: "Parcial", tone: "text-info", icon: Loading03Icon },
  pagado: { label: "Pagado", tone: "text-positive", icon: CheckmarkCircle02Icon },
  vencido: { label: "Vencido", tone: "text-negative", icon: AlertCircleIcon },
  anulado: { label: "Anulado", tone: "text-foreground-muted", icon: AlertCircleIcon },
};

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: c, isLoading } = useContract(id);
  const { data: charges } = useCharges(c ? { contract_id: c.id, per_page: 50 } : { per_page: 0 });

  if (isLoading) {
    return (
      <div className="px-6 py-6">
        <Card className="h-72 animate-pulse bg-surface-muted/50" />
      </div>
    );
  }
  if (!c) {
    return (
      <div className="px-6 py-6 text-center text-foreground-muted">
        Contrato no encontrado.
      </div>
    );
  }

  const status = STATUS_META[c.status] ?? STATUS_META.borrador;
  const totalAmount = charges?.data.reduce((s, x) => s + x.amount, 0) ?? 0;
  const totalPaid = charges?.data.reduce((s, x) => s + x.paid_amount, 0) ?? 0;
  const collectionRate = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  return (
    <div className="px-6 py-6">
      <Link
        href="/contratos"
        className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
      >
        <Icon icon={ArrowLeft01Icon} size={13} /> Contratos
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Contrato {c.type.replace(/_/g, " ")}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight tabular-numbers">{c.code}</h1>
        </div>
        <Badge variant={status.tone}>{status.label}</Badge>
      </div>

      {/* KPIs del contrato */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiBox icon={CashIcon} label="Renta mensual" value={formatCurrency(c.monthly_rent)} />
        <KpiBox icon={CashIcon} label="Depósito" value={formatCurrency(c.deposit)} />
        <KpiBox icon={Calendar03Icon} label="Inicio" value={c.start_date} />
        <KpiBox icon={CalendarSetting01Icon} label="Fin" value={c.end_date} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Property + parties */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Propiedad
          </h3>
          {c.property ? (
            <Link
              href={`/propiedades/${c.property.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border-subtle p-4 hover:bg-surface-muted/50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
                <Icon icon={PropertyNewIcon} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{c.property.title}</div>
                <div className="text-xs text-foreground-muted">
                  {c.property.address}, {c.property.city} ·{" "}
                  <span className="tabular-numbers">{c.property.code}</span>
                </div>
              </div>
              <Icon icon={UserIcon} size={14} className="text-muted-foreground" />
            </Link>
          ) : (
            <p className="text-sm text-foreground-muted">Sin propiedad asociada.</p>
          )}

          <h3 className="mt-6 mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Partes
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {c.owner && (
              <PartyCard
                icon={UserStar01Icon}
                role="Propietario"
                name={c.owner.full_name}
                email={c.owner.email}
                phone={c.owner.phone}
                href={`/personas/${c.owner.id}`}
              />
            )}
            {c.tenant && (
              <PartyCard
                icon={UserIcon}
                role="Arrendatario"
                name={c.tenant.full_name}
                email={c.tenant.email}
                phone={c.tenant.phone}
                href={`/personas/${c.tenant.id}`}
              />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Cobro
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-semibold tabular-numbers">{collectionRate}%</div>
              <div className="text-xs text-muted-foreground">tasa de cobro acumulada</div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-positive transition-all"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total emitido</dt>
                <dd className="font-medium tabular-numbers">{formatCurrency(totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total cobrado</dt>
                <dd className="font-medium tabular-numbers text-positive">
                  {formatCurrency(totalPaid)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Pendiente</dt>
                <dd className="font-medium tabular-numbers">
                  {formatCurrency(totalAmount - totalPaid)}
                </dd>
              </div>
            </dl>
          </div>
        </Card>
      </div>

      {/* Cargos */}
      <Card className="mt-4 overflow-hidden">
        <div className="border-b border-border-subtle px-6 py-4">
          <h3 className="text-sm font-semibold">Cargos del contrato</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
                <th className="h-11 px-6 text-left">Código</th>
                <th className="h-11 px-6 text-left">Concepto</th>
                <th className="h-11 px-6 text-left">Vencimiento</th>
                <th className="h-11 px-6 text-right">Importe</th>
                <th className="h-11 px-6 text-right">Pagado</th>
                <th className="h-11 px-6 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(charges?.data.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-foreground-muted">
                    Sin cargos asociados.
                  </td>
                </tr>
              ) : (
                charges!.data.map((ch: Charge) => {
                  const meta = CHARGE_STATUS[ch.status] ?? CHARGE_STATUS.pendiente;
                  return (
                    <tr
                      key={ch.id}
                      className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40"
                    >
                      <td className="h-12 px-6 tabular-numbers font-medium">{ch.code}</td>
                      <td className="h-12 px-6 capitalize">{ch.concept}</td>
                      <td className="h-12 px-6 tabular-numbers text-foreground-muted">
                        {ch.due_date}
                      </td>
                      <td className="h-12 px-6 text-right tabular-numbers">
                        {formatCurrency(ch.amount)}
                      </td>
                      <td className="h-12 px-6 text-right tabular-numbers text-foreground-muted">
                        {formatCurrency(ch.paid_amount)}
                      </td>
                      <td className="h-12 px-6">
                        <span className={cn("inline-flex items-center gap-1.5", meta.tone)}>
                          <Icon icon={meta.icon} size={13} />
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Comisiones */}
      <ContractCommissionsBlock contractId={c.id} />

      {/* Documentos */}
      <Card className="mt-4 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Documentos del contrato
        </h3>
        <DocumentDropZone owner="contracts" ownerId={c.id} />
      </Card>
    </div>
  );
}

function ContractCommissionsBlock({ contractId }: { contractId: number }) {
  const { data, isLoading } = useContractCommissions(contractId);
  const [paying, setPaying] = useState<CommissionSplit | null>(null);
  const total = (data ?? []).reduce((s, c) => s + c.amount, 0);
  const paid = (data ?? [])
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + c.amount, 0);

  if (!isLoading && (data?.length ?? 0) === 0) return null;

  return (
    <Card className="mt-4 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Comisiones
        </h3>
        <div className="text-xs text-foreground-muted tabular-numbers">
          Total {formatCurrency(total)} · Pagado {formatCurrency(paid)} · Pendiente{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(total - paid)}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-2xl bg-surface-muted/50" />
      ) : (
        <ul className="space-y-2">
          {data?.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-border-subtle p-3"
            >
              {c.user ? (
                <Avatar name={c.user.name} src={c.user.avatar_url} size="sm" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted text-foreground-muted">
                  ?
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{c.user?.name ?? "Sin agente"}</span>
                  <Badge variant="outline" className="capitalize">
                    {c.role}
                  </Badge>
                </div>
                <div className="text-[11px] tabular-numbers text-foreground-muted">
                  {c.pct}% del total
                  {c.paid_at && ` · pagado ${c.paid_at}`}
                  {c.payment_reference && ` · ref. ${c.payment_reference}`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-numbers">
                  {formatCurrency(c.amount)}
                </div>
                <Badge
                  variant={
                    c.status === "paid"
                      ? "positive"
                      : c.status === "pending"
                        ? "warning"
                        : "neutral"
                  }
                  className="text-[10px] capitalize"
                >
                  {c.status === "pending"
                    ? "Pendiente"
                    : c.status === "paid"
                      ? "Pagada"
                      : c.status}
                </Badge>
              </div>
              {c.status === "pending" && (
                <button
                  type="button"
                  onClick={() => setPaying(c)}
                  className="ml-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium hover:bg-surface-muted"
                >
                  Pagar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <PayCommissionDialog
        commission={paying}
        open={!!paying}
        onClose={() => setPaying(null)}
      />
    </Card>
  );
}

function KpiBox({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
        <Icon icon={icon} size={16} />
      </span>
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-semibold tabular-numbers">{value}</div>
      </div>
    </Card>
  );
}

function PartyCard({
  icon,
  role,
  name,
  email,
  phone,
  href,
}: {
  icon: IconSvgElement;
  role: string;
  name: string;
  email: string | null;
  phone: string | null;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border-subtle p-4 hover:bg-surface-muted/50"
    >
      <Avatar name={name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {role}
        </div>
        <div className="truncate font-semibold">{name}</div>
        <div className="truncate text-[11px] text-foreground-muted">
          {email ?? phone ?? "Sin contacto"}
        </div>
      </div>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted text-foreground-muted">
        <Icon icon={icon} size={13} />
      </span>
    </Link>
  );
}
