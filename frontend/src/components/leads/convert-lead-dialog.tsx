"use client";

import { useEffect, useState } from "react";
import {
  Cancel01Icon,
  Agreement02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { useConvertLead, useProperties, usePersons, type Lead } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

interface Props {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onConverted: () => void;
}

export function ConvertLeadDialog({ lead, open, onClose, onConverted }: Props) {
  const convert = useConvertLead(lead?.id ?? 0);
  const [error, setError] = useState<string | null>(null);

  // Pickers
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerId, setOwnerId] = useState<number | null>(null);

  const propsQuery = useProperties({
    search: propertySearch || undefined,
    status: "disponible",
    per_page: 6,
  });
  const ownersQuery = usePersons({
    search: ownerSearch || undefined,
    type: "owner",
    per_page: 6,
  });

  // Form
  const [monthlyRent, setMonthlyRent] = useState<number>(lead?.value ?? 0);
  const [deposit, setDeposit] = useState<number>(0);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
  );
  const [paymentDay, setPaymentDay] = useState(5);

  useEffect(() => {
    if (lead) {
      setMonthlyRent(lead.value || 0);
      setDeposit((lead.value || 0) * 2);
      setError(null);
    }
  }, [lead]);

  if (!open || !lead) return null;

  const submit = async () => {
    setError(null);
    if (!propertyId) {
      setError("Selecciona una propiedad disponible.");
      return;
    }
    if (!ownerId) {
      setError("Selecciona el propietario.");
      return;
    }
    try {
      await convert.mutateAsync({
        property_id: propertyId,
        owner_id: ownerId,
        monthly_rent: monthlyRent,
        deposit,
        start_date: startDate,
        end_date: endDate,
        payment_day: paymentDay,
        generate_charges: true,
      });
      onConverted();
    } catch (e) {
      setError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((e as any).response?.data?.message as string | undefined) ??
          "Error al convertir.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border-subtle p-5">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Convertir lead
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              {lead.title}
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

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {error && (
            <div className="rounded-2xl border border-negative/20 bg-negative-soft p-3 text-xs text-negative">
              {error}
            </div>
          )}

          {/* Property picker */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Propiedad disponible *
            </h4>
            <Input
              placeholder="Buscar propiedad por título o código..."
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              leading={<Icon icon={Search01Icon} size={14} />}
            />
            <div className="mt-2 max-h-44 overflow-y-auto rounded-2xl border border-border-subtle">
              {propsQuery.data?.data.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-foreground-muted">
                  Sin propiedades disponibles que coincidan.
                </div>
              ) : (
                propsQuery.data?.data.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPropertyId(p.id);
                      if (!monthlyRent) setMonthlyRent(p.price_rent ?? 0);
                    }}
                    className={`flex w-full items-center justify-between gap-3 border-b border-border-subtle px-4 py-2.5 text-left text-sm last:border-b-0 hover:bg-surface-muted ${
                      propertyId === p.id ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.title}</span>
                      <span className="block truncate text-[11px] opacity-70">
                        {p.code} · {p.address}
                      </span>
                    </span>
                    <span className="tabular-numbers text-xs font-medium">
                      {p.price_rent ? formatCurrency(p.price_rent) : "—"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Owner picker */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Propietario *
            </h4>
            <Input
              placeholder="Buscar propietario..."
              value={ownerSearch}
              onChange={(e) => setOwnerSearch(e.target.value)}
              leading={<Icon icon={Search01Icon} size={14} />}
            />
            <div className="mt-2 max-h-32 overflow-y-auto rounded-2xl border border-border-subtle">
              {ownersQuery.data?.data.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-foreground-muted">
                  Sin propietarios.
                </div>
              ) : (
                ownersQuery.data?.data.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOwnerId(o.id)}
                    className={`flex w-full items-center justify-between gap-3 border-b border-border-subtle px-4 py-2.5 text-left text-sm last:border-b-0 hover:bg-surface-muted ${
                      ownerId === o.id ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    <span>
                      <span className="block font-medium">{o.full_name}</span>
                      <span className="block text-[11px] opacity-70">
                        {o.email ?? o.phone ?? "—"}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Contract terms */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Renta /mes (€)">
              <Input
                type="number"
                step="0.01"
                value={monthlyRent || ""}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
              />
            </Field>
            <Field label="Depósito (€)">
              <Input
                type="number"
                step="0.01"
                value={deposit || ""}
                onChange={(e) => setDeposit(Number(e.target.value))}
              />
            </Field>
            <Field label="Día de cobro">
              <Input
                type="number"
                min={1}
                max={28}
                value={paymentDay}
                onChange={(e) => setPaymentDay(Number(e.target.value))}
              />
            </Field>
            <div />
            <Field label="Inicio">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
            <Field label="Fin">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
          </section>

          <div className="rounded-2xl bg-info-soft p-3 text-xs text-info">
            Al convertir se creará el contrato, se marcará la propiedad como ocupada,
            se generará el primer cargo del mes y se cerrará el lead como ganado.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border-subtle p-4">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={convert.isPending}>
            <Icon icon={Agreement02Icon} size={14} />
            {convert.isPending ? "Convirtiendo..." : "Convertir a contrato"}
          </Button>
        </div>
      </div>
    </div>
  );
}
