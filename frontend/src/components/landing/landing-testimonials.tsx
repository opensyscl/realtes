"use client";

import { StarIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  agency: string;
  avatar: string;
  metric?: { value: string; label: string };
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Pasamos de 4 herramientas distintas a una sola. El equipo factura más y discute menos quién hizo qué.",
    author: "Carla Montoya",
    role: "CEO",
    agency: "Montoya Inmobiliaria",
    avatar: "https://i.pravatar.cc/120?img=47",
    metric: { value: "+38%", label: "operaciones / trimestre" },
  },
  {
    quote:
      "La generación automática de cargos nos ahorra dos días de trabajo cada mes. Nadie quiere volver atrás.",
    author: "David Ferrer",
    role: "Director",
    agency: "Ferrer Real Estate",
    avatar: "https://i.pravatar.cc/120?img=33",
    metric: { value: "8h", label: "ahorradas por semana" },
  },
  {
    quote:
      "Ver el pipeline en kanban hizo que cada agente supiera qué tocar primero. Subimos conversión sin contratar a nadie.",
    author: "Lucía Romero",
    role: "Head of Sales",
    agency: "Marina Living",
    avatar: "https://i.pravatar.cc/120?img=20",
    metric: { value: "2.4×", label: "conversión vs antes" },
  },
];

export function LandingTestimonials() {
  return (
    <section
      id="testimonios"
      className="relative py-28 text-[#1a1612]"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f4ecdc 0%, #fbf6ec 50%, #f3ecdf 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(45% 35% at 75% 25%, rgba(201,169,110,0.16), transparent 70%), radial-gradient(40% 35% at 15% 75%, rgba(201,169,110,0.13), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              Reseñas
            </span>
            <h2 className="mt-5 font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
              Lo dicen los equipos
              <br />
              que <span className="italic text-[var(--gold)]">venden</span>.
            </h2>
          </div>
          <div className="flex items-center gap-4 rounded-full border border-white/70 bg-white/55 px-4 py-2 backdrop-blur-xl">
            <div className="flex -space-x-2">
              {[5, 6, 7, 8].map((i) => (
                <span
                  key={i}
                  className="h-9 w-9 overflow-hidden rounded-full border-2 border-white"
                >
                  <img
                    src={`https://i.pravatar.cc/72?img=${i + 25}`}
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
              </div>
              <div className="text-[12px] text-[#1a1612]/55">
                4.9 de 1.200+ reseñas
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.author} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className="relative flex flex-col rounded-[28px] border border-white/70 bg-white/45 p-7 shadow-[0_20px_60px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl transition-all hover:bg-white/65">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-[var(--gold)] backdrop-blur-xl">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
            aria-hidden
          >
            <path d="M7.6 7.4c-2.7 1.4-4 3.5-4 6.4v3.6h5.4v-5.4H6.5c.1-1.7.9-2.9 2.5-3.7l-1.4-.9zM17.1 7.4c-2.7 1.4-4 3.5-4 6.4v3.6h5.4v-5.4H16c.1-1.7.9-2.9 2.5-3.7l-1.4-.9z" />
          </svg>
        </span>
        <div className="flex items-center gap-0.5 text-[var(--gold)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} icon={StarIcon} size={11} />
          ))}
        </div>
      </div>

      <p className="mt-7 font-serif text-[20px] leading-[1.35] tracking-[-0.01em] text-[#1a1612]/90">
        &ldquo;{t.quote}&rdquo;
      </p>

      {t.metric && (
        <div className="mt-7 inline-flex items-baseline gap-2">
          <span className="font-serif text-[28px] font-semibold leading-none tracking-tight tabular-numbers text-[var(--gold)]">
            {t.metric.value}
          </span>
          <span className="text-[12px] text-[#1a1612]/55">
            {t.metric.label}
          </span>
        </div>
      )}

      <div className="mt-auto flex items-center gap-3 pt-7">
        <span className="h-11 w-11 overflow-hidden rounded-full border border-white/70">
          <img
            src={t.avatar}
            alt={t.author}
            className="h-full w-full object-cover"
          />
        </span>
        <div>
          <div className="text-[13.5px] font-semibold text-[#1a1612]">
            {t.author}
          </div>
          <div className="text-[12px] text-[#1a1612]/55">
            {t.role} · {t.agency}
          </div>
        </div>
      </div>
    </article>
  );
}
