"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search01Icon,
  Add01Icon,
  Settings01Icon,
  PropertyAddIcon,
  UserAdd01Icon,
  File01Icon,
  ZapIcon,
  TicketIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { NotificationsBell } from "./notifications-bell";
import { useCommandPalette } from "./command-palette-provider";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { open: openPalette } = useCommandPalette();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!createOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setCreateOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [createOpen]);

  const QUICK_CREATE = [
    { label: "Nueva propiedad", href: "/propiedades/nueva", icon: PropertyAddIcon },
    { label: "Nueva persona", href: "/personas/nueva", icon: UserAdd01Icon },
    { label: "Nuevo contrato", href: "/contratos", icon: File01Icon },
    { label: "Nuevo lead", href: "/leads", icon: ZapIcon },
    { label: "Nuevo ticket mantención", href: "/mantenciones", icon: TicketIcon },
    { label: "Enviar email", href: "/comunicacion", icon: Mail01Icon },
  ];

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-surface px-6">
      {/* Spacer izquierda */}
      <div className="w-32" />

      {/* Search center */}
      <div className="flex-1">
        <button
          type="button"
          onClick={openPalette}
          className="mx-auto flex h-10 w-full max-w-xl items-center gap-2.5 rounded-full bg-surface-muted px-4 text-sm text-foreground-muted transition-colors hover:bg-surface-muted/70"
        >
          <Icon icon={Search01Icon} size={15} />
          <span className="flex-1 text-left">Búsqueda General</span>
          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] tabular-numbers">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Create */}
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setCreateOpen((o) => !o)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              createOpen
                ? "bg-foreground text-accent-foreground"
                : "bg-surface-muted text-foreground-muted hover:bg-surface-muted/70 hover:text-foreground",
            )}
            aria-label="Crear"
          >
            <Icon icon={Add01Icon} size={16} />
          </button>
          {createOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
              <div className="border-b border-border-subtle px-4 py-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Crear rápido
                </h3>
              </div>
              <ul>
                {QUICK_CREATE.map((q) => (
                  <li key={q.href}>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateOpen(false);
                        router.push(q.href);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-muted text-foreground-muted">
                        <Icon icon={q.icon} size={13} />
                      </span>
                      {q.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <NotificationsBell />

        <Link
          href="/ajustes"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-foreground-muted hover:bg-surface-muted/70 hover:text-foreground"
          aria-label="Ajustes"
        >
          <Icon icon={Settings01Icon} size={16} />
        </Link>
      </div>
    </header>
  );
}
