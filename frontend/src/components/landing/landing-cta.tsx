"use client";

import Link from "next/link";
import { ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

export function LandingCta() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0c] py-20 text-white">
      {/* glow gold */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 50%, rgba(201,169,110,0.15), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Empieza hoy con Realtes
            </h2>
            <p className="mt-4 max-w-xl text-base text-white/70">
              Únete a cientos de inmobiliarias que ya están vendiendo más y
              mejor.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/registro"
                className="group inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black shadow-[0_8px_30px_-8px_rgba(201,169,110,0.5)] transition-all hover:bg-[var(--gold)]/90"
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
                className="text-sm font-medium text-white/85 hover:text-white"
              >
                Agendar demo
              </a>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-white/65">
              {["Sin tarjeta de crédito", "Cancela cuando quieras"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Icon
                    icon={CheckmarkCircle02Icon}
                    size={13}
                    className="text-[var(--gold)]"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual side: vista de propiedad placeholder */}
          <div className="relative hidden h-72 overflow-hidden rounded-3xl border border-white/10 lg:block">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #1a1714 0%, #2d2820 30%, #1a1714 60%, #0f0d0a 100%)",
              }}
            />
            <div className="absolute right-[20%] top-[10%] h-[60%] w-[35%] rounded-2xl bg-gradient-to-br from-[#c9a96e]/20 to-transparent blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
