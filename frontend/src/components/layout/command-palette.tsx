"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search01Icon,
  Cancel01Icon,
  PropertyNewIcon,
  UserIcon,
  File01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Icon } from "@/components/ui/icon";
import { useGlobalSearch, type SearchHit } from "@/lib/queries";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<string, IconSvgElement> = {
  property: PropertyNewIcon,
  person: UserIcon,
  contract: File01Icon,
  lead: ZapIcon,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const { data, isFetching } = useGlobalSearch(q);

  // flatten for keyboard nav
  const flatHits: SearchHit[] = (data?.groups ?? []).flatMap((g) => g.items);

  useEffect(() => {
    if (!open) {
      setQ("");
      setHighlighted(0);
    }
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [q]);

  if (!open) return null;

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, Math.max(0, flatHits.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = flatHits[highlighted];
      if (hit) navigate(hit.href);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-foreground/40 px-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* search bar */}
        <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-4">
          <Icon icon={Search01Icon} size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Buscar propiedades, personas, contratos, leads..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          {q.length > 0 && (
            <button
              onClick={() => setQ("")}
              className="text-foreground-muted hover:text-foreground"
              aria-label="Limpiar"
            >
              <Icon icon={Cancel01Icon} size={14} />
            </button>
          )}
          <kbd className="rounded border border-border-subtle bg-surface-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            esc
          </kbd>
        </div>

        {/* results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim().length < 2 ? (
            <EmptyState title="Empieza a escribir" subtitle="Mínimo 2 caracteres" />
          ) : isFetching ? (
            <div className="px-5 py-8 text-center text-xs text-muted-foreground">
              Buscando...
            </div>
          ) : (data?.total ?? 0) === 0 ? (
            <EmptyState title="Sin resultados" subtitle={`Para "${q}"`} />
          ) : (
            <div className="py-2">
              {(data?.groups ?? [])
                .filter((g) => g.items.length > 0)
                .map((group) => (
                  <div key={group.kind} className="mb-2">
                    <div className="px-5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </div>
                    <ul>
                      {group.items.map((hit) => {
                        const idx = flatHits.findIndex(
                          (h) => h.kind === hit.kind && h.id === hit.id,
                        );
                        const isActive = idx === highlighted;
                        const Ic = KIND_ICON[hit.kind] ?? Search01Icon;
                        return (
                          <li key={`${hit.kind}-${hit.id}`}>
                            <button
                              type="button"
                              onMouseEnter={() => setHighlighted(idx)}
                              onClick={() => navigate(hit.href)}
                              className={cn(
                                "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors",
                                isActive
                                  ? "bg-surface-muted"
                                  : "hover:bg-surface-muted/60",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-foreground-muted",
                                  isActive ? "bg-accent text-accent-foreground" : "bg-surface-muted",
                                )}
                              >
                                <Icon icon={Ic} size={14} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline gap-2">
                                  <span className="truncate text-sm font-medium">
                                    {hit.title}
                                  </span>
                                  {hit.code && (
                                    <span className="shrink-0 text-[10px] tabular-numbers text-muted-foreground">
                                      {hit.code}
                                    </span>
                                  )}
                                </div>
                                <div className="truncate text-[11px] text-foreground-muted">
                                  {hit.subtitle}
                                </div>
                              </div>
                              {isActive && (
                                <kbd className="rounded border border-border-subtle bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                  ↵
                                </kbd>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* footer hint */}
        <div className="flex items-center justify-between border-t border-border-subtle bg-surface-muted/40 px-5 py-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border-subtle bg-surface px-1.5 py-0.5">
                ↑↓
              </kbd>
              navegar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border-subtle bg-surface px-1.5 py-0.5">
                ↵
              </kbd>
              abrir
            </span>
          </div>
          <span>Real State Valencia</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-5 py-12 text-center">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}
