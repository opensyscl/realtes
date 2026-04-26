"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
} from "react-hook-form";
import {
  RulerIcon,
  BedSingle01Icon,
  Bathtub01Icon,
  CarParking01Icon,
  Calendar03Icon,
  Building03Icon,
  CashIcon,
} from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { NativeSelect } from "@/components/ui/native-select";

const ORIENTATIONS = [
  { value: "norte", label: "Norte" },
  { value: "sur", label: "Sur" },
  { value: "oriente", label: "Oriente" },
  { value: "poniente", label: "Poniente" },
  { value: "nororiente", label: "Nororiente" },
  { value: "norponiente", label: "Norponiente" },
  { value: "suroriente", label: "Suroriente" },
  { value: "surponiente", label: "Surponiente" },
];

export function StepFeatures<TForm extends FieldValues>({
  form,
}: {
  form: UseFormReturn<TForm>;
}) {
  const {
    register,
    formState: { errors },
  } = form;
  const f = (name: string) => name as Path<TForm>;
  const errs = errors as Record<string, { message?: string } | undefined>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={RulerIcon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Características
          </h2>
          <p className="text-xs text-foreground-muted">
            Habitaciones, baños, superficie y amenidades.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Habitaciones" error={errs.bedrooms?.message}>
          <Input
            type="number"
            min={0}
            max={20}
            {...register(f("bedrooms"))}
            leading={<Icon icon={BedSingle01Icon} size={13} />}
          />
        </Field>
        <Field label="Baños" error={errs.bathrooms?.message}>
          <Input
            type="number"
            step="0.5"
            min={0}
            max={10}
            {...register(f("bathrooms"))}
            leading={<Icon icon={Bathtub01Icon} size={13} />}
          />
        </Field>
        <Field label="Superficie (m²)" error={errs.area_sqm?.message}>
          <Input
            type="number"
            min={1}
            {...register(f("area_sqm"))}
            leading={<Icon icon={RulerIcon} size={13} />}
          />
        </Field>
        <Field
          label="Superficie construida (m²)"
          error={errs.built_sqm?.message}
        >
          <Input
            type="number"
            min={0}
            {...register(f("built_sqm"))}
            leading={<Icon icon={RulerIcon} size={13} />}
          />
        </Field>
        <Field
          label="Superficie terraza (m²)"
          error={errs.terrace_sqm?.message}
        >
          <Input
            type="number"
            min={0}
            {...register(f("terrace_sqm"))}
            leading={<Icon icon={RulerIcon} size={13} />}
          />
        </Field>
        <Field label="Estacionamientos" error={errs.parking_spaces?.message}>
          <Input
            type="number"
            min={0}
            max={50}
            {...register(f("parking_spaces"))}
            leading={<Icon icon={CarParking01Icon} size={13} />}
          />
        </Field>
        <Field
          label="Año de construcción"
          error={errs.year_built?.message}
        >
          <Input
            type="number"
            min={1800}
            max={new Date().getFullYear() + 5}
            placeholder={String(new Date().getFullYear())}
            {...register(f("year_built"))}
            leading={<Icon icon={Calendar03Icon} size={13} />}
          />
        </Field>
        <Field label="Orientación" error={errs.orientation?.message}>
          <NativeSelect {...register(f("orientation"))}>
            <option value="">— Selecciona —</option>
            {ORIENTATIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field
          label="Gastos comunes"
          hint="Mensual"
          error={errs.community_fee?.message}
        >
          <Input
            type="number"
            min={0}
            step="any"
            {...register(f("community_fee"))}
            leading={<Icon icon={CashIcon} size={13} />}
          />
        </Field>
      </section>

      {/* Datos del edificio */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Edificio
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Número de pisos" error={errs.floors_count?.message}>
            <Input
              type="number"
              min={1}
              max={200}
              {...register(f("floors_count"))}
              leading={<Icon icon={Building03Icon} size={13} />}
            />
          </Field>
          <Field
            label="Deptos. por piso"
            error={errs.units_per_floor?.message}
          >
            <Input
              type="number"
              min={1}
              max={200}
              {...register(f("units_per_floor"))}
              leading={<Icon icon={Building03Icon} size={13} />}
            />
          </Field>
        </div>
      </section>

    </div>
  );
}
