"use client";

import {
  Home05Icon,
  UserMultiple02Icon,
  DollarCircleIcon,
  Calendar03Icon,
  ChartLineData01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Icon } from "@/components/ui/icon";

interface Feature {
  icon: IconSvgElement;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Home05Icon,
    title: "Gestión de propiedades",
    description:
      "Publica, organiza y mantén tus propiedades siempre actualizadas.",
  },
  {
    icon: UserMultiple02Icon,
    title: "CRM inmobiliario",
    description:
      "Gestiona tus clientes, seguimientos y oportunidades de venta.",
  },
  {
    icon: DollarCircleIcon,
    title: "Ventas y comisiones",
    description:
      "Controla tus ventas, comisiones y el rendimiento de tu equipo.",
  },
  {
    icon: Calendar03Icon,
    title: "Tareas y recordatorios",
    description:
      "No pierdas ningún seguimiento con tareas y recordatorios.",
  },
  {
    icon: ChartLineData01Icon,
    title: "Reportes y analytics",
    description:
      "Toma decisiones inteligentes con datos reales y reportes clave.",
  },
  {
    icon: SmartPhone01Icon,
    title: "Acceso desde cualquier lugar",
    description:
      "Usa Realtes desde tu computadora, tablet o celular.",
  },
];

export function LandingFeatures() {
  return (
    <section
      id="funcionalidades"
      className="bg-white py-24 text-foreground"
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className="mx-auto max-w-3xl text-center font-serif text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
          Todo lo que necesitas para gestionar tu{" "}
          <span className="text-[var(--gold)]">inmobiliaria</span>
        </h2>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center transition-all hover:border-[var(--gold)]/40 hover:shadow-card"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)]">
                <Icon icon={f.icon} size={22} />
              </span>
              <div>
                <div className="text-[13px] font-semibold tracking-tight">
                  {f.title}
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-foreground-muted">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
