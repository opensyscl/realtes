"use client";

import { useState } from "react";
import Link from "next/link";
import {
  StarIcon,
  Location01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  REVIEWS,
  FEATURED_REVIEW,
  REVIEW_STATS,
  type Review,
} from "@/lib/reviews-data";

const SERVICE_LABELS: Record<Review["service"], string> = {
  cartera: "Cartera",
  crm: "CRM",
  captacion: "Captación",
  cobros: "Cobros",
  reportes: "Reportes",
};

const FILTERS: { value: "all" | Review["service"]; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "cartera", label: "Cartera" },
  { value: "crm", label: "CRM" },
  { value: "captacion", label: "Captación" },
  { value: "cobros", label: "Cobros" },
  { value: "reportes", label: "Reportes" },
];

export function ResenasClient() {
  const [filter, setFilter] = useState<"all" | Review["service"]>("all");
  const filtered =
    filter === "all" ? REVIEWS : REVIEWS.filter((r) => r.service === filter);

  return (
    <main className="min-h-screen text-[#1a1612]">
      <LandingNavbar />
      <Hero />
      <FeaturedQuote />
      <FilterBar filter={filter} setFilter={setFilter} />
      <ReviewsGrid reviews={filtered} />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}

/* ============ HERO ============ */

function Hero() {
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
            "radial-gradient(45% 40% at 25% 25%, rgba(201,169,110,0.20), transparent 70%), radial-gradient(40% 40% at 80% 70%, rgba(201,169,110,0.16), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[920px] px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3.5 py-1.5 text-[11px] font-medium text-[#1a1612]/80 shadow-[0_4px_16px_-6px_rgba(80,60,30,0.18)] backdrop-blur-xl">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gold)] opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          </span>
          Reseñas verificadas
        </span>

        <h1 className="mt-7 font-serif text-[52px] font-medium leading-[1.02] tracking-[-0.02em] sm:text-[68px] lg:text-[78px]">
          Lo que dicen las
          <br />
          corredoras que{" "}
          <span className="italic text-[var(--gold)]">venden</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-[#1a1612]/65">
          Reseñas reales de corredoras de propiedades en Chile que ya operan
          con Realtes. Sin filtros, sin maquillaje.
        </p>

        {/* Stats row */}
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          <StatPill value={REVIEW_STATS.rating} label="rating promedio" prefix="⭐" />
          <StatPill value={REVIEW_STATS.reviewCount} label="reseñas" />
          <StatPill value={REVIEW_STATS.agencyCount} label="corredoras" />
          <StatPill value={REVIEW_STATS.recommendation} label="recomienda" />
        </div>
      </div>
    </section>
  );
}

function StatPill({
  value,
  label,
  prefix,
}: {
  value: string;
  label: string;
  prefix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/55 p-4 backdrop-blur-xl">
      <div className="font-serif text-[26px] font-semibold leading-none tabular-numbers text-[#1a1612]">
        {prefix && (
          <span className="mr-1 text-[var(--gold)]">{prefix}</span>
        )}
        {value}
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#1a1612]/55">
        {label}
      </div>
    </div>
  );
}

/* ============ FEATURED QUOTE ============ */

