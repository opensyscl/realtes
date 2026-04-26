"use client";

import {
  Shield01Icon,
  CheckmarkCircle02Icon,
  LockIcon,
  CloudUploadIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/ui/icon";

interface SecurityPoint {
  icon: IconSvgElement;
  title: string;
  description: string;
}

const POINTS: SecurityPoint[] = [
  {
    icon: LockIcon,
    title: "Datos 100% protegidos",
    description: "Cifrado de nivel empresarial para tu tranquilidad.",
  },
  {
    icon: CloudUploadIcon,
    title: "Backups automáticos",
    description: "Tu información siempre segura y respaldada.",
  },
  {
    icon: CheckmarkCircle02Icon,
    title: "Cumplimiento legal",
    description: "Cumplimos con las normativas de protección de datos.",
  },
];

export function LandingSecurity() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-foreground-muted">
          Seguridad · Confianza
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <ul className="space-y-5">
            {POINTS.map((p) => (
              <li key={p.title} className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)]">
                  <Icon icon={p.icon} size={18} />
                </span>
                <div>
                  <div className="text-base font-semibold tracking-tight">
                    {p.title}
                  </div>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {p.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-center lg:justify-end">
            <ShieldGraphic />
          </div>
        </div>
      </div>
    </section>
  );
}

function ShieldGraphic() {
  return (
    <div className="relative flex h-56 w-56 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--gold)]/15 via-transparent to-transparent blur-xl" />
      <div className="relative flex h-44 w-44 items-center justify-center rounded-3xl border-2 border-[var(--gold)]/40 bg-gradient-to-br from-neutral-800 to-neutral-900 text-[var(--gold)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)]">
        <Icon icon={Shield01Icon} size={64} />
      </div>
    </div>
  );
}
