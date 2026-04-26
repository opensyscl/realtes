"use client";

import * as RTooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = RTooltip.Provider;
export const TooltipRoot = RTooltip.Root;
export const TooltipTrigger = RTooltip.Trigger;

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof RTooltip.Content> {
  side?: "top" | "right" | "bottom" | "left";
}

export function TooltipContent({
  className,
  side = "right",
  sideOffset = 12,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <RTooltip.Portal>
      <RTooltip.Content
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "rsv-tooltip z-[100] select-none rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-medium text-accent-foreground shadow-xl",
          className,
        )}
        {...props}
      >
        {children}
        <RTooltip.Arrow
          className="fill-foreground"
          width={9}
          height={5}
        />
      </RTooltip.Content>
    </RTooltip.Portal>
  );
}

/**
 * Helper compacto: <Tooltip label="..." side="right"><Button /></Tooltip>
 */
export function Tooltip({
  label,
  side = "right",
  delayDuration = 250,
  children,
}: {
  label: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
  children: React.ReactNode;
}) {
  return (
    <TooltipRoot delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </TooltipRoot>
  );
}
