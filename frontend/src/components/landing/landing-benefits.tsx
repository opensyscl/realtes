"use client";

import {
  ChartLineData01Icon,
  Clock01Icon,
  UserMultiple02Icon,
  ChartIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/ui/icon";

interface Benefit {
  icon: IconSvgElement;
  big: string;
  prefix?: string;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: ChartLineData01Icon,
    prefix: "Hasta",
    big: "+35%",
    title: "Aumenta tus ventas",
    description: "más conversión",
  },
  {
    icon: Clock01Icon,
    prefix: "Hasta",
    big: "−50%",
    title: "Ahorra tiempo en gestión",
    description: "menos tiempo administrativo",
  },
  {
    icon: UserMultiple02Icon,
    big: "",
    title: "Mejora la experiencia de tus clientes",
    description: "Seguimientos personalizados y oportunos",
  },
  {
    icon: ChartIcon,
    big: "",
    title: "Toma decisiones con datos reales",
    description: "Reportes y análisis en tiempo real",
  },
];

export function LandingBenefits() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-foreground-muted">
          Beneficios · Resultados
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface p-7 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)]">
                <Icon icon={b.icon} size={22} />
              </span>
              {b.big ? (
                <div>
                  {b.prefix && (
                    <div className="text-[11px] text-foreground-muted">
                      {b.prefix}
                    </div>
                  )}
                  <div className="mt-0.5 font-serif text-4xl font-semibold tracking-tight text-[var(--gold)]">
                    {b.big}
                  </div>
                </div>
              ) : null}
              <div>
                <div className="font-semibold leading-tight">{b.title}</div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
