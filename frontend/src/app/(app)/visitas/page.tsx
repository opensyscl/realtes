"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Calendar03Icon,
  CalendarSetting01Icon,
  PropertyNewIcon,
  UserIcon,
  CallIcon,
  TicketIcon,
  ZapIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useUpcomingEvents, type UpcomingEvent } from "@/lib/queries";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS = [
  { days: 7, label: "7 días" },
  { days: 14, label: "14 días" },
  { days: 30, label: "30 días" },
];

const KIND_META: Record<string, { label: string; icon: IconSvgElement; tone: string }> = {
  visit: {
    label: "Visita",
    icon: ZapIcon,
    tone: "bg-info-soft text-info",
  },
  maintenance: {
    label: "Mantenimiento",
    icon: TicketIcon,
    tone: "bg-warning-soft text-warning",
  },
};

export default function VisitasPage() {
  const [days, setDays] = useState(14);
  const { data, isLoading } = useUpcomingEvents(days);

  // Agrupar por día
  const grouped = (data ?? []).reduce<Record<string, UpcomingEvent[]>>((acc, e) => {
    const day = e.datetime?.slice(0, 10) ?? "—";
    (acc[day] ??= []).push(e);
    return acc;
  }, {});

  const visits = (data ?? []).filter((e) => e.kind === "visit");
  const maint = (data ?? []).filter((e) => e.kind === "maintenance");

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Icon icon={Calendar03Icon} size={13} />
            Calendario
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Visitas y agenda</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Próximas visitas comerciales y mantenimientos programados.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={cn(
                "rounded-full px-3 py-1 font-medium",
                days === r.days
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground-muted hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatBox icon={Calendar03Icon} label="Total eventos" value={data?.length ?? 0} />
        <StatBox icon={ZapIcon} tone="info" label="Visitas comerciales" value={visits.length} />
        <StatBox
          icon={TicketIcon}
          tone="warning"
          label="Mantenimientos"
          value={maint.length}
        />
      </div>

      {/* Timeline por día */}
      {isLoading ? (
        <Card className="h-72 animate-pulse bg-surface-muted/50" />
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
            <Icon icon={CalendarSetting01Icon} size={20} />
          </div>
          <h3 className="mt-4 text-base font-semibold">Sin eventos próximos</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Las visitas a leads y los mantenimientos programados aparecerán aquí.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, events]) => (
              <DaySection key={day} day={day} events={events} />
            ))}
        </div>
      )}
    </div>
  );
}

function DaySection({ day, events }: { day: string; events: UpcomingEvent[] }) {
  const date = new Date(day);
  const isToday = day === new Date().toISOString().slice(0, 10);
  const isTomorrow =
    day ===
    new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const label = isToday
    ? "Hoy"
    : isTomorrow
      ? "Mañana"
      : date.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-muted/40 px-6 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isToday
                ? "bg-foreground"
                : isTomorrow
                  ? "bg-info"
                  : "bg-foreground-muted/40",
            )}
          />
          <span className="text-sm font-semibold capitalize">{label}</span>
          <span className="text-xs text-muted-foreground tabular-numbers">{day}</span>
        </div>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium tabular-numbers text-foreground-muted">
          {events.length} evento{events.length !== 1 && "s"}
        </span>
      </div>

      <ul className="divide-y divide-border-subtle">
        {events.map((e) => (
          <li key={e.id} className="px-6 py-3">
            <EventRow event={e} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function EventRow({ event: e }: { event: UpcomingEvent }) {
  const meta = KIND_META[e.kind] ?? { label: e.kind, icon: Calendar03Icon, tone: "bg-surface-muted text-foreground-muted" };
  const time = e.datetime ? new Date(e.datetime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—";
  const target = e.kind === "visit" ? "/leads" : `/propiedades/${e.property?.id ?? ""}`;

  return (
    <Link href={target} className="flex items-center gap-4 hover:opacity-80">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", meta.tone)}>
        <Icon icon={meta.icon} size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium">{e.title}</span>
          {e.code && (
            <span className="text-[10px] tabular-numbers text-muted-foreground">
              {e.code}
            </span>
          )}
          {e.priority && (
            <Badge
              variant={
                e.priority === "urgente"
                  ? "negative"
                  : e.priority === "alta"
                    ? "warning"
                    : "neutral"
              }
              className="text-[10px]"
            >
              {e.priority}
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-foreground-muted">
          {e.kind === "visit" && e.lead && (
            <>
              <span className="inline-flex items-center gap-1">
                <Icon icon={UserIcon} size={11} />
                {e.lead.contact_name ?? e.lead.title}
              </span>
              {e.lead.contact_phone && (
                <span className="inline-flex items-center gap-1 tabular-numbers">
                  <Icon icon={CallIcon} size={11} />
                  {e.lead.contact_phone}
                </span>
              )}
            </>
          )}
          {e.kind === "maintenance" && e.property && (
            <span className="inline-flex items-center gap-1 truncate">
              <Icon icon={PropertyNewIcon} size={11} />
              {e.property.title}
            </span>
          )}
          {e.description && <span className="truncate">· {e.description}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {e.agent && (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground-muted">
            <Avatar name={e.agent.name} size="xs" />
            {e.agent.name.split(" ")[0]}
          </span>
        )}
        <span className="text-sm font-semibold tabular-numbers">{time}</span>
        <Icon icon={ArrowDown01Icon} size={12} className="-rotate-90 text-muted-foreground" />
      </div>
    </Link>
  );
}

function StatBox({
  icon,
  label,
  value,
  tone,
}: {
  icon: IconSvgElement;
  label: string;
  value: number;
  tone?: "info" | "warning";
}) {
  const t =
    tone === "info"
      ? "bg-info-soft text-info"
      : tone === "warning"
        ? "bg-warning-soft text-warning"
        : "bg-surface-muted text-foreground-muted";
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", t)}>
        <Icon icon={icon} size={18} />
      </span>
      <div>
        <div className="text-xs font-medium text-foreground-muted">{label}</div>
        <div className="mt-0.5 text-xl font-semibold tabular-numbers">{value}</div>
      </div>
    </Card>
  );
}
