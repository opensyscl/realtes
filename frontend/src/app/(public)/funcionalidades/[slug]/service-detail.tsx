"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Add01Icon,
  Remove01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  PropertyMock,
  KanbanMock,
  ChannelsMock,
  ChargesMock,
  ReportsMock,
} from "@/components/landing/service-mocks";
import type { Service } from "@/lib/services-data";

const MOCK_BY_SLUG: Record<string, () => ReactNode> = {
  cartera: () => <PropertyMock />,
  crm: () => <KanbanMock />,
  captacion: () => <ChannelsMock />,
  cobros: () => <ChargesMock />,
  reportes: () => <ReportsMock />,
};

export function ServiceDetail({
  service,
  otherSlugs,
  allServices,
}: {
  service: Service;
  otherSlugs: string[];
  allServices: Record<string, Service>;
}) {
  return (
    <main className="min-h-screen text-[#1a1612]">
      <LandingNavbar />

      <Hero service={service} />
      <FeaturesGrid service={service} />
      <HowItWorks service={service} />
      <BeforeAfter service={service} />
      <StatsRow service={service} />
      <Testimonial service={service} />
      <Faqs service={service} />
      <OtherServices otherSlugs={otherSlugs} allServices={allServices} />

      <LandingCta />
      <LandingFooter />
    </main>
  );
}

/* ============ HERO ============ */

