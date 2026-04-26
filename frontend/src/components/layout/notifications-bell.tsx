"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Notification01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  File01Icon,
  ZapIcon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Icon } from "@/components/ui/icon";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

const ICON_BY_TYPE: Record<string, IconSvgElement> = {
  lead_created: ZapIcon,
  contract_signed: File01Icon,
  charge_overdue: AlertCircleIcon,
  commission_pending: Coins01Icon,
  custom: Notification01Icon,
};

const TONE_BG: Record<string, string> = {
  positive: "bg-positive-soft text-positive",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  negative: "bg-negative-soft text-negative",
  neutral: "bg-surface-muted text-foreground-muted",
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: count } = useUnreadNotificationsCount();
  const { data: notifs } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  // Cerrar al click fuera
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const unread = count ?? 0;
  const items = (notifs?.data ?? []).slice(0, 8);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
        aria-label="Notificaciones"
      >
        <Icon icon={Notification01Icon} size={18} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-negative px-1 text-[9px] font-semibold tabular-numbers text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">Notificaciones</h3>
              <p className="text-[11px] text-foreground-muted">
                {unread > 0 ? `${unread} sin leer` : "Todo al día"}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="text-[11px] font-medium text-foreground-muted hover:text-foreground"
              >
                Marcar todo leído
              </button>
            )}
          </div>

          <ul className="max-h-[480px] overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-12 text-center text-sm text-foreground-muted">
                Sin notificaciones todavía.
              </li>
            ) : (
              items.map((n) => {
                const Ic = ICON_BY_TYPE[n.type] ?? Notification01Icon;
                const tone = TONE_BG[n.icon_tone] ?? TONE_BG.neutral;
                const Item = (
                  <div
                    onClick={() => {
                      if (!n.read_at) markRead.mutate(n.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0 hover:bg-surface-muted/50",
                      !n.read_at && "bg-info-soft/30",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl",
                        tone,
                      )}
                    >
                      <Icon icon={Ic} size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {n.title}
                        </span>
                        <span className="shrink-0 text-[10px] tabular-numbers text-muted-foreground">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      {n.body && (
                        <div className="mt-0.5 truncate text-xs text-foreground-muted">
                          {n.body}
                        </div>
                      )}
                    </div>
                    {!n.read_at && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-info" />
                    )}
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? <Link href={n.link}>{Item}</Link> : Item}
                  </li>
                );
              })
            )}
          </ul>

          <div className="border-t border-border-subtle bg-surface-muted/30 px-4 py-2 text-center">
            <Link
              href="/notificaciones"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-foreground-muted hover:text-foreground"
            >
              Ver todas →
            </Link>
          </div>
        </div>
      )}

      {/* Suprime warnings */}
      <span className="hidden">
        <Icon icon={CheckmarkCircle02Icon} size={1} />
      </span>
    </div>
  );
}

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return "ahora";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}
