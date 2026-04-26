"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
  Controller,
} from "react-hook-form";
import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  {
    value: "calcom",
    label: "Cal.com (Recomendado)",
    hint: "Pega tu link público (ej: cal.com/usuario/evento).",
  },
  {
    value: "google",
    label: "Google Calendar",
    hint: 'Pega el link de "Citas" o calendario público.',
  },
  {
    value: "other",
    label: "Otro proveedor",
    hint: "Cualquier link de agendamiento (Calendly, TidyCal, etc.).",
  },
] as const;

export function StepBooking<TForm extends FieldValues>({
  form,
}: {
  form: UseFormReturn<TForm>;
}) {
  const {
    register,
    control,
    formState: { errors },
    watch,
  } = form;
  const f = (name: string) => name as Path<TForm>;
  const errs = errors as Record<string, { message?: string } | undefined>;

  const enabled = watch(f("booking_enabled")) as unknown as boolean;
  const provider =
    (watch(f("booking_provider")) as unknown as string) || "calcom";
  const url = watch(f("booking_url")) as unknown as string | undefined;

  const currentProvider = PROVIDERS.find((p) => p.value === provider) ?? PROVIDERS[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={Calendar03Icon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Agendamiento de visitas
          </h2>
          <p className="text-xs text-foreground-muted">
            Permite que tus clientes reserven visitas a esta propiedad desde el
            escaparate público.
          </p>
        </div>
      </div>

      {/* Toggle habilitar */}
      <Controller
        control={control}
        name={f("booking_enabled")}
        render={({ field }) => (
          <button
            type="button"
            onClick={() => field.onChange(!field.value)}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
              field.value
                ? "border-primary bg-primary-soft/30"
                : "border-border bg-surface hover:bg-surface-muted/40",
            )}
          >
            <Checkbox checked={!!field.value} tabIndex={-1} />
            <div className="flex-1">
              <div className="text-sm font-semibold">
                Habilitar agendamiento para esta propiedad
              </div>
              <p className="mt-0.5 text-xs text-foreground-muted">
                Aparecerá un botón &ldquo;Agendar visita&rdquo; en el escaparate
                público que abre tu calendario.
              </p>
            </div>
          </button>
        )}
      />

      {/* Provider + URL (solo visible si enabled) */}
      <div
        className={cn(
          "space-y-4 transition-opacity",
          enabled ? "opacity-100" : "pointer-events-none opacity-40",
        )}
      >
        <Field label="Proveedor de Calendario">
          <Controller
            control={control}
            name={f("booking_provider")}
            render={({ field }) => (
              <Select
                value={(field.value as string) || "calcom"}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            )}
          />
        </Field>

        <Field
          label="URL del calendario / Link de agenda"
          hint={currentProvider.hint}
          error={errs.booking_url?.message}
        >
          <Input
            type="url"
            placeholder="Ej: https://cal.com/mi-usuario/visita"
            leading={<Icon icon={Globe02Icon} size={13} />}
            {...register(f("booking_url"))}
          />
        </Field>

        {/* Preview del link */}
        {url && (
          <div className="rounded-2xl border border-positive/20 bg-positive-soft/30 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-positive">
              <Icon icon={CheckmarkCircle02Icon} size={13} />
              Link configurado
            </div>
            <p className="mt-1 truncate font-mono text-[11px] text-foreground-muted">
              {url}
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-positive hover:underline"
            >
              Probar el link →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
