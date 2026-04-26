"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

export function FeaturesList({ features }: { features: string[] }) {
  if (!features.length) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">Lo que incluye</h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {features.map((f) => (
          <li
            key={f}
            className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface px-3 py-2 text-sm capitalize"
          >
            <Icon
              icon={CheckmarkCircle02Icon}
              size={14}
              className="text-[var(--brand)]"
            />
            {f.replace(/_/g, " ")}
          </li>
        ))}
      </ul>
    </section>
  );
}
