"use client";

import {
  DashboardSquare01Icon,
  UserMultiple02Icon,
  Home05Icon,
  ChartLineData01Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

export function LandingDemo() {
  return (
    <section id="producto" className="bg-surface-muted/30 py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Texto */}
          <div>
            <h2 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-[44px]">
              Todo lo que necesitas, en una sola vista.
            </h2>
            <p className="mt-5 text-base text-foreground-muted">
              Un dashboard intuitivo para tener el control total de tu
              inmobiliaria.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                { icon: DashboardSquare01Icon, label: "Dashboard" },
                { icon: UserMultiple02Icon, label: "Clientes" },
                { icon: Home05Icon, label: "Propiedades" },
                { icon: ChartLineData01Icon, label: "Ventas" },
                { icon: Task01Icon, label: "Reportes" },
              ].map((it) => (
                <li
                  key={it.label}
                  className="flex items-center gap-3 text-[15px] font-medium"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                    <Icon icon={it.icon} size={14} />
                  </span>
                  {it.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup grande del dashboard con donut chart */}
          <div className="rounded-3xl border border-border bg-surface p-3 shadow-card">
            <div className="overflow-hidden rounded-2xl bg-white">
              <div className="border-b border-border-subtle bg-surface px-5 py-3 text-sm font-semibold">
                Dashboard
              </div>

              <div className="grid grid-cols-3 gap-3 p-5">
                <DemoStat title="Ventas este mes" value="$128.540" delta="+34%" />
                <DemoStat title="Nuevos clientes" value="48" delta="+13%" />
                <DemoStat title="Propiedades activas" value="86" delta="" />
              </div>

              <div className="grid grid-cols-[1.4fr_1fr] gap-3 px-5 pb-5">
                <div className="rounded-2xl border border-border-subtle p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ventas
                  </div>
                  <DemoSparkline />
                </div>
                <div className="flex items-center justify-center rounded-2xl border border-border-subtle p-4">
                  <DonutChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoStat({
  title,
  value,
  delta,
}: {
  title: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="mt-1 text-lg font-bold tabular-numbers">{value}</div>
      {delta && <div className="text-[10px] font-semibold text-positive">↑ {delta}</div>}
    </div>
  );
}

function DemoSparkline() {
  return (
    <svg viewBox="0 0 320 90" className="mt-2 h-24 w-full">
      <defs>
        <linearGradient id="demo-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c9a96e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points="0,75 50,68 100,55 150,60 200,40 250,28 320,18 320,90 0,90"
        fill="url(#demo-grad)"
      />
      <polyline
        points="0,75 50,68 100,55 150,60 200,40 250,28 320,18"
        fill="none"
        stroke="#c9a96e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DonutChart() {
  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32">
      <circle cx="50" cy="50" r="38" fill="none" stroke="#f0e3cc" strokeWidth="14" />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="#c9a96e"
        strokeWidth="14"
        strokeDasharray="180 240"
        strokeDashoffset="60"
        transform="rotate(-90 50 50)"
        strokeLinecap="round"
      />
      <text
        x="50"
        y="48"
        textAnchor="middle"
        className="fill-foreground font-bold"
        fontSize="14"
      >
        75%
      </text>
      <text
        x="50"
        y="62"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize="6"
      >
        OBJETIVO
      </text>
    </svg>
  );
}
