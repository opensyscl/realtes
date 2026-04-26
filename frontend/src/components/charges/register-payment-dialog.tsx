"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Cancel01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import {
  useRegisterPayment,
  type Charge,
  type PaymentInput,
} from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  amount: z.coerce.number().min(0.01, "Importe mínimo 0,01"),
  method: z.enum(["transferencia", "efectivo", "tarjeta", "domiciliacion", "otro"]),
  reference: z.string().max(80).optional().or(z.literal("")),
  received_at: z.string().min(8, "Fecha requerida"),
  notes: z.string().optional().or(z.literal("")),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

export function RegisterPaymentDialog({
  charge,
  open,
  onClose,
}: {
  charge: Charge | null;
  open: boolean;
  onClose: () => void;
}) {
  const register = useRegisterPayment();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      method: "transferencia",
      received_at: new Date().toISOString().slice(0, 10),
      amount: charge?.pending,
    },
  });

  useEffect(() => {
    if (charge) {
      form.reset({
        method: "transferencia",
        received_at: new Date().toISOString().slice(0, 10),
        amount: charge.pending,
      });
    }
  }, [charge, form]);

  if (!open || !charge) return null;

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload: PaymentInput = {
        charge_id: charge.id,
        amount: data.amount,
        method: data.method,
        reference: data.reference || null,
        received_at: data.received_at,
        notes: data.notes || null,
      };
      await register.mutateAsync(payload);
      onClose();
    } catch (e) {
      setError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((e as any).response?.data?.message as string | undefined) ??
          "Error registrando pago",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Registrar pago
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight tabular-numbers">
              {charge.code}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
            aria-label="Cerrar"
          >
            <Icon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface-muted/50 p-3 text-xs">
          <div>
            <div className="text-muted-foreground">Importe</div>
            <div className="mt-0.5 font-semibold tabular-numbers">
              {formatCurrency(charge.amount)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Pagado</div>
            <div className="mt-0.5 font-semibold tabular-numbers">
              {formatCurrency(charge.paid_amount)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Pendiente</div>
            <div className="mt-0.5 font-semibold tabular-numbers text-negative">
              {formatCurrency(charge.pending)}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-negative/20 bg-negative-soft p-3 text-xs text-negative">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <Field label="Importe (€) *" error={form.formState.errors.amount?.message}>
            <Input type="number" step="0.01" {...form.register("amount")} />
          </Field>
          <Field label="Método">
            <NativeSelect {...form.register("method")}>
              <option value="transferencia">Transferencia</option>
              <option value="domiciliacion">Domiciliación</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="otro">Otro</option>
            </NativeSelect>
          </Field>
          <Field label="Referencia">
            <Input {...form.register("reference")} placeholder="TRX-XXXX" />
          </Field>
          <Field label="Fecha de cobro *" error={form.formState.errors.received_at?.message}>
            <Input type="date" {...form.register("received_at")} />
          </Field>
          <Field label="Notas">
            <Textarea rows={2} {...form.register("notes")} />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={register.isPending}>
              <Icon icon={CheckmarkCircle02Icon} size={14} />
              {register.isPending ? "Guardando..." : "Registrar pago"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
