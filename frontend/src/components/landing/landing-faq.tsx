"use client";

import { useState } from "react";
import { Add01Icon, Remove01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

const FAQS = [
  {
    q: "¿Realtes tiene prueba gratis?",
    a: "Sí. 14 días de prueba completos en el plan Pro, sin pedirte tarjeta de crédito. Si te convence, eliges plan; si no, no pasa nada.",
  },
  {
    q: "¿Necesito tarjeta de crédito para empezar?",
    a: "No. Te das de alta con un email, configuramos tu agencia y empiezas a operar. La tarjeta solo entra cuando decides quedarte.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Por supuesto. Sin permanencia, sin costes de cancelación. Mantienes acceso hasta el final del ciclo facturado y puedes exportar tus datos.",
  },
  {
    q: "¿Cuántos usuarios puedo añadir a mi equipo?",
    a: "El plan Pro incluye usuarios ilimitados con permisos por rol — agentes, oficinas, administración — para que cada quien vea solo lo suyo.",
  },
  {
    q: "¿Funciona en móvil y tablet?",
    a: "Sí. Realtes es 100% web responsive: funciona desde cualquier navegador moderno en ordenador, tablet o móvil. Sin instalar nada.",
  },
  {
    q: "¿Migráis los datos desde mi sistema actual?",
    a: "Sí. En el plan Pro y Enterprise hacemos la migración inicial: propiedades, contactos, contratos en curso. En 48-72h estás operando con todo dentro.",
  },
];

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="recursos"
      className="relative py-28 text-[#1a1612]"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f4ecdc 0%, #fbf6ec 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(50% 40% at 50% 20%, rgba(201,169,110,0.13), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[920px] px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            FAQ
          </span>
          <h2 className="mt-5 font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            Preguntas{" "}
            <span className="italic text-[var(--gold)]">frecuentes</span>
          </h2>
          <p className="mt-5 text-[15px] text-[#1a1612]/60">
            ¿No ves la tuya? Escríbenos a hola@realtes.cl y te respondemos en
            menos de 24h.
          </p>
        </div>

        <ul className="mt-14 space-y-3">
          {FAQS.map((f, i) => {
            const open = openIdx === i;
            return (
              <li
                key={f.q}
                className="overflow-hidden rounded-[24px] border border-white/70 bg-white/45 shadow-[0_12px_40px_-20px_rgba(80,60,30,0.15)] backdrop-blur-2xl transition-all hover:bg-white/60"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="text-[15.5px] font-medium text-[#1a1612]">
                    {f.q}
                  </span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/70 backdrop-blur-xl transition-colors ${
                      open
                        ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[#7a5b1f]"
                        : "text-[#1a1612]/70"
                    }`}
                  >
                    <Icon icon={open ? Remove01Icon : Add01Icon} size={14} />
                  </span>
                </button>
                {open && (
                  <div className="px-6 pb-6 pr-20 text-[14.5px] leading-relaxed text-[#1a1612]/65">
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
