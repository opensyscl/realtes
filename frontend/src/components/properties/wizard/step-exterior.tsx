"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
  Controller,
} from "react-hook-form";
import {
  TreesIcon,
  Building03Icon,
  CarParking01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface AmenityGroup {
  label: string;
  items: { key: string; label: string }[];
}

const EXTERIOR_GROUPS: AmenityGroup[] = [
  {
    label: "Áreas comunes",
    items: [
      { key: "piscina", label: "Piscina" },
      { key: "quincho", label: "Quincho/Parrilla" },
      { key: "sala_juegos", label: "Sala de juegos" },
      { key: "juegos_infantiles", label: "Juegos infantiles" },
      { key: "jardin_azotea", label: "Jardín en azotea" },
      { key: "jardin", label: "Jardín" },
      { key: "patio", label: "Patio" },
      { key: "vista_panoramica", label: "Vista panorámica" },
    ],
  },
  {
    label: "Espacios privados",
    items: [
      { key: "balcon", label: "Balcón" },
      { key: "terraza", label: "Terraza" },
      { key: "bano_visita", label: "Baño de visita" },
      { key: "bodega", label: "Bodega" },
    ],
  },
  {
    label: "Acceso y movilidad",
    items: [
      { key: "estacionamiento_visita", label: "Estacionamiento para visita" },
      { key: "bicicletero", label: "Bicicletero" },
      { key: "porton_automatico", label: "Portón automático" },
    ],
  },
  {
    label: "Seguridad y servicios",
    items: [
      { key: "seguridad_24_7", label: "Seguridad 24/7" },
      { key: "camara_seguridad", label: "Cámara de seguridad" },
      { key: "agua_corriente", label: "Agua corriente" },
      { key: "permite_mascotas", label: "Permite mascotas" },
    ],
  },
];

export function StepExterior<TForm extends FieldValues>({
  form,
}: {
  form: UseFormReturn<TForm>;
}) {
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const f = (name: string) => name as Path<TForm>;
  const errs = errors as Record<string, { message?: string } | undefined>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={TreesIcon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Exterior</h2>
          <p className="text-xs text-foreground-muted">
            Edificio, estacionamientos y áreas comunes.
          </p>
        </div>
      </div>

      {/* Edificio */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Edificio
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field
            label="Número de ascensores"
            error={errs.elevators_count?.message}
          >
            <Input
              type="number"
              min={0}
              max={50}
              {...register(f("elevators_count"))}
              leading={<Icon icon={ArrowUpDownIcon} size={13} />}
            />
          </Field>
          <Field
            label="Estacionamientos cubiertos"
            error={errs.covered_parking_spaces?.message}
          >
            <Input
              type="number"
              min={0}
              max={50}
              {...register(f("covered_parking_spaces"))}
              leading={<Icon icon={CarParking01Icon} size={13} />}
            />
          </Field>
          <Field
            label="Estacionamientos descubiertos"
            error={errs.uncovered_parking_spaces?.message}
          >
            <Input
              type="number"
              min={0}
              max={50}
              {...register(f("uncovered_parking_spaces"))}
              leading={<Icon icon={Building03Icon} size={13} />}
            />
          </Field>
        </div>
      </section>

      {/* Amenities exteriores con toggles Sí/No */}
      <Controller
        control={control}
        name={f("features")}
        render={({ field }) => {
          const selected = (field.value as string[] | undefined) ?? [];
          const setYes = (key: string) => {
            if (!selected.includes(key)) field.onChange([...selected, key]);
          };
          const setNo = (key: string) => {
            if (selected.includes(key))
              field.onChange(selected.filter((k) => k !== key));
          };

          return (
            <div className="space-y-6">
              {EXTERIOR_GROUPS.map((group) => (
                <Field key={group.label} label={group.label}>
                  <div className="grid grid-cols-1 gap-2 rounded-2xl border border-border-subtle bg-surface-muted/30 p-3 sm:grid-cols-2">
                    {group.items.map((item) => {
                      const isYes = selected.includes(item.key);
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2"
                        >
                          <span className="truncate text-[13px] font-medium">
                            {item.label}
                          </span>
                          <div className="flex shrink-0 overflow-hidden rounded-full border border-border">
                            <button
                              type="button"
                              onClick={() => setYes(item.key)}
                              className={cn(
                                "px-3 py-1 text-[11px] font-semibold transition-colors",
                                isYes
                                  ? "bg-positive text-white"
                                  : "bg-transparent text-foreground-muted hover:bg-surface-muted",
                              )}
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setNo(item.key)}
                              className={cn(
                                "border-l border-border px-3 py-1 text-[11px] font-semibold transition-colors",
                                !isYes
                                  ? "bg-surface-muted text-foreground"
                                  : "bg-transparent text-foreground-muted hover:bg-surface-muted",
                              )}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Field>
              ))}
            </div>
          );
        }}
      />
    </div>
  );
}
