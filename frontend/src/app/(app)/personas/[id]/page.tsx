"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import {
  ArrowLeft01Icon,
  Edit02Icon,
  Delete02Icon,
  Mail01Icon,
  CallIcon,
  HouseIcon,
  Calendar03Icon,
  TextFontIcon,
  CashIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { PersonForm } from "@/components/persons/person-form";
import { usePerson, useDeletePerson } from "@/lib/queries";

export default function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const { data: p, isLoading } = usePerson(id);
  const del = useDeletePerson();

  const handleDelete = async () => {
    if (!p) return;
    if (!confirm(`¿Eliminar a ${p.full_name}?`)) return;
    await del.mutateAsync(p.id);
    router.push("/personas");
  };

  if (isLoading) {
    return (
      <div className="px-6 py-6">
        <Card className="h-72 animate-pulse bg-surface-muted/50" />
      </div>
    );
  }
  if (!p) {
    return (
      <div className="px-6 py-6 text-center text-foreground-muted">
        Persona no encontrada.
      </div>
    );
  }

  if (editing) {
    return (
      <div className="px-6 py-6">
        <button
          onClick={() => setEditing(false)}
          className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
        >
          <Icon icon={ArrowLeft01Icon} size={13} /> Volver al detalle
        </button>
        <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">
          Editar {p.full_name}
        </h1>
        <PersonForm person={p} />
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <Link
        href="/personas"
        className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
      >
        <Icon icon={ArrowLeft01Icon} size={13} /> Personas
      </Link>

      <Card className="mt-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={p.full_name} size="lg" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{p.full_name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    p.type === "owner"
                      ? "info"
                      : p.type === "tenant"
                        ? "positive"
                        : "neutral"
                  }
                >
                  {p.type === "owner"
                    ? "Propietario"
                    : p.type === "tenant"
                      ? "Arrendatario"
                      : p.type === "both"
                        ? "Mixto"
                        : "Prospecto"}
                </Badge>
                {p.nif && (
                  <span className="text-xs text-muted-foreground tabular-numbers">
                    NIF {p.nif}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Icon icon={Edit02Icon} size={14} />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Icon icon={Delete02Icon} size={14} />
              Eliminar
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Contacto
          </h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Row icon={Mail01Icon} label="Email">
              {p.email ? (
                <a href={`mailto:${p.email}`} className="hover:underline">
                  {p.email}
                </a>
              ) : (
                "—"
              )}
            </Row>
            <Row icon={CallIcon} label="Teléfono">
              {p.phone ? (
                <a href={`tel:${p.phone}`} className="tabular-numbers hover:underline">
                  {p.phone}
                </a>
              ) : (
                "—"
              )}
            </Row>
            {p.phone_alt && (
              <Row icon={CallIcon} label="Teléfono alt.">
                <span className="tabular-numbers">{p.phone_alt}</span>
              </Row>
            )}
            <Row icon={HouseIcon} label="Dirección">
              {p.address ? `${p.address}, ${p.city ?? "—"}` : "—"}
            </Row>
            {p.iban_last4 && (
              <Row icon={CashIcon} label="IBAN">
                ···· {p.iban_last4}
              </Row>
            )}
            {p.birthday && (
              <Row icon={Calendar03Icon} label="Cumpleaños">
                {new Date(p.birthday).toLocaleDateString("es-ES")}
              </Row>
            )}
          </dl>

          {p.notes && (
            <>
              <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Notas
              </h3>
              <p className="flex items-start gap-2 whitespace-pre-line rounded-2xl bg-surface-muted/50 p-4 text-sm">
                <Icon icon={TextFontIcon} size={14} className="mt-0.5 text-muted-foreground" />
                {p.notes}
              </p>
            </>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Resumen
          </h3>
          <dl className="space-y-3 text-sm">
            <SummaryRow label="Contratos arrendatario">
              {p.active_contracts_count ?? 0}
            </SummaryRow>
            <SummaryRow label="Propiedades en gestión">
              {p.owned_count ?? 0}
            </SummaryRow>
            <SummaryRow label="Alta">
              {new Date(p.created_at).toLocaleDateString("es-ES")}
            </SummaryRow>
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: Parameters<typeof Icon>[0]["icon"];
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border-subtle p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
        <Icon icon={icon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="truncate text-sm font-medium">{children}</dd>
      </div>
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-numbers">{children}</dd>
    </div>
  );
}
