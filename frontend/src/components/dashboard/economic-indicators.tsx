"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChartLineData01Icon,
  ChartIncreaseIcon,
  Calendar03Icon,
  DollarCircleIcon,
  EuroCircleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface MindicadorResponse {
  uf?: { valor: number; fecha: string };
  utm?: { valor: number; fecha: string };
  dolar?: { valor: number; fecha: string };
  euro?: { valor: number; fecha: string };
  ipc?: { valor: number; fecha: string };
}

async function fetchIndicators(): Promise<MindicadorResponse> {
  const res = await fetch("https://mindicador.cl/api");
  if (!res.ok) throw new Error("No se pudo obtener indicadores");
  return res.json();
}

export function EconomicIndicators() {
  const { data, isLoading } = useQuery({
    queryKey: ["mindicador"],
    queryFn: fetchIndicators,
    staleTime: 30 * 60_000, // 30 min — los indicadores se actualizan 1 vez al día
    refetchOnWindowFocus: false,
  });

  const today = new Date().toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-border bg-foreground/95 py-1.5 pl-2 pr-3 text-accent-foreground shadow-sm ring-1 ring-black/5">
      <Pill
        icon={ChartLineData01Icon}
        label="UF"
        value={formatCLP(data?.uf?.valor)}
        loading={isLoading}
        tone="warning"
      />
      <Sep />
      <Pill
        icon={ChartIncreaseIcon}
        label="UTM"
        value={formatCLP(data?.utm?.valor)}
        loading={isLoading}
        tone="negative"
      />
      <Sep />
      <Pill
        icon={Calendar03Icon}
        label="Fecha"
        value={today}
        tone="info"
      />
      <Sep />
      <Pill
        icon={DollarCircleIcon}
        label="USD"
        value={formatCLP(data?.dolar?.valor)}
        loading={isLoading}
        tone="positive"
      />
      <Sep />
      <Pill
        icon={EuroCircleIcon}
        label="EUR"
        value={formatCLP(data?.euro?.valor)}
        loading={isLoading}
        tone="info"
      />
    </div>
  );
}

function Pill({
  icon,
  label,
  value,
  loading,
  tone = "neutral",
}: {
  icon: IconSvgElement;
  label: string;
  value: string;
  loading?: boolean;
  tone?: "neutral" | "positive" | "negative" | "info" | "warning";
}) {
  const iconCls = {
    neutral: "text-white/70",
    positive: "text-positive",
    negative: "text-negative",
    info: "text-info",
    warning: "text-[#e3b341]",
  }[tone];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1"
      title={label}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5",
          iconCls,
        )}
      >
        <Icon icon={icon} size={12} />
      </span>
      <span className="text-[11px] font-medium tabular-numbers">
        {loading ? "…" : value}
      </span>
    </span>
  );
}

function Sep() {
  return <span className="h-4 w-px shrink-0 bg-white/10" />;
}

function formatCLP(value?: number | null): string {
  if (value == null || isNaN(value)) return "—";
  return `$${Math.round(value).toLocaleString("es-CL")}`;
}
