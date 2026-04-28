"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChartLineData01Icon,
  PropertyNewIcon,
  UserMultiple02Icon,
  File01Icon,
  Invoice04Icon,
  Wallet01Icon,
  CashbackIcon,
  TicketIcon,
  UserGroup02Icon,
  Calendar01Icon,
  AnalyticsUpIcon,
  Mail01Icon,
  InboxIcon,
  Building03Icon,
  GiftIcon,
  Settings01Icon,
  CustomerSupportIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { RealtesLogo } from "@/components/landing/realtes-logo";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth";
import { useUiStore } from "@/store/ui";
import { useLogout } from "@/lib/queries";

interface NavItem {
  label: string;
  href: string;
  icon: IconSvgElement;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: ChartLineData01Icon }],
  },
  {
    title: "Operación",
    items: [
      { label: "Propiedades", href: "/propiedades", icon: PropertyNewIcon },
      { label: "Personas", href: "/personas", icon: UserMultiple02Icon },
      { label: "Contratos", href: "/contratos", icon: File01Icon },
      { label: "Cargos", href: "/cargos", icon: Invoice04Icon },
      { label: "Pagos", href: "/pagos", icon: Wallet01Icon },
      { label: "Comisiones", href: "/comisiones", icon: CashbackIcon },
      { label: "Mantenciones", href: "/mantenciones", icon: TicketIcon },
    ],
  },
  {
    title: "CRM",
    items: [
      { label: "Bandeja de entrada", href: "/bandeja", icon: InboxIcon },
      { label: "Leads / Pipeline", href: "/leads", icon: UserGroup02Icon },
      { label: "Visitas", href: "/visitas", icon: Calendar01Icon },
      { label: "Marketplace", href: "/marketplace", icon: Building03Icon },
      { label: "Alianzas", href: "/alianzas", icon: GiftIcon },
      { label: "Comunicación", href: "/comunicacion", icon: Mail01Icon },
    ],
  },
  {
    title: "Insights",
    items: [{ label: "Reportes", href: "/reportes", icon: AnalyticsUpIcon }],
  },
];

const SUPPORT_ITEMS: NavItem[] = [
  { label: "Soporte", href: "/soporte", icon: CustomerSupportIcon },
  { label: "Ajustes", href: "/ajustes", icon: Settings01Icon },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const expanded = useUiStore((s) => s.sidebarExpanded);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const [userMenu, setUserMenu] = useState(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "group/sidebar flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out",
        expanded ? "w-60" : "w-16",
      )}
    >
      {/* Logo + brand */}
      <div className="relative flex h-14 items-center px-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5"
          title="Realtes"
        >
          {expanded ? (
            <>
              <RealtesLogo variant="white" className="h-6" />
              <span className="text-[var(--gold)]">*</span>
            </>
          ) : (
            <RealtesLogo variant="iso-white" className="h-7 w-7" />
          )}
        </Link>

        {/* Toggle button — discreto, mismo color de la sidebar, sin border blanco */}
        <button
          type="button"
          onClick={toggle}
          className="absolute right-0 top-1/2 z-20 flex h-5 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-sidebar-foreground/15 text-sidebar-foreground/70 opacity-0 transition-opacity hover:bg-sidebar-foreground/25 hover:text-sidebar-foreground group-hover/sidebar:opacity-100"
          aria-label={expanded ? "Contraer sidebar" : "Expandir sidebar"}
          title={expanded ? "Contraer (Ctrl+B)" : "Expandir (Ctrl+B)"}
        >
          <Icon icon={expanded ? ArrowLeft01Icon : ArrowRight01Icon} size={10} />
        </button>
      </div>

      {/* Nav */}
      <nav className="scrollbar-hide flex-1 overflow-y-auto py-3">
        {SECTIONS.map((section, si) => (
          <div key={si} className="mb-3">
            {expanded && section.title && (
              <div className="mx-3 mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/40">
                {section.title}
              </div>
            )}
            <ul className="flex flex-col gap-0.5 px-2">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const link = (
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex h-10 items-center rounded-xl transition-colors",
                      expanded ? "px-2.5" : "justify-center",
                      active
                        ? "bg-sidebar-foreground/10 text-sidebar-foreground"
                        : "text-sidebar-foreground/55 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute -left-2 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-foreground" />
                    )}
                    <Icon
                      icon={item.icon}
                      size={18}
                      strokeWidth={active ? 2 : 1.7}
                      className="shrink-0"
                    />
                    {expanded && (
                      <span className="ml-3 truncate text-sm font-medium">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );

                return (
                  <li key={item.href}>
                    {expanded ? (
                      link
                    ) : (
                      <Tooltip label={item.label} side="right">
                        {link}
                      </Tooltip>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Support */}
      <div className="py-2">
        <ul className="flex flex-col gap-0.5 px-2">
          {SUPPORT_ITEMS.map((item) => {
            const active = isActive(item.href);
            const link = (
              <Link
                href={item.href}
                className={cn(
                  "relative flex h-10 items-center rounded-xl transition-colors",
                  expanded ? "px-2.5" : "justify-center",
                  active
                    ? "bg-sidebar-foreground/10 text-sidebar-foreground"
                    : "text-sidebar-foreground/55 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
                )}
              >
                {active && (
                  <span className="absolute -left-2 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-foreground" />
                )}
                <Icon icon={item.icon} size={18} strokeWidth={active ? 2 : 1.7} className="shrink-0" />
                {expanded && (
                  <span className="ml-3 truncate text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
            return (
              <li key={item.href}>
                {expanded ? link : <Tooltip label={item.label} side="right">{link}</Tooltip>}
              </li>
            );
          })}
        </ul>
      </div>

      {/* User */}
      <div className="p-2">
        <div className="relative">
          <button
            onClick={() => setUserMenu((o) => !o)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl p-1 transition-colors hover:bg-sidebar-foreground/5",
              expanded ? "px-2" : "justify-center",
            )}
            title={user?.name}
          >
            <Avatar
              name={user?.name ?? "?"}
              src={user?.avatar_url}
              size="sm"
              className="ring-2 ring-sidebar-foreground/20 hover:ring-sidebar-foreground/50"
            />
            {expanded && (
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-xs font-semibold">{user?.name}</div>
                <div className="truncate text-[10px] text-sidebar-foreground/50">
                  {user?.agency?.name}
                </div>
              </div>
            )}
          </button>
          {userMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenu(false)}
              />
              <div
                className={cn(
                  "absolute z-50 w-56 rounded-2xl border border-border bg-surface p-1 text-foreground shadow-2xl",
                  expanded ? "bottom-full left-0 mb-1" : "bottom-full left-full mb-1 ml-2",
                )}
              >
                <div className="border-b border-border-subtle px-3 py-2.5">
                  <div className="truncate text-sm font-medium">{user?.name}</div>
                  <div className="truncate text-[11px] text-foreground-muted">
                    {user?.email}
                  </div>
                </div>
                <Link
                  href="/ajustes"
                  onClick={() => setUserMenu(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface-muted"
                >
                  <Icon icon={Settings01Icon} size={14} />
                  Ajustes
                </Link>
                <button
                  onClick={() => logout.mutate()}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-negative hover:bg-negative-soft"
                >
                  <Icon icon={Logout01Icon} size={14} />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
