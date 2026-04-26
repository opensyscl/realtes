"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md";
}

/**
 * Checkbox custom con esquinas redondeadas (rounded-md), tick animado y
 * estado intermedio (indeterminate) propio. Usa un <button> en vez de
 * <input type="checkbox"> para tener control total del estilo.
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(
    {
      checked = false,
      indeterminate = false,
      onCheckedChange,
      size = "md",
      className,
      onClick,
      disabled,
      ...rest
    },
    ref,
  ) {
    const isOn = checked || indeterminate;
    const dim = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          onCheckedChange?.(!checked);
        }}
        className={cn(
          "group relative inline-flex shrink-0 items-center justify-center rounded-md border-[1.5px]",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          dim,
          isOn
            ? "border-primary bg-primary text-white shadow-[0_2px_8px_-2px_rgba(248,87,87,0.4)]"
            : "border-border bg-surface hover:border-primary/40 hover:bg-primary-soft/30",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...rest}
      >
        {/* Tick (checked) */}
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className={cn(
            "h-[60%] w-[60%] transition-all duration-150",
            checked && !indeterminate
              ? "scale-100 opacity-100"
              : "scale-50 opacity-0",
          )}
        >
          <path
            d="M3 8l3.5 3.5L13 5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Indeterminate dash */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-1.5 h-[2px] rounded-full bg-current transition-all duration-150",
            indeterminate ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        />
      </button>
    );
  },
);
