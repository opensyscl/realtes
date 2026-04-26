"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu03Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { RealtesLogo } from "./realtes-logo";

const LINKS = [
  { href: "#producto", label: "Producto" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "/planes", label: "Precios" },
  { href: "#recursos", label: "Recursos" },
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
        scrolled
          ? "bg-[#0a0a0c]/80 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.5)] backdrop-blur-lg"
          : "",
      )}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <RealtesLogo variant="white" className="h-8" />
        </Link>

        {/* Links centro */}
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-[var(--gold)] px-5 py-2 text-xs font-semibold text-black hover:bg-[var(--gold)]/90"
            >
              Ir a mi dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm text-white/80 transition-colors hover:text-white"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-full bg-[var(--gold)] px-5 py-2 text-sm font-semibold text-black hover:bg-[var(--gold)]/90"
              >
                Comenzar gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
          aria-label={mobileOpen ? "Cerrar" : "Abrir menú"}
        >
          <Icon icon={mobileOpen ? Cancel01Icon : Menu03Icon} size={15} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="bg-[#0a0a0c] md:hidden">
          <nav className="flex flex-col px-6 py-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-white/5 py-3 text-sm font-medium text-white/80 last:border-b-0"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex gap-2">
              {isAuthed ? (
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-full bg-[var(--gold)] px-4 py-2.5 text-center text-sm font-semibold text-black"
                >
                  Ir al dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex-1 rounded-full border border-white/15 px-4 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="flex-1 rounded-full bg-[var(--gold)] px-4 py-2.5 text-center text-sm font-semibold text-black"
                  >
                    Comenzar gratis
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
