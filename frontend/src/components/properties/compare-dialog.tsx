"use client";

import Link from "next/link";
import {
  Cancel01Icon,
  PropertyNewIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { type Property } from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  properties: Property[];
}

const STATUS_VARIANT: Record<
  string,
  "neutral" | "info" | "warning" | "positive" | "negative"
> = {
  disponible: "positive",
  ocupada: "info",
  mantenimiento: "warning",
  fuera_mercado: "neutral",
};

export function CompareDialog({ open, onClose, properties }: Props) {
  if (!open) return null;

  // Calcular best/worst para resaltar
  const prices = properties.map((p) => p.price_rent ?? 0).filter(Boolean);
  const areas = properties.map((p) => p.area_sqm ?? 0).filter(Boolean);
  const minPrice = Math.min(...prices);
  const maxArea = Math.max(...areas);

  const allFeatures = Array.from(
    new Set(properties.flatMap((p) => p.features ?? [])),
  ).sort();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 pt-[5vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl rounded-3xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border-subtle p-5">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Comparar
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              {properties.length} propiedades lado a lado
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
            aria-label="Cerrar"
          >
            <Icon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <div className="overflow-x-auto p-5">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `180px repeat(${properties.length}, minmax(200px, 1fr))`,
            }}
          >
            {/* Header con foto */}
            <div />
            {properties.map((p) => (
              <div key={`hdr-${p.id}`} className="space-y-2">
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface-muted">
                  {p.cover_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-foreground-muted">
                      <Icon icon={PropertyNewIcon} size={32} />
                    </div>
                  )}
                </div>
                <div>
                  <Link
                    href={`/propiedades/${p.id}`}
                    className="block truncate text-sm font-semibold hover:underline"
                  >
                    {p.title}
                  </Link>
                  <div className="text-[11px] tabular-numbers text-muted-foreground">
                    {p.code}
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[p.status] ?? "neutral"} className="text-[10px]">
                  {p.status}
                </Badge>
              </div>
            ))}

            {/* Filas comparativas */}
            <Section title="Precios" />
            <Row
              label="Renta /mes"
              values={properties.map((p) => ({
                value: p.price_rent ? formatCurrency(p.price_rent) : "—",
                highlight: p.price_rent === minPrice && minPrice > 0,
                hint: p.price_rent === minPrice && minPrice > 0 ? "más barato" : null,
              }))}
            />
            <Row
              label="Precio venta"
              values={properties.map((p) => ({
                value: p.price_sale ? formatCurrency(p.price_sale) : "—",
              }))}
            />
            <Row
              label="Comunidad"
              values={properties.map((p) => ({
                value: p.community_fee ? formatCurrency(p.community_fee) : "—",
              }))}
            />
            <Row
              label="€/m² mensual"
              values={properties.map((p) => ({
                value:
                  p.price_rent && p.area_sqm
                    ? `€${(p.price_rent / p.area_sqm).toFixed(2)}`
                    : "—",
              }))}
            />

            <Section title="Características" />
            <Row
              label="Tipo"
              values={properties.map((p) => ({
                value: p.type,
                className: "capitalize",
              }))}
            />
            <Row
              label="Habitaciones"
              values={properties.map((p) => ({
                value: p.bedrooms.toString(),
              }))}
            />
            <Row
              label="Baños"
              values={properties.map((p) => ({
                value: p.bathrooms.toString(),
              }))}
            />
            <Row
              label="Superficie"
              values={properties.map((p) => ({
                value: p.area_sqm ? `${p.area_sqm} m²` : "—",
                highlight: p.area_sqm === maxArea && maxArea > 0,
                hint: p.area_sqm === maxArea && maxArea > 0 ? "más grande" : null,
              }))}
            />
            <Row
              label="Planta"
              values={properties.map((p) => ({
                value: p.floor || "—",
              }))}
            />

            <Section title="Ubicación" />
            <Row
              label="Dirección"
              values={properties.map((p) => ({ value: p.address, small: true }))}
            />
            <Row
              label="C.P."
              values={properties.map((p) => ({
                value: p.postal_code || "—",
              }))}
            />

            <Section title="Características incluidas" />
            {allFeatures.map((feat) => (
              <Row
                key={feat}
                label={feat.replace(/_/g, " ")}
                labelCapitalize
                values={properties.map((p) => ({
                  value: p.features?.includes(feat) ? (
                    <Icon icon={CheckmarkCircle02Icon} size={14} className="text-positive" />
                  ) : (
                    <span className="text-foreground-muted/40">—</span>
                  ),
                  isReact: true,
                }))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div
      className="col-span-full mt-4 border-b border-border-subtle pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
    >
      {title}
    </div>
  );
}

interface CellValue {
  value: React.ReactNode;
  highlight?: boolean;
  hint?: string | null;
  className?: string;
  small?: boolean;
  isReact?: boolean;
}

function Row({
  label,
  values,
  labelCapitalize,
}: {
  label: string;
  values: CellValue[];
  labelCapitalize?: boolean;
}) {
  return (
    <>
      <div
        className={cn(
          "flex items-center text-xs font-medium text-muted-foreground",
          labelCapitalize && "capitalize",
        )}
      >
        {label}
      </div>
      {values.map((v, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col justify-center rounded-2xl px-3 py-2 tabular-numbers",
            v.highlight && "bg-positive-soft text-positive",
            v.small && "text-xs",
            v.className,
          )}
        >
          <span className={cn("font-medium", !v.small && "text-sm")}>{v.value}</span>
          {v.hint && (
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
              {v.hint}
            </span>
          )}
        </div>
      ))}
    </>
  );
}
