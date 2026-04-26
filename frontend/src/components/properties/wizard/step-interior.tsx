"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
  Controller,
} from "react-hook-form";
import {
  HomeWifiIcon,
  Sofa01Icon,
  Bathtub01Icon,
  BedSingle01Icon,
} from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

const CONDITIONS = [
  { value: "excelente", label: "Excelente" },
  { value: "bueno", label: "Bueno" },
  { value: "regular", label: "Regular" },
  { value: "a_reformar", label: "A reformar" },
];

const FLOOR_TYPES = [
  { value: "piso_flotante", label: "Piso flotante" },
  { value: "ceramica", label: "Cerámica" },
  { value: "madera", label: "Madera" },
  { value: "porcelanato", label: "Porcelanato" },
  { value: "alfombra", label: "Alfombra" },
  { value: "vinilico", label: "Vinílico" },
  { value: "marmol", label: "Mármol" },
  { value: "otro", label: "Otro" },
];

const GAS_TYPES = [
  { value: "caneria", label: "Cañería" },
  { value: "balon", label: "Balón" },
  { value: "otros", label: "Otros" },
];

const HOT_WATER_TYPES = [
  { value: "electrico", label: "Eléctrico" },
  { value: "gas", label: "Gas" },
  { value: "solar", label: "Solar" },
  { value: "otro", label: "Otro" },
];

const HEATING_TYPES = [
  { value: "central", label: "Central" },
  { value: "electrica", label: "Eléctrica" },
  { value: "losa_radiante", label: "Losa radiante" },
  { value: "gas", label: "Gas" },
  { value: "no_tiene", label: "No tiene" },
  { value: "otro", label: "Otro" },
];

const KITCHEN_TYPES = [
  { value: "americana", label: "Americana" },
  { value: "cerrada", label: "Cerrada" },
  { value: "isla", label: "Isla" },
  { value: "otro", label: "Otro" },
];

const WINDOW_TYPES = [
  { value: "termopanel", label: "Termopanel" },
  { value: "aluminio", label: "Aluminio" },
  { value: "pvc", label: "PVC" },
  { value: "madera", label: "Madera" },
  { value: "otro", label: "Otro" },
];

export function StepInterior<TForm extends FieldValues>({
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
          <Icon icon={HomeWifiIcon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Interior</h2>
          <p className="text-xs text-foreground-muted">
            Estado, distribución, instalaciones y terminaciones del inmueble.
          </p>
        </div>
      </div>

      {/* Estado y distribución */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field
          label="Estado de la propiedad"
          error={errs.condition?.message}
        >
          <NativeSelect {...register(f("condition"))}>
            <option value="">— Selecciona —</option>
            {CONDITIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Número de suites" error={errs.suites_count?.message}>
          <Input
            type="number"
            min={0}
            max={20}
            {...register(f("suites_count"))}
            leading={<Icon icon={BedSingle01Icon} size={13} />}
          />
        </Field>
        <Field
          label="Salas de estar"
          error={errs.living_rooms?.message}
        >
          <Input
            type="number"
            min={0}
            max={10}
            {...register(f("living_rooms"))}
            leading={<Icon icon={Sofa01Icon} size={13} />}
          />
        </Field>
        <Field
          label="Piezas de servicio"
          error={errs.service_rooms?.message}
        >
          <Input
            type="number"
            min={0}
            max={10}
            {...register(f("service_rooms"))}
            leading={<Icon icon={BedSingle01Icon} size={13} />}
          />
        </Field>
        <Field
          label="Baño de servicio"
          hint="Cantidad"
          error={errs.service_bathrooms?.message}
        >
          <Input
            type="number"
            min={0}
            max={10}
            {...register(f("service_bathrooms"))}
            leading={<Icon icon={Bathtub01Icon} size={13} />}
          />
        </Field>
      </section>

      {/* Instalaciones */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Instalaciones
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Tipo de gas" error={errs.gas_type?.message}>
            <NativeSelect {...register(f("gas_type"))}>
              <option value="">— Selecciona —</option>
              {GAS_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label="Tipo de agua caliente"
            error={errs.hot_water_type?.message}
          >
            <NativeSelect {...register(f("hot_water_type"))}>
              <option value="">— Selecciona —</option>
              {HOT_WATER_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label="Tipo de calefacción"
            error={errs.heating_type?.message}
          >
            <NativeSelect {...register(f("heating_type"))}>
              <option value="">— Selecciona —</option>
              {HEATING_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
      </section>

      {/* Terminaciones */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Terminaciones
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Tipo de piso" error={errs.floor_type?.message}>
            <NativeSelect {...register(f("floor_type"))}>
              <option value="">— Selecciona —</option>
              {FLOOR_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Tipo de cocina" error={errs.kitchen_type?.message}>
            <NativeSelect {...register(f("kitchen_type"))}>
              <option value="">— Selecciona —</option>
              {KITCHEN_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Tipo de ventanas" error={errs.window_type?.message}>
            <NativeSelect {...register(f("window_type"))}>
              <option value="">— Selecciona —</option>
              {WINDOW_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

        {/* Termopanel toggle */}
        <Field label="Termopanel" hint="¿La propiedad tiene termopanel?">
          <Controller
            control={control}
            name={f("has_termopanel")}
            render={({ field }) => {
              const value =
                field.value === true
                  ? "si"
                  : field.value === false
                    ? "no"
                    : "";
              return (
                <div className="flex gap-2">
                  {[
                    { v: "si", label: "Sí" },
                    { v: "no", label: "No" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() =>
                        field.onChange(opt.v === "si" ? true : false)
                      }
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors",
                        value === opt.v
                          ? "border-primary bg-primary-soft/50 text-primary"
                          : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                  {value !== "" && (
                    <button
                      type="button"
                      onClick={() => field.onChange(undefined)}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] text-foreground-muted hover:bg-surface-muted"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              );
            }}
          />
        </Field>
      </section>
    </div>
  );
}
