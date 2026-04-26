"use client";

import { useEffect, useState } from "react";
import { Cancel01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import {
  usePayCommission,
  type CommissionSplit,
} from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export function PayCommissionDialog({
  commission,
  open,
  onClose,
}: {
  commission: CommissionSplit | null;
  open: boolean;
  onClose: () => void;
}) {
  const pay = usePayCommission();
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (commission) {
      setPaidAt(new Date().toISOString().slice(0, 10));
      setReference("");
      setNotes("");
      setError(null);
    }
  }, [commission]);

  if (!open || !commission) return null;

  const submit = async () => {
    setError(null);
    try {
      await pay.mutateAsync({
        id: commission.id,
        paid_at: paidAt,
        payment_reference: reference || undefined,
        notes: notes || undefined,
      });
      onClose();
    } catch (e) {
      setError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((e as any).response?.data?.message as string | undefined) ?? "Error",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Marcar como pagada
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              {commission.user?.name ?? "—"}
            </h3>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Contrato {commission.contract?.code} · {commission.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
          >
            <Icon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-surface-muted/50 p-3 text-xs">
          <div>
            <div className="text-muted-foreground">Importe</div>
            <div className="mt-0.5 text-base font-semibold tabular-numbers">
              {formatCurrency(commission.amount)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">% del total</div>
            <div className="mt-0.5 text-base font-semibold tabular-numbers">
              {commission.pct}%
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-negative/20 bg-negative-soft p-3 text-xs text-negative">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <Field label="Fecha de pago *">
            <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          </Field>
          <Field label="Referencia bancaria" hint="ej. TR-12345">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>
          <Field label="Notas">
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pay.isPending}>
            <Icon icon={CheckmarkCircle02Icon} size={14} />
            {pay.isPending ? "Guardando..." : "Confirmar pago"}
          </Button>
        </div>
      </div>
    </div>
  );
}
