"use client";

import { useState } from "react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { usePlans, useUpgradePlan, type Plan } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Código de feature que motivó el upgrade (ej: "marketplace", "feeds"). */
  reason?: string;
}

export function UpgradeDialog({ open, onClose, reason }: Props) {
  const { data: plans } = usePlans();
  const upgrade = useUpgradePlan();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const handleUpgrade = async (code: string) => {
    setSuccess(null);
    await upgrade.mutateAsync({ plan_code: code, billing_cycle: cycle });
    setSuccess(code);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 pt-[5vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border-subtle p-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Suscripción
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Elige el plan que mejor se adapta
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              {reason
                ? `Necesitas un plan superior para usar "${reason}".`
                : "Cambia o actualiza tu plan en cualquier momento."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
          >
            <Icon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        {/* Cycle toggle */}
        <div className="flex items-center justify-center gap-3 border-b border-border-subtle p-4">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              cycle === "monthly"
                ? "bg-foreground text-accent-foreground"
                : "text-foreground-muted hover:text-foreground",
            )}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setCycle("yearly")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              cycle === "yearly"
                ? "bg-foreground text-accent-foreground"
                : "text-foreground-muted hover:text-foreground",
            )}
          >
            Anual
            <span className="rounded-full bg-positive-soft px-2 py-0.5 text-[10px] text-positive">
              -17%
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
          {plans?.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              loading={upgrade.isPending}
              success={success === plan.code}
              onSelect={() => handleUpgrade(plan.code)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  cycle,
  loading,
  success,
  onSelect,
}: {
  plan: Plan;
  cycle: "monthly" | "yearly";
  loading: boolean;
  success: boolean;
  onSelect: () => void;
}) {
  const price = cycle === "monthly" ? plan.price_monthly : plan.price_yearly / 12;
  const isFree = plan.code === "starter";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border-2 bg-surface p-6 transition-all",
        plan.is_recommended
          ? "border-foreground shadow-lg"
          : "border-border hover:border-foreground/30",
      )}
    >
      {plan.is_recommended && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-[10px] font-semibold text-accent-foreground">
          <Icon icon={ZapIcon} size={10} />
          Más popular
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        {plan.tagline && (
          <p className="mt-0.5 text-xs text-foreground-muted">{plan.tagline}</p>
        )}
      </div>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-semibold tabular-numbers">
            {isFree ? "Gratis" : `€${Math.round(price)}`}
          </span>
          {!isFree && (
            <span className="text-sm text-foreground-muted">/mes</span>
          )}
        </div>
        {!isFree && cycle === "yearly" && (
          <div className="mt-1 text-[11px] text-foreground-muted tabular-numbers">
            Facturado anualmente: €{plan.price_yearly}
          </div>
        )}
      </div>

      <Button
        className="w-full"
        variant={plan.is_recommended ? "primary" : "outline"}
        onClick={onSelect}
        disabled={loading || success}
      >
        {success ? (
          <>
            <Icon icon={CheckmarkCircle02Icon} size={14} />
            Activado
          </>
        ) : isFree ? (
          "Empezar gratis"
        ) : (
          "Suscribirme"
        )}
      </Button>

      <ul className="mt-6 space-y-2 border-t border-border-subtle pt-4 text-xs">
        {plan.features.map((f) => (
          <li
            key={f.code}
            className={cn(
              "flex items-start gap-2",
              !f.included && "opacity-40",
            )}
          >
            <Icon
              icon={f.included ? CheckmarkCircle02Icon : Cancel01Icon}
              size={13}
              className={f.included ? "text-positive" : "text-foreground-muted"}
            />
            <span className={cn("flex-1", !f.included && "line-through")}>
              {f.name}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-border-subtle pt-4">
        <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Límites
        </h4>
        <ul className="space-y-1 text-[11px] text-foreground-muted">
          <li>
            <span className="font-medium tabular-numbers text-foreground">
              {fmt(plan.limits.max_properties)}
            </span>{" "}
            propiedades
          </li>
          <li>
            <span className="font-medium tabular-numbers text-foreground">
              {fmt(plan.limits.max_users)}
            </span>{" "}
            usuarios
          </li>
          <li>
            <span className="font-medium tabular-numbers text-foreground">
              {fmt(plan.limits.max_active_leads)}
            </span>{" "}
            leads activos
          </li>
        </ul>
      </div>

      {!isFree && (
        <Badge variant="info" className="mt-4 self-start text-[10px]">
          14 días de prueba gratis
        </Badge>
      )}
    </div>
  );
}

function fmt(n: number): string {
  if (n === -1) return "Ilimitadas";
  return n.toLocaleString("es-ES");
}
