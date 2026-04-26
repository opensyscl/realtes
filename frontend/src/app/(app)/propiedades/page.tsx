"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search01Icon,
  Add01Icon,
  PropertyNewIcon,
  PropertyAddIcon,
  Building03Icon,
  LocationStar01Icon,
  BedSingle01Icon,
  Bathtub01Icon,
  RulerIcon,
  Location01Icon,
  Camera01Icon,
  GridViewIcon,
  GridTableIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useProperties, usePropertyStats, type Property } from "@/lib/queries";
import {
  PropertyFilters,
  type AdvancedFilters,
} from "@/components/properties/property-filters";
import { SelectionBar } from "@/components/properties/selection-bar";
import {
  PropertyTable,
  type SortState,
} from "@/components/properties/property-table";
import { usePropertySelection } from "@/store/selection";
import { cn, formatCurrency } from "@/lib/utils";

type ViewMode = "grid" | "table";

function loadViewMode(): ViewMode {
  if (typeof window === "undefined") return "grid";
  const saved = window.localStorage.getItem("rsv-properties-view");
  return saved === "table" ? "table" : "grid";
}

const STATUS_VARIANT: Record<
  string,
  { label: string; tone: "positive" | "info" | "warning" | "neutral" | "negative" }
> = {
  disponible: { label: "Disponible", tone: "positive" },
  arrendada: { label: "Arrendada", tone: "info" },
  vendida: { label: "Vendida", tone: "negative" },
  reservada: { label: "Reservada", tone: "warning" },
  mantenimiento: { label: "En mantenimiento", tone: "warning" },
};

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "disponible", label: "Disponibles" },
  { value: "arrendada", label: "Arrendadas" },
  { value: "vendida", label: "Vendidas" },
  { value: "reservada", label: "Reservadas" },
  { value: "mantenimiento", label: "En mantenimiento" },
];

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [advanced, setAdvanced] = useState<AdvancedFilters>({});
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortState>({
    field: "created_at",
    dir: "desc",
  });

  // Cargar preferencia de vista en mount (evita hydration mismatch)
  useEffect(() => {
    setView(loadViewMode());
  }, []);

  const handleViewChange = (mode: ViewMode) => {
    setView(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("rsv-properties-view", mode);
    }
  };

  const stats = usePropertyStats();
  const { data, isLoading } = useProperties({
    search: search || undefined,
    status: status || undefined,
    page,
    per_page: view === "table" ? 25 : 12,
    sort: sort.field,
    dir: sort.dir,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(advanced as any),
  });

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Propiedades</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Cartera completa: alta, edición y vista detallada de cada unidad.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/propiedades/mapa">
            <Button variant="outline">
              <Icon icon={LocationStar01Icon} size={14} />
              Ver en mapa
            </Button>
          </Link>
          <Link href="/propiedades/nueva">
            <Button>
              <Icon icon={Add01Icon} size={14} />
              Nueva propiedad
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox
          icon={PropertyNewIcon}
          label="Total"
          value={stats.data?.total}
        />
        <StatBox
          icon={PropertyAddIcon}
          label="Disponibles"
          value={stats.data?.available}
          tone="positive"
        />
        <StatBox
          icon={Building03Icon}
          label="Ocupadas"
          value={stats.data?.occupied}
          tone="info"
        />
        <StatBox
          icon={Building03Icon}
          label="Renta media"
          value={stats.data ? formatCurrency(stats.data.avg_rent) : undefined}
        />
      </div>

      {/* Filtros */}
      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="min-w-64 flex-1">
          <Input
            placeholder="Buscar por título, código o dirección..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leading={<Icon icon={Search01Icon} size={15} />}
          />
        </div>

        <div className="flex items-center gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.value;
            return (
              <button
                key={opt.value || "all"}
                type="button"
                onClick={() => {
                  setStatus(opt.value);
                  setPage(1);
                }}
                className={cn(
                  "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
                )}
              >
                {opt.label}
              </button>
            );
          })}
          <PropertyFilters
            value={advanced}
            onChange={(v) => {
              setAdvanced(v);
              setPage(1);
            }}
          />

          {/* Toggle Grid/Tabla */}
          <div className="ml-1 inline-flex items-center gap-0 rounded-full border border-border bg-surface p-0.5">
            <button
              type="button"
              onClick={() => handleViewChange("grid")}
              title="Vista en grid"
              className={cn(
                "inline-flex h-7 w-8 items-center justify-center rounded-full transition-colors",
                view === "grid"
                  ? "bg-foreground text-accent-foreground"
                  : "text-foreground-muted hover:bg-surface-muted",
              )}
            >
              <Icon icon={GridViewIcon} size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("table")}
              title="Vista en tabla"
              className={cn(
                "inline-flex h-7 w-8 items-center justify-center rounded-full transition-colors",
                view === "table"
                  ? "bg-foreground text-accent-foreground"
                  : "text-foreground-muted hover:bg-surface-muted",
              )}
            >
              <Icon icon={GridTableIcon} size={13} />
            </button>
          </div>
        </div>
      </Card>

      {/* Grid o Tabla */}
      {isLoading && !data ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="h-80 animate-pulse bg-surface-muted/50" />
            ))}
          </div>
        ) : (
          <Card className="h-[480px] animate-pulse bg-surface-muted/50" />
        )
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {data?.data.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <PropertyTable
              properties={data?.data ?? []}
              sort={sort}
              onSortChange={(s) => {
                setSort(s);
                setPage(1);
              }}
            />
          )}

          {data && (
            <div className="mt-6 flex items-center justify-between text-sm text-foreground-muted">
              <span className="tabular-numbers">
                Mostrando {(data.meta.current_page - 1) * data.meta.per_page + 1}–
                {Math.min(
                  data.meta.current_page * data.meta.per_page,
                  data.meta.total,
                )}{" "}
                de {data.meta.total}
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
        </>
      )}

      <SelectionBar allProperties={data?.data ?? []} />
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  tone,
}: {
  icon: Parameters<typeof Icon>[0]["icon"];
  label: string;
  value: string | number | undefined;
  tone?: "positive" | "info";
}) {
  const toneClasses = tone
    ? tone === "positive"
      ? "bg-positive-soft text-positive"
      : "bg-info-soft text-info"
    : "bg-surface-muted text-foreground-muted";

  return (
    <Card className="flex items-center gap-4 p-5">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-2xl",
          toneClasses,
        )}
      >
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

