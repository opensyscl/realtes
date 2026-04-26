"use client";

import { useEffect } from "react";
import {
  Cancel01Icon,
  LocationStar01Icon,
  BedSingle01Icon,
  Bathtub01Icon,
  RulerIcon,
  CashIcon,
  Coins01Icon,
  PropertyNewIcon,
  CheckmarkCircle02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import type { UseFormReturn } from "react-hook-form";

import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  chalet: "Chalet",
  oficina: "Oficina",
  local: "Local",
  parking: "Parking",
  trastero: "Trastero",
};

const FEATURE_LABELS: Record<string, string> = {
  aire_acondicionado: "Aire acondicionado",
  amueblado: "Amoblado",
  ascensor: "Ascensor",
  balcon: "Balcón",
  bodega: "Bodega",
  estacionamiento: "Estacionamiento",
  gimnasio: "Gimnasio",
  patio: "Patio",
  piscina: "Piscina",
  terraza: "Terraza",
};

const formatFeature = (key: string) =>
  FEATURE_LABELS[key] ?? key.replace(/_/g, " ");

export function WizardPreview({
  form,
  open,
  onClose,
}: {
  form: UseFormReturn<Record<string, unknown>>;
  open: boolean;
  onClose: () => void;
}) {
  const v = form.watch();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const isRent =
    v.listing_type === "alquiler" || v.listing_type === "ambos";
  const price = isRent ? v.price_rent : v.price_sale;
  const features = Array.isArray(v.features) ? (v.features as string[]) : [];
  const cover = v.cover_image_url as string | undefined;
  const title = (v.title as string) || "Sin título";
  const description = (v.description as string) || "";
  const address = (v.address as string) || "";
  const city = (v.city as string) || "";
  const typeLabel = TYPE_LABELS[v.type as string] ?? v.type ?? "Propiedad";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[920px] flex-col overflow-hidden rounded-3xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon icon={ViewIcon} size={14} />
            </span>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vista previa
              </div>
              <div className="text-[12px] font-medium text-foreground-muted">
                Así se verá la ficha pública
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
            aria-label="Cerrar preview"
          >
            <Icon icon={Cancel01Icon} size={14} />
          </button>
        </div>

        {/* Scrollable preview */}
        <div className="flex-1 overflow-y-auto bg-background p-6">
          {/* Hero: imagen */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-muted">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-muted to-border-subtle text-foreground-muted">
                <div className="flex flex-col items-center gap-2">
                  <Icon icon={PropertyNewIcon} size={36} />
                  <span className="text-xs">Aún no hay foto de portada</span>
                </div>
              </div>
            )}

            {/* Overlay con badges */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
              <div className="flex flex-wrap gap-1.5">
                {v.listing_type ? (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
                      isRent ? "bg-info" : "bg-positive",
                    )}
                  >
                    {String(v.listing_type)}
                  </span>
                ) : null}
                <span className="rounded-full bg-foreground/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground backdrop-blur">
                  {typeLabel}
                </span>
              </div>
              {!v.is_published && (
                <span className="rounded-full bg-warning px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Borrador
                </span>
              )}
            </div>
          </div>

          {/* Header info */}
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              {(address || city) && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground-muted">
                  <Icon icon={LocationStar01Icon} size={13} />
                  {address}
                  {address && city ? " — " : ""}
                  {city}
                </p>
              )}
            </div>
            {price ? (
              <div className="text-right">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {isRent ? "Renta mensual" : "Precio venta"}
                </div>
                <div className="mt-0.5 flex items-baseline justify-end gap-1.5">
                  <span className="text-2xl font-bold tabular-numbers tracking-tight">
                    {formatCurrency(Number(price))}
                  </span>
                  {isRent && (
                    <span className="text-sm font-medium text-foreground-muted">
                      /mes
                    </span>
                  )}
                </div>
                {v.community_fee ? (
                  <div className="mt-0.5 flex justify-end text-[11px] text-foreground-muted tabular-numbers">
                    <span className="inline-flex items-center gap-1">
                      <Icon icon={Coins01Icon} size={11} />
                      Comunidad {formatCurrency(Number(v.community_fee))}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Métricas clave */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PreviewMetric
              icon={BedSingle01Icon}
              label="Habitaciones"
              value={
                v.bedrooms !== undefined ? String(v.bedrooms) : "—"
              }
            />
            <PreviewMetric
              icon={Bathtub01Icon}
              label="Baños"
              value={
                v.bathrooms !== undefined ? String(v.bathrooms) : "—"
              }
            />
            <PreviewMetric
              icon={RulerIcon}
              label="Superficie"
              value={v.area_sqm ? `${v.area_sqm} m²` : "—"}
            />
            <PreviewMetric
              icon={CashIcon}
              label="Renta"
              value={
                v.price_rent ? formatCurrency(Number(v.price_rent)) : "—"
              }
              suffix={v.price_rent ? "/mes" : undefined}
            />
          </div>

          {/* Descripción */}
          <section className="mt-7">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción
            </h3>
            {description ? (
              <p className="whitespace-pre-line text-sm text-foreground-muted">
                {description}
              </p>
            ) : (
              <p className="text-sm italic text-foreground-muted/70">
                Aún no hay descripción.
              </p>
            )}
          </section>

          {/* Comodidades */}
          {features.length > 0 && (
            <section className="mt-6">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Comodidades ({features.length})
              </h3>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {features.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-1.5 rounded-xl bg-surface-muted/50 px-3 py-1.5 text-[12px]"
                  >
                    <Icon
                      icon={CheckmarkCircle02Icon}
                      size={11}
                      className="text-positive"
                    />
                    <span className="truncate capitalize">
                      {formatFeature(f)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Detalles adicionales */}
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {v.year_built ? (
              <PreviewDetail label="Año construcción" value={String(v.year_built)} />
            ) : null}
            {v.orientation ? (
              <PreviewDetail
                label="Orientación"
                value={String(v.orientation)}
                capitalize
              />
            ) : null}
            {v.parking_spaces ? (
              <PreviewDetail
                label="Estacionamientos"
                value={String(v.parking_spaces)}
              />
            ) : null}
            {v.condition ? (
              <PreviewDetail
                label="Estado"
                value={String(v.condition).replace(/_/g, " ")}
                capitalize
              />
            ) : null}
            {v.floor_type ? (
              <PreviewDetail
                label="Tipo de piso"
                value={String(v.floor_type).replace(/_/g, " ")}
                capitalize
              />
            ) : null}
            {v.heating_type ? (
              <PreviewDetail
                label="Calefacción"
                value={String(v.heating_type).replace(/_/g, " ")}
                capitalize
              />
            ) : null}
          </section>

          {/* Footer del preview */}
          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface-muted/40 p-3 text-[12px] text-foreground-muted">
            <Badge variant="neutral">Preview</Badge>
            Es la representación aproximada de la ficha pública. Algunos
            elementos (galería completa, mapa, agente) requieren guardar la
            propiedad para mostrarse.
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewMetric({
  icon,
  label,
  value,
  suffix,
}: {
  icon: import("@hugeicons/react").IconSvgElement;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-border-subtle bg-surface p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
        <Icon icon={icon} size={14} />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="truncate text-sm font-bold tabular-numbers">
            {value}
          </span>
          {suffix && (
            <span className="text-[10px] text-foreground-muted">{suffix}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewDetail({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 truncate text-sm font-semibold",
          capitalize && "capitalize",
        )}
      >
        {value}
      </div>
    </div>
  );
}
