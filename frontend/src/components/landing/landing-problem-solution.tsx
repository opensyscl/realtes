"use client";

import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

const PROBLEMS = [
  "Información en distintos lugares y desorganizada",
  "Pérdida de oportunidades de cliente",
  "Falta de seguimiento a clientes",
  "Reportes manuales y poco confiables",
];

const SOLUTIONS = [
  "Todo centralizado en un solo lugar",
  "No pierdas más oportunidades",
  "Seguimiento automático y organizado",
  "Reportes en tiempo real y confiables",
];

export function LandingProblemSolution() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          {/* Problema */}
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-negative">
              El problema
            </h3>
            <ul className="mt-5 space-y-3">
              {PROBLEMS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-foreground-muted">
                  <Icon
                    icon={Cancel01Icon}
                    size={14}
                    className="mt-0.5 shrink-0 text-negative"
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Screenshot/mockup en el centro (laptop frame) */}
          <div className="hidden justify-center lg:flex">
            <LaptopMockup />
          </div>

          {/* Solución */}
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-positive">
              La solución
            </h3>
            <ul className="mt-5 space-y-3">
              {SOLUTIONS.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-foreground-muted">
                  <Icon
                    icon={CheckmarkCircle02Icon}
                    size={14}
                    className="mt-0.5 shrink-0 text-positive"
                  />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-base text-foreground-muted">
          <strong className="font-semibold text-foreground">Realtes</strong>{" "}
          simplifica la operación para que te enfoques en lo más importante:{" "}
          <strong className="font-semibold text-foreground">vender</strong>.
        </p>
      </div>
    </section>
  );
}

function LaptopMockup() {
  return (
    <div className="w-[280px]">
      <div className="rounded-t-xl border border-border-subtle bg-neutral-800 p-1.5">
        <div className="overflow-hidden rounded-md bg-white">
          <div className="flex">
            <div className="w-12 bg-neutral-800" />
            <div className="flex-1 p-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="aspect-video rounded bg-surface-muted" />
                <div className="aspect-video rounded bg-surface-muted" />
                <div className="aspect-video rounded bg-surface-muted" />
                <div className="aspect-video rounded bg-surface-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-1.5 w-[110%] rounded-b-md bg-neutral-700" />
    </div>
  );
}
