"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
  Controller,
} from "react-hook-form";
import {
  CashIcon,
  Calendar03Icon,
  BankIcon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

const ACQUISITION_METHODS = [
  { value: "compra", label: "Compra" },
  { value: "herencia", label: "Herencia" },
  { value: "donacion", label: "Donación" },
  { value: "permuta", label: "Permuta" },
  { value: "remate", label: "Remate" },
  { value: "otro", label: "Otro" },
];

export function StepDebts<TForm extends FieldValues>({
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
          <Icon icon={Coins01Icon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Deudas y pagos
          </h2>
          <p className="text-xs text-foreground-muted">
            Adquisición, contribuciones y deuda asociada al inmueble.
          </p>
        </div>
      </div>

      {/* Adquisición */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Adquisición
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field
            label="Año de adquisición"
            error={errs.acquisition_year?.message}
          >
            <Input
              type="number"
              min={1900}
              max={new Date().getFullYear() + 1}
              placeholder={String(new Date().getFullYear())}
              {...register(f("acquisition_year"))}
              leading={<Icon icon={Calendar03Icon} size={13} />}
            />
          </Field>
          <Field
            label="Forma de adquisición"
            error={errs.acquisition_method?.message}
          >
            <NativeSelect {...register(f("acquisition_method"))}>
              <option value="">— Selecciona —</option>
              {ACQUISITION_METHODS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
      </section>

      {/* Pagos recurrentes */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pagos recurrentes
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field
            label="Contribuciones"
            hint="Anual"
            error={errs.ibi_annual?.message}
          >
            <Input
              type="number"
              min={0}
              step="any"
              {...register(f("ibi_annual"))}
              leading={<Icon icon={CashIcon} size={13} />}
            />
          </Field>
        </div>
      </section>

      {/* Deuda */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Deuda
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Deuda banco" error={errs.bank_debt?.message}>
            <Input
              type="number"
              min={0}
              step="any"
              {...register(f("bank_debt"))}
              leading={<Icon icon={BankIcon} size={13} />}
            />
          </Field>
          <Field
            label="Institución de la deuda"
            error={errs.debt_institution?.message}
          >
            <Input
              type="text"
              maxLength={120}
              placeholder="Ej: Banco Estado"
              {...register(f("debt_institution"))}
              leading={<Icon icon={BankIcon} size={13} />}
            />
          </Field>
        </div>

        {/* Requiere aval */}
        <Field label="Requiere aval" hint="¿La operación exige aval?">
          <Controller
            control={control}
            name={f("requires_guarantor")}
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
