"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  InformationCircleIcon,
  MapPinIcon,
  RulerIcon,
  HomeWifiIcon,
  ListSettingIcon,
  TreesIcon,
  Coins01Icon,
  MoreHorizontalIcon,
  UserCircleIcon,
  FloorPlanIcon,
  Image01Icon,
  DocumentAttachmentIcon,
  Video01Icon,
  VrIcon,
  Agreement02Icon,
  Note01Icon,
  ClipboardIcon,
  TaskDaily01Icon,
  Calendar03Icon,
  Home05Icon,
  CheckmarkCircle02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  AlbumIcon,
  UserMultiple02Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type StepId =
  | "basic"
  | "location"
  | "features"
  | "interior"
  | "comodidades"
  | "exterior"
  | "debts"
  | "otros"
  | "owner"
  | "client"
  | "floors"
  | "gallery"
  | "documents"
  | "video"
  | "tour"
  | "agent"
  | "private_note"
  | "inventory"
  | "reception"
  | "booking"
  | "lease";

export interface WizardStep {
  id: StepId;
  label: string;
  icon: IconSvgElement;
  enabled: boolean;
  completed?: boolean;
  hasErrors?: boolean;
}

interface WizardGroup {
  id: string;
  label: string;
  icon: IconSvgElement;
  stepIds: StepId[];
}

const GROUPS: WizardGroup[] = [
  {
    id: "info",
    label: "Información",
    icon: InformationCircleIcon,
    stepIds: ["basic", "location", "features", "interior", "comodidades", "exterior", "debts", "otros"],
  },
  {
    id: "people",
    label: "Personas",
    icon: UserMultiple02Icon,
    stepIds: ["owner", "client", "agent"],
  },
  {
    id: "media",
    label: "Multimedia",
    icon: AlbumIcon,
    stepIds: ["gallery", "floors", "video", "tour"],
  },
  {
    id: "docs",
    label: "Notas y documentos",
    icon: DocumentAttachmentIcon,
    stepIds: ["documents", "private_note", "inventory", "reception"],
  },
  {
    id: "ops",
    label: "Gestión",
    icon: Settings01Icon,
    stepIds: ["booking", "lease"],
  },
];

export const STEPS: WizardStep[] = [
  { id: "basic", label: "Información básica", icon: InformationCircleIcon, enabled: true },
  { id: "location", label: "Ubicación", icon: MapPinIcon, enabled: true },
  { id: "features", label: "Características", icon: RulerIcon, enabled: true },
  { id: "interior", label: "Interior", icon: HomeWifiIcon, enabled: true },
  { id: "comodidades", label: "Comodidades", icon: ListSettingIcon, enabled: true },
  { id: "exterior", label: "Exterior", icon: TreesIcon, enabled: true },
  { id: "debts", label: "Deudas y pagos", icon: Coins01Icon, enabled: true },
  { id: "otros", label: "Otros", icon: MoreHorizontalIcon, enabled: true },
  { id: "owner", label: "Dueño", icon: UserCircleIcon, enabled: false },
  { id: "client", label: "Cliente", icon: UserCircleIcon, enabled: false },
  { id: "floors", label: "Plantas", icon: FloorPlanIcon, enabled: false },
  { id: "gallery", label: "Galería de imágenes", icon: Image01Icon, enabled: false },
  { id: "documents", label: "Documentos", icon: DocumentAttachmentIcon, enabled: false },
  { id: "video", label: "Video", icon: Video01Icon, enabled: false },
  { id: "tour", label: "Virtual Tour", icon: VrIcon, enabled: false },
  { id: "agent", label: "Agente", icon: Agreement02Icon, enabled: false },
  { id: "private_note", label: "Nota privada", icon: Note01Icon, enabled: false },
  { id: "inventory", label: "Inventario y manuales", icon: ClipboardIcon, enabled: false },
  { id: "reception", label: "Observaciones recepción", icon: TaskDaily01Icon, enabled: false },
  { id: "booking", label: "Agendamiento de visitas", icon: Calendar03Icon, enabled: false },
  { id: "lease", label: "Gestión de arriendo", icon: Home05Icon, enabled: false },
];

function findGroupOf(stepId: StepId): string {
  return GROUPS.find((g) => g.stepIds.includes(stepId))?.id ?? "info";
}

