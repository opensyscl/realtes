"use client";

import { useEffect, useState } from "react";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useMlListingTypes, type MlListingTypeOption } from "@/lib/queries";
import { cn } from "@/lib/utils";

const EXPOSURE_LABEL: Record<string, string> = {
  highest: "Máxima exposición",
  high: "Exposición alta",
  mid: "Exposición media",
  lowest: "Exposición mínima",
};

interface Props {
  propertyId: number;
  open: boolean;
  onClose: () => void;
  /** Llamado con el listing_type_id elegido. */
  onConfirm: (listingTypeId: string) => void;
  isPublishing: boolean;
}

export function MlPublishDialog({
  propertyId,
  open,
  onClose,
  onConfirm,
  isPublishing,
}: Props) {
  const { data, isLoading, error } = useMlListingTypes(propertyId, open);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (data && !selected) {
      setSelected(data.chosen_listing_type_id);
    }
  }, [data, selected]);

  // Reset selection when dialog reopens for a different chosen tier
  useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  if (!open) return null;

  const chosen = selected
    ? data?.options.find((o) => o.id === selected)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold"
            style={{ backgroundColor: "#FFE600", color: "#1f2937" }}
          >
            ML
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Publicar en Mercado Libre
            </h3>
            <p className="text-xs text-foreground-muted">
              Elegí el tipo de publicación
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-5 space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-2xl bg-surface-muted/50"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-4 rounded-2xl border border-negative/30 bg-negative-soft/30 p-3 text-xs text-negative">
            <Icon icon={AlertCircleIcon} size={13} className="mr-1 inline" />
            No pudimos consultar los tipos de publicación. {String(error.message ?? error)}
          </div>
        ) : !data || data.options.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border-subtle p-4 text-center text-xs text-foreground-muted">
            Tu cuenta ML no tiene tipos disponibles para esta categoría. Verificá
            tu plan en developers.mercadolibre.cl.
          </div>
        ) : (
          <>
            <div className="mt-5 space-y-2 max-h-[60vh] overflow-y-auto">
              {data.options.map((opt) => (
                <TierOption
                  key={opt.id}
                  option={opt}
                  selected={selected === opt.id}
                  recommended={opt.id === data.chosen_listing_type_id}
                  onSelect={() => setSelected(opt.id)}
                />
              ))}
            </div>

            {chosen && chosen.fee > 0 && (
              <div className="mt-4 rounded-2xl border border-warning/30 bg-warning-soft/30 px-3 py-2 text-[11px]">
                <Icon
                  icon={AlertCircleIcon}
                  size={12}
                  className="mr-1 inline text-warning"
                />
                Mercado Libre te va a cobrar{" "}
                <strong className="tabular-numbers">
                  {formatCLP(chosen.fee)}
                </strong>{" "}
                por esta publicación.
              </div>
            )}
          </>
        )}

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-border-subtle pt-4">
          <Button variant="outline" onClick={onClose} disabled={isPublishing}>
            Cancelar
          </Button>
          <Button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected || isPublishing}
          >
            {isPublishing
              ? "Publicando..."
              : chosen && chosen.fee > 0
                ? `Confirmar y pagar ${formatCLP(chosen.fee)}`
                : "Publicar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TierOption({
  option,
  selected,
  recommended,
  onSelect,
}: {
  option: MlListingTypeOption;
  selected: boolean;
  recommended: boolean;
  onSelect: () => void;
}) {
  const isFree = option.fee === 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border p-3 text-left transition-all",
        selected
          ? "border-primary bg-primary-soft/40 ring-2 ring-primary/30"
          : "border-border-subtle bg-surface hover:border-border hover:bg-surface-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{option.name}</span>
            {recommended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-positive-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-positive">
                <Icon icon={CheckmarkCircle02Icon} size={9} />
                Recomendado
              </span>
            )}
          </div>
          {option.exposure && (
            <p className="mt-0.5 text-[11px] text-foreground-muted">
              {EXPOSURE_LABEL[option.exposure] ?? option.exposure}
            </p>
          )}
        </div>
        <div className="text-right">
          <div
            className={cn(
              "text-sm font-bold tabular-numbers",
              isFree ? "text-positive" : "text-foreground",
            )}
          >
            {isFree ? "Gratis" : formatCLP(option.fee)}
          </div>
          {option.remaining !== null && option.remaining > 0 && (
            <div className="text-[10px] text-muted-foreground">
              {option.remaining} restante{option.remaining === 1 ? "" : "s"}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function formatCLP(n: number): string {
  return "$" + n.toLocaleString("es-CL");
}
