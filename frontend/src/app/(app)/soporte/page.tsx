"use client";

import Link from "next/link";
import {
  CustomerSupportIcon,
  Mail01Icon,
  ZapIcon,
  AnalyticsUpIcon,
  RankingIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useCommandPalette } from "@/components/layout/command-palette-provider";

const QUICK_LINKS = [
  {
    title: "Atajo de búsqueda",
    description: "Pulsa ⌘K (Mac) o Ctrl+K (Win) en cualquier pantalla para buscar propiedades, personas, contratos y leads.",
  },
  {
    title: "Reportar pago",
    description: "Cargos → fila del cargo → botón “Cobrar”. Actualiza el estado del cargo automáticamente.",
  },
  {
    title: "Convertir un lead a contrato",
    description: "Leads → click en el lead → panel lateral → botón “Convertir a contrato”. Crea persona, contrato, propiedad ocupada y primer cargo.",
  },
  {
    title: "Generar cargos del mes",
    description: "Reportes → Financiero → botón “Generar cargos del mes”. También corre automático el día 1 a las 06:00.",
  },
];

export default function SoportePage() {
  const { open: openCommand } = useCommandPalette();

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Icon icon={CustomerSupportIcon} size={13} />
          Soporte
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">¿En qué te ayudamos?</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Documentación rápida, atajos y contacto directo con el equipo.
        </p>
      </div>

      {/* Search shortcut */}
      <Card className="mb-4 p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
            <Icon icon={RankingIcon} size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Búsqueda global</h2>
            <p className="text-sm text-foreground-muted">
              Encuentra cualquier propiedad, persona, contrato o lead en segundos.
            </p>
          </div>
          <button
            onClick={openCommand}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground"
          >
            Abrir buscador
            <kbd className="rounded border border-border-subtle bg-surface-muted px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>
        </div>
      </Card>

      {/* Quick links */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {QUICK_LINKS.map((q) => (
          <Card key={q.title} className="p-5">
            <div className="text-sm font-semibold">{q.title}</div>
            <div className="mt-1 text-xs text-foreground-muted">{q.description}</div>
          </Card>
        ))}
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-info-soft text-info">
              <Icon icon={Mail01Icon} size={16} />
            </span>
            <div>
              <h3 className="font-semibold">Contacto directo</h3>
              <p className="text-xs text-foreground-muted">
                ¿Algo no va? Escríbenos.
              </p>
            </div>
          </div>
          <a
            href="mailto:soporte@realstatevalencia.local"
            className="mt-3 block text-sm font-medium text-foreground hover:underline"
          >
            soporte@realstatevalencia.local
          </a>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-positive-soft text-positive">
              <Icon icon={ZapIcon} size={16} />
            </span>
            <div>
              <h3 className="font-semibold">Estado del sistema</h3>
              <p className="text-xs text-foreground-muted">
                Operativo
              </p>
            </div>
          </div>
          <Link
            href="/reportes"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
          >
            <Icon icon={AnalyticsUpIcon} size={13} />
            Ver métricas
          </Link>
        </Card>
      </div>
    </div>
  );
}
