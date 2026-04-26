"use client";

import Link from "next/link";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  ChartLineData01Icon,
  UserMultiple02Icon,
  Building03Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { RealtesLogo } from "./realtes-logo";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0c] pb-20 pt-28 text-white">
      {/* fondo: leve grain + glow gold */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(201,169,110,0.10), transparent 50%), radial-gradient(circle at 80% 70%, rgba(201,169,110,0.06), transparent 60%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Columna izquierda: copy + CTAs */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--gold)]">
            Software inmobiliario todo en uno
          </span>

          <h1 className="mt-7 font-serif text-[64px] font-semibold leading-[1.05] tracking-tight sm:text-[72px] lg:text-[80px]">
            Gestiona. Vende.
            <br />
            <span className="text-[var(--gold)]">
              Haz crecer tu negocio.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base text-white/70 sm:text-lg">
            Realtes es el software inmobiliario que te ayuda a gestionar
            propiedades, clientes y ventas desde un solo lugar.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/registro"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black shadow-[0_8px_30px_-8px_rgba(201,169,110,0.5)] transition-all hover:bg-[var(--gold)]/90 hover:shadow-[0_12px_40px_-8px_rgba(201,169,110,0.6)]"
            >
              Comenzar gratis
              <Icon
                icon={ArrowRight01Icon}
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href="#demo"
              className="group inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              Agendar demo
              <Icon
                icon={ArrowRight01Icon}
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </div>

          {/* Trust badges */}
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/70">
            {[
              "Sin tarjeta de crédito",
              "Fácil de usar",
              "Soporte en español",
            ].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Icon
                  icon={CheckmarkCircle02Icon}
                  size={14}
                  className="text-[var(--gold)]"
                />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Columna derecha: mockup del dashboard sobre fondo de propiedad */}
        <div className="relative">
          <PropertyBackdrop />
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

/**
 * Fondo de la columna derecha — placeholder gradient simulando una propiedad.
 * Cuando tengas una imagen real, sustituye por <img src="/landing/hero.jpg" />
 */
function PropertyBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 overflow-hidden rounded-3xl"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #1a1714 0%, #2d2820 30%, #1a1714 60%, #0f0d0a 100%)",
      }}
    >
      {/* Sugerencia de ventana iluminada */}
      <div className="absolute right-[20%] top-[10%] h-[60%] w-[35%] rounded-2xl bg-gradient-to-br from-[#c9a96e]/20 via-[#c9a96e]/5 to-transparent blur-2xl" />
      <div className="absolute bottom-[15%] left-[10%] h-[40%] w-[40%] rounded-2xl bg-gradient-to-tl from-[#c9a96e]/10 to-transparent blur-3xl" />
    </div>
  );
}

/**
 * Mockup del dashboard interno — versión simplificada que se ve flotando
 * sobre la imagen de fondo. No es una captura real, es CSS + datos demo.
 */
function DashboardMockup() {
  return (
    <div className="relative ml-auto max-w-[540px] rounded-2xl border border-white/10 bg-white/[0.02] p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-sm">
      <div className="flex overflow-hidden rounded-xl bg-white">
        {/* Sidebar */}
        <aside className="flex w-[140px] shrink-0 flex-col gap-1 bg-[#0e1014] p-3 text-white">
          <div className="mb-3 px-1.5">
            <RealtesLogo variant="white" className="h-4" />
          </div>
          {[
            ["Dashboard", true],
            ["Propiedades", false],
            ["Clientes", false],
            ["Oportunidades", false],
            ["Tareas", false],
            ["Reportes", false],
            ["Configuración", false],
          ].map(([label, active]) => (
            <span
              key={String(label)}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] ${
                active
                  ? "bg-white/10 font-semibold text-white"
                  : "text-white/55"
              }`}
            >
              <span className="h-1 w-1 rounded-full bg-current" />
              {label}
            </span>
          ))}
        </aside>

        {/* Contenido */}
        <div className="flex-1 p-3">
          <div className="text-[11px] font-semibold text-foreground">
            Dashboard
          </div>

          {/* Stats row */}
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <MockStat
              label="Ventas este mes"
              value="$128.540"
              delta="+34%"
            />
            <MockStat label="Nuevos clientes" value="48" delta="+13%" />
            <MockStat
              label="Propiedades activas"
              value="86"
              delta=""
            />
          </div>

          {/* Chart + activity */}
          <div className="mt-2 grid grid-cols-[1.3fr_1fr] gap-1.5">
            <div className="rounded-md border border-border-subtle bg-surface p-2">
              <div className="text-[8px] font-semibold text-foreground-muted">
                Ventas
              </div>
              <Sparkline />
              <div className="mt-1 flex justify-between text-[7px] text-muted-foreground">
                {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-border-subtle bg-surface p-2">
              <div className="text-[8px] font-semibold text-foreground-muted">
                Actividad reciente
              </div>
              <ul className="mt-1.5 space-y-1.5">
                {[
                  { icon: UserMultiple02Icon, t: "Nuevo cliente", s: "Hace 2h" },
                  {
                    icon: Building03Icon,
                    t: "Propiedad publicada",
                    s: "Hace 5h",
                  },
                  { icon: ChartLineData01Icon, t: "Oferta recibida", s: "Hace 1d" },
                ].map((a, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-foreground-muted">
                      <Icon icon={a.icon} size={7} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[8px] font-semibold text-foreground">
                        {a.t}
                      </div>
                      <div className="text-[7px] text-muted-foreground">
                        {a.s}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockStat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface p-1.5">
      <div className="text-[7px] font-medium text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-[11px] font-bold tabular-numbers tracking-tight text-foreground">
        {value}
      </div>
      {delta && (
        <div className="text-[7px] font-semibold text-positive">↑ {delta}</div>
      )}
    </div>
  );
}

function Sparkline() {
  // Path simplificado — emula la curva del mockup
  return (
    <svg viewBox="0 0 220 50" className="mt-1 h-12 w-full">
      <defs>
        <linearGradient id="sl-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c9a96e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points="0,40 35,35 70,28 105,30 140,18 175,12 220,8 220,50 0,50"
        fill="url(#sl-grad)"
      />
      <polyline
        points="0,40 35,35 70,28 105,30 140,18 175,12 220,8"
        fill="none"
        stroke="#c9a96e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
