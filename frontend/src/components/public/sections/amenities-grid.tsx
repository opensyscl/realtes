"use client";

import {
  Wifi01Icon,
  Car01Icon,
  SwimmingIcon,
  Sun01Icon,
  AirplaneSeatIcon,
  Building03Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/ui/icon";

const ICONS: Record<string, IconSvgElement> = {
  wifi: Wifi01Icon,
  parking: Car01Icon,
  garaje: Car01Icon,
  piscina: SwimmingIcon,
  terraza: Sun01Icon,
  amueblado: AirplaneSeatIcon,
  ascensor: Building03Icon,
};

function pickIcon(feature: string): IconSvgElement {
  const key = feature.toLowerCase().replace(/_/g, " ");
  for (const k of Object.keys(ICONS)) {
    if (key.includes(k)) return ICONS[k];
  }
  return Building03Icon;
}

export function AmenitiesGrid({ features }: { features: string[] }) {
  const top = features.slice(0, 6);
  if (!top.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">Comodidades</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {top.map((f) => (
          <div
            key={f}
            className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-foreground">
              <Icon icon={pickIcon(f)} size={16} />
            </span>
            <span className="text-sm font-medium capitalize">
              {f.replace(/_/g, " ")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
