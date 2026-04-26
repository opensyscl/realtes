"use client";

import { useState } from "react";
import {
  Search01Icon,
  PropertyNewIcon,
  Building03Icon,
  Coins01Icon,
  CallIcon,
  Mail01Icon,
  BedSingle01Icon,
  Bathtub01Icon,
  RulerIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  useMarketplace,
  useMarketplaceStats,
  type MarketplaceProperty,
} from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";

const TYPES = [
  { value: "", label: "Todas" },
  { value: "apartamento", label: "Apartamentos" },
  { value: "casa", label: "Casas" },
  { value: "oficina", label: "Oficinas" },
  { value: "local", label: "Locales" },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  const stats = useMarketplaceStats();
  const { data, isLoading } = useMarketplace({
    search: search || undefined,
    type: type || undefined,
    page,
    per_page: 12,
  });

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Icon icon={Building03Icon} size={13} />
          Marketplace cross-broker
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Propiedades compartidas por otras agencias
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Si encuentras un cliente para una de estas propiedades, contacta a la
          agencia propietaria. El % indica la comisión que comparte contigo si cierras.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox
          icon={Building03Icon}
          label="Propiedades disponibles"
          value={stats.data?.available_count}
        />
        <StatBox
          icon={Coins01Icon}
          tone="info"
          label="Agencias compartiendo"
          value={stats.data?.agencies_sharing}
        />
        <StatBox
          icon={PropertyNewIcon}
          tone="positive"
          label="Mías compartidas"
          value={stats.data?.my_shared_count}
        />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="min-w-64 flex-1">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leading={<Icon icon={Search01Icon} size={15} />}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {TYPES.map((t) => (
            <button
              key={t.value || "all"}
              onClick={() => {
                setType(t.value);
                setPage(1);
              }}
              className={cn(
                "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                type === t.value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-72 animate-pulse bg-surface-muted/50" />
          ))}
        </div>
      ) : (data?.data.length ?? 0) === 0 ? (
        <Card className="p-12 text-center">
          <Icon icon={Building03Icon} size={36} className="mx-auto text-foreground-muted" />
          <h3 className="mt-3 font-semibold">Sin propiedades en el marketplace</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Cuando otras agencias compartan propiedades, las verás aquí.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((p) => <SharedCard key={p.id} property={p} />)}
        </div>
      )}

      {data && data.meta.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
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
      )}
    </div>
  );
}

function SharedCard({ property: p }: { property: MarketplaceProperty }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-surface-muted to-border-subtle">
        {p.cover_image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={p.cover_image_url}
            alt={p.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-foreground-muted">
            <Icon icon={PropertyNewIcon} size={48} />
          </div>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-1 text-[10px] font-semibold text-accent-foreground tabular-numbers">
          <Icon icon={Coins01Icon} size={10} />
          {p.share_pct}%
        </span>
      </div>
      <div className="p-5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {p.type} · {p.listing_type}
        </div>
        <h3 className="mt-1 truncate text-base font-semibold tracking-tight">
          {p.title}
        </h3>
        <p className="truncate text-xs text-foreground-muted">
          {p.address}, {p.city}
        </p>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-lg font-semibold tabular-numbers">
            {p.price_rent ? formatCurrency(p.price_rent) : "—"}
            <span className="ml-1 text-xs font-normal text-muted-foreground">/mes</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground-muted tabular-numbers">
            <span className="inline-flex items-center gap-0.5">
              <Icon icon={BedSingle01Icon} size={12} />
              {p.bedrooms}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Icon icon={Bathtub01Icon} size={12} />
              {p.bathrooms}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Icon icon={RulerIcon} size={12} />
              {p.area_sqm}m²
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border-subtle pt-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Compartida por
            </div>
            <div className="truncate text-sm font-semibold">{p.agency.name}</div>
          </div>
          <div className="flex items-center gap-1">
            {p.agency.phone && (
              <a
                href={`tel:${p.agency.phone}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                title={p.agency.phone}
              >
                <Icon icon={CallIcon} size={13} />
              </a>
            )}
            {p.agency.email && (
              <a
                href={`mailto:${p.agency.email}?subject=Interesado en ${encodeURIComponent(p.code)}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                title={p.agency.email}
              >
                <Icon icon={Mail01Icon} size={13} />
              </a>
            )}
            <Badge variant="outline">{p.code}</Badge>
          </div>
        </div>
      </div>
    </Card>
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
  tone?: "info" | "positive";
}) {
  const t =
    tone === "info"
      ? "bg-info-soft text-info"
      : tone === "positive"
        ? "bg-positive-soft text-positive"
        : "bg-surface-muted text-foreground-muted";
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", t)}>
        <Icon icon={icon} size={18} />
      </span>
      <div>
        <div className="text-xs font-medium text-foreground-muted">{label}</div>
        <div className="mt-0.5 text-xl font-semibold tabular-numbers">
          {value ?? "—"}
        </div>
      </div>
    </Card>
  );
}
