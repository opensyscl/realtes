"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu03Icon, Cancel01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { RealtesLogo } from "./realtes-logo";

const LINKS = [
  { href: "/funcionalidades", label: "Funcionalidades" },
  { href: "/#proyectos", label: "Casos" },
  { href: "/planes", label: "Precios" },
  { href: "/resenas", label: "Reseñas" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthed = useAuthStore((s) => !!s.token);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "py-3" : "py-5",
      )}
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-1.5">
          <RealtesLogo variant="full" className="h-7" />
          <span className="-ml-1 text-[var(--gold)]">*</span>
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-1 rounded-full border border-white/70 bg-white/55 px-1.5 py-1 shadow-[0_8px_28px_-12px_rgba(50,40,25,0.18)] backdrop-blur-xl md:flex",
          )}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-[#1a1612]/70 transition-colors hover:bg-white/70 hover:text-[#1a1612]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-2 pl-5 pr-2 text-[13px] font-medium text-white shadow-[0_8px_24px_-10px_rgba(26,22,18,0.4)] hover:bg-black"
            >
              Ir al dashboard
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1612]">
                <Icon icon={ArrowRight01Icon} size={11} />
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-[13px] text-[#1a1612]/75 transition-colors hover:text-[#1a1612]"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-2 pl-5 pr-2 text-[13px] font-medium text-white shadow-[0_8px_24px_-10px_rgba(26,22,18,0.4)] hover:bg-black"
              >
                Contactar
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1612]">
                  <Icon icon={ArrowRight01Icon} size={11} />
                </span>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#1a1612] shadow-[0_4px_16px_-6px_rgba(50,40,25,0.18)] backdrop-blur-xl md:hidden"
          aria-label={mobileOpen ? "Cerrar" : "Abrir menú"}
        >
          <Icon icon={mobileOpen ? Cancel01Icon : Menu03Icon} size={15} />
        </button>
      </div>

      {mobileOpen && (
        <div className="mx-4 mt-2 rounded-3xl border border-white/70 bg-white/80 p-2 shadow-[0_20px_50px_-20px_rgba(50,40,25,0.25)] backdrop-blur-xl md:hidden">
          <nav className="flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-[#1a1612]/85 hover:bg-white/70"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 p-1">
              {isAuthed ? (
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-full bg-[#1a1612] px-4 py-2.5 text-center text-sm font-medium text-white"
                >
                  Ir al dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex-1 rounded-full border border-[#1a1612]/15 px-4 py-2.5 text-center text-sm font-medium text-[#1a1612]"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="flex-1 rounded-full bg-[#1a1612] px-4 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Contactar
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
