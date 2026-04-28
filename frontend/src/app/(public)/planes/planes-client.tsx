"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ZapIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { usePlans, type Plan } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";

export function PlanesClient() {
  const { data: plans, isLoading } = usePlans();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <main className="min-h-screen text-[#1a1612]">
      <LandingNavbar />

      <PlanesHero cycle={cycle} setCycle={setCycle} />

      <section className="relative pb-28">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, #fbf6ec 0%, #f3ecdf 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(45% 35% at 25% 35%, rgba(201,169,110,0.16), transparent 70%), radial-gradient(40% 35% at 80% 70%, rgba(201,169,110,0.13), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-[1280px] px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[520px] animate-pulse rounded-[28px] border border-white/70 bg-white/40 backdrop-blur-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {plans?.map((p) => (
                <PublicPlanCard key={p.id} plan={p} cycle={cycle} />
              ))}
            </div>
          )}

          <PlanesAssurance />
        </div>
      </section>

      <LandingFaq />
      <LandingFooter />
    </main>
  );
}

function PlanesHero({
  cycle,
  setCycle,
}: {
  cycle: "monthly" | "yearly";
  setCycle: (v: "monthly" | "yearly") => void;
}) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 text-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f6f1e8 0%, #fbf7ef 50%, #f3ecdf 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(45% 45% at 50% 30%, rgba(201,169,110,0.20), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[920px] px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3.5 py-1.5 text-[11px] font-medium text-[#1a1612]/80 shadow-[0_4px_16px_-6px_rgba(80,60,30,0.18)] backdrop-blur-xl">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gold)] opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          </span>
          14 días de prueba sin tarjeta de crédito
        </span>

        <h1 className="mt-7 font-serif text-[52px] font-medium leading-[1.02] tracking-[-0.02em] sm:text-[68px] lg:text-[78px]">
          Precios para corredoras
          <br />
          que <span className="italic text-[var(--gold)]">crecen</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-[#1a1612]/65">
          Empieza gratis con todo lo esencial. Sube de plan cuando necesites
          comisiones, marketplace o emails automáticos. Sin permanencias, sin
          letra chica.
        </p>

        <CycleToggle cycle={cycle} setCycle={setCycle} />
      </div>
    </section>
  );
}

function CycleToggle({
  cycle,
  setCycle,
}: {
  cycle: "monthly" | "yearly";
  setCycle: (v: "monthly" | "yearly") => void;
}) {
  return (
    <div className="mt-10 inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/55 p-1 text-[13px] shadow-[0_8px_28px_-12px_rgba(50,40,25,0.18)] backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setCycle("monthly")}
        className={cn(
          "rounded-full px-5 py-2 font-medium transition-all",
          cycle === "monthly"
            ? "bg-[#1a1612] text-white shadow-[0_6px_16px_-6px_rgba(26,22,18,0.4)]"
            : "text-[#1a1612]/65 hover:text-[#1a1612]",
        )}
      >
        Mensual
      </button>
      <button
        type="button"
        onClick={() => setCycle("yearly")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-5 py-2 font-medium transition-all",
          cycle === "yearly"
            ? "bg-[#1a1612] text-white shadow-[0_6px_16px_-6px_rgba(26,22,18,0.4)]"
            : "text-[#1a1612]/65 hover:text-[#1a1612]",
        )}
      >
        Anual
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            cycle === "yearly"
              ? "bg-[var(--gold)]/30 text-[#fff7e2]"
              : "bg-emerald-500/15 text-emerald-700",
          )}
        >
          ahorra 17%
        </span>
      </button>
    </div>
  );
}

