"use client";

import Link from "next/link";
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  PropertyNewIcon,
  Building03Icon,
  Agreement02Icon,
  EyeIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { usePropertySelection } from "@/store/selection";
import { cn, formatCurrency } from "@/lib/utils";
import type { Property } from "@/lib/queries";

const STATUS_VARIANT: Record<
  string,
  { label: string; tone: "positive" | "info" | "warning" | "neutral" | "negative"; color: string }
> = {
  disponible: { label: "Disponible", tone: "positive", color: "#15a86c" },
  arrendada: { label: "Arrendada", tone: "info", color: "#2563eb" },
  vendida: { label: "Vendida", tone: "negative", color: "#dc3545" },
  reservada: { label: "Reservada", tone: "warning", color: "#e0a800" },
  mantenimiento: { label: "Mantenimiento", tone: "warning", color: "#f97316" },
};

export interface SortState {
  field: string;
  dir: "asc" | "desc";
}

const COLUMNS = [
  { id: "image", label: "", width: "w-16", sortable: false },
  { id: "title", label: "Propiedad", sortable: true },
  { id: "listing_type", label: "🏠", sortable: true, width: "w-24", title: "Operación" },
  { id: "leads_count", label: "📩", sortable: true, width: "w-20", title: "Consultas" },
  { id: "status", label: "Estado", sortable: true, width: "w-32" },
  { id: "building", label: "Edificio", sortable: false, width: "w-36" },
  { id: "active_contract", label: "Contrato", sortable: false, width: "w-32" },
  { id: "is_shared", label: "Compart.", sortable: false, width: "w-24" },
  { id: "type", label: "Tipo", sortable: false, width: "w-28" },
  { id: "price_rent", label: "Precio", sortable: true, width: "w-32" },
  { id: "view_count", label: "Vistas", sortable: true, width: "w-20" },
  { id: "created_at", label: "Fecha", sortable: true, width: "w-28" },
];

export function PropertyTable({
  properties,
  sort,
  onSortChange,
}: {
  properties: Property[];
  sort: SortState;
  onSortChange: (sort: SortState) => void;
}) {
  const ids = usePropertySelection((s) => s.ids);
  const toggle = usePropertySelection((s) => s.toggle);
  const setMany = usePropertySelection((s) => s.setMany);
  const clear = usePropertySelection((s) => s.clear);

  const allSelected =
    properties.length > 0 && properties.every((p) => ids.has(p.id));
  const someSelected =
    !allSelected && properties.some((p) => ids.has(p.id));

  const handleSort = (field: string) => {
    if (sort.field === field) {
      onSortChange({ field, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      onSortChange({ field, dir: "desc" });
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      clear();
    } else {
      setMany(properties.map((p) => p.id));
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-muted/50">
              <th className="sticky left-0 z-10 w-10 bg-surface-muted/50 px-3 py-3">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Seleccionar todo"
                />
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.id}
                  title={col.title}
                  className={cn(
                    "px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                    col.width,
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.id)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {col.label}
                      {sort.field === col.id ? (
                        <Icon
                          icon={sort.dir === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
                          size={11}
                        />
                      ) : (
                        <span className="opacity-40">↕</span>
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <PropertyRow
                key={p.id}
                property={p}
                selected={ids.has(p.id)}
                onToggle={() => toggle(p.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PropertyRow({
  property: p,
  selected,
  onToggle,
}: {
  property: Property;
  selected: boolean;
  onToggle: () => void;
}) {
  const status = STATUS_VARIANT[p.status] ?? {
    label: p.status,
    tone: "neutral" as const,
    color: "#9ca3af",
  };
  const isRent = !!p.price_rent;
  const price = isRent ? p.price_rent : p.price_sale;

  return (
    <tr
      className={cn(
        "border-b border-border-subtle transition-colors last:border-b-0",
        selected ? "bg-primary-soft/40" : "hover:bg-surface-muted/40",
      )}
    >
      <td className="sticky left-0 z-10 bg-inherit px-3 py-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      {/* Image */}
      <td className="px-3 py-2.5">
        <Link href={`/propiedades/${p.id}`}>
          <div className="h-12 w-16 overflow-hidden rounded-xl bg-surface-muted">
            {p.cover_image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={p.cover_image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-foreground-muted">
                <Icon icon={PropertyNewIcon} size={18} />
              </div>
            )}
          </div>
        </Link>
      </td>

      {/* Title + code + city */}
      <td className="min-w-[260px] px-3 py-2.5">
        <Link
          href={`/propiedades/${p.id}`}
          className="block min-w-0 hover:underline"
        >
          <div className="truncate text-[13px] font-semibold">{p.title}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="tabular-numbers">{p.code}</span>
            <span>·</span>
            <span className="truncate">{p.city}</span>
          </div>
        </Link>
      </td>

      {/* Listing type */}
      <td className="px-3 py-2.5">
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            isRent ? "bg-info-soft text-info" : "bg-positive-soft text-positive",
          )}
        >
          {p.listing_type === "alquiler" ? "Alquiler" : p.listing_type === "venta" ? "Venta" : p.listing_type}
        </span>
      </td>

      {/* Leads count */}
      <td className="px-3 py-2.5">
        <div className="inline-flex items-center gap-1 text-[13px] tabular-numbers">
          <span className={cn(
            "font-semibold",
            (p.leads_count ?? 0) > 0 ? "text-foreground" : "text-foreground-muted/60"
          )}>
            {p.leads_count ?? 0}
          </span>
        </div>
      </td>

      {/* Status con dot de color */}
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          {status.label}
        </span>
      </td>

      {/* Building */}
      <td className="px-3 py-2.5">
        {p.building ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-foreground-muted">
            <Icon icon={Building03Icon} size={11} />
            <span className="truncate">{p.building.name}</span>
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">—</span>
        )}
      </td>

      {/* Active contract */}
      <td className="px-3 py-2.5">
        {p.active_contract ? (
          <Link
            href={`/contratos/${p.active_contract.id}`}
            className="inline-flex items-center gap-1.5 text-[12px] hover:underline"
          >
            <Icon icon={Agreement02Icon} size={11} className="text-positive" />
            <span className="font-mono tabular-numbers">{p.active_contract.code}</span>
          </Link>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">Sin contrato</span>
        )}
      </td>

      {/* Compartido */}
      <td className="px-3 py-2.5">
        {p.is_shared ? (
          <Badge variant="info" className="text-[10px]">
            {p.share_pct ?? 50}%
          </Badge>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">No</span>
        )}
      </td>

      {/* Type */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] capitalize text-foreground-muted">
          {p.type}
        </span>
      </td>

      {/* Price */}
      <td className="px-3 py-2.5">
        {price ? (
          <div>
            <div className="text-[13px] font-semibold tabular-numbers">
              {formatCurrency(price)}
            </div>
            {isRent && (
              <div className="text-[10px] text-muted-foreground">/mes</div>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">—</span>
        )}
      </td>

      {/* View count */}
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center gap-1 text-[12px] tabular-numbers text-foreground-muted">
          <Icon icon={EyeIcon} size={11} />
          {p.view_count ?? 0}
        </span>
      </td>

      {/* Created at */}
      <td className="px-3 py-2.5 text-[11px] tabular-numbers text-foreground-muted">
        {new Date(p.created_at).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })}
      </td>
    </tr>
  );
}
