"use client";

import {
  ArrowUpRight01Icon,
  Clock01Icon,
  ChartLineData01Icon,
  CheckmarkCircle02Icon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";

const STATS = [
  {
    value: "32%",
    label: "menos tiempo en gestión",
    sub: "vs hojas de cálculo",
  },
  { value: "200+", label: "corredoras", sub: "ya operan con Realtes" },
  {
    value: "UF 2.1M",
    label: "en operaciones gestionadas",
    sub: "por la plataforma en 2025",
  },
  { value: "4.9", label: "valoración media", sub: "de 1.200+ reseñas" },
];

const BENEFITS = [
  {
    icon: Clock01Icon,
    title: "Ahorra 8h por semana",
    text: "Automatiza cargos mensuales, recordatorios y comunicaciones rutinarias.",
  },
  {
    icon: ChartLineData01Icon,
    title: "Decide con datos",
    text: "Reportes de morosidad, aging y performance siempre al día.",
  },
  {
    icon: CheckmarkCircle02Icon,
    title: "Cero errores de Excel",
    text: "Cargos, comisiones y conciliación calculados por la plataforma.",
  },
  {
    icon: Globe02Icon,
    title: "Multi-portal",
    text: "Publica una vez, sincroniza con Idealista y portales locales.",
  },
];

export function LandingBenefits() {
  return (
    <section className="relative py-28 text-[#1a1612]">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f3ebd9 0%, #faf4e8 50%, #f4ecdc 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 30%, rgba(201,169,110,0.16), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        {/* Big stats row */}
        <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:gap-x-10">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col">
              <div className="font-serif text-[64px] font-medium leading-[0.95] tracking-[-0.03em] tabular-numbers sm:text-[80px]">
                <span className="bg-gradient-to-b from-[#1a1612] to-[#1a1612]/55 bg-clip-text text-transparent">
                  {s.value}
                </span>
              </div>
              <div className="mt-3 text-[14px] font-medium leading-tight text-[#1a1612]/85">
                {s.label}
              </div>
              <div className="mt-1 text-[12px] text-[#1a1612]/45">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-20 h-px bg-gradient-to-r from-transparent via-[#1a1612]/12 to-transparent" />

        {/* Benefit cards row */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              Por qué Realtes
            </span>
            <h2 className="mt-5 font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
              Hecho para
              <br />
              agencias <span className="italic text-[var(--gold)]">que operan</span>.
            </h2>
            <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-[#1a1612]/60">
              No es otra herramienta más. Es la plataforma que tu equipo abre
              cada mañana y no quiere cerrar.
            </p>
            <a
              href="#"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3 pl-5 pr-2 text-[13px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(26,22,18,0.4)] hover:bg-black"
            >
              Hablar con ventas
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1612]">
                <Icon icon={ArrowUpRight01Icon} size={11} />
              </span>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-3xl border border-white/70 bg-white/45 p-5 shadow-[0_16px_50px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl transition-all hover:bg-white/65"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-[var(--gold)] backdrop-blur-xl">
                  <Icon icon={b.icon} size={17} />
                </span>
                <div className="mt-5 text-[15px] font-semibold leading-tight tracking-tight">
                  {b.title}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[#1a1612]/60">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
