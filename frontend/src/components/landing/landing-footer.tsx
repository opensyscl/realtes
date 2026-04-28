"use client";

import Link from "next/link";
import {
  Facebook02Icon,
  InstagramIcon,
  Linkedin02Icon,
  NewTwitterIcon,
  YoutubeIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { RealtesLogo } from "./realtes-logo";

const COLUMNS = [
  {
    title: "Producto",
    links: [
      ["Funcionalidades", "#funcionalidades"],
      ["Casos", "#proyectos"],
      ["Precios", "/planes"],
      ["Integraciones", "#"],
      ["Novedades", "#"],
    ],
  },
  {
    title: "Recursos",
    links: [
      ["Blog", "#"],
      ["Guías para agencias", "#"],
      ["Centro de ayuda", "#"],
      ["Webinars", "#"],
      ["Estado del servicio", "#"],
    ],
  },
  {
    title: "Empresa",
    links: [
      ["Nosotros", "#"],
      ["Contacto", "#"],
      ["Trabaja con nosotros", "#"],
      ["Partners", "#"],
    ],
  },
];

const SOCIAL = [
  { icon: Facebook02Icon, href: "#", label: "Facebook" },
  { icon: NewTwitterIcon, href: "#", label: "X (Twitter)" },
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: Linkedin02Icon, href: "#", label: "LinkedIn" },
  { icon: YoutubeIcon, href: "#", label: "YouTube" },
];

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden pt-24 text-[#1a1612]">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f3ecdf 0%, #ede4d2 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(45% 50% at 50% 100%, rgba(201,169,110,0.22), transparent 70%)",
        }}
      />

      {/* Wordmark gigante de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-12 select-none text-center font-serif text-[180px] font-medium leading-none tracking-[-0.04em] text-[#1a1612]/[0.06] sm:text-[260px] lg:text-[360px]"
      >
        Realtes<span className="text-[var(--gold)]/40">*</span>
      </div>

      <div className="relative mx-auto max-w-[1280px] px-6">
        {/* Top: brand + newsletter */}
        <div className="grid grid-cols-1 items-start gap-12 border-b border-[#1a1612]/[0.08] pb-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5">
              <RealtesLogo variant="full" className="h-7" />
              <span className="text-[var(--gold)]">*</span>
            </Link>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#1a1612]/65">
              El sistema operativo de tu agencia inmobiliaria. Captación, CRM,
              cargos, comisiones y reportes — sin más Excel.
            </p>
            <div className="mt-7 flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#1a1612]/70 backdrop-blur-xl transition-all hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/15 hover:text-[#7a5b1f]"
                >
                  <Icon icon={s.icon} size={14} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1a1612]/55">
              Newsletter inmobiliaria
            </div>
            <h3 className="mt-3 font-serif text-[24px] font-medium leading-tight tracking-tight">
              Una vez al mes. Sin spam.
            </h3>
            <form
              className="mt-5 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="hola@tucorredora.cl"
                className="flex-1 rounded-full border border-white/70 bg-white/55 px-5 py-3 text-[14px] text-[#1a1612] placeholder:text-[#1a1612]/40 backdrop-blur-xl focus:border-[var(--gold)]/40 focus:bg-white/75 focus:outline-none"
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#1a1612] py-3 pl-5 pr-2 text-[13px] font-medium text-white shadow-[0_10px_28px_-10px_rgba(26,22,18,0.4)] hover:bg-black"
              >
                Suscribirme
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1612]">
                  <Icon icon={ArrowRight01Icon} size={11} />
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Mid: link columns */}
        <div className="grid grid-cols-2 gap-10 py-14 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1a1612]/55">
                {col.title}
              </div>
              <ul className="mt-5 space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-[#1a1612]/75 transition-colors hover:text-[#1a1612]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#1a1612]/[0.08] py-6 text-[12px] text-[#1a1612]/50">
          <span>
            © {new Date().getFullYear()} Realtes · Hecho con cuidado en
            Santiago de Chile.
          </span>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-[#1a1612]/80">
              Términos
            </Link>
            <Link href="#" className="hover:text-[#1a1612]/80">
              Privacidad
            </Link>
            <Link href="#" className="hover:text-[#1a1612]/80">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
