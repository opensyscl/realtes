"use client";

import { useState } from "react";
import { Add01Icon, Remove01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

const FAQS = [
  {
    q: "¿Realtes tiene prueba gratis?",
    a: "Sí. Ofrecemos 14 días de prueba en el plan Pro, sin tarjeta de crédito.",
  },
  {
    q: "¿Necesito tarjeta de crédito para probar?",
    a: "No. Puedes usar Realtes durante el periodo de prueba sin agregar ningún método de pago.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Por supuesto. No hay permanencia ni costos de cancelación. Mantienes acceso hasta el final del ciclo facturado.",
  },
  {
    q: "¿Puedo usar Realtes con mi equipo?",
    a: "Sí. El plan Pro incluye usuarios ilimitados y permisos por rol para que cada miembro vea solo lo que necesita.",
  },
  {
    q: "¿Qué dispositivos son compatibles?",
    a: "Realtes funciona en cualquier navegador moderno desde computadora, tablet o celular — no necesitas instalar nada.",
  },
];

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="recursos" className="bg-surface-muted/30 py-24">
      <div className="mx-auto max-w-[800px] px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-foreground-muted">
          Preguntas frecuentes
        </h2>
        <ul className="mt-10 space-y-2">
          {FAQS.map((f, i) => {
            const open = openIdx === i;
            return (
              <li
                key={f.q}
                className="rounded-2xl border border-border bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-[15px] font-medium">{f.q}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-foreground-muted">
                    <Icon icon={open ? Remove01Icon : Add01Icon} size={12} />
                  </span>
                </button>
                {open && (
                  <div className="border-t border-border-subtle px-5 py-4 text-sm leading-relaxed text-foreground-muted">
                    {f.a}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
