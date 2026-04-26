"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Add01Icon,
  Search01Icon,
  UserIcon,
  UserStar01Icon,
  CallIcon,
  Mail01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { usePersons } from "@/lib/queries";
import { cn } from "@/lib/utils";

const TYPES = [
  { value: "", label: "Todos" },
  { value: "owner", label: "Propietarios" },
  { value: "tenant", label: "Arrendatarios" },
  { value: "prospect", label: "Prospectos" },
];

const TYPE_BADGE: Record<string, { label: string; variant: "info" | "positive" | "neutral" | "warning"; icon: IconSvgElement }> = {
  owner: { label: "Propietario", variant: "info", icon: UserStar01Icon },
  tenant: { label: "Arrendatario", variant: "positive", icon: UserIcon },
  both: { label: "Mixto", variant: "warning", icon: UserStar01Icon },
  prospect: { label: "Prospecto", variant: "neutral", icon: UserIcon },
};

export default function PersonsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePersons({
    search: search || undefined,
    type: type || undefined,
    page,
    per_page: 20,
  });

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Personas</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Propietarios, arrendatarios y prospectos vinculados a tu cartera.
          </p>
        </div>
        <Link href="/personas/nueva">
          <Button>
            <Icon icon={Add01Icon} size={14} />
            Nueva persona
          </Button>
        </Link>
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="min-w-64 flex-1">
          <Input
            placeholder="Buscar por nombre, email, NIF..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leading={<Icon icon={Search01Icon} size={15} />}
          />
        </div>
        <div className="flex items-center gap-2">
          {TYPES.map((opt) => (
            <button
              key={opt.value || "all"}
              type="button"
              onClick={() => {
                setType(opt.value);
                setPage(1);
              }}
              className={cn(
                "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                type === opt.value
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
                <th className="h-11 px-6 text-left">Persona</th>
                <th className="h-11 px-6 text-left">Tipo</th>
                <th className="h-11 px-6 text-left">Contacto</th>
                <th className="h-11 px-6 text-left">NIF</th>
                <th className="h-11 px-6 text-right">Contratos</th>
                <th className="h-11 px-6 text-right" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="h-14 px-6">
                      <div className="h-4 animate-pulse rounded bg-surface-muted" />
                    </td>
                  </tr>
                ))
              ) : (data?.data.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-foreground-muted">
                    Sin resultados.
                  </td>
                </tr>
              ) : (
                data?.data.map((p) => {
                  const badge = TYPE_BADGE[p.type] ?? TYPE_BADGE.tenant;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40"
                    >
                      <td className="h-14 px-6">
                        <Link href={`/personas/${p.id}`} className="flex items-center gap-3">
                          <Avatar name={p.full_name} size="sm" />
                          <span>
                            <div className="font-medium">{p.full_name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {p.city ?? "—"}
                            </div>
                          </span>
                        </Link>
                      </td>
                      <td className="h-14 px-6">
                        <Badge variant={badge.variant}>
                          <Icon icon={badge.icon} size={11} />
                          {badge.label}
                        </Badge>
                      </td>
                      <td className="h-14 px-6">
                        <div className="flex flex-col text-xs">
                          {p.email && (
                            <span className="inline-flex items-center gap-1 text-foreground-muted">
                              <Icon icon={Mail01Icon} size={11} />
                              {p.email}
                            </span>
                          )}
                          {p.phone && (
                            <span className="inline-flex items-center gap-1 text-foreground-muted">
                              <Icon icon={CallIcon} size={11} />
                              <span className="tabular-numbers">{p.phone}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="h-14 px-6 tabular-numbers text-foreground-muted">
                        {p.nif ?? "—"}
                      </td>
                      <td className="h-14 px-6 text-right tabular-numbers">
                        {p.type === "owner"
                          ? (p.owned_count ?? 0)
                          : (p.active_contracts_count ?? 0)}
                      </td>
                      <td className="h-14 px-6 text-right">
                        <Link
                          href={`/personas/${p.id}`}
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
