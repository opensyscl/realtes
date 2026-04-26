"use client";

import { useState } from "react";
import {
  File01Icon,
  Wallet01Icon,
  AlertCircleIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useActivityFeed } from "@/lib/queries";

const ICON_BY_TYPE: Record<string, { icon: IconSvgElement; tone: string }> = {
  contract: {
    icon: File01Icon,
    tone: "bg-info-soft text-info",
  },
  payment: {
    icon: Wallet01Icon,
    tone: "bg-positive-soft text-positive",
  },
  overdue: {
    icon: AlertCircleIcon,
    tone: "bg-negative-soft text-negative",
  },
};

const FILTERS = ["Hoy", "Ayer", "Semana"] as const;

export function LatestUpdates() {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("Hoy");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useActivityFeed();

  const items = (data?.data ?? []).filter((u) =>
    search.trim() === ""
      ? true
      : (u.title + " " + u.description).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Actividad reciente</h3>
      </div>

      <div className="mt-3 grid grid-cols-3 rounded-full border border-border bg-surface p-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={cn(
              "rounded-full py-1.5 text-xs font-medium transition-colors",
              active === f
                ? "bg-accent text-accent-foreground"
                : "text-foreground-muted hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <Input
          placeholder="Buscar actividad"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leading={<Icon icon={Search01Icon} size={15} />}
        />
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground tabular-numbers">
          {items.length}
        </span>{" "}
        eventos recientes
      </div>

      <ul className="mt-2 flex-1 space-y-2 overflow-y-auto pr-1">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="h-12 animate-pulse rounded-2xl bg-surface-muted/50" />
            ))
          : items.length === 0
            ? (
              <li className="py-6 text-center text-sm text-foreground-muted">
                Sin actividad reciente.
              </li>
            )
            : items.map((u, i) => {
                const meta = ICON_BY_TYPE[u.type] ?? {
                  icon: File01Icon,
                  tone: "bg-surface-muted text-foreground-muted",
                };
                return (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-2xl px-2 py-2 hover:bg-surface-muted/60"
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                        meta.tone,
                      )}
                    >
                      <Icon icon={meta.icon} size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="truncate text-sm font-medium">{u.title}</div>
                        <span className="shrink-0 text-[11px] tabular-numbers text-muted-foreground">
                          {u.time}
                        </span>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {u.description}
                      </div>
                    </div>
                  </li>
                );
              })}
      </ul>
    </Card>
  );
}
