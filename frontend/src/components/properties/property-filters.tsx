"use client";

import { useState } from "react";
import {
  FilterIcon,
  Cancel01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface AdvancedFilters {
  min_price?: number;
  max_price?: number;
  bedrooms_min?: number;
  area_min?: number;
  types?: string[];
  features?: string[];
  listing_type?: string;
}

interface Props {
  value: AdvancedFilters;
  onChange: (next: AdvancedFilters) => void;
}

const TYPES = ["apartamento", "casa", "chalet", "oficina", "local", "parking", "trastero"];
const FEATURES = [
  "amueblado",
  "ascensor",
  "aire_acondicionado",
  "calefaccion_central",
  "terraza",
  "balcon",
  "parking",
  "trastero",
  "lavadora",
  "horno",
  "lavavajillas",
  "fibra_optica",
];
const LISTING_TYPES = [
  { value: "", label: "Todos" },
  { value: "alquiler", label: "Alquiler" },
  { value: "venta", label: "Venta" },
  { value: "ambos", label: "Ambos" },
];

export function PropertyFilters({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const activeCount = countActive(value);

  const update = (patch: Partial<AdvancedFilters>) => onChange({ ...value, ...patch });

  const toggleArray = (key: "types" | "features", item: string) => {
    const current = value[key] ?? [];
    update({
      [key]: current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item],
    } as Partial<AdvancedFilters>);
  };

  const reset = () => onChange({});

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border bg-surface px-3 text-xs font-medium transition-colors",
          activeCount > 0
            ? "border-accent text-foreground"
            : "border-border text-foreground-muted hover:bg-surface-muted",
        )}
      >
        <Icon icon={FilterIcon} size={13} />
        Más filtros
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/30"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col overflow-hidden border-l border-border bg-surface shadow-2xl">
            <div className="flex items-start justify-between border-b border-border-subtle p-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Icon icon={FilterIcon} size={13} />
                  Filtros
                </div>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">
                  Refinar búsqueda
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
                aria-label="Cerrar"
              >
                <Icon icon={Cancel01Icon} size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* Precio */}
              <Section title="Precio mensual (€)">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Mínimo">
                    <Input
                      type="number"
                      value={value.min_price ?? ""}
                      onChange={(e) =>
                        update({
                          min_price: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="0"
                    />
                  </Field>
                  <Field label="Máximo">
                    <Input
                      type="number"
                      value={value.max_price ?? ""}
                      onChange={(e) =>
                        update({
                          max_price: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="∞"
                    />
                  </Field>
                </div>
              </Section>

              {/* Habs y m² */}
              <Section title="Características">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Habs. mínimas">
                    <Input
                      type="number"
                      min={0}
                      value={value.bedrooms_min ?? ""}
                      onChange={(e) =>
                        update({
                          bedrooms_min: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="0"
                    />
                  </Field>
                  <Field label="m² mínimos">
                    <Input
                      type="number"
                      min={0}
                      value={value.area_min ?? ""}
                      onChange={(e) =>
                        update({
                          area_min: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="0"
                    />
                  </Field>
                </div>
              </Section>

              {/* Tipo */}
              <Section title="Tipo de propiedad">
                <div className="flex flex-wrap gap-1.5">
                  {TYPES.map((t) => {
                    const active = value.types?.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleArray("types", t)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                          active
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Operación */}
              <Section title="Operación">
                <div className="flex gap-1.5">
                  {LISTING_TYPES.map((l) => {
                    const active = (value.listing_type ?? "") === l.value;
                    return (
                      <button
                        key={l.value || "all"}
                        type="button"
                        onClick={() => update({ listing_type: l.value || undefined })}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          active
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
                        )}
                      >
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Features */}
              <Section title="Características incluidas">
                <div className="flex flex-wrap gap-1.5">
                  {FEATURES.map((f) => {
                    const active = value.features?.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleArray("features", f)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                          active
                            ? "border-foreground bg-foreground text-accent-foreground"
                            : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
                        )}
                      >
                        {f.replace(/_/g, " ")}
                      </button>
                    );
                  })}
                </div>
              </Section>
            </div>

            <div className="flex items-center justify-between border-t border-border-subtle p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                disabled={activeCount === 0}
              >
                Limpiar todo
              </Button>
              <Button onClick={() => setOpen(false)}>
                Aplicar
                {activeCount > 0 && (
                  <span className="rounded-full bg-accent-foreground/20 px-2 py-0.5 text-[10px] font-semibold">
                    {activeCount}
                  </span>
                )}
              </Button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function countActive(f: AdvancedFilters): number {
  let n = 0;
  if (f.min_price !== undefined) n++;
  if (f.max_price !== undefined) n++;
  if (f.bedrooms_min !== undefined) n++;
  if (f.area_min !== undefined) n++;
  if (f.types?.length) n++;
  if (f.features?.length) n++;
  if (f.listing_type) n++;
  return n;
}

// Suprime warning unused
void ArrowDown01Icon;