function FeaturedQuote() {
  const r = FEATURED_REVIEW;
  return (
    <section className="relative py-20">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f3ecdf 0%, #fbf6ec 100%)",
        }}
      />

      <div className="mx-auto max-w-[1080px] px-6">
        <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white/55 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.25)] backdrop-blur-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
            {/* Quote */}
            <div className="p-10 lg:p-14">
              <div className="flex items-center gap-1 text-[var(--gold)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} icon={StarIcon} size={14} />
                ))}
              </div>

              <p className="mt-6 font-serif text-[32px] leading-[1.2] tracking-[-0.015em] text-[#1a1612] sm:text-[40px]">
                &ldquo;{r.quote}&rdquo;
              </p>

              <div className="mt-10 flex items-center gap-4">
                <span className="h-14 w-14 overflow-hidden rounded-full border border-white/70">
                  <img
                    src={r.avatar}
                    alt={r.author}
                    className="h-full w-full object-cover"
                  />
                </span>
                <div>
                  <div className="text-[15px] font-semibold text-[#1a1612]">
                    {r.author}
                  </div>
                  <div className="text-[13px] text-[#1a1612]/55">
                    {r.role} · {r.agency}
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-[#1a1612]/45">
                    <Icon icon={Location01Icon} size={11} />
                    {r.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Big metric panel */}
            <div className="relative flex flex-col items-start justify-center bg-gradient-to-br from-[var(--gold)]/[0.20] to-[var(--gold)]/[0.05] p-10 lg:p-14">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(60% 60% at 70% 30%, rgba(201,169,110,0.35), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a5b1f]">
                  Resultado medido
                </div>
                <div className="mt-4 font-serif text-[88px] font-semibold leading-[0.9] tracking-[-0.04em] tabular-numbers text-[#1a1612] sm:text-[112px]">
                  {r.metric.value}
                </div>
                <div className="mt-3 max-w-[240px] text-[15px] leading-snug text-[#1a1612]/70">
                  {r.metric.label}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ FILTER BAR ============ */

function FilterBar({
  filter,
  setFilter,
}: {
  filter: "all" | Review["service"];
  setFilter: (v: "all" | Review["service"]) => void;
}) {
  return (
    <section className="relative pt-12 pb-6">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #fbf6ec 0%, #fbf6ec 100%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6 text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1a1612]/55">
          Filtrar por funcionalidad
        </div>
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/70 bg-white/55 p-1 shadow-[0_8px_28px_-12px_rgba(50,40,25,0.18)] backdrop-blur-xl">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-[#1a1612] text-white shadow-[0_6px_16px_-6px_rgba(26,22,18,0.4)]"
                    : "text-[#1a1612]/65 hover:text-[#1a1612]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============ REVIEWS GRID ============ */

function ReviewsGrid({ reviews }: { reviews: Review[] }) {
  return (
    <section className="relative py-16">
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
            "radial-gradient(40% 30% at 80% 30%, rgba(201,169,110,0.13), transparent 70%), radial-gradient(40% 30% at 20% 70%, rgba(201,169,110,0.10), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        {reviews.length === 0 ? (
          <p className="text-center text-[14px] text-[#1a1612]/55">
            No hay reseñas en esta categoría aún.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <ReviewCard key={r.author} review={r} />
            ))}
          </div>
        )}

        {/* Final CTA inline */}
        <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-[28px] border border-white/70 bg-white/55 p-8 text-center shadow-[0_20px_60px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl">
          <div className="font-serif text-[24px] font-medium leading-tight tracking-tight text-[#1a1612] sm:text-[28px]">
            ¿Quieres ser la próxima reseña?
          </div>
          <p className="max-w-md text-[14px] text-[#1a1612]/60">
            Empieza gratis con Realtes. 14 días sin tarjeta, migración
            incluida en plan Pro y Business.
          </p>
          <Link
            href="/registro?plan=pro"
            className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3 pl-5 pr-2 text-[13px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(26,22,18,0.4)] hover:bg-black"
          >
            Empezar gratis
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
              <Icon icon={ArrowRight01Icon} size={11} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex flex-col rounded-[24px] border border-white/70 bg-white/45 p-6 shadow-[0_16px_50px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl transition-all hover:bg-white/65">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[var(--gold)]">
          {Array.from({ length: review.rating }).map((_, i) => (
            <Icon key={i} icon={StarIcon} size={11} />
          ))}
        </div>
        <Link
          href={`/funcionalidades/${review.service}`}
          className="rounded-full border border-white/70 bg-white/55 px-2.5 py-1 text-[10.5px] font-medium text-[#1a1612]/65 transition-colors hover:bg-white/75 hover:text-[#1a1612]"
        >
          {SERVICE_LABELS[review.service]}
        </Link>
      </div>

      <p className="mt-5 font-serif text-[16px] leading-[1.45] tracking-[-0.005em] text-[#1a1612]/90">
        &ldquo;{review.quote}&rdquo;
      </p>

      <div className="mt-5 inline-flex items-baseline gap-1.5">
        <span className="font-serif text-[22px] font-semibold leading-none tabular-numbers text-[var(--gold)]">
          {review.metric.value}
        </span>
        <span className="text-[11.5px] text-[#1a1612]/55">
          {review.metric.label}
        </span>
      </div>

      <div className="mt-auto flex items-center gap-3 pt-6">
        <span className="h-10 w-10 overflow-hidden rounded-full border border-white/70">
          <img
            src={review.avatar}
            alt={review.author}
            className="h-full w-full object-cover"
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-[#1a1612]">
            {review.author}
          </div>
          <div className="truncate text-[11.5px] text-[#1a1612]/55">
            {review.role} · {review.agency}
          </div>
          <div className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] text-[#1a1612]/45">
            <Icon icon={Location01Icon} size={9} />
            {review.location}
          </div>
        </div>
      </div>
    </article>
  );
}
