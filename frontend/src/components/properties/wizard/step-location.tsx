"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
} from "react-hook-form";
import { MapPinIcon } from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";

export function StepLocation<TForm extends FieldValues>({
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
          <Icon icon={MapPinIcon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Ubicación</h2>
          <p className="text-xs text-foreground-muted">
            Dirección completa y datos del edificio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <Field
          label="Dirección *"
          error={errs.address?.message}
          className="sm:col-span-4"
        >
          <Input
            {...register(f("address"))}
            placeholder="Av. Providencia 1234"
          />
        </Field>
        <Field label="Piso">
          <Input {...register(f("floor"))} placeholder="3" maxLength={10} />
        </Field>
        <Field label="Depto / Puerta">
          <Input {...register(f("door"))} placeholder="A" maxLength={10} />
        </Field>

        <Field label="Comuna / Ciudad" className="sm:col-span-2">
          <Input {...register(f("city"))} placeholder="Providencia" />
        </Field>
        <Field label="Región / Provincia" className="sm:col-span-2">
          <Input {...register(f("province"))} placeholder="Metropolitana" />
        </Field>
        <Field label="Código postal" className="sm:col-span-2">
          <Input {...register(f("postal_code"))} placeholder="7500000" />
        </Field>

        <Field label="País" hint="Código ISO 2 letras (CL, ES, AR...)">
          <Input
            {...register(f("country"))}
            placeholder="CL"
            maxLength={2}
            className="uppercase"
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-info/20 bg-info-soft/40 p-3 text-xs text-info">
        Tip: en una próxima iteración podrás clickear en un mapa para fijar las
        coordenadas exactas.
      </div>
    </div>
  );
}
