"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Coins01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import type { PublicAgency, PublicProperty } from "@/lib/queries-public";
import { formatCurrency } from "@/lib/utils";
import { BookingModal } from "./booking-modal";

const contactSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(120),
  email: z.string().email("Email inválido"),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
});
type ContactForm = z.infer<typeof contactSchema>;

export function ContactCard({
  property: p,
  agency,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  property: PublicProperty;
  agency: PublicAgency;
  onSubmit: (data: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }) => Promise<{ lead_code: string }>;
  isSubmitting?: boolean;
  submitError?: string;
}) {
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const canBook = !!p.booking_enabled && !!p.booking_url;
  const isRent = !!p.price_rent;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const submit = handleSubmit(async (data) => {
    const r = await onSubmit({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      message: data.message || undefined,
    });
    setSubmittedCode(r.lead_code);
    reset();
  });

  return (
    <Card className="p-6">
      {/* Precio destacado */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {isRent ? "Renta mensual" : "Precio venta"}
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tabular-numbers tracking-tight">
            {p.price_rent
              ? formatCurrency(p.price_rent)
              : p.price_sale
                ? formatCurrency(p.price_sale)
                : "—"}
          </span>
          {isRent && (
            <span className="text-sm font-medium text-foreground-muted">/mes</span>
          )}
        </div>
        {p.community_fee && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-[11px] text-foreground-muted">
            <Icon icon={Coins01Icon} size={11} />
            Comunidad {formatCurrency(p.community_fee)}/mes
          </div>
        )}
      </div>

      {/* Botón de agendar visita (solo si la agencia lo habilitó) */}
      {canBook && (
        <button
          type="button"
          onClick={() => setBookingOpen(true)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--brand)] bg-[var(--brand)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--brand)] transition-colors hover:bg-[var(--brand)]/15"
        >
          <Icon icon={Calendar03Icon} size={14} />
          Agendar visita
        </button>
      )}

      <div className="mt-5 border-t border-border-subtle pt-5">
        <h3 className="text-sm font-semibold">¿Te interesa esta propiedad?</h3>
        <p className="mt-1 text-xs text-foreground-muted">
          {agency.name} te contactará en menos de 24h.
        </p>

        {submittedCode ? (
          <div className="mt-4 rounded-2xl border border-positive/20 bg-positive-soft p-3 text-xs">
            <div className="inline-flex items-center gap-1.5 font-semibold text-positive">
              <Icon icon={CheckmarkCircle02Icon} size={13} />
              ¡Mensaje enviado!
            </div>
            <p className="mt-1 text-positive/90">
              Tu solicitud {submittedCode} fue registrada.
            </p>
            <button
              onClick={() => setSubmittedCode(null)}
              className="mt-2 text-[11px] underline opacity-70 hover:opacity-100"
            >
              Enviar otro
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <Field label="Nombre *" error={errors.name?.message}>
              <Input {...register("name")} placeholder="Tu nombre" />
            </Field>
            <Field label="Email *" error={errors.email?.message}>
              <Input type="email" {...register("email")} placeholder="tu@email.com" />
            </Field>
            <Field label="Teléfono">
              <Input {...register("phone")} placeholder="+34 6XX XXX XXX" />
            </Field>
            <Field label="Mensaje">
              <Textarea
                rows={3}
                {...register("message")}
                placeholder={`Hola, me interesa ${p.title}...`}
              />
            </Field>
            {submitError && (
              <div className="rounded-2xl border border-negative/20 bg-negative-soft p-2 text-[11px] text-negative">
                <Icon icon={Cancel01Icon} size={11} className="inline" /> {submitError}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Solicitar contacto"}
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              Tus datos solo se usarán para responder a esta consulta.
            </p>
          </form>
        )}
      </div>

      {canBook && p.booking_url && (
        <BookingModal
          open={bookingOpen}
          url={p.booking_url}
          onClose={() => setBookingOpen(false)}
          title={`Agendar visita · ${p.title}`}
        />
      )}
    </Card>
  );
}
