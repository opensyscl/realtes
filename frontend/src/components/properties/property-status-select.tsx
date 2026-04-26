"use client";

import { useEffect, useRef, useState } from "react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export const PROPERTY_STATUSES = [
  { value: "disponible", label: "Disponible", color: "#15a86c" },
  { value: "arrendada", label: "Arrendada", color: "#2563eb" },
  { value: "vendida", label: "Vendida", color: "#dc3545" },
  { value: "reservada", label: "Reservada", color: "#e0a800" },
  { value: "mantenimiento", label: "En mantenimiento", color: "#f97316" },
] as const;

export type PropertyStatusValue = (typeof PROPERTY_STATUSES)[number]["value"];

/**
 * Selector custom de estado de la propiedad con dot de color.
 *
 * - `variant="default"`  full-width tipo input (usado en el step Información)
 * - `variant="pill"`     compacto en pill, con fondo tonal del color del estado.
 *                         Pensado para el header del wizard, al lado de los botones.
 */
export function PropertyStatusSelect({
  value,
  onChange,
  disabled = false,
  variant = "default",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  variant?: "default" | "pill";
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = PROPERTY_STATUSES.find((s) => s.value === value) ?? PROPERTY_STATUSES[0];
  const isPill = variant === "pill";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        title={disabled ? "El estado se sincroniza con el contrato vigente" : undefined}
        className={cn(
          "inline-flex items-center gap-2 transition-all",
          isPill
            ? "h-9 rounded-full border px-3 text-[13px] font-semibold"
            : "h-9 w-full rounded-2xl border border-border bg-surface px-3 text-sm",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "hover:bg-surface-muted/60",
        )}
        style={
          isPill
            ? {
                backgroundColor: `${current.color}1a`,
                borderColor: `${current.color}40`,
                color: current.color,
              }
            : undefined
        }
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: current.color }}
        />
        <span className={cn("flex-1 text-left", isPill ? "" : "font-medium")}>
          {current.label}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={cn(
            "transition-transform",
            isPill ? "" : "text-foreground-muted",
            open && "rotate-180",
          )}
        >
          <path
            d="M2 4l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-[60] overflow-hidden rounded-2xl border border-border bg-surface shadow-card",
            isPill ? "right-0 top-[calc(100%+4px)] min-w-[220px]" : "left-0 right-0 top-[calc(100%+4px)]",
          )}
        >
          <ul className="py-1">
            {PROPERTY_STATUSES.map((s) => {
              const active = s.value === value;
              return (
                <li key={s.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(s.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "bg-primary-soft/40 font-semibold"
                        : "hover:bg-surface-muted",
                    )}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="flex-1 text-foreground">{s.label}</span>
                    {active && (
                      <Icon
                        icon={CheckmarkCircle02Icon}
                        size={12}
                        className="text-primary"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
