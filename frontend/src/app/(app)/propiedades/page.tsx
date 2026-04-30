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
  Mail01Icon,
  GridViewIcon,
  GridTableIcon,
  Download01Icon,
  WhatsappIcon,
  MoreVerticalIcon,
  Edit02Icon,
  Copy01Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  Link01Icon,
  ContractsIcon,
  LicenseNoIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  useProperties,
  usePropertyStats,
  useDuplicateProperty,
  useDeleteProperty,
  useSaveProperty,
  type Property,
} from "@/lib/queries";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import {
  Popover,
  PopoverTrigger,
  PopoverPopup,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
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
  { value: "__archived__", label: "Archivadas" },
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
  const showingArchived = status === "__archived__";
  const { data, isLoading } = useProperties({
    search: search || undefined,
    status: showingArchived ? undefined : status || undefined,
    trashed: showingArchived ? "only" : undefined,
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
        <SelectAllToggle visibleIds={data?.data.map((p) => p.id) ?? []} />
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

          <ExportXlsxButton />
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

function ExportXlsxButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const XLSX = await import("xlsx");
      // Pedimos todas las propiedades sin paginar (per_page alto).
      const res = await api.get<{ data: Property[] }>("/api/properties", {
        params: { per_page: 1000 },
      });
      const all = res.data.data ?? [];

      const rows = all.map((p) => ({
        ID: p.id,
        Código: p.code,
        Título: p.title,
        Tipo: p.type,
        Operación: p.listing_type,
        Estado: p.status,
        Dirección: p.address,
        Ciudad: p.city,
        Provincia: p.province,
        "Código postal": p.postal_code ?? "",
        Habitaciones: p.bedrooms,
        Baños: p.bathrooms,
        "m²": p.area_sqm ?? "",
        "m² construidos": p.built_sqm ?? "",
        "m² terraza": p.terrace_sqm ?? "",
        Estacionamientos: p.parking_spaces ?? "",
        "Año construcción": p.year_built ?? "",
        Orientación: p.orientation ?? "",
        "Renta mensual": p.price_rent ?? "",
        "Precio venta": p.price_sale ?? "",
        "Gastos comunes": p.community_fee ?? "",
        Contribuciones: p.ibi_annual ?? "",
        Edificio: p.building?.name ?? "",
        "Cliente asignado": p.client?.full_name ?? "",
        "Dueño": p.owner?.full_name ?? "",
        "Agente": p.agent?.name ?? "",
        Comodidades: (p.features ?? []).join(", "),
        "URL portada": p.cover_image_url ?? "",
        "Tour virtual": p.tour_url ?? "",
        "Video": p.video_url ?? "",
        "Creada": p.created_at,
        "Actualizada": p.updated_at,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);

      // Ancho de columnas auto (max 50)
      const cols = Object.keys(rows[0] ?? {}).map((key) => {
        const maxLen = Math.max(
          key.length,
          ...rows.map((r) => String(r[key as keyof typeof r] ?? "").length),
        );
        return { wch: Math.min(maxLen + 2, 50) };
      });
      ws["!cols"] = cols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Propiedades");
      const filename = `propiedades-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);

      toast.success({ title: `${all.length} propiedades exportadas` });
    } catch (err) {
      toast.error({
        title: "Error al exportar",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      title="Exportar todas las propiedades a Excel (.xlsx)"
      className={cn(
        "ml-1 inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground",
        loading && "cursor-wait opacity-60",
      )}
    >
      <Icon icon={Download01Icon} size={13} />
      {loading ? "Exportando…" : "Excel"}
    </button>
  );
}

function SelectAllToggle({ visibleIds }: { visibleIds: number[] }) {
  const idsSet = usePropertySelection((s) => s.ids);
  const setMany = usePropertySelection((s) => s.setMany);
  const clear = usePropertySelection((s) => s.clear);

  const total = visibleIds.length;
  const selectedHere = visibleIds.filter((id) => idsSet.has(id)).length;
  const allSelected = total > 0 && selectedHere === total;
  const someSelected = selectedHere > 0 && !allSelected;

  const handleClick = () => {
    if (allSelected) {
      // Deseleccionar sólo los visibles preservando otras selecciones.
      const remaining = Array.from(idsSet).filter(
        (id) => !visibleIds.includes(id),
      );
      clear();
      if (remaining.length) setMany(remaining);
    } else {
      setMany(visibleIds);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={
        allSelected
          ? "Deseleccionar visibles"
          : `Seleccionar ${total} visible${total === 1 ? "" : "s"}`
      }
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition-colors",
        allSelected
          ? "border-foreground bg-foreground text-accent-foreground"
          : someSelected
            ? "border-foreground/40 bg-surface text-foreground"
            : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
      )}
      aria-checked={allSelected ? "true" : someSelected ? "mixed" : "false"}
      role="checkbox"
    >
      {allSelected ? (
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6.5L4.5 9L10 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : someSelected ? (
        <span className="h-0.5 w-3 rounded-full bg-current" />
      ) : null}
    </button>
  );
}

function PropertyCardActions({ property: p }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dup = useDuplicateProperty();
  const del = useDeleteProperty();
  const save = useSaveProperty(p.id);

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const whatsappText = encodeURIComponent(
    `Hola! Te comparto esta propiedad: *${p.title}*\n` +
      `${p.address ?? ""}${p.city ? `, ${p.city}` : ""}\n` +
      (p.price_rent
        ? `Renta: $${Number(p.price_rent).toLocaleString("es-CL")}/mes\n`
        : "") +
      (p.price_sale
        ? `Precio: $${Number(p.price_sale).toLocaleString("es-CL")}\n`
        : "") +
      `${baseUrl}/propiedades/${p.id}`,
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  const stopAll = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDuplicate = async () => {
    setOpen(false);
    const ok = await toast.confirm({
      title: "¿Duplicar propiedad?",
      description: `Se creará una copia de "${p.title}" con un nuevo código.`,
      confirmLabel: "Duplicar",
    });
    if (!ok) return;
    try {
      const created = await toast.promise(dup.mutateAsync(p.id), {
        loading: { title: "Duplicando…" },
        success: (np: Property) => ({
          title: "Propiedad duplicada",
          description: `Nuevo código: ${np.code}`,
        }),
        error: (e: unknown) => ({
          title: "Error",
          description: e instanceof Error ? e.message : "",
        }),
      });
      router.push(`/propiedades/${created.id}`);
    } catch {
      // error toast ya se mostró
    }
  };

  const handleMarkRented = async () => {
    setOpen(false);
    const ok = await toast.confirm({
      title: "¿Marcar como arrendada?",
      description: `La propiedad "${p.title}" cambiará a estado arrendada.`,
      confirmLabel: "Confirmar",
    });
    if (!ok) return;
    await toast.promise(save.mutateAsync({ status: "arrendada" }), {
      loading: { title: "Actualizando…" },
      success: { title: "Marcada como arrendada" },
      error: (e: unknown) => ({
        title: "Error",
        description: e instanceof Error ? e.message : "",
      }),
    });
  };

  const handleDelete = async () => {
    setOpen(false);
    const ok = await toast.confirm({
      title: `¿Eliminar "${p.title}"?`,
      description: "Se podrá restaurar desde la papelera.",
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!ok) return;
    await toast.promise(del.mutateAsync(p.id), {
      loading: { title: "Eliminando…" },
      success: { title: "Propiedad eliminada" },
      error: (e: unknown) => ({
        title: "Error",
        description: e instanceof Error ? e.message : "",
      }),
    });
  };

  const handleCopyLink = async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(`${baseUrl}/propiedades/${p.id}`);
      toast.success("Link copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <div className="absolute right-3 top-3 z-20 flex items-center gap-1">
      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title="Compartir por WhatsApp"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-transform hover:scale-110"
      >
        <Icon icon={WhatsappIcon} size={13} />
      </a>

      {/* Acciones */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              onClick={stopAll}
              title="Acciones"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              <Icon icon={MoreVerticalIcon} size={14} />
            </button>
          }
        />
        <PopoverPopup align="end" side="bottom">
          <div
            className="flex w-56 flex-col p-1"
            onClick={stopAll}
            onPointerDown={stopAll}
          >
            <ActionItem
              icon={Edit02Icon}
              label="Editar"
              onClick={() => {
                setOpen(false);
                router.push(`/propiedades/${p.id}/editar`);
              }}
            />
            <ActionItem
              icon={WhatsappIcon}
              label="Compartir por WhatsApp"
              onClick={() => {
                setOpen(false);
                window.open(whatsappUrl, "_blank", "noopener,noreferrer");
              }}
              tone="positive"
            />
            <ActionItem
              icon={Link01Icon}
              label="Copiar link"
              onClick={handleCopyLink}
            />
            <ActionItem
              icon={Copy01Icon}
              label="Duplicar"
              onClick={handleDuplicate}
            />
            {p.status !== "arrendada" && (
              <ActionItem
                icon={CheckmarkCircle02Icon}
                label="Marcar como arrendada"
                onClick={handleMarkRented}
                tone="info"
              />
            )}
            <div className="my-1 h-px bg-border-subtle" />
            <ActionItem
              icon={Delete02Icon}
              label="Eliminar"
              onClick={handleDelete}
              tone="negative"
            />
          </div>
        </PopoverPopup>
      </Popover>
    </div>
  );
}

function ActionItem({
  icon,
  label,
  onClick,
  tone = "neutral",
}: {
  icon: import("@hugeicons/react").IconSvgElement;
  label: string;
  onClick: () => void;
  tone?: "neutral" | "positive" | "info" | "negative";
}) {
  const cls = {
    neutral: "text-foreground hover:bg-surface-muted",
    positive: "text-positive hover:bg-positive-soft/40",
    info: "text-info hover:bg-info-soft/40",
    negative: "text-negative hover:bg-negative-soft/40",
  }[tone];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition-colors",
        cls,
      )}
    >
      <Icon icon={icon} size={13} />
      {label}
    </button>
  );
}

function ContractRow({ property: p }: { property: Property }) {
  const isRental = !!p.price_rent;
  const c = p.active_contract;

  if (!isRental) return null;

  if (c) {
    const end = c.end_date ? new Date(c.end_date) : null;
    const daysLeft = end
      ? Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    const isExpiring = daysLeft !== null && daysLeft <= 60 && daysLeft >= 0;
    const isExpired = daysLeft !== null && daysLeft < 0;

    return (
      <div
        className={cn(
          "mt-2 flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-[11px]",
          isExpired
            ? "bg-negative-soft text-negative"
            : isExpiring
              ? "bg-warning-soft text-warning"
              : "bg-positive-soft text-positive",
        )}
        title={
          end
            ? `Vence el ${end.toLocaleDateString("es-CL")}`
            : "Contrato vigente"
        }
      >
        <span className="flex items-center gap-1.5 font-medium">
          <Icon icon={ContractsIcon} size={12} />
          {c.code}
        </span>
        <span className="tabular-numbers font-semibold">
          {formatCurrency(c.monthly_rent)}/mes
        </span>
      </div>
    );
  }

  return (
    <div
      className="mt-2 flex items-center gap-1.5 rounded-xl bg-surface-muted/60 px-2.5 py-1.5 text-[11px] text-foreground-muted"
      title="Aún no hay contrato cargado para esta propiedad"
    >
      <Icon icon={LicenseNoIcon} size={12} />
      <span>Sin contrato cargado</span>
    </div>
  );
}

function PropertyCard({ property: p }: { property: Property }) {
  const status = p.is_archived
    ? { label: "Archivada", tone: "neutral" as const }
    : (STATUS_VARIANT[p.status] ?? { label: p.status, tone: "neutral" as const });
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

            {/* Acciones top-right (WhatsApp + dropdown) */}
            <PropertyCardActions property={p} />

            {/* Status badge: debajo del menú, top-right secundario */}
            <div className="absolute right-3 top-12 z-10">
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
              {(p.leads_count ?? 0) > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
                  title={`${p.leads_count} consulta${p.leads_count === 1 ? "" : "s"} en el historial`}
                >
                  <Icon icon={Mail01Icon} size={10} />
                  {p.leads_count}
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

            <ContractRow property={p} />

            <PublishedChannels channels={p.published_channels} />
          </div>
        </Card>
      </Link>
    </div>
  );
}

/**
 * Iconitos del footer mostrando dónde está publicada la propiedad.
 * Cada nuevo conector (Toctoc, Idealista, etc.) suma una entrada en CHANNEL_BADGES.
 */
const CHANNEL_BADGES: Record<
  string,
  { label: string; bg: string; fg: string; mark: string }
> = {
  mercadolibre: {
    label: "Mercado Libre / Portal Inmobiliario",
    bg: "#FFE600",
    fg: "#1f2937",
    mark: "ML",
  },
  // Cuando agreguemos:
  // toctoc:    { label: "Toctoc",    bg: "#ff6900", fg: "#fff", mark: "TT" },
  // idealista: { label: "Idealista", bg: "#7cb342", fg: "#fff", mark: "ID" },
};

function PublishedChannels({ channels }: { channels?: string[] }) {
  if (!channels || channels.length === 0) return null;
  return (
    <div className="mt-3 flex items-center gap-1.5 border-t border-border-subtle pt-2">
      <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        Publicada en
      </span>
      <div className="flex items-center gap-1">
        {channels.map((c) => {
          const def = CHANNEL_BADGES[c];
          if (!def) return null;
          return (
            <span
              key={c}
              title={def.label}
              className="flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold"
              style={{ backgroundColor: def.bg, color: def.fg }}
            >
              {def.mark}
            </span>
          );
        })}
      </div>
    </div>
  );
}
