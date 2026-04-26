"use client";

import * as React from "react";
import { useMemo } from "react";
import {
  type UseFormReturn,
  type Path,
  type FieldValues,
  Controller,
} from "react-hook-form";
import {
  CameraAdd01Icon,
  InformationCircleIcon,
  Image01Icon,
  CheckmarkCircle02Icon,
  Calendar03Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { ImageToolField } from "@/components/ui/image-tool-field";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverPopup,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/auth";
import { useUploadPropertyCover } from "@/lib/queries";
import {
  PropertyStatusSelect,
  PROPERTY_STATUSES as STATUSES_FROM_SHARED,
} from "@/components/properties/property-status-select";
import { SUPPORTED_CURRENCIES, cn } from "@/lib/utils";

// Re-export para no romper imports antiguos
export const PROPERTY_STATUSES = STATUSES_FROM_SHARED;

export interface BasicFormValues {
  title: string;
  description?: string;
  cover_image_url?: string;
  type: string;
  listing_type: string;
  status: string;
  is_published: boolean;
  is_exclusive: boolean;
  currency: string;
  price_rent?: number | string;
  price_sale?: number | string;
  commission_pct?: number | string;
  rol?: string;
  captacion_date?: string;
  captacion_source?: string;
}


const TYPES = [
  { value: "apartamento", label: "Departamento" },
  { value: "casa", label: "Casa" },
  { value: "chalet", label: "Casa de campo" },
  { value: "oficina", label: "Oficina" },
  { value: "local", label: "Local comercial" },
  { value: "parking", label: "Estacionamiento" },
  { value: "trastero", label: "Bodega" },
];

const LISTING_TYPES = [
  { value: "alquiler", label: "Arriendo" },
  { value: "venta", label: "Venta" },
  { value: "ambos", label: "Arriendo y venta" },
];

const CAPTACION_SOURCES = [
  { value: "particular", label: "Particular" },
  { value: "portal", label: "Portal inmobiliario" },
  { value: "referido", label: "Referido" },
  { value: "web", label: "Web propia" },
  { value: "otro", label: "Otro" },
];

export function StepBasic<TForm extends FieldValues = BasicFormValues>({
  form,
  propertyId,
  hasLease,
  hasClient,
}: {
  form: UseFormReturn<TForm>;
  propertyId?: number;
  /** Si hay un contract vigente — el status queda forzado a "arrendada" */
  hasLease?: boolean;
  /** Si hay client_person_id asignado — el status sugerido es "reservada" */
  hasClient?: boolean;
}) {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const agencyCurrency = useAuthStore((s) => s.user?.agency?.currency) ?? "CLP";
  const uploadCover = useUploadPropertyCover();
  const listingType = watch("listing_type" as Path<TForm>) as unknown as string;
  const cover = watch("cover_image_url" as Path<TForm>) as unknown as string | undefined;

  const isRent = listingType === "alquiler" || listingType === "ambos";
  const showSale = listingType === "venta" || listingType === "ambos";

  // Si no se ha asignado moneda a la propiedad, usar la de la agencia
  const currentCurrency =
    (watch("currency" as Path<TForm>) as unknown as string) || agencyCurrency;

  const currencySymbol = useMemo(
    () =>
      SUPPORTED_CURRENCIES.find((c) => c.code === currentCurrency)?.symbol ??
      currentCurrency,
    [currentCurrency],
  );

  const f = (name: string) => name as Path<TForm>;
  const errs = errors as Record<string, { message?: string } | undefined>;

  return (
    <div className="space-y-8">
      {/* Header de sección */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={InformationCircleIcon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Información básica
          </h2>
          <p className="text-xs text-foreground-muted">
            Lo esencial para identificar y publicar la propiedad.
          </p>
        </div>
      </div>

      {/* Título + descripción */}
      <section className="space-y-4">
        <Field label="Título *" error={errs.title?.message}>
          <Input
            {...register(f("title"))}
            placeholder="Ej: Departamento luminoso en Providencia"
          />
        </Field>
        <Field label="Descripción" hint="Aparece en el escaparate público y portales">
          <Textarea
            rows={5}
            {...register(f("description"))}
            placeholder="Describe los puntos fuertes de la propiedad: orientación, vista, equipamiento, barrio..."
          />
        </Field>
      </section>

      {/* Imagen de portada con ImageTool (drag&drop + crop + compress) */}
      <section>
        <Field
          label="Imagen de portada"
          hint="Arrastra una imagen o haz clic para seleccionar. Se recortará y comprimirá automáticamente."
        >
          <Controller
            control={control}
            name={f("cover_image_url")}
            render={({ field }) => (
              <ImageToolField
                value={(field.value as string) || null}
                onChange={(url) => field.onChange(url)}
                upload={async (result) => {
                  const r = await uploadCover.mutateAsync({
                    file: result.file,
                    propertyId,
                  });
                  return r.url;
                }}
                aspectRatio="4:3"
                maxWidth={1600}
                maxHeight={1200}
                format="webp"
                quality={88}
                placeholder="Arrastra la foto principal o haz clic para subirla"
                buttonText="Seleccionar imagen"
                modalTitle="Recortar imagen de portada"
              />
            )}
          />
        </Field>
      </section>

      {/* Tipo / Operación / Estado de la propiedad / Publicación / Exclusividad */}
      <section className="space-y-3">
        <SectionLabel>Clasificación</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Tipo de propiedad *">
            <Controller
              control={control}
              name={f("type")}
              render={({ field }) => (
                <Select value={field.value as string} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectPopup>
                    {TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              )}
            />
          </Field>
          <Field label="Operación *">
            <Controller
              control={control}
              name={f("listing_type")}
              render={({ field }) => (
                <Select value={field.value as string} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectPopup>
                    {LISTING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              )}
            />
          </Field>
          <Field
            label="Estado de la propiedad"
            hint={
              hasLease
                ? "Hay un contrato vigente — el estado se sincroniza con el arriendo"
                : hasClient
                  ? "Hay un cliente asignado — sugerimos «Reservada»"
                  : "Estado actual de la unidad"
            }
          >
            <Controller
              control={control}
              name={f("status")}
              render={({ field }) => (
                <PropertyStatusSelect
                  value={(field.value as string) || "disponible"}
                  onChange={field.onChange}
                  disabled={hasLease}
                />
              )}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Publicación" hint="¿Visible en el escaparate público?">
            <Controller
              control={control}
              name={f("is_published")}
              render={({ field }) => (
                <Select
                  value={field.value ? "active" : "inactive"}
                  onValueChange={(v) => field.onChange(v === "active")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="active">Activa (publicada)</SelectItem>
                    <SelectItem value="inactive">Inactiva (oculta)</SelectItem>
                  </SelectPopup>
                </Select>
              )}
            />
          </Field>
          <Field label="Exclusividad" hint="¿Tienes la exclusiva con el dueño?">
            <Controller
              control={control}
              name={f("is_exclusive")}
              render={({ field }) => (
                <ExclusiveToggle
                  checked={!!field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>
        </div>
      </section>

      {/* Moneda + Precio + Comisión + Rol */}
      <section className="space-y-3">
        <SectionLabel>Comercial</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Moneda *" hint="Por defecto la de tu agencia">
            <Controller
              control={control}
              name={f("currency")}
              render={({ field }) => (
                <Select
                  value={(field.value as string) || agencyCurrency}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona moneda..." />
                  </SelectTrigger>
                  <SelectPopup>
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="font-mono text-xs text-foreground-muted">
                          {c.symbol}
                        </span>{" "}
                        {c.label} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              )}
            />
          </Field>

          {isRent && (
            <Field
              label={showSale ? "Precio arriendo *" : "Precio *"}
              error={errs.price_rent?.message}
            >
              <Input
                type="number"
                step="any"
                min={0}
                {...register(f("price_rent"))}
                leading={
                  <span className="font-mono text-[11px] text-foreground-muted">
                    {currencySymbol}
                  </span>
                }
                placeholder="440000"
              />
            </Field>
          )}

          {showSale && (
            <Field
              label={isRent ? "Precio venta *" : "Precio *"}
              error={errs.price_sale?.message}
            >
              <Input
                type="number"
                step="any"
                min={0}
                {...register(f("price_sale"))}
                leading={
                  <span className="font-mono text-[11px] text-foreground-muted">
                    {currencySymbol}
                  </span>
                }
                placeholder="0"
              />
            </Field>
          )}

          <Field label="Comisión (%)" hint="Sobre el monto de la operación">
            <Input
              type="number"
              step="0.1"
              min={0}
              max={100}
              {...register(f("commission_pct"))}
              placeholder="50"
            />
          </Field>

          <Field
            label="Rol"
            hint="Si no tiene un rol ingresa &quot;1&quot;"
            error={errs.rol?.message}
          >
            <Input
              {...register(f("rol"))}
              placeholder="123-45"
              maxLength={60}
            />
          </Field>
        </div>
      </section>

      {/* Fecha y fuente de captación */}
      <section className="space-y-3">
        <SectionLabel>Captación</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Fecha de captación">
            <Controller
              control={control}
              name={f("captacion_date")}
              render={({ field }) => (
                <CaptacionDatePicker
                  value={(field.value as string) ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>
          <Field label="Fuente de captación">
            <Controller
              control={control}
              name={f("captacion_source")}
              render={({ field }) => (
                <Select
                  value={(field.value as string) || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectPopup>
                    {CAPTACION_SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              )}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function ExclusiveToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex h-9 w-full items-center gap-2 rounded-2xl border px-3 text-sm transition-colors",
        checked
          ? "border-primary bg-primary-soft/40 text-primary"
          : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
      )}
    >
      <Checkbox checked={checked} size="sm" tabIndex={-1} />
      <span className="font-medium">{checked ? "Sí — exclusiva" : "No"}</span>
    </button>
  );
}

function CaptacionDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  // value es "YYYY-MM-DD" o "". Lo convertimos a Date para el calendar.
  const selected = useMemo(() => {
    if (!value) return undefined;
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  }, [value]);

  const formatted = useMemo(() => {
    if (!selected) return "";
    return selected.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, [selected]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onChange("");
      return;
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "inline-flex h-9 w-full items-center gap-2 rounded-2xl border border-border bg-surface px-3 pr-9 text-sm transition-colors hover:bg-surface-muted/60",
                !selected && "text-foreground-muted",
              )}
            >
              <Icon
                icon={Calendar03Icon}
                size={13}
                className="text-foreground-muted"
              />
              <span className="flex-1 truncate text-left">
                {formatted || "Seleccionar fecha"}
              </span>
            </button>
          }
        />
        <PopoverPopup align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            captionLayout="dropdown"
            startMonth={new Date(2000, 0)}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
        </PopoverPopup>
      </Popover>
      {selected && (
        <button
          type="button"
          onClick={() => handleSelect(undefined)}
          className="absolute right-2 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted hover:text-foreground"
          aria-label="Limpiar fecha"
        >
          <Icon icon={Cancel01Icon} size={11} />
        </button>
      )}
    </div>
  );
}