function PublicPlanCard({
  plan,
  cycle,
}: {
  plan: Plan;
  cycle: "monthly" | "yearly";
}) {
  const monthly = Number(plan.price_monthly);
  const yearly = Number(plan.price_yearly);
  const rawPrice = cycle === "monthly" ? monthly : yearly / 12;
  const price = Math.round(rawPrice);
  const isFree = plan.code === "starter";
  const highlighted = !!plan.is_recommended;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[28px] p-7 backdrop-blur-2xl transition-all",
        highlighted
          ? "border border-[var(--gold)]/40 bg-gradient-to-b from-[var(--gold)]/[0.18] to-white/55 shadow-[0_30px_80px_-30px_rgba(201,169,110,0.45)]"
          : "border border-white/70 bg-white/45 shadow-[0_20px_60px_-25px_rgba(80,60,30,0.18)] hover:bg-white/65",
      )}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[var(--gold)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1a1612] shadow-[0_6px_18px_-6px_rgba(201,169,110,0.6)]">
          <Icon icon={ZapIcon} size={10} />
          Más elegido
        </span>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-tight text-[#1a1612]">
          {plan.name}
        </span>
        {plan.tagline && (
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#1a1612]/50">
            {plan.tagline}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-baseline gap-1.5">
        {isFree ? (
          <span className="font-serif text-[52px] font-medium leading-none tracking-[-0.02em] text-[#1a1612]">
            Gratis
          </span>
        ) : (
          <>
            <span className="font-serif text-[52px] font-medium leading-none tracking-[-0.02em] tabular-numbers text-[#1a1612]">
              ${price.toLocaleString("es-CL")}
            </span>
            <span className="text-[14px] text-[#1a1612]/45">CLP/mes</span>
          </>
        )}
      </div>
      {!isFree && cycle === "yearly" && (
        <div className="mt-2 text-[12px] text-[#1a1612]/55 tabular-numbers">
          ${plan.price_yearly.toLocaleString("es-CL")} CLP facturados al año
        </div>
      )}

      <Link
        href={`/registro?plan=${plan.code}`}
        className={cn(
          "group mt-7 inline-flex items-center justify-between gap-2 rounded-full py-3 pl-5 pr-2 text-[13px] font-medium transition-all",
          highlighted
            ? "bg-[#1a1612] text-white shadow-[0_12px_30px_-10px_rgba(26,22,18,0.4)] hover:bg-black"
            : "border border-white/70 bg-white/55 text-[#1a1612] backdrop-blur-xl hover:bg-white/75",
        )}
      >
        {isFree ? "Empezar gratis" : "Probar 14 días"}
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full",
            highlighted
              ? "bg-white text-[#1a1612]"
              : "bg-white/70 text-[#1a1612]",
          )}
        >
          <Icon icon={ArrowRight01Icon} size={11} />
        </span>
      </Link>

      <div className="mt-7 border-t border-[#1a1612]/[0.08] pt-6">
        <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1a1612]/45">
          Incluye
        </h4>
        <ul className="space-y-2.5 text-[14px]">
          {plan.features.map((f) => (
            <li
              key={f.code}
              className={cn(
                "flex items-start gap-2.5",
                !f.included && "opacity-50",
              )}
            >
              <Icon
                icon={f.included ? CheckmarkCircle02Icon : Cancel01Icon}
                size={14}
                className={cn(
                  "mt-0.5 shrink-0",
                  f.included
                    ? highlighted
                      ? "text-[var(--gold)]"
                      : "text-emerald-600"
                    : "text-[#1a1612]/40",
                )}
              />
              <span
                className={cn(
                  "flex-1 text-[#1a1612]/85",
                  !f.included && "line-through",
                )}
              >
                {f.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/60 bg-white/40 p-3 text-center backdrop-blur-xl">
        <Limit n={plan.limits.max_properties} label="props" />
        <Limit n={plan.limits.max_users} label="usuarios" />
        <Limit n={plan.limits.max_active_leads} label="leads" />
      </div>
    </div>
  );
}

function Limit({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="font-serif text-[18px] font-semibold leading-none tabular-numbers text-[#1a1612]">
        {n === -1 ? "∞" : n}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#1a1612]/50">
        {label}
      </div>
    </div>
  );
}

function PlanesAssurance() {
  const items = [
    {
      title: "Sin permanencia",
      text: "Cancela cuando quieras desde Ajustes → Facturación.",
    },
    {
      title: "Cambias de plan al vuelo",
      text: "Sube o baja el plan y prorrateamos automáticamente.",
    },
    {
      title: "Tus datos son tuyos",
      text: "Exporta propiedades, leads y contratos cuando quieras.",
    },
  ];
  return (
    <div className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.title}
          className="rounded-2xl border border-white/70 bg-white/45 p-5 backdrop-blur-2xl"
        >
          <div className="text-[14px] font-semibold tracking-tight text-[#1a1612]">
            {it.title}
          </div>
          <div className="mt-1.5 text-[13px] leading-relaxed text-[#1a1612]/60">
            {it.text}
          </div>
        </div>
      ))}
    </div>
  );
}
