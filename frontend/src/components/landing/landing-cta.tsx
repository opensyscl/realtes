"use client";

import Link from "next/link";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

export function LandingCta() {
  return (
    <section className="relative px-6 py-20">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #fbf6ec 0%, #f3ecdf 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[36px] border border-white/70 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.3)]">
        {/* Foto fondo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1800&q=85&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(245,240,228,0.92) 0%, rgba(245,240,228,0.65) 45%, rgba(245,240,228,0.15) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(40% 60% at 75% 50%, rgba(201,169,110,0.25), transparent 70%)",
            }}
          />
        </div>

        <div className="relative grid grid-cols-1 items-center gap-10 px-8 py-16 sm:px-12 lg:grid-cols-[1.1fr_1fr] lg:px-16 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1 text-[11px] font-medium text-[#1a1612]/80 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              Empieza hoy · 14 días gratis
            </span>

            <h2 className="mt-6 font-serif text-[44px] font-medium leading-[1.02] tracking-[-0.02em] text-[#1a1612] sm:text-[60px] lg:text-[68px]">
              Lleva tu agencia
              <br />
              <span className="italic text-[#1a1612]/95">al siguiente</span>{" "}
              <span className="text-[var(--gold)]">nivel</span>.
            </h2>

            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#1a1612]/70">
              Únete a las cientos de agencias inmobiliarias que ya cierran más
              operaciones, con menos esfuerzo, desde una sola plataforma.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/registro"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3.5 pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_14px_34px_-10px_rgba(26,22,18,0.45)] hover:bg-black"
              >
                Empezar gratis
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
                  <Icon icon={ArrowRight01Icon} size={13} />
                </span>
              </Link>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-6 py-3.5 text-[14px] font-medium text-[#1a1612]/85 backdrop-blur-xl hover:bg-white/75 hover:text-[#1a1612]"
              >
                Agendar demo
              </a>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-[#1a1612]/70">
              {[
                "Sin tarjeta de crédito",
                "Setup en 1 día",
                "Cancela cuando quieras",
              ].map((t) => (
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

          {/* Visual side: glass cards */}
          <div className="relative hidden h-[340px] lg:block">
            <div className="absolute right-0 top-0 w-64 rounded-2xl border border-white/70 bg-white/65 p-4 shadow-[0_18px_42px_-14px_rgba(50,40,25,0.2)] backdrop-blur-2xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1a1612]/45">
                Operación cerrada
              </div>
              <div className="mt-2 font-serif text-[24px] font-semibold leading-none tracking-tight tabular-numbers text-[#1a1612]">
                UF 8.450
              </div>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-[#1a1612]/65">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Comisión registrada · 4.5%
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-72 rounded-2xl border border-white/70 bg-white/65 p-4 shadow-[0_18px_42px_-14px_rgba(50,40,25,0.2)] backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 overflow-hidden rounded-full border border-white/70">
                  <img
                    src="https://i.pravatar.cc/72?img=15"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-[#1a1612]">
                    Lead asignado
                  </div>
                  <div className="text-[11px] text-[#1a1612]/55">
                    Marta Valdés · hace 2 min
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[12px] text-[#1a1612]/75 backdrop-blur-xl">
                &ldquo;Hola, vi el departamento que publicaron ayer…&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
