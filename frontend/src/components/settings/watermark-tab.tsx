"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImageUpload01Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Image01Icon,
  TextFontIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";
import { NativeSelect } from "@/components/ui/native-select";
import {
  useAgencyWatermark,
  useUpdateAgencyWatermark,
  useUploadWatermarkImage,
  useDeleteWatermarkImage,
  type WatermarkAlignment,
  type WatermarkSettings,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

const ALIGNMENT_GRID: { row: WatermarkAlignment[] }[] = [
  { row: ["top_left", "top", "top_right"] },
  { row: ["left", "center", "right"] },
  { row: ["bottom_left", "bottom", "bottom_right"] },
];

const ALIGNMENT_LABEL: Record<WatermarkAlignment, string> = {
  top_left: "Sup. izq.",
  top: "Sup.",
  top_right: "Sup. der.",
  left: "Izq.",
  center: "Centro",
  right: "Der.",
  bottom_left: "Inf. izq.",
  bottom: "Inf.",
  bottom_right: "Inf. der.",
};

export function WatermarkTab() {
  const { data, isLoading } = useAgencyWatermark();
  const update = useUpdateAgencyWatermark();
  const upload = useUploadWatermarkImage();
  const removeImage = useDeleteWatermarkImage();
  const fileRef = useRef<HTMLInputElement>(null);

  // Estado local — sincronizamos con el servidor en cada update.
  const [s, setS] = useState<WatermarkSettings | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (data?.settings && !s) setS(data.settings);
  }, [data, s]);

  if (isLoading || !s) {
    return (
      <Card className="h-72 animate-pulse bg-surface-muted/40" />
    );
  }

  const patch = async (delta: Partial<WatermarkSettings>) => {
    setS((prev) => (prev ? { ...prev, ...delta } : prev));
    await update.mutateAsync(delta);
    setSavedAt(Date.now());
  };

  const handleUpload = async (file: File) => {
    await upload.mutateAsync(file);
    setSavedAt(Date.now());
  };

  const imageUrl = data?.image_url;

  return (
    <div className="space-y-5">
      {/* Estado y toggle global */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Marca de agua</h3>
            <p className="mt-0.5 text-sm text-foreground-muted">
              Aplica automáticamente una marca de agua a las fotos de tus
              propiedades.
            </p>
          </div>
          <Toggle
            checked={s.enabled}
            onChange={(v) => patch({ enabled: v })}
          />
        </div>
        {savedAt && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-positive-soft/40 px-2.5 py-1 text-[11px] font-medium text-positive">
            <Icon icon={CheckmarkCircle02Icon} size={11} />
            Guardado
          </div>
        )}
      </Card>

      {/* Aplicación */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Aplicación
        </h3>
        <p className="mt-1 text-xs text-foreground-muted">
          Selecciona dónde aplicar automáticamente la marca de agua.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <CheckboxRow
            label="Imagen de portada (cover)"
            checked={s.apply_to_cover}
            onChange={(v) => patch({ apply_to_cover: v })}
          />
          <CheckboxRow
            label="Galería de fotos"
            checked={s.apply_to_gallery}
            onChange={(v) => patch({ apply_to_gallery: v })}
          />
          <CheckboxRow
            label="Plantas / floor plans"
            checked={s.apply_to_floors}
            onChange={(v) => patch({ apply_to_floors: v })}
          />
          <CheckboxRow
            label="Permitir aplicar manualmente"
            hint="Botón en la galería para aplicar a fotos existentes"
            checked={s.manual_apply_enabled}
            onChange={(v) => patch({ manual_apply_enabled: v })}
          />
        </div>
      </Card>

      {/* Tipo */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Tipo de marca
        </h3>
        <div className="mt-3 inline-flex rounded-2xl border border-border p-1">
          {(
            [
              { v: "image", label: "Imagen", icon: Image01Icon },
              { v: "text", label: "Texto", icon: TextFontIcon },
            ] as const
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => patch({ type: opt.v })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-medium transition-all",
                s.type === opt.v
                  ? "bg-primary text-white shadow-card"
                  : "text-foreground-muted hover:bg-surface-muted",
              )}
            >
              <Icon icon={opt.icon} size={12} />
              {opt.label}
            </button>
          ))}
        </div>

        {s.type === "image" ? (
          <div className="mt-5">
            <Field
              label="Imagen de marca de agua"
              hint="PNG con transparencia recomendado · máx. 5 MB"
            >
              {imageUrl ? (
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-muted/30 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Marca de agua"
                    className="h-16 w-24 shrink-0 rounded-xl border border-border-subtle bg-[length:12px_12px] bg-[linear-gradient(45deg,#0001_25%,transparent_25%),linear-gradient(-45deg,#0001_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0001_75%),linear-gradient(-45deg,transparent_75%,#0001_75%)] object-contain p-1"
                  />
                  <div className="flex-1 text-[12px] text-foreground-muted">
                    Imagen actual
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    loading={upload.isPending}
                  >
                    Reemplazar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive-outline"
                    size="sm"
                    onClick={() => removeImage.mutate()}
                    loading={removeImage.isPending}
                  >
                    <Icon icon={Delete02Icon} size={13} />
                    Quitar
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-surface-muted/30 p-6 text-foreground-muted transition-colors hover:border-primary/40 hover:bg-primary-soft/10"
                >
                  <Icon icon={ImageUpload01Icon} size={24} />
                  <span className="text-sm font-medium">
                    {upload.isPending
                      ? "Subiendo…"
                      : "Subir imagen de marca de agua"}
                  </span>
                  <span className="text-[11px]">PNG, JPG · máx. 5 MB</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = "";
                }}
              />
            </Field>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Texto" className="sm:col-span-2">
              <Input
                value={s.text}
                onChange={(e) => setS({ ...s, text: e.target.value })}
                onBlur={() => patch({ text: s.text })}
                placeholder="© Mi Inmobiliaria"
                maxLength={120}
              />
            </Field>
            <Field label="Color">
              <input
                type="color"
                value={s.text_color}
                onChange={(e) => patch({ text_color: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-2xl border border-border bg-surface px-1"
              />
            </Field>
          </div>
        )}
      </Card>

      {/* Posición */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Posición
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
          {/* Grid de alineación */}
          <div className="grid w-fit grid-cols-3 gap-1 rounded-2xl border border-border bg-surface-muted/30 p-2">
            {ALIGNMENT_GRID.flatMap((r) => r.row).map((al) => {
              const active = s.alignment === al;
              return (
                <button
                  key={al}
                  type="button"
                  onClick={() => patch({ alignment: al })}
                  title={ALIGNMENT_LABEL[al]}
                  className={cn(
                    "flex h-12 w-16 items-center justify-center rounded-xl border transition-all",
                    active
                      ? "border-primary bg-primary-soft/40"
                      : "border-transparent bg-surface hover:bg-surface-muted",
                  )}
                >
                  <span
                    className={cn(
                      "h-3 w-3 rounded-sm",
                      active ? "bg-primary" : "bg-foreground-muted/40",
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Offset */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Desplazamiento X">
                <Input
                  type="number"
                  min={-1000}
                  max={1000}
                  value={s.offset_x}
                  onChange={(e) =>
                    setS({ ...s, offset_x: Number(e.target.value) || 0 })
                  }
                  onBlur={() => patch({ offset_x: s.offset_x })}
                />
              </Field>
              <Field label="Desplazamiento Y">
                <Input
                  type="number"
                  min={-1000}
                  max={1000}
                  value={s.offset_y}
                  onChange={(e) =>
                    setS({ ...s, offset_y: Number(e.target.value) || 0 })
                  }
                  onBlur={() => patch({ offset_y: s.offset_y })}
                />
              </Field>
            </div>
            <Field label="Unidad">
              <div className="inline-flex rounded-full border border-border p-1">
                {(["px", "percent"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => patch({ offset_unit: u })}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
                      s.offset_unit === u
                        ? "bg-foreground text-accent-foreground"
                        : "text-foreground-muted hover:bg-surface-muted",
                    )}
                  >
                    {u === "px" ? "Píxeles" : "Porcentaje"}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>
      </Card>

      {/* Tamaño y opacidad */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Tamaño y opacidad
        </h3>
        <div className="mt-4 space-y-5">
          <Field label="Modo de tamaño">
            <NativeSelect
              value={s.size_mode}
              onChange={(e) =>
                patch({ size_mode: e.target.value as WatermarkSettings["size_mode"] })
              }
            >
              <option value="original">Original (sin escalar)</option>
              <option value="custom">Custom (% del ancho)</option>
              <option value="scaled">Escalado proporcional</option>
            </NativeSelect>
          </Field>

          {s.size_mode !== "original" && (
            <SliderRow
              label="Tamaño"
              hint="0–100. 100 = ancho completo de la imagen."
              value={s.size_value}
              onChange={(v) => patch({ size_value: v })}
            />
          )}

          <SliderRow
            label="Opacidad"
            hint="0 = transparente · 100 = totalmente opaco"
            value={s.opacity}
            onChange={(v) => patch({ opacity: v })}
          />
        </div>
      </Card>

      {/* Calidad */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Calidad de salida
        </h3>
        <div className="mt-4 space-y-5">
          <SliderRow
            label="Calidad"
            hint="Calidad JPEG (recomendado 80–90)"
            value={s.quality}
            onChange={(v) => patch({ quality: v })}
          />
          <Field label="Formato JPEG">
            <div className="inline-flex rounded-full border border-border p-1">
              {(
                [
                  { v: "baseline", label: "Baseline" },
                  { v: "progressive", label: "Progressive" },
                ] as const
              ).map((f) => (
                <button
                  key={f.v}
                  type="button"
                  onClick={() => patch({ format: f.v })}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
                    s.format === f.v
                      ? "bg-foreground text-accent-foreground"
                      : "text-foreground-muted hover:bg-surface-muted",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      {/* Aviso */}
      <div className="flex items-start gap-2 rounded-2xl border border-warning/20 bg-warning-soft/30 p-3 text-[12px] text-foreground-muted">
        <Icon
          icon={AlertCircleIcon}
          size={13}
          className="mt-0.5 shrink-0 text-warning"
        />
        <span>
          La aplicación de la marca de agua sobre las fotos se procesa al subir
          una nueva imagen. Para fotos existentes usa el botón &ldquo;Aplicar
          marca de agua&rdquo; desde la galería de la propiedad.
        </span>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors",
        checked ? "border-positive bg-positive" : "border-border bg-surface-muted",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function CheckboxRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-start gap-3 rounded-2xl border bg-surface px-3 py-3 text-left transition-colors",
        checked
          ? "border-primary/40 bg-primary-soft/10"
          : "border-border hover:bg-surface-muted/50",
      )}
    >
      <Checkbox checked={checked} size="sm" tabIndex={-1} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium">{label}</div>
        {hint && (
          <div className="mt-0.5 text-[11px] text-foreground-muted">{hint}</div>
        )}
      </div>
    </button>
  );
}

function SliderRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-surface-muted accent-primary"
        />
        <span className="w-12 shrink-0 rounded-lg bg-surface-muted px-2 py-1 text-center text-[12px] font-semibold tabular-numbers">
          {value}
        </span>
      </div>
    </Field>
  );
}