export function WizardShell({
  title,
  subtitle,
  steps = STEPS,
  current,
  onChangeStep,
  onSave,
  onCancel,
  saving,
  headerActions,
  children,
}: {
  title: string;
  subtitle?: string;
  steps?: WizardStep[];
  current: StepId;
  onChangeStep: (id: StepId) => void;
  onSave: () => void;
  onCancel?: () => void;
  saving?: boolean;
  /** Slot extra a la izquierda de los botones Cancelar/Guardar (ej. status selector) */
  headerActions?: ReactNode;
  children: ReactNode;
}) {
  // El grupo del step activo siempre está expandido. Los demás se pueden
  // expandir/colapsar manualmente.
  const activeGroup = findGroupOf(current);
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set([activeGroup]),
  );

  // Auto-expandir el grupo cuando cambia el step (por ejemplo via prev/next)
  useEffect(() => {
    setOpenGroups((prev) => {
      if (prev.has(activeGroup)) return prev;
      const next = new Set(prev);
      next.add(activeGroup);
      return next;
    });
  }, [activeGroup]);

  const enabledSteps = steps.filter((s) => s.enabled);
  const enabledIdx = enabledSteps.findIndex((s) => s.id === current);
  const isFirst = enabledIdx <= 0;
  const isLast = enabledIdx === enabledSteps.length - 1;

  const stepsById = useMemo(
    () => Object.fromEntries(steps.map((s) => [s.id, s])),
    [steps],
  );

  const goPrev = () => {
    const target = enabledSteps[enabledIdx - 1];
    if (target) onChangeStep(target.id);
  };
  const goNext = () => {
    const target = enabledSteps[enabledIdx + 1];
    if (target) onChangeStep(target.id);
  };

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-[1400px] flex-col px-4 pb-24 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1 truncate text-xs text-foreground-muted">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {headerActions}
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
            )}
            <Button type="button" onClick={onSave} loading={saving}>
              Guardar
            </Button>
          </div>
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* Sidebar agrupado */}
        <Card className="flex w-64 shrink-0 flex-col overflow-hidden p-0">
          <div className="border-b border-border-subtle px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Información de la propiedad
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-mono text-[11px] tabular-numbers text-foreground-muted">
                {enabledIdx + 1} / {enabledSteps.length}
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${((enabledIdx + 1) / enabledSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-1 px-2">
              {GROUPS.map((g) => {
                const groupSteps = g.stepIds
                  .map((id) => stepsById[id])
                  .filter(Boolean);
                if (!groupSteps.length) return null;

                const enabledCount = groupSteps.filter((s) => s.enabled).length;
                const completedCount = groupSteps.filter((s) => s.completed).length;
                const isActive = activeGroup === g.id;
                const isOpen = openGroups.has(g.id);
                const groupHasError = groupSteps.some((s) => s.hasErrors);

                return (
                  <li key={g.id}>
                    {/* Group header */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(g.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-all",
                        isActive
                          ? "bg-primary-soft/40 text-foreground"
                          : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                          isActive
                            ? "bg-primary text-white"
                            : "bg-surface-muted text-foreground-muted",
                        )}
                      >
                        <Icon icon={g.icon} size={13} />
                      </span>
                      <span className="flex-1 truncate font-semibold">
                        {g.label}
                      </span>
                      <span className="text-[10px] tabular-numbers text-muted-foreground">
                        {completedCount}/{enabledCount}
                      </span>
                      {groupHasError && (
                        <span className="h-1.5 w-1.5 rounded-full bg-negative" />
                      )}
                      <Icon
                        icon={ArrowDown01Icon}
                        size={12}
                        className={cn(
                          "shrink-0 text-foreground-muted transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {/* Sub-items */}
                    {isOpen && (
                      <ul className="ml-4 mt-1 space-y-px border-l border-border-subtle pl-3">
                        {groupSteps.map((s) => {
                          const isCurrent = current === s.id;
                          return (
                            <li key={s.id}>
                              <button
                                type="button"
                                disabled={!s.enabled}
                                onClick={() => s.enabled && onChangeStep(s.id)}
                                className={cn(
                                  "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-all",
                                  isCurrent
                                    ? "bg-primary-soft/60 font-semibold text-foreground"
                                    : s.enabled
                                      ? "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                                      : "cursor-not-allowed text-muted-foreground/40",
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 shrink-0 rounded-full",
                                    isCurrent
                                      ? "bg-primary"
                                      : s.completed
                                        ? "bg-positive"
                                        : "bg-border",
                                  )}
                                />
                                <span className="flex-1 truncate">{s.label}</span>
                                {s.completed && !isCurrent && (
                                  <Icon
                                    icon={CheckmarkCircle02Icon}
                                    size={11}
                                    className="shrink-0 text-positive"
                                  />
                                )}
                                {s.hasErrors && (
                                  <span className="h-1 w-1 rounded-full bg-negative" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </Card>

        {/* Content */}
        <Card className="flex min-w-0 flex-1 flex-col overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer prev/next */}
          <div className="flex items-center justify-between border-t border-border-subtle bg-surface-muted/40 px-6 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={isFirst}
            >
              <Icon icon={ArrowLeft01Icon} size={13} />
              Anterior
            </Button>
            <span className="text-[11px] text-foreground-muted">
              Paso {enabledIdx + 1} de {enabledSteps.length}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={isLast}
            >
              Siguiente
              <Icon icon={ArrowRight01Icon} size={13} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function useWizardStep(initial: StepId = "basic") {
  const [current, setCurrent] = useState<StepId>(initial);
  return { current, setCurrent };
}
