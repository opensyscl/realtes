"use client";

import Link from "next/link";
import { use, useState } from "react";
import {
  Search01Icon,
  PropertyNewIcon,
  BedSingle01Icon,
  Bathtub01Icon,
  RulerIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  usePublicAgency,
  usePublicProperties,
  type PublicProperty,
} from "@/lib/queries-public";
import { cn, formatCurrency } from "@/lib/utils";

const TYPES = [
  { value: "", label: "Todas" },
  { value: "apartamento", label: "Apartamentos" },
  { value: "casa", label: "Casas" },
  { value: "oficina", label: "Oficinas" },
  { value: "local", label: "Locales" },
];

export default function PublicListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: agency } = usePublicAgency(slug);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [listing, setListing] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePublicProperties(slug, {
    search: search || undefined,
    type: type || undefined,
    listing_type: listing || undefined,
    page,
    per_page: 12,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {agency?.name ?? "Cargando..."}
        </h1>
        <p className="mt-2 text-sm text-foreground-muted">
          {agency?.properties_count ?? 0} propiedad
          {(agency?.properties_count ?? 0) !== 1 && "es"} disponibles en{" "}
          {agency?.city ?? "Valencia"}.
        </p>
      </div>

      {/* Búsqueda */}
      <Card className="mb-6 flex flex-wrap items-center gap-3 p-3">
        <div className="min-w-64 flex-1">
          <Input
            placeholder="Busca por zona, calle o tipo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leading={<Icon icon={Search01Icon} size={15} />}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
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
        <div className="flex items-center gap-1">
          {[
            { v: "", l: "Todas" },
            { v: "alquiler", l: "Alquiler" },
            { v: "venta", l: "Venta" },
          ].map((o) => (
            <button
              key={o.v || "all-l"}
              onClick={() => {
                setListing(o.v);
                setPage(1);
              }}
              className={cn(
                "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                listing === o.v
                  ? "border-foreground bg-foreground text-accent-foreground"
                  : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
              )}
            >
              {o.l}
            </button>
          ))}
        </div>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-72 animate-pulse bg-surface-muted/50" />
          ))}
        </div>
      ) : (data?.data.length ?? 0) === 0 ? (
        <Card className="p-12 text-center">
          <Icon icon={PropertyNewIcon} size={36} className="mx-auto text-foreground-muted" />
          <h3 className="mt-3 font-semibold">Sin resultados</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Prueba con otros filtros.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((p) => (
              <PropertyCard key={p.id} property={p} slug={slug} />
            ))}
          </div>

          {data && data.meta.last_page > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.meta.current_page <= 1}
                className="h-9 rounded-full border border-border bg-surface px-4 text-xs font-medium text-foreground-muted hover:bg-surface-muted disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-3 text-xs tabular-numbers text-foreground-muted">
                {data.meta.current_page} / {data.meta.last_page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={data.meta.current_page >= data.meta.last_page}
                className="h-9 rounded-full border border-border bg-surface px-4 text-xs font-medium text-foreground-muted hover:bg-surface-muted disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PropertyCard({
  property: p,
  slug,
}: {
  property: PublicProperty;
  slug: string;
}) {
  return (
    <Link href={`/p/${slug}/${p.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-card cursor-pointer">
        <div className="aspect-[16/10] w-full bg-gradient-to-br from-surface-muted to-border-subtle">
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
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>{p.type}</span>·<span>{p.listing_type}</span>
          </div>
          <h3 className="mt-1 truncate text-base font-semibold tracking-tight">
            {p.title}
          </h3>
          <p className="truncate text-xs text-foreground-muted">
            {p.address}, {p.city}
          </p>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-lg font-semibold tabular-numbers">
                {p.price_rent ? formatCurrency(p.price_rent) : "—"}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  /mes
                </span>
              </div>
              {p.price_sale && (
                <div className="text-[11px] text-muted-foreground tabular-numbers">
                  Venta {formatCurrency(p.price_sale)}
                </div>
              )}
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

          {p.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border-subtle pt-4">
              {p.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
