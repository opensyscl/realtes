"use client";

import Link from "next/link";
import {
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
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
    price: "€29",
    priceSuffix: "/mes",
    description: "Para inmobiliarias que están empezando.",
    features: [
      "Hasta 5 usuarios",
      "Gestión de propiedades",
      "CRM básico",
      "Reportes esenciales",
    ],
    cta: "Empezar gratis",
    ctaHref: "/registro?plan=starter",
  },
  {
    name: "Pro",
    price: "€79",
    priceSuffix: "/mes",
    description: "Para agencias en crecimiento que ya facturan.",
    features: [
      "Usuarios ilimitados",
      "CRM avanzado + pipeline",
      "Cargos y comisiones automáticos",
      "Reportes & analytics",
      "Soporte prioritario",
      "Publicación a portales",
    ],
    cta: "Empezar gratis",
    ctaHref: "/registro?plan=pro",
    highlighted: true,
    badge: "Más elegido",
  },
  {
    name: "Enterprise",
    price: "Hablamos",
    description: "Para redes con varias oficinas y multi-marca.",
    features: [
      "Todo lo de Pro",
      "Multi-oficina y multi-marca",
      "Integraciones a medida",
      "Onboarding dedicado",
      "SLA y soporte priority",
    ],
    cta: "Agendar demo",
    ctaHref: "#",
  },
];

export function LandingPricing() {
  return (
    <section className="relative py-28 text-[#1a1612]">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f3ecdf 0%, #faf4e8 50%, #f4ecdc 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(50% 40% at 50% 30%, rgba(201,169,110,0.18), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            Precios
          </span>
          <h2 className="mt-5 font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
            Simples.{" "}
            <span className="italic text-[var(--gold)]">Sin sorpresas</span>.
          </h2>
          <p className="mt-5 text-[15px] text-[#1a1612]/60">
            Cancela cuando quieras. Cambia de plan al vuelo. Sin comisiones por
            usuario.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard key={p.name} plan={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const highlighted = !!plan.highlighted;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[28px] p-7 backdrop-blur-2xl transition-all",
        highlighted
          ? "border border-[var(--gold)]/40 bg-gradient-to-b from-[var(--gold)]/[0.18] to-white/55 shadow-[0_30px_80px_-30px_rgba(201,169,110,0.45)]"
          : "border border-white/70 bg-white/45 shadow-[0_20px_60px_-25px_rgba(80,60,30,0.18)] hover:bg-white/65",
      )}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--gold)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1a1612] shadow-[0_6px_18px_-6px_rgba(201,169,110,0.6)]">
          {plan.badge}
        </span>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-tight text-[#1a1612]">
          {plan.name}
        </span>
        {highlighted && (
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#7a5b1f]">
            Pro
          </span>
        )}
      </div>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-serif text-[52px] font-medium leading-none tracking-[-0.02em] tabular-numbers text-[#1a1612]">
          {plan.price}
        </span>
        {plan.priceSuffix && (
          <span className="text-[14px] text-[#1a1612]/45">
            {plan.priceSuffix}
          </span>
        )}
      </div>
      <p className="mt-3 text-[13.5px] text-[#1a1612]/60">{plan.description}</p>

      <ul className="mt-7 flex-1 space-y-3 border-t border-[#1a1612]/[0.08] pt-6">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-[14px] text-[#1a1612]/85"
          >
            <Icon
              icon={CheckmarkCircle02Icon}
              size={14}
              className={cn(
                "mt-0.5 shrink-0",
                highlighted ? "text-[var(--gold)]" : "text-[#1a1612]/55",
              )}
            />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={cn(
          "group mt-8 inline-flex items-center justify-between gap-2 rounded-full py-3 pl-5 pr-2 text-[13px] font-medium transition-all",
          highlighted
            ? "bg-[#1a1612] text-white shadow-[0_12px_30px_-10px_rgba(26,22,18,0.4)] hover:bg-black"
            : "border border-white/70 bg-white/55 text-[#1a1612] backdrop-blur-xl hover:bg-white/75",
        )}
      >
        {plan.cta}
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full",
            highlighted ? "bg-white text-[#1a1612]" : "bg-white/70 text-[#1a1612]",
          )}
        >
          <Icon icon={ArrowRight01Icon} size={11} />
        </span>
      </Link>
    </div>
  );
}
