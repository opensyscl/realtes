/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "@/lib/utils";

/**
 * Logo de Realtes — variantes:
 *  - "full"    logo completo (isotipo + texto)
 *  - "iso"     solo el isotipo (la casa)
 *  - "white"   versión blanca (filter invert) sobre fondos dark
 *  - "iso-white"  isotipo blanco sobre fondos dark
 */
export function RealtesLogo({
  variant = "full",
  className,
}: {
  variant?: "full" | "iso" | "white" | "iso-white";
  className?: string;
}) {
  const isWhite = variant === "white" || variant === "iso-white";
  const isIso = variant === "iso" || variant === "iso-white";
  const src = isIso ? "/logos/realtes-iso.png" : "/logos/realtes-full.png";

  return (
    <img
      src={src}
      alt="Realtes"
      className={cn(
        "select-none object-contain",
        // Los archivos vienen en color oscuro; para fondos dark los invertimos
        isWhite && "brightness-0 invert",
        className,
      )}
    />
  );
}
