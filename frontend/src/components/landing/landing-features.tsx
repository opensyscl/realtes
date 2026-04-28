"use client";

import Link from "next/link";
import {
  Home05Icon,
  UserMultiple02Icon,
  DollarCircleIcon,
  ChartLineData01Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Icon } from "@/components/ui/icon";

interface Feature {
  slug: string;
  icon: IconSvgElement;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  image: string;
}

const FEATURES: Feature[] = [
  {
    slug: "cartera",
    icon: Home05Icon,
    eyebrow: "01 — Cartera",
    title: "Propiedades, todas en orden",
    description:
      "Captación, ficha rica, fotos, documentos, mapa y publicación. Tu inventario por fin centralizado.",
    bullets: ["Ficha completa", "Fotos + tour 360", "Publicación a portales"],
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80&auto=format&fit=crop",
  },
  {
    slug: "crm",
    icon: UserMultiple02Icon,
    eyebrow: "02 — CRM",
    title: "Cada lead, un cierre potencial",
    description:
      "Pipeline visual, actividades, recordatorios y seguimiento desde el primer contacto hasta la firma.",
    bullets: ["Pipeline kanban", "Tareas y agenda", "Conversión 1-click"],
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80&auto=format&fit=crop",
  },
  {
    slug: "cobros",
    icon: DollarCircleIcon,
    eyebrow: "03 — Cobros",
    title: "Cargos, pagos, comisiones",
    description:
      "Generación automática de cargos mensuales, control de mora y splits de comisión sin Excel.",
    bullets: ["Cargos automáticos", "Conciliación", "Splits multi-agente"],
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format&fit=crop",
  },
  {
    slug: "reportes",
    icon: ChartLineData01Icon,
    eyebrow: "04 — Decisiones",
    title: "Reportes que sí lees",
    description:
      "Dashboards limpios: morosidad, aging, ingresos por propiedad, performance de agentes.",
    bullets: ["KPIs en tiempo real", "Aging y mora", "Ranking de agentes"],
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=80&auto=format&fit=crop",
  },
];

export function LandingFeatures() {
  return (
    <section
      id="funcionalidades"
      className="relative py-28 text-[#1a1612]"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f7f1e6 0%, #fbf6ec 50%, #f4ecdc 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(50% 40% at 80% 20%, rgba(201,169,110,0.15), transparent 70%), radial-gradient(40% 40% at 10% 80%, rgba(201,169,110,0.12), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <SectionHeader />

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          Servicios
        </span>
        <h2 className="mt-5 font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
          Todo lo que tu agencia
          <br />
          necesita, <span className="italic text-[var(--gold)]">en un sitio</span>.
        </h2>
      </div>
      <p className="max-w-sm text-[15px] leading-relaxed text-[#1a1612]/55">
        Construido por personas que han trabajado en agencias inmobiliarias.
        Sin pestañas extra, sin spreadsheets, sin caos.
      </p>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Link
      href={`/funcionalidades/${feature.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/45 p-6 shadow-[0_20px_60px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl transition-all hover:bg-white/60 hover:shadow-[0_28px_70px_-25px_rgba(80,60,30,0.25)]"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-[var(--gold)] shadow-[0_4px_12px_-4px_rgba(80,60,30,0.15)] backdrop-blur-xl">
          <Icon icon={feature.icon} size={20} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1a1612]/35">
          {feature.eyebrow}
        </span>
      </div>

      <div className="mt-7">
        <h3 className="font-serif text-[26px] font-medium leading-tight tracking-tight">
          {feature.title}
        </h3>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[#1a1612]/60">
          {feature.description}
        </p>
      </div>

      <ul className="mt-5 flex flex-wrap gap-2">
        {feature.bullets.map((b) => (
          <li
            key={b}
            className="rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11.5px] text-[#1a1612]/75 backdrop-blur-xl"
          >
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-7 overflow-hidden rounded-2xl border border-white/70 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div className="aspect-[16/8] overflow-hidden">
          <img
            src={feature.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-[13px]">
        <span className="text-[#1a1612]/60">Saber más</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#1a1612]/80 backdrop-blur-xl transition-all group-hover:border-[var(--gold)]/50 group-hover:bg-[var(--gold)]/15 group-hover:text-[#7a5b1f]">
          <Icon icon={ArrowUpRight01Icon} size={13} />
        </span>
      </div>
    </Link>
  );
}
