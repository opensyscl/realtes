"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
} from "react-hook-form";
import {
  Note01Icon,
  ClipboardIcon,
  TaskDaily01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";

interface NoteVariant {
  fieldName: string;
  title: string;
  subtitle: string;
  hint: string;
  placeholder: string;
  icon: IconSvgElement;
  iconTone: "primary" | "warning" | "info";
}

const VARIANTS: Record<"private" | "inventory" | "reception", NoteVariant> = {
  private: {
    fieldName: "private_note",
    title: "Nota privada",
    subtitle: "Solo visible para tu equipo. Nunca aparece en el escaparate público.",
    hint: "Información interna sobre el dueño, particularidades, conflictos, etc.",
    placeholder: "Ej: el dueño solo responde por WhatsApp después de las 18:00...",
    icon: Note01Icon,
    iconTone: "warning",
  },
  inventory: {
    fieldName: "inventory_notes",
    title: "Inventario y manuales",
    subtitle: "Lista de mobiliario, electrodomésticos, manuales entregados.",
    hint: "Útil para cuando el inquilino devuelve la propiedad.",
    placeholder:
      "Ej:\n- Refrigerador Samsung RF28T (manual entregado)\n- 2 sillones de cuero\n- Cocina Bosch 4 quemadores...",
    icon: ClipboardIcon,
    iconTone: "info",
  },
  reception: {
    fieldName: "reception_notes",
    title: "Observaciones de recepción",
    subtitle: "Estado en el que se recibió la propiedad.",
    hint: "Manchas, rayones, daños existentes — para no atribuirlos al inquilino al fin del contrato.",
    placeholder:
      "Ej:\n- Mancha en pared del salón cerca de la puerta\n- Pintura descascarada en techo del baño\n- Mueble de cocina con bisagra rota...",
    icon: TaskDaily01Icon,
    iconTone: "primary",
  },
};

export function StepNotes<TForm extends FieldValues>({
  form,
  variant,
}: {
  form: UseFormReturn<TForm>;
  variant: "private" | "inventory" | "reception";
}) {
  const v = VARIANTS[variant];
  const { register } = form;
  const f = (name: string) => name as Path<TForm>;

  const toneCls = {
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning",
    info: "bg-info-soft text-info",
  }[v.iconTone];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneCls}`}
        >
          <Icon icon={v.icon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{v.title}</h2>
          <p className="text-xs text-foreground-muted">{v.subtitle}</p>
        </div>
      </div>

      <Field hint={v.hint}>
        <Textarea rows={12} {...register(f(v.fieldName))} placeholder={v.placeholder} />
      </Field>
    </div>
  );
}