function PropertyCard({ property: p }: { property: Property }) {
  const status = STATUS_VARIANT[p.status] ?? { label: p.status, tone: "neutral" as const };
  const selected = usePropertySelection((s) => s.ids.has(p.id));
  const toggle = usePropertySelection((s) => s.toggle);
  const anySelected = usePropertySelection((s) => s.ids.size > 0);

  const isRent = !!p.price_rent;
  const priceMain = isRent ? p.price_rent : p.price_sale;

  return (
    <div className="group relative">
      {/* Checkbox flotante */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(p.id);
        }}
        className={cn(
          "absolute left-3 top-3 z-20 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all duration-200",
          selected
            ? "border-foreground bg-foreground text-accent-foreground opacity-100"
            : anySelected
              ? "border-white/80 bg-white/90 text-foreground opacity-100 backdrop-blur"
              : "border-white/80 bg-white/90 text-foreground opacity-0 backdrop-blur group-hover:opacity-100",
        )}
        aria-label={selected ? "Deseleccionar" : "Seleccionar"}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6.5L4.5 9L10 3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <Link href={`/propiedades/${p.id}`} className="block">
        <Card
          className={cn(
            "group/card cursor-pointer overflow-hidden p-0",
            "transition-all duration-300 ease-out",
            "hover:-translate-y-1 hover:shadow-[0_18px_40px_-15px_rgba(0,0,0,0.22)]",
            selected && "ring-2 ring-foreground/40 ring-offset-2 ring-offset-background",
          )}
        >
          {/* Imagen con overlay y badges */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-surface-muted to-border-subtle">
            {p.cover_image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={p.cover_image_url}
                alt={p.title}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-foreground-muted">
                <Icon icon={PropertyNewIcon} size={48} />
              </div>
            )}

            {/* Gradiente inferior */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            {/* Status badge top-right */}
            <div className="absolute right-3 top-3 z-10">
              <Badge
                variant={status.tone}
                className="border border-white/20 bg-white/95 shadow-sm backdrop-blur"
              >
                {status.label}
              </Badge>
            </div>

            {/* Tipo de operación bottom-left */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-sm",
                  isRent
                    ? "bg-info text-white"
                    : "bg-positive text-white",
                )}
              >
                {isRent ? "Alquiler" : "Venta"}
              </span>
              {p.cover_image_url && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  <Icon icon={Camera01Icon} size={10} />
                  1
                </span>
              )}
            </div>

            {/* Precio sobreimpreso bottom-right */}
            <div className="absolute bottom-3 right-3 z-10 text-right text-white">
              <div className="text-base font-bold leading-none tabular-numbers drop-shadow-md">
                {priceMain ? formatCurrency(priceMain) : "—"}
              </div>
              {isRent && (
                <div className="mt-0.5 text-[10px] font-medium opacity-90">/mes</div>
              )}
              {p.price_rent && p.price_sale && (
                <div className="mt-0.5 text-[10px] tabular-numbers opacity-80">
                  Venta {formatCurrency(p.price_sale)}
                </div>
              )}
            </div>
          </div>

          {/* Contenido */}
          <div className="p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="tabular-numbers">{p.code}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50" />
              <span className="capitalize">{p.type}</span>
            </div>
            <h3 className="mt-1.5 line-clamp-1 text-[15px] font-semibold tracking-tight">
              {p.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-foreground-muted">
              <Icon icon={Location01Icon} size={11} />
              <span className="truncate">{p.address}, {p.city}</span>
            </p>

            {/* Stats con iconos */}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-subtle pt-3 text-xs text-foreground-muted">
              <span className="flex items-center gap-1 tabular-numbers">
                <Icon icon={BedSingle01Icon} size={13} />
                {p.bedrooms}
              </span>
              <span className="h-3 w-px bg-border-subtle" />
              <span className="flex items-center gap-1 tabular-numbers">
                <Icon icon={Bathtub01Icon} size={13} />
                {p.bathrooms}
              </span>
              <span className="h-3 w-px bg-border-subtle" />
              <span className="flex items-center gap-1 tabular-numbers">
                <Icon icon={RulerIcon} size={13} />
                {p.area_sqm ?? "—"}m²
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
