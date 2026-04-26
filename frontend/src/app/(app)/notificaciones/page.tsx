"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Notification01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  File01Icon,
  ZapIcon,
  Coins01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useUnreadNotificationsCount,
} from "@/lib/queries";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
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

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data: notifs, isLoading } = useNotifications(unreadOnly);
  const { data: unread } = useUnreadNotificationsCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const qc = useQueryClient();

  const items = notifs?.data ?? [];

  const remove = async (id: number) => {
    await api.delete(`/api/notifications/${id}`);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Icon icon={Notification01Icon} size={13} />
            Notificaciones
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Tu bandeja de entrada
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {unread ?? 0} sin leer · {items.length} mostradas
          </p>
        </div>
        {(unread ?? 0) > 0 && (
          <Button variant="outline" onClick={() => markAll.mutate()}>
            <Icon icon={CheckmarkCircle02Icon} size={14} />
            Marcar todo leído
          </Button>
        )}
      </div>

      <Card className="mb-4 flex items-center gap-2 p-3">
        <button
          onClick={() => setUnreadOnly(false)}
          className={cn(
            "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
            !unreadOnly
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
          )}
        >
          Todas
        </button>
        <button
          onClick={() => setUnreadOnly(true)}
          className={cn(
            "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
            unreadOnly
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
          )}
        >
          Solo sin leer
        </button>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse border-b border-border-subtle bg-surface-muted/30 last:border-b-0"
            />
          ))
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Icon
              icon={Notification01Icon}
              size={32}
              className="mx-auto text-foreground-muted"
            />
            <h3 className="mt-3 text-base font-semibold">Bandeja vacía</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              {unreadOnly
                ? "Has leído todas tus notificaciones."
                : "Cuando ocurran eventos en tu cuenta aparecerán aquí."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {items.map((n) => {
              const Ic = ICON_BY_TYPE[n.type] ?? Notification01Icon;
              const tone = TONE_BG[n.icon_tone] ?? TONE_BG.neutral;

              const Inner = (
                <div
                  className={cn(
                    "flex items-start gap-3 px-6 py-4",
                    !n.read_at && "bg-info-soft/20",
                  )}
                >
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", tone)}>
                    <Icon icon={Ic} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{n.title}</span>
                      <span className="shrink-0 text-[11px] tabular-numbers text-muted-foreground">
                        {new Date(n.created_at).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {n.body && (
                      <p className="mt-1 text-sm text-foreground-muted">{n.body}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.read_at && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          markRead.mutate(n.id);
                        }}
                        className="rounded-full p-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                        title="Marcar como leída"
                      >
                        <Icon icon={CheckmarkCircle02Icon} size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        remove(n.id);
                      }}
                      className="rounded-full p-1 text-muted-foreground hover:bg-negative-soft hover:text-negative"
                      title="Eliminar"
                    >
                      <Icon icon={Delete02Icon} size={14} />
                    </button>
                  </div>
                </div>
              );

              return (
                <li key={n.id} className="hover:bg-surface-muted/40">
                  {n.link ? <Link href={n.link}>{Inner}</Link> : Inner}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
