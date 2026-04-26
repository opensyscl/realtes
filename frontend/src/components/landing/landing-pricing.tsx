"use client";

import Link from "next/link";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "$29",
    priceSuffix: "/mes",
    description: "Para inmobiliarias pequeñas",
    features: ["Hasta 5 usuarios", "Gestión de propiedades", "CRM básico", "Reportes básicos"],
    cta: "Comenzar gratis",
    ctaHref: "/registro?plan=starter",
  },
  {
    name: "Pro",
    price: "$79",
    priceSuffix: "/mes",
    description: "Para inmobiliarias en crecimiento",
    features: [
      "Usuarios ilimitados",
      "CRM avanzado",
      "Reportes y analytics",
      "Tareas y recordatorios",
      "Soporte prioritario",
    ],
    cta: "Comenzar gratis",
    ctaHref: "/registro?plan=pro",
    highlighted: true,
    badge: "MÁS POPULAR",
  },
  {
    name: "Enterprise",
    price: "Contáctanos",
    description: "Para grandes empresas",
    features: [
      "Todo lo de Pro",
      "Personalización",
      "Tu información siempre segura",
      "Integraciones",
      "Soporte prioritario",
    ],
    cta: "Agendar demo",
    ctaHref: "#demo",
  },
];

export function LandingPricing() {
  return (
    <section className="bg-surface-muted/30 py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className="text-center font-serif text-4xl font-semibold tracking-tight">
          Precios simples y claros
        </h2>
        <p className="mt-3 text-center text-base text-foreground-muted">
          Sin sorpresas. Cancela cuando quieras.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative flex flex-col rounded-3xl border p-7 transition-all",
                p.highlighted
                  ? "border-[var(--gold)] bg-white shadow-[0_20px_60px_-20px_rgba(201,169,110,0.4)]"
                  : "border-border bg-white",
              )}
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--gold)] px-3 py-1 text-[10px] font-bold tracking-wider text-black">
                  {p.badge}
                </span>
              )}
              <div className="text-lg font-semibold tracking-tight">{p.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-serif text-5xl font-semibold tabular-numbers">
                  {p.price}
                </span>
                {p.priceSuffix && (
                  <span className="text-sm text-foreground-muted">{p.priceSuffix}</span>
                )}
              </div>
              <p className="mt-2 text-xs text-foreground-muted">{p.description}</p>

              <ul className="mt-6 flex-1 space-y-2.5 border-t border-border-subtle pt-5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Icon
                      icon={CheckmarkCircle02Icon}
                      size={14}
                      className="mt-0.5 shrink-0 text-[var(--gold)]"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={p.ctaHref}
                className={cn(
                  "mt-7 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-all",
                  p.highlighted
                    ? "bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
                    : "border border-border bg-surface text-foreground hover:bg-surface-muted",
                )}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
