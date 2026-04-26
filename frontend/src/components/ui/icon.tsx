import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export type IconProps = Omit<HugeiconsIconProps, "size" | "strokeWidth"> & {
  size?: number;
  strokeWidth?: number;
};

export function Icon({
  className,
  size = 18,
  strokeWidth = 1.5,
  ...props
}: IconProps) {
  return (
    <HugeiconsIcon
      size={size}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}
