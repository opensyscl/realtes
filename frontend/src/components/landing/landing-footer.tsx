"use client";

import Link from "next/link";
import {
  Facebook02Icon,
  InstagramIcon,
  Linkedin02Icon,
  NewTwitterIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { RealtesLogo } from "./realtes-logo";

const COLUMNS = [
  {
    title: "Producto",
    links: [
      ["Funcionalidades", "#funcionalidades"],
      ["Precios", "/planes"],
      ["Integraciones", "#integraciones"],
      ["Novedades", "#"],
    ],
  },
  {
    title: "Recursos",
    links: [
      ["Blog", "#"],
      ["Guías", "#"],
      ["Centro de ayuda", "#"],
      ["Webinars", "#"],
    ],
  },
  {
    title: "Empresa",
    links: [
      ["Nosotros", "#"],
      ["Contacto", "#"],
      ["Trabaja con nosotros", "#"],
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
    <footer className="bg-[#0a0a0c] py-16 text-white">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <RealtesLogo variant="white" className="h-7" />
            <p className="mt-4 max-w-xs text-sm text-white/60">
              El software inmobiliario todo en uno para gestionar, vender y hacer
              crecer tu negocio.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
                >
                  <Icon icon={s.icon} size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {col.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-white/45">
          <span>© {new Date().getFullYear()} Realtes. Todos los derechos reservados.</span>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-white/70">
              Términos y condiciones
            </Link>
            <Link href="#" className="hover:text-white/70">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
