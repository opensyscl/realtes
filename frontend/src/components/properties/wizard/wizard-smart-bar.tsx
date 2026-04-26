"use client";

import { useMemo, useState } from "react";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
  SparklesIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  RocketIcon,
  ViewIcon,
  Note01Icon,
} from "@hugeicons/core-free-icons";
import type { UseFormReturn } from "react-hook-form";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { StepId, WizardStep } from "./wizard-shell";

interface Requirement {
  field: string;
  label: string;
  step: StepId;
  isMet: boolean;
}

export function WizardSmartBar({
  form,
  steps,
  current,
  onChangeStep,
  onSaveDraft,
  onPublish,
  onPreview,
  saving,
  hasPhotos,
  isPublished,
}: {
  form: UseFormReturn<Record<string, unknown>>;
  steps: WizardStep[];
  current: StepId;
  onChangeStep: (id: StepId) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onPreview: () => void;
  saving?: boolean;
  hasPhotos?: boolean;
  isPublished?: boolean;
}) {
  const values = form.watch();
  const [expanded, setExpanded] = useState(false);

  const required: Requirement[] = useMemo(() => {
    const isRent =
      values.listing_type === "alquiler" || values.listing_type === "ambos";
    const isSale =
      values.listing_type === "venta" || values.listing_type === "ambos";
    const hasPrice = isRent
      ? !!values.price_rent
      : isSale
        ? !!values.price_sale
        : !!values.price_rent || !!values.price_sale;

    return [
      {
        field: "title",
        label: "Título de la propiedad",
        step: "basic",
        isMet: !!values.title && String(values.title).trim().length > 0,
      },
      {
        field: "description",
        label: "Descripción",
        step: "basic",
        isMet:
          !!values.description &&
          String(values.description).trim().length > 0,
      },
      {
        field: "price",
        label: isRent ? "Precio de renta" : "Precio de venta",
        step: "basic",
        isMet: hasPrice,
      },
      {
        field: "address",
        label: "Dirección",
        step: "location",
        isMet: !!values.address && String(values.address).trim().length > 0,
      },
      {
        field: "city",
        label: "Ciudad",
        step: "location",
        isMet: !!values.city && String(values.city).trim().length > 0,
      },
      {
        field: "bedrooms_or_area",
        label: "Habitaciones o superficie",
        step: "features",
        isMet:
          values.bedrooms !== undefined ||
          (typeof values.area_sqm === "number" && values.area_sqm > 0),
      },
      {
        field: "cover",
        label: "Foto de portada",
        step: "gallery",
        isMet: !!hasPhotos || !!values.cover_image_url,
      },
    ];
  }, [values, hasPhotos]);

  const recommended: Requirement[] = useMemo(
    () => [
      {
        field: "owner_person_id",
        label: "Asignar propietario",
        step: "owner",
        isMet: !!values.owner_person_id,
      },
      {
        field: "features",
        label: "Marcar comodidades",
        step: "comodidades",
        isMet:
          Array.isArray(values.features) &&
          (values.features as unknown[]).length > 0,
      },
      {
        field: "condition",
        label: "Estado interior",
        step: "interior",
        isMet: !!values.condition,
      },
    ],
    [values],
  );

  const totalRequired = required.length;
  const metRequired = required.filter((r) => r.isMet).length;
  const missingRequired = required.filter((r) => !r.isMet);
  const missingRecommended = recommended.filter((r) => !r.isMet);

  const totalAll = required.length + recommended.length;
  const metAll = metRequired + recommended.filter((r) => r.isMet).length;
  const overallPct = Math.round((metAll / totalAll) * 100);
  const isPublishable = missingRequired.length === 0;

  // Sugerencia del siguiente paso: el primer requisito faltante,
  // o si todo está OK, el siguiente paso del wizard.
  const nextSuggestion = useMemo(() => {
    if (missingRequired.length > 0) {
      return {
        kind: "required" as const,
        label: missingRequired[0].label,
        step: missingRequired[0].step,
      };
    }
    if (missingRecommended.length > 0) {
      return {
        kind: "recommended" as const,
        label: missingRecommended[0].label,
        step: missingRecommended[0].step,
      };
    }
    const enabled = steps.filter((s) => s.enabled);
    const idx = enabled.findIndex((s) => s.id === current);
    const nextStep = enabled[idx + 1];
    return nextStep
      ? {
          kind: "next" as const,
          label: nextStep.label,
          step: nextStep.id,
        }
      : null;
  }, [missingRequired, missingRecommended, steps, current]);

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[820px] -translate-x-1/2">
      {/* Panel expandido (encima de la barra) */}
      {expanded && (
        <div className="pointer-events-auto mb-2 rounded-2xl border border-border bg-surface p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Icon icon={SparklesIcon} size={12} />
                Asistente de publicación
              </div>
              <p className="mt-1 text-sm">
                {isPublishable
                  ? "Lista para publicar. Estos detalles opcionales harán tu ficha más completa:"
                  : `Faltan ${missingRequired.length} ${
                      missingRequired.length === 1
                        ? "campo esencial"
                        : "campos esenciales"
                    } para que la propiedad pueda publicarse.`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
              aria-label="Cerrar panel"
            >
              <Icon icon={ArrowDown01Icon} size={13} />
            </button>
          </div>

          {/* Lista de requeridos */}
          {missingRequired.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {missingRequired.map((r) => (
                <li key={r.field}>
                  <button
                    type="button"
                    onClick={() => onChangeStep(r.step)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
                        <Icon icon={AlertCircleIcon} size={11} />
                      </span>
                      <span className="text-[13px] font-medium">
                        {r.label}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-foreground-muted">
                      Ir
                      <Icon icon={ArrowRight01Icon} size={11} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Lista de recomendados (cuando ya es publicable o como complementarios) */}
          {missingRecommended.length > 0 && (
            <>
              {missingRequired.length > 0 && (
                <div className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Recomendado para una ficha completa
                </div>
              )}
              <ul className="mt-2 space-y-1.5">
                {missingRecommended.map((r) => (
                  <li key={r.field}>
                    <button
                      type="button"
                      onClick={() => onChangeStep(r.step)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/10"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-info-soft text-info">
                          <Icon icon={SparklesIcon} size={11} />
                        </span>
                        <span className="text-[13px] font-medium">
                          {r.label}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] text-foreground-muted">
                        Ir
                        <Icon icon={ArrowRight01Icon} size={11} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {missingRequired.length === 0 && missingRecommended.length === 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-positive-soft/40 p-3 text-[13px] text-positive">
              <Icon icon={CheckmarkCircle02Icon} size={14} />
              ¡Ficha completa! Lista para publicar.
            </div>
          )}
        </div>
      )}

      {/* Barra principal */}
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-foreground py-2 pl-2 pr-2 text-accent-foreground shadow-2xl">
        {/* Progreso circular */}
        <button
          type="button"
          onClick={() => setExpanded((o) => !o)}
          className="flex items-center gap-2.5 rounded-full px-2 py-1 hover:bg-accent-foreground/10"
          title="Ver detalles"
        >
          <ProgressRing pct={overallPct} ok={isPublishable} />
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider opacity-60">
              Completado
            </div>
            <div className="text-[12px] font-semibold tabular-numbers">
              {overallPct}%
            </div>
          </div>
        </button>

        <div className="mx-1 h-6 w-px bg-accent-foreground/20" />

        {/* Estado: publicable o no */}
        <div className="flex items-center gap-2 px-2">
          <span
            className={cn(
              "flex h-2 w-2 rounded-full",
              isPublishable ? "bg-positive" : "bg-warning",
            )}
          />
          <span className="text-[12px] font-medium">
            {isPublishable
              ? "Lista para publicar"
              : `${missingRequired.length} esencial${missingRequired.length === 1 ? "" : "es"}`}
          </span>
        </div>

        <div className="mx-1 h-6 w-px bg-accent-foreground/20" />

        {/* Sugerencia del siguiente paso */}
        {nextSuggestion && (
          <button
            type="button"
            onClick={() => onChangeStep(nextSuggestion.step)}
            className="inline-flex max-w-[280px] items-center gap-1.5 truncate rounded-full px-3 py-1.5 text-[12px] font-medium hover:bg-accent-foreground/10"
            title={`Ir a: ${nextSuggestion.label}`}
          >
            <Icon
              icon={
                nextSuggestion.kind === "required"
                  ? AlertCircleIcon
                  : nextSuggestion.kind === "recommended"
                    ? SparklesIcon
                    : ArrowRight01Icon
              }
              size={12}
              className={cn(
                nextSuggestion.kind === "required" && "text-warning",
                nextSuggestion.kind === "recommended" && "text-info",
              )}
            />
            <span className="truncate opacity-80">
              {nextSuggestion.kind === "required" && "Falta:"}
              {nextSuggestion.kind === "recommended" && "Sugerido:"}
              {nextSuggestion.kind === "next" && "Siguiente:"}
            </span>
            <span className="truncate font-semibold">
              {nextSuggestion.label}
            </span>
          </button>
        )}

        <div className="mx-1 h-6 w-px bg-accent-foreground/20" />

        {/* Vista previa */}
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors hover:bg-accent-foreground/10"
          title="Ver cómo se verá la ficha pública"
        >
          <Icon icon={ViewIcon} size={13} />
          Vista previa
        </button>

        {/* Guardar borrador (siempre disponible) */}
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors",
            "bg-accent-foreground/10 hover:bg-accent-foreground/20",
            saving && "cursor-wait opacity-60",
          )}
          title="Guardar como borrador (no se publica)"
        >
          <Icon icon={Note01Icon} size={13} />
          {saving ? "Guardando…" : "Borrador"}
        </button>

        {/* CTA: Publicar (solo si está completo) */}
        <button
          type="button"
          onClick={onPublish}
          disabled={saving || !isPublishable}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold transition-all",
            isPublishable
              ? "bg-positive text-white hover:bg-positive/90"
              : "cursor-not-allowed bg-accent-foreground/5 text-accent-foreground/40",
            saving && "cursor-wait opacity-60",
          )}
          title={
            isPublishable
              ? isPublished
                ? "Actualizar ficha publicada"
                : "Publicar la propiedad"
              : "Completa los campos esenciales para publicar"
          }
        >
          <Icon icon={RocketIcon} size={13} />
          {isPublished ? "Actualizar publicación" : "Publicar"}
        </button>

        {/* Toggle expand */}
        <button
          type="button"
          onClick={() => setExpanded((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent-foreground/10"
          aria-label={expanded ? "Cerrar panel" : "Ver detalles"}
        >
          <Icon
            icon={expanded ? ArrowDown01Icon : ArrowUp01Icon}
            size={13}
          />
        </button>

        {/* Datos al pasar el cursor */}
        <span className="sr-only">
          {metRequired} de {totalRequired} esenciales completos
        </span>
      </div>
    </div>
  );
}

function ProgressRing({ pct, ok }: { pct: number; ok: boolean }) {
  const size = 28;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 -rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={cn(
          "transition-all duration-500",
          ok ? "text-positive" : "text-warning",
        )}
      />
    </svg>
  );
}
