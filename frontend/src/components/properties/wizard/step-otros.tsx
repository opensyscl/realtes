"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
  Controller,
} from "react-hook-form";
import {
  MoreHorizontalIcon,
  Layers01Icon,
  HouseSolarPanelIcon,
  CarParking01Icon,
  UserGroupIcon,
  Wifi01Icon,
} from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

const APARTMENT_SUBTYPES = [
  { value: "tradicional", label: "Tradicional" },
  { value: "loft", label: "Loft" },
  { value: "duplex", label: "Dúplex" },
  { value: "triplex", label: "Tríplex" },
  { value: "penthouse", label: "Penthouse" },
  { value: "studio", label: "Studio" },
  { value: "otro", label: "Otro" },
];

interface AmenityGroup {
  label: string;
  items: { key: string; label: string }[];
}

const OTHER_AMENITIES: AmenityGroup[] = [
  {
    label: "Energía y servicios",
    items: [
      { key: "energia_solar", label: "Energía solar" },
      { key: "generador_electrico", label: "Generador eléctrico" },
      { key: "acceso_internet", label: "Acceso a internet" },
      { key: "linea_telefonica", label: "Línea telefónica" },
    ],
  },
  {
    label: "Condominio y administración",
    items: [
      { key: "en_condominio", label: "En condominio" },
      { key: "condominio_cerrado", label: "Condominio cerrado" },
      { key: "recepcion", label: "Recepción" },
      { key: "conserjeria", label: "Conserjería" },
      { key: "areas_verdes_comunes", label: "Áreas verdes comunes" },
      { key: "rampa_accesibilidad", label: "Rampa para sillas de ruedas" },
    ],
  },
  {
    label: "Recreación",
    items: [
      { key: "sauna", label: "Sauna" },
      { key: "jacuzzi", label: "Jacuzzi" },
      { key: "area_cine", label: "Área de cine" },
      { key: "business_center", label: "Business center" },
      { key: "cancha_tenis", label: "Cancha de tenis" },
      { key: "cancha_futbol", label: "Cancha de fútbol" },
      { key: "cancha_basquetbol", label: "Cancha de básquetbol" },
      { key: "cancha_paddle", label: "Cancha de paddle" },
      { key: "cancha_polideportiva", label: "Cancha polideportiva" },
    ],
  },
  {
    label: "Comercialización y operación",
    items: [
      { key: "tiene_letrero", label: "Tiene letrero" },
      { key: "llaves_oficina", label: "Llaves en la oficina" },
      { key: "uso_comercial", label: "Uso comercial" },
    ],
  },
];

export function StepOtros<TForm extends FieldValues>({
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
          <Icon icon={MoreHorizontalIcon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Otros</h2>
          <p className="text-xs text-foreground-muted">
            Detalles adicionales del inmueble y comodidades del condominio.
          </p>
        </div>
      </div>

      {/* Detalles numéricos / categóricos */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Detalles
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field
            label="Tipo de departamento"
            error={errs.apartment_subtype?.message}
          >
            <NativeSelect {...register(f("apartment_subtype"))}>
              <option value="">— Selecciona —</option>
              {APARTMENT_SUBTYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label="Ambientes"
            hint="Cantidad total"
            error={errs.rooms_count?.message}
          >
            <Input
              type="number"
              min={0}
              max={50}
              placeholder="Ej. 3"
              {...register(f("rooms_count"))}
              leading={<Icon icon={Layers01Icon} size={13} />}
            />
          </Field>
          <Field
            label="Cantidad máxima de habitantes"
            error={errs.max_occupants?.message}
          >
            <Input
              type="number"
              min={0}
              max={100}
              {...register(f("max_occupants"))}
              leading={<Icon icon={UserGroupIcon} size={13} />}
            />
          </Field>
          <Field
            label="Sup. estacionamientos (m²)"
            error={errs.parking_sqm?.message}
          >
            <Input
              type="number"
              min={0}
              {...register(f("parking_sqm"))}
              leading={<Icon icon={CarParking01Icon} size={13} />}
            />
          </Field>
          <Field
            label="Número de bodegas"
            error={errs.storage_count?.message}
          >
            <Input
              type="number"
              min={0}
              max={50}
              placeholder="Ej. 1"
              {...register(f("storage_count"))}
              leading={<Icon icon={HouseSolarPanelIcon} size={13} />}
            />
          </Field>
        </div>
      </section>

      {/* Amenidades adicionales con toggles Sí/No */}
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
              {OTHER_AMENITIES.map((group) => (
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

      {/* Hint sobre el código */}
      <div className="flex items-start gap-2 rounded-2xl border border-border-subtle bg-surface-muted/30 p-3 text-[12px] text-foreground-muted">
        <Icon icon={Wifi01Icon} size={13} className="mt-0.5 shrink-0" />
        <span>
          El <strong>código de propiedad</strong> se asigna automáticamente al
          guardar (puedes editarlo en el step &ldquo;Información básica&rdquo;).
        </span>
      </div>
    </div>
  );
}
