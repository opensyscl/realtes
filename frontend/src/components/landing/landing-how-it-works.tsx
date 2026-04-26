"use client";

import {
  UserAdd01Icon,
  Home05Icon,
  ChartLineData01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/ui/icon";

interface Step {
  num: number;
  icon: IconSvgElement;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    num: 1,
    icon: UserAdd01Icon,
    title: "Crea tu cuenta",
    description: "Regístrate en minutos y configura tu equipo.",
  },
  {
    num: 2,
    icon: Home05Icon,
    title: "Carga tus propiedades",
    description: "Publica y organiza todas tus propiedades en un solo lugar.",
  },
  {
    num: 3,
    icon: ChartLineData01Icon,
    title: "Empieza a vender",
    description: "Gestiona clientes, seguimientos y cierra más ventas.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="bg-surface-muted/30 py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-foreground-muted">
          Cómo funciona · 3 pasos
        </h2>
        <div className="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Línea conectora desktop */}
          <div
            aria-hidden
            className="absolute left-[16.6%] right-[16.6%] top-[60px] hidden h-px bg-gradient-to-r from-[var(--gold)]/0 via-[var(--gold)]/40 to-[var(--gold)]/0 sm:block"
          />
          {STEPS.map((s) => (
            <div
              key={s.num}
              className="relative flex flex-col items-center text-center"
            >
              <span className="absolute -top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-white text-[12px] font-bold text-[var(--gold)]">
                {s.num}
              </span>
              <span className="mt-1 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-card">
                <Icon
                  icon={s.icon}
                  size={32}
                  className="text-[var(--gold)]"
                />
              </span>
              <h3 className="mt-5 text-base font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-1.5 max-w-[260px] text-sm text-foreground-muted">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
