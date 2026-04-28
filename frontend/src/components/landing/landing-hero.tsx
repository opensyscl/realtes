"use client";

import Link from "next/link";
import {
  ArrowRight01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 text-[#1a1612]">
      <BackgroundLight />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-x-14 gap-y-16 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <HeroCopy />
        <HeroVisual />
      </div>
    </section>
  );
}

function BackgroundLight() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f6f1e8 0%, #fbf7ef 35%, #f3ecdf 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(45% 45% at 18% 22%, rgba(201,169,110,0.22), transparent 70%), radial-gradient(40% 50% at 85% 80%, rgba(201,169,110,0.16), transparent 70%), radial-gradient(35% 35% at 65% 15%, rgba(255,255,255,0.7), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </>
  );
}

function HeroCopy() {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3.5 py-1.5 text-[11px] font-medium text-[#1a1612]/80 shadow-[0_4px_16px_-6px_rgba(80,60,30,0.18)] backdrop-blur-xl">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gold)] opacity-50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
        </span>
        #1 ERP + CRM inmobiliario en Chile
      </span>

      <h1 className="mt-7 font-serif text-[56px] font-medium leading-[1.0] tracking-[-0.02em] sm:text-[68px] lg:text-[80px]">
        Tu agencia,
        <br />
        operada con
        <br />
        <span className="italic text-[#1a1612]/95">elegancia</span>{" "}
        <span className="text-[var(--gold)]">·</span>
      </h1>

      <p className="mt-7 max-w-lg text-[17px] leading-[1.55] text-[#1a1612]/65">
        Realtes centraliza propiedades, captación, contratos, comisiones y la
        comunicación con tus clientes. Tu equipo cierra más operaciones, sin
        fricción.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Link
          href="/registro"
          className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3.5 pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(26,22,18,0.45)] transition-all hover:bg-black"
        >
          Empezar gratis
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
            <Icon icon={ArrowRight01Icon} size={13} />
          </span>
        </Link>
        <a
          href="#funcionalidades"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/45 px-6 py-3.5 text-[14px] font-medium text-[#1a1612]/85 shadow-[0_4px_16px_-6px_rgba(80,60,30,0.12)] backdrop-blur-xl transition-colors hover:bg-white/70 hover:text-[#1a1612]"
        >
          Ver funcionalidades
        </a>
      </div>

      <HeroSocialProof />
    </div>
  );
}

function HeroSocialProof() {
  return (
    <div className="mt-12 flex items-center gap-6 border-t border-[#1a1612]/[0.08] pt-7">
      <div className="flex -space-x-2">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-9 w-9 overflow-hidden rounded-full border-2 border-[#fbf7ef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
          >
            <img
              src={`https://i.pravatar.cc/72?img=${i + 12}`}
              alt=""
              className="h-full w-full object-cover"
            />
          </span>
        ))}
      </div>
      <div>
        <div className="flex items-center gap-1 text-[var(--gold)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} icon={StarIcon} size={12} />
          ))}
          <span className="ml-1 text-[13px] font-medium text-[#1a1612]">
            5.0
          </span>
        </div>
        <div className="mt-0.5 text-[12px] text-[#1a1612]/55">
          De 200+ corredoras de propiedades en Chile
        </div>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      {/* Imagen en arco */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-[260px] rounded-b-[14px] bg-[#1a1714] shadow-[0_40px_100px_-30px_rgba(80,60,30,0.35)] ring-1 ring-white/40">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=85&auto=format&fit=crop"
          alt="Villa moderna mediterránea"
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 65%, rgba(0,0,0,0.18) 100%)",
          }}
        />
      </div>

      {/* Badge: arriba */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2">
        <FloatingChip>Captación inteligente</FloatingChip>
      </div>

      {/* Badge: medio derecha */}
      <div className="absolute right-[-18px] top-[42%] hidden sm:block">
        <FloatingChip>Cierres sin fricción</FloatingChip>
      </div>

      {/* Badge: abajo izquierda */}
      <div className="absolute bottom-[26%] left-[-18px] hidden sm:block">
        <FloatingChip>Clientes felices</FloatingChip>
      </div>

      {/* Mini KPI bottom right */}
      <div className="absolute -bottom-4 right-2">
        <KpiCard />
      </div>

      {/* Mini pulse top left */}
      <div className="absolute -left-3 top-[12%] hidden lg:block">
        <PulseCard />
      </div>
    </div>
  );
}

function FloatingChip({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-[12.5px] font-medium text-[#1a1612] shadow-[0_10px_28px_-10px_rgba(50,40,25,0.2)] backdrop-blur-xl">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
      {children}
    </div>
  );
}

function KpiCard() {
  return (
    <div className="flex w-[170px] flex-col gap-1.5 rounded-2xl border border-white/70 bg-white/70 p-3 text-[#1a1612] shadow-[0_18px_42px_-14px_rgba(50,40,25,0.25)] backdrop-blur-xl">
      <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.12em] text-[#1a1612]/45">
        <span>Cerrado este mes</span>
      </div>
      <div className="font-serif text-[26px] font-semibold leading-none tracking-tight tabular-numbers">
        UF 3.250
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
        <span className="h-1 w-1 rounded-full bg-emerald-500" />
        +34% vs mes pasado
      </div>
    </div>
  );
}

function PulseCard() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/65 py-1.5 pl-1.5 pr-3 text-[11px] text-[#1a1612] shadow-[0_10px_28px_-10px_rgba(50,40,25,0.18)] backdrop-blur-xl">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--gold)]/20 text-[10px] font-semibold text-[#7a5b1f]">
        ↗
      </span>
      <span className="font-medium">3 nuevos leads</span>
    </div>
  );
}
