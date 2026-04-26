"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { usePlans, type Plan } from "@/lib/queries";
import { cn } from "@/lib/utils";

export default function PlanesPage() {
  const { data: plans, isLoading } = usePlans();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-foreground text-sm font-semibold">
              R
            </span>
            <span className="font-semibold tracking-tight">
              Real State Valencia
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-foreground-muted hover:text-foreground"
            >
              Iniciar sesión
            </Link>
            <Link href="/registro">
              <Button>Crear agencia gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <Badge variant="info" className="mb-4">
          14 días de prueba gratis sin tarjeta
        </Badge>
        <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Precios para agencias que <span className="italic text-foreground-muted">crecen</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-foreground-muted">
          Comienza gratis con todo lo esencial. Sube de plan cuando necesites
          comisiones, marketplace o emails automáticos. Sin permanencias.
        </p>

        {/* Cycle toggle */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-sm">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={cn(
              "rounded-full px-4 py-1.5 font-medium transition-colors",
              cycle === "monthly"
                ? "bg-foreground text-accent-foreground"
                : "text-foreground-muted",
            )}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setCycle("yearly")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-colors",
              cycle === "yearly"
                ? "bg-foreground text-accent-foreground"
                : "text-foreground-muted",
            )}
          >
            Anual
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                cycle === "yearly"
                  ? "bg-accent-foreground/20 text-accent-foreground"
                  : "bg-positive-soft text-positive",
              )}
            >
              ahorra 17%
            </span>
          </button>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="h-96 animate-pulse bg-surface-muted/40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans?.map((plan) => <PublicPlanCard key={plan.id} plan={plan} cycle={cycle} />)}
          </div>
        )}
      </section>

      {/* FAQs cortas */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight">
          Preguntas frecuentes
        </h2>
        <ul className="space-y-3">
          {FAQS.map((f, i) => (
            <li
              key={i}
              className="rounded-2xl border border-border-subtle bg-surface p-5"
            >
              <h3 className="text-sm font-semibold">{f.q}</h3>
              <p className="mt-2 text-sm text-foreground-muted">{f.a}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PublicPlanCard({ plan, cycle }: { plan: Plan; cycle: "monthly" | "yearly" }) {
  const price = cycle === "monthly" ? plan.price_monthly : plan.price_yearly / 12;
  const isFree = plan.code === "starter";

  return (
    <Card
      className={cn(
        "relative flex flex-col p-7",
        plan.is_recommended && "ring-2 ring-foreground/40",
      )}
    >
      {plan.is_recommended && (
        <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-[10px] font-semibold text-accent-foreground">
          <Icon icon={ZapIcon} size={10} />
          Más popular
        </span>
      )}

      <div>
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        {plan.tagline && (
          <p className="mt-1 text-sm text-foreground-muted">{plan.tagline}</p>
        )}
      </div>

      <div className="my-6">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-semibold tabular-numbers">
            {isFree ? "Gratis" : `€${Math.round(price)}`}
          </span>
          {!isFree && (
            <span className="text-sm text-foreground-muted">/mes</span>
          )}
        </div>
        {!isFree && cycle === "yearly" && (
          <div className="mt-1 text-xs text-foreground-muted tabular-numbers">
            €{plan.price_yearly} facturados anualmente
          </div>
        )}
      </div>

      <Link href={`/registro?plan=${plan.code}`} className="block">
        <Button
          variant={plan.is_recommended ? "primary" : "outline"}
          size="lg"
          className="w-full"
        >
          {isFree ? "Empezar gratis" : "Probar 14 días"}
        </Button>
      </Link>

      <div className="mt-6 border-t border-border-subtle pt-6">
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Incluye
        </h4>
        <ul className="space-y-2.5 text-sm">
          {plan.features.map((f) => (
            <li
              key={f.code}
              className={cn("flex items-start gap-2", !f.included && "opacity-40")}
            >
              <Icon
                icon={f.included ? CheckmarkCircle02Icon : Cancel01Icon}
                size={14}
                className={cn(
                  "mt-0.5 shrink-0",
                  f.included ? "text-positive" : "text-foreground-muted",
                )}
              />
              <span className={cn("flex-1", !f.included && "line-through")}>
                {f.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border-subtle pt-4 text-center">
        <Limit n={plan.limits.max_properties} label="props" />
        <Limit n={plan.limits.max_users} label="usuarios" />
        <Limit n={plan.limits.max_active_leads} label="leads" />
      </div>
    </Card>
  );
}

function Limit({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="text-base font-semibold tabular-numbers">
        {n === -1 ? "∞" : n}
      </div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

const FAQS = [
  {
    q: "¿Necesito tarjeta para empezar?",
    a: "No. Crea tu agencia y obtén 14 días de prueba gratis del plan Pro sin introducir ningún dato de pago.",
  },
  {
    q: "¿Puedo cambiar de plan después?",
    a: "Sí. Sube o baja de plan desde Ajustes → Facturación. El cambio es inmediato y prorrateamos.",
  },
  {
    q: "¿Qué pasa si supero el límite de mi plan?",
    a: "Te avisamos antes y puedes subir a un plan superior. Tus datos siempre se conservan, solo se bloquea la creación de nuevos registros hasta que actualizas.",
  },
  {
    q: "¿Hay permanencia o contrato mínimo?",
    a: "No. Cancela cuando quieras y mantienes acceso hasta el final del período facturado.",
  },
];