function Hero({ service }: { service: Service }) {
  const Mock = MOCK_BY_SLUG[service.slug] ?? (() => null);
  return (
    <section className="relative overflow-hidden pt-32 pb-20 text-[#1a1612]">
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
            "radial-gradient(45% 40% at 18% 22%, rgba(201,169,110,0.22), transparent 70%), radial-gradient(40% 50% at 85% 80%, rgba(201,169,110,0.18), transparent 70%), radial-gradient(35% 35% at 65% 15%, rgba(255,255,255,0.7), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <Link
          href="/funcionalidades"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#1a1612]/55 hover:text-[#1a1612]"
        >
          <Icon icon={ArrowLeft01Icon} size={11} />
          Todas las funcionalidades
        </Link>

        <div className="mt-6 grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)]/20 text-[#7a5b1f]">
                <Icon icon={service.icon} size={11} />
              </span>
              {service.eyebrow}
            </span>

            <h1 className="mt-6 font-serif text-[48px] font-medium leading-[1.0] tracking-[-0.02em] sm:text-[64px] lg:text-[72px]">
              {service.title}{" "}
              <span className="italic text-[var(--gold)]">
                {service.titleAccent}
              </span>
              .
            </h1>
            <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-[#1a1612]/65">
              {service.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/registro?plan=pro"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3.5 pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_14px_34px_-12px_rgba(26,22,18,0.45)] hover:bg-black"
              >
                Empezar gratis
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
                  <Icon icon={ArrowRight01Icon} size={13} />
                </span>
              </Link>
              <Link
                href="/planes"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-6 py-3.5 text-[14px] font-medium text-[#1a1612]/85 backdrop-blur-xl hover:bg-white/75 hover:text-[#1a1612]"
              >
                Ver planes
              </Link>
            </div>
          </div>

          <div className="relative">
            <Mock />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ FEATURES GRID ============ */

function FeaturesGrid({ service }: { service: Service }) {
  return (
    <section className="relative py-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f3ecdf 0%, #fbf6ec 100%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            Lo que incluye
          </span>
          <h2 className="mt-5 font-serif text-[36px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[44px]">
            Todo lo que necesitas
            <br />
            para esta área de tu corredora.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {service.features.map((f) => (
            <div
              key={f.title}
              className="rounded-[24px] border border-white/70 bg-white/45 p-6 shadow-[0_16px_50px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl transition-all hover:bg-white/65"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-[var(--gold)] backdrop-blur-xl">
                <Icon icon={f.icon} size={17} />
              </span>
              <div className="mt-5 text-[15px] font-semibold leading-tight tracking-tight text-[#1a1612]">
                {f.title}
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#1a1612]/60">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ HOW IT WORKS ============ */

function HowItWorks({ service }: { service: Service }) {
  return (
    <section className="relative py-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #fbf6ec 0%, #f4ecdc 100%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            Cómo funciona
          </span>
          <h2 className="mt-5 font-serif text-[36px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[44px]">
            En 3 pasos. <span className="italic text-[var(--gold)]">Simple</span>.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {service.steps.map((s, i) => (
            <div key={s.num} className="relative">
              {/* Connector line */}
              {i < service.steps.length - 1 && (
                <div className="absolute left-1/2 top-8 z-0 hidden h-px w-full bg-gradient-to-r from-[var(--gold)]/40 to-transparent lg:block" />
              )}
              <div className="relative z-10 rounded-[24px] border border-white/70 bg-white/55 p-7 shadow-[0_16px_50px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-[36px] font-medium leading-none tracking-[-0.02em] tabular-numbers text-[var(--gold)]">
                    {s.num}
                  </span>
                  <span className="text-[16px] font-semibold tracking-tight text-[#1a1612]">
                    {s.title}
                  </span>
                </div>
                <p className="mt-4 text-[14px] leading-relaxed text-[#1a1612]/65">
                  {s.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ BEFORE / AFTER ============ */

function BeforeAfter({ service }: { service: Service }) {
  return (
    <section className="relative py-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f4ecdc 0%, #fbf6ec 100%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            La diferencia
          </span>
          <h2 className="mt-5 font-serif text-[36px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[44px]">
            Antes vs <span className="italic text-[var(--gold)]">después</span>.
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-[980px] grid-cols-1 gap-5 md:grid-cols-2">
          {/* Antes */}
          <div className="rounded-[28px] border border-rose-300/30 bg-rose-50/40 p-7 shadow-[0_16px_50px_-25px_rgba(150,30,30,0.12)] backdrop-blur-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/50 bg-rose-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-rose-700">
              Antes · con Excel
            </div>
            <ul className="mt-6 space-y-3">
              {service.before.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#1a1612]/75"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <Icon icon={Cancel01Icon} size={9} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Después */}
          <div className="rounded-[28px] border border-[var(--gold)]/40 bg-gradient-to-b from-[var(--gold)]/[0.18] to-white/55 p-7 shadow-[0_30px_80px_-30px_rgba(201,169,110,0.45)] backdrop-blur-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1a1612]">
              Después · con Realtes
            </div>
            <ul className="mt-6 space-y-3">
              {service.after.map((a) => (
                <li
                  key={a}
                  className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#1a1612]/85"
                >
                  <Icon
                    icon={CheckmarkCircle02Icon}
                    size={14}
                    className="mt-0.5 shrink-0 text-[var(--gold)]"
                  />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ STATS ============ */

function StatsRow({ service }: { service: Service }) {
  return (
    <section className="relative py-24">
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
            "radial-gradient(50% 40% at 50% 50%, rgba(201,169,110,0.18), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-3 lg:gap-x-10">
          {service.stats.map((s) => (
            <div key={s.label} className="flex flex-col text-center lg:text-left">
              <div className="font-serif text-[64px] font-medium leading-[0.95] tracking-[-0.03em] tabular-numbers sm:text-[80px]">
                <span className="bg-gradient-to-b from-[#1a1612] to-[#1a1612]/55 bg-clip-text text-transparent">
                  {s.value}
                </span>
              </div>
              <div className="mt-3 text-[14px] font-medium leading-tight text-[#1a1612]/85">
                {s.label}
              </div>
              {s.sub && (
                <div className="mt-1 text-[12px] text-[#1a1612]/45">{s.sub}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ TESTIMONIAL ============ */

function Testimonial({ service }: { service: Service }) {
  const t = service.testimonial;
  return (
    <section className="relative py-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f3ecdf 0%, #fbf6ec 100%)",
        }}
      />

      <div className="mx-auto max-w-[820px] px-6">
        <div className="rounded-[32px] border border-white/70 bg-white/55 p-10 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.25)] backdrop-blur-2xl">
          <div className="flex items-center gap-1 text-[var(--gold)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon key={i} icon={StarIcon} size={13} />
            ))}
          </div>

          <p className="mt-5 font-serif text-[26px] leading-[1.3] tracking-[-0.01em] text-[#1a1612] sm:text-[30px]">
            &ldquo;{t.quote}&rdquo;
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 overflow-hidden rounded-full border border-white/70">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="h-full w-full object-cover"
                />
              </span>
              <div>
                <div className="text-[14px] font-semibold text-[#1a1612]">
                  {t.author}
                </div>
                <div className="text-[12.5px] text-[#1a1612]/55">
                  {t.role} · {t.agency}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--gold)]/40 bg-gradient-to-b from-[var(--gold)]/[0.18] to-white/55 px-5 py-3 backdrop-blur-xl">
              <div className="font-serif text-[24px] font-semibold leading-none tabular-numbers text-[var(--gold)]">
                {t.metric.value}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#1a1612]/60">
                {t.metric.label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ FAQS ============ */

function Faqs({ service }: { service: Service }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section className="relative py-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #fbf6ec 0%, #f4ecdc 100%)",
        }}
      />

      <div className="mx-auto max-w-[820px] px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            Preguntas
          </span>
          <h2 className="mt-5 font-serif text-[36px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[44px]">
            Lo que más nos{" "}
            <span className="italic text-[var(--gold)]">preguntan</span>.
          </h2>
        </div>

        <ul className="mt-12 space-y-3">
          {service.faqs.map((f, i) => {
            const open = openIdx === i;
            return (
              <li
                key={f.q}
                className="overflow-hidden rounded-[20px] border border-white/70 bg-white/45 shadow-[0_12px_40px_-20px_rgba(80,60,30,0.15)] backdrop-blur-2xl transition-all hover:bg-white/60"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="text-[15px] font-medium text-[#1a1612]">
                    {f.q}
                  </span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/70 backdrop-blur-xl ${
                      open
                        ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[#7a5b1f]"
                        : "text-[#1a1612]/70"
                    }`}
                  >
                    <Icon icon={open ? Remove01Icon : Add01Icon} size={14} />
                  </span>
                </button>
                {open && (
                  <div className="px-6 pb-6 pr-20 text-[14px] leading-relaxed text-[#1a1612]/65">
                    {f.a}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ============ OTHER SERVICES ============ */

function OtherServices({
  otherSlugs,
  allServices,
}: {
  otherSlugs: string[];
  allServices: Record<string, Service>;
}) {
  return (
    <section className="relative py-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f4ecdc 0%, #f3ecdf 100%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              Otras funcionalidades
            </span>
            <h2 className="mt-5 font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[40px]">
              Sigue <span className="italic text-[var(--gold)]">explorando</span>.
            </h2>
          </div>
          <Link
            href="/funcionalidades"
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/55 px-5 py-3 text-[13px] font-medium text-[#1a1612]/85 backdrop-blur-xl hover:bg-white/75 hover:text-[#1a1612]"
          >
            Ver todas
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70">
              <Icon icon={ArrowUpRight01Icon} size={12} />
            </span>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {otherSlugs.map((slug) => {
            const s = allServices[slug];
            return (
              <Link
                key={slug}
                href={`/funcionalidades/${slug}`}
                className="group rounded-[24px] border border-white/70 bg-white/45 p-5 shadow-[0_12px_40px_-20px_rgba(80,60,30,0.15)] backdrop-blur-2xl transition-all hover:bg-white/65 hover:shadow-[0_18px_50px_-20px_rgba(80,60,30,0.22)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-[var(--gold)] backdrop-blur-xl">
                  <Icon icon={s.icon} size={17} />
                </span>
                <div className="mt-5 text-[15px] font-semibold leading-tight tracking-tight text-[#1a1612]">
                  {s.eyebrow}
                </div>
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#1a1612]/55">
                  {s.subtitle}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[12.5px] font-medium text-[#1a1612]/70 transition-all group-hover:text-[#7a5b1f]">
                  Ver funcionalidad
                  <Icon icon={ArrowRight01Icon} size={11} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
