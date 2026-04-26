"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
  Controller,
} from "react-hook-form";
import { ListSettingIcon } from "@hugeicons/core-free-icons";

import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface AmenityGroup {
  label: string;
  items: { key: string; label: string }[];
}

const AMENITY_GROUPS: AmenityGroup[] = [
  {
    label: "Servicios",
    items: [
      { key: "gas_natural", label: "Gas natural" },
      { key: "aire_acondicionado", label: "Aire acondicionado" },
      { key: "calefaccion_central", label: "Calefacción central" },
      { key: "tv_cable", label: "TV por cable" },
      { key: "tv_satelital", label: "TV satelital" },
      { key: "fibra_optica", label: "Fibra óptica" },
      { key: "alarma_incorporada", label: "Alarma incorporada" },
      { key: "proteccion_ventanas", label: "Protección en ventanas" },
    ],
  },
  {
    label: "Espacios",
    items: [
      { key: "amueblado", label: "Amoblado" },
      { key: "regularizada", label: "Regularizada" },
      { key: "bano_visita", label: "Baño de visita" },
      { key: "bano_extractor", label: "Baño con extractor" },
      { key: "living_comedor_juntos", label: "Living/comedor (juntos)" },
      { key: "living_separado", label: "Living separado" },
      { key: "comedor_separado", label: "Comedor separado" },
      { key: "comedor_diario", label: "Comedor diario" },
      { key: "desayunador", label: "Desayunador" },
      { key: "estudio", label: "Estudio" },
      { key: "sala_multiple", label: "Sala múltiple" },
      { key: "closet", label: "Closet" },
      { key: "walk_in_closet", label: "Walk in closet" },
      { key: "despensa", label: "Despensa" },
      { key: "lavanderia", label: "Lavandería" },
      { key: "logia", label: "Loggia" },
    ],
  },
  {
    label: "Equipamiento",
    items: [
      { key: "refrigerador", label: "Refrigerador" },
      { key: "chimenea", label: "Chimenea" },
      { key: "caldera", label: "Caldera" },
      { key: "cisterna", label: "Cisterna" },
      { key: "conexion_lavadora", label: "Conexión para lavadora" },
    ],
  },
  {
    label: "Servicios comunes",
    items: [
      { key: "ascensor", label: "Ascensor" },
      { key: "gimnasio", label: "Gimnasio" },
      { key: "para_estudiantes", label: "Para estudiantes" },
    ],
  },
];

export function StepComodidades<TForm extends FieldValues>({
  form,
}: {
  form: UseFormReturn<TForm>;
}) {
  const { control } = form;
  const f = (name: string) => name as Path<TForm>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={ListSettingIcon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Comodidades</h2>
          <p className="text-xs text-foreground-muted">
            Marca Sí o No para cada característica de la propiedad.
          </p>
        </div>
      </div>

      <Controller
        control={control}
        name={f("features")}
        render={({ field }) => {
          const selected = (field.value as string[] | undefined) ?? [];
          const setYes = (key: string) => {
            if (!selected.includes(key))
              field.onChange([...selected, key]);
          };
          const setNo = (key: string) => {
            if (selected.includes(key))
              field.onChange(selected.filter((k) => k !== key));
          };

          return (
            <div className="space-y-8">
              {AMENITY_GROUPS.map((group) => (
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
