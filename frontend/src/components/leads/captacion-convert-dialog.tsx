"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Cancel01Icon, PropertyAddIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import {
  useConvertLeadToProperty,
  type Lead,
} from "@/lib/queries";

const schema = z.object({
  title: z.string().min(2, "Mínimo 2 caracteres").max(200),
  type: z.enum(["apartamento", "casa", "chalet", "oficina", "local", "parking", "trastero"]),
  listing_type: z.enum(["alquiler", "venta", "ambos"]).optional(),
  address: z.string().min(2).max(255),
  area_sqm: z.coerce.number().int().min(1).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  price_rent: z.coerce.number().min(0).optional(),
  price_sale: z.coerce.number().min(0).optional(),
});
type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

export function CaptacionConvertDialog({
  lead,
  open,
  onClose,
  onConverted,
}: {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onConverted: () => void;
}) {
  const convert = useConvertLeadToProperty(lead?.id ?? 0);
  const [error, setError] = useState<string | null>(null);

  const requirements = lead?.requirements as
    | {
        address?: string;
        bedrooms?: number;
        area_sqm?: number;
        estimated_rent?: number;
      }
    | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: lead?.title?.replace(/^Captaci[oó]n:\s*/i, "") ?? "",
      type: "apartamento",
      listing_type: "alquiler",
      address: requirements?.address ?? "",
      bedrooms: requirements?.bedrooms,
      area_sqm: requirements?.area_sqm,
      price_rent: requirements?.estimated_rent,
    },
  });

  if (!open || !lead) return null;

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await convert.mutateAsync(data);
      onConverted();
    } catch (e) {
      setError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((e as any).response?.data?.message as string | undefined) ??
          "Error al convertir.",
      );
    }
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-foreground/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border-subtle p-5">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Captación firmada
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              Crear propiedad desde {lead.contact_name ?? lead.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
          >
            <Icon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-2xl border border-negative/20 bg-negative-soft p-3 text-xs text-negative">
              {error}
            </div>
          )}

          <Field label="Título *" error={errors.title?.message}>
            <Input {...register("title")} placeholder="Apartamento luminoso en Russafa" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo *">
              <NativeSelect {...register("type")}>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="chalet">Chalet</option>
                <option value="oficina">Oficina</option>
                <option value="local">Local</option>
                <option value="parking">Parking</option>
                <option value="trastero">Trastero</option>
              </NativeSelect>
            </Field>
            <Field label="Operación">
              <NativeSelect {...register("listing_type")}>
                <option value="alquiler">Alquiler</option>
                <option value="venta">Venta</option>
                <option value="ambos">Ambos</option>
              </NativeSelect>
            </Field>
          </div>

          <Field label="Dirección *" error={errors.address?.message}>
            <Input {...register("address")} placeholder="Calle Russafa 14, 3ºB" />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="m²">
              <Input type="number" min={0} {...register("area_sqm")} />
            </Field>
            <Field label="Habs.">
              <Input type="number" min={0} {...register("bedrooms")} />
            </Field>
            <Field label="Baños">
              <Input type="number" step="0.5" min={0} {...register("bathrooms")} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Renta /mes (€)">
              <Input type="number" step="0.01" {...register("price_rent")} />
            </Field>
            <Field label="Precio venta (€)">
              <Input type="number" step="0.01" {...register("price_sale")} />
            </Field>
          </div>

          <div className="rounded-2xl bg-info-soft p-3 text-xs text-info">
            Se creará la propiedad <strong>en estado disponible y sin publicar</strong>.
            Luego podrás añadir fotos y publicarla en el escaparate.
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || convert.isPending}>
              <Icon icon={PropertyAddIcon} size={14} />
              {convert.isPending ? "Creando..." : "Crear propiedad"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
