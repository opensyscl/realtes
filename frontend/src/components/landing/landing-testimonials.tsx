"use client";

import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Realtes nos permitió ordenar todo el equipo y aumentar nuestras ventas en semanas.",
    name: "Andrea Vargas",
    role: "Director Comercial en RE/MAX México",
  },
  {
    quote:
      "La herramienta es intuitiva, completa y soporte rápido cuando lo necesitamos.",
    name: "María Fernanda Ruiz",
    role: "Broker en Century 21",
  },
  {
    quote:
      "Ahora tenemos visibilidad real de nuestra cartera y métricas clave al día.",
    name: "Javier Londoño",
    role: "CEO en Inmobiliaria Élite",
  },
];

export function LandingTestimonials() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-foreground-muted">
          Testimonios
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="p-6">
              <Quote />
              <p className="mt-3 text-[15px] leading-relaxed text-foreground">
                {t.quote}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border-subtle pt-4">
                <Avatar name={t.name} size="md" />
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-[11px] text-foreground-muted">
                    {t.role}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Indicadores de carrusel (decorativos) */}
        <div className="mt-8 flex justify-center gap-1.5">
          {[true, false, false, false].map((active, i) => (
            <span
              key={i}
              className={
                active
                  ? "h-1.5 w-6 rounded-full bg-[var(--gold)]"
                  : "h-1.5 w-1.5 rounded-full bg-border"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <svg
      width="22"
      height="18"
      viewBox="0 0 22 18"
      fill="none"
      className="text-[var(--gold)]"
      aria-hidden
    >
      <path
        d="M0 18V11.6c0-2.6.5-4.9 1.5-7C2.5 2.5 4.2 1 6.5 0l1.7 2.5c-1.4.7-2.5 1.6-3.2 2.7-.7 1.1-1 2.4-1 3.8h3.5V18H0zm12 0V11.6c0-2.6.5-4.9 1.5-7C14.5 2.5 16.2 1 18.5 0l1.7 2.5c-1.4.7-2.5 1.6-3.2 2.7-.7 1.1-1 2.4-1 3.8H19.5V18H12z"
        fill="currentColor"
      />
    </svg>
  );
}
