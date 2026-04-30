"use client";

import Link from "next/link";
import { AlertCircleIcon, PropertyNewIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { useBillingMe } from "@/lib/queries";

/**
 * Banner que avisa cuando estás cerca del límite de propiedades del plan,
 * o ya lo pasaste y se está cobrando overage. Aparece debajo del TrialBanner.
 *
 * Umbrales:
 *  - >= 80% del cupo:  amber (warning)  → "te quedan X"
 *  - >  100% del cupo: red   (negative) → "X extras a $Y c/u — total $Z"
 *  - Enterprise / ilimitado: no aparece
 */
export function UsageBanner() {
  const { data } = useBillingMe();
  if (!data) return null;

  const u = data.usage?.properties;
  const plan = data.plan;
  if (!u || !plan) return null;

  // Plan ilimitado (limit -1) o no definido
  if (!u.limit || u.limit < 0) return null;

  const percent = u.percent ?? 0;
  const over = u.over ?? 0;

  // Caso 1: ya pasó el límite — overage activo
  if (over > 0) {
    const each = Number(plan.overage_per_property ?? 0);
    const total = u.overage_amount ?? 0;
    return (
      <div className="flex items-center justify-center gap-3 bg-negative-soft px-6 py-2 text-xs text-negative">
        <Icon icon={AlertCircleIcon} size={13} />
        <span>
          Tienes <strong className="tabular-numbers">{over}</strong> propiedad
          {over === 1 ? "" : "es"} sobre el límite de tu plan{" "}
          <strong>{plan.name}</strong> · cargo extra de{" "}
          <strong className="tabular-numbers">
            ${total.toLocaleString("es-CL")} CLP/mes
          </strong>{" "}
          (${each.toLocaleString("es-CL")} c/u)
        </span>
        <Link
          href="/planes"
          className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-accent-foreground hover:bg-foreground/90"
        >
          Subir de plan →
        </Link>
      </div>
    );
  }

  // Caso 2: cerca del límite (>= 80%)
  if (percent >= 80) {
    const remaining = (u.limit ?? 0) - (u.current ?? 0);
    return (
      <div className="flex items-center justify-center gap-3 bg-warning-soft px-6 py-2 text-xs text-warning">
        <Icon icon={PropertyNewIcon} size={13} />
        <span>
          Estás usando{" "}
          <strong className="tabular-numbers">{percent}%</strong> de las
          propiedades de tu plan <strong>{plan.name}</strong> · te quedan{" "}
          <strong className="tabular-numbers">{remaining}</strong> antes del
          cargo extra
        </span>
        <Link
          href="/planes"
          className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-accent-foreground hover:bg-foreground/90"
        >
          Ver planes
        </Link>
      </div>
    );
  }

  return null;
}
