"use client";

import Link from "next/link";
import { ZapIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { useBillingMe } from "@/lib/queries";

/**
 * Banner amarillo en la parte superior cuando la agency está en trial activo.
 * Inspirado en el banner de AlterEstate "Tu prueba gratuita expira en X días".
 */
export function TrialBanner() {
  const { data } = useBillingMe();
  const a = data?.agency;
  if (!a) return null;

  // Caso 1: trial activo
  if (a.is_trialing && a.trial_days_left > 0) {
    const urgent = a.trial_days_left <= 3;
    return (
      <div
        className={`flex items-center justify-center gap-3 px-6 py-2 text-xs ${
          urgent
            ? "bg-negative-soft text-negative"
            : "bg-warning-soft text-warning"
        }`}
      >
        <Icon icon={ZapIcon} size={13} />
        <span>
          Tu prueba gratuita de <strong>{data?.plan.name}</strong> expira en{" "}
          <strong className="tabular-numbers">
            {a.trial_days_left} día{a.trial_days_left !== 1 && "s"}
          </strong>
        </span>
        <Link
          href="/planes"
          className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-accent-foreground hover:bg-foreground/90"
        >
          Actualizar plan →
        </Link>
      </div>
    );
  }

  // Caso 2: trial expirado
  if (a.subscription_status === "trialing" && a.trial_days_left === 0) {
    return (
      <div className="flex items-center justify-center gap-3 bg-negative px-6 py-2 text-xs text-white">
        <Icon icon={ZapIcon} size={13} />
        <span>
          <strong>Tu prueba gratuita ha expirado.</strong> Activa un plan para seguir
          usando la plataforma.
        </span>
        <Link
          href="/planes"
          className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-negative hover:bg-white/90"
        >
          Ver planes
        </Link>
      </div>
    );
  }

  // Caso 3: cancelada con período activo
  if (a.subscription_status === "cancelled" && a.current_period_end) {
    return (
      <div className="flex items-center justify-center gap-3 bg-warning-soft px-6 py-2 text-xs text-warning">
        <Icon icon={ZapIcon} size={13} />
        <span>
          Tu suscripción está <strong>cancelada</strong>. Acceso hasta el{" "}
          {new Date(a.current_period_end).toLocaleDateString("es-ES")}.
        </span>
        <Link
          href="/ajustes"
          className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-accent-foreground hover:bg-foreground/90"
        >
          Reactivar
        </Link>
      </div>
    );
  }

  return null;
}
