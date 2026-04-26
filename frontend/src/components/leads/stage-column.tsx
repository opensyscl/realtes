"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { LeadCard } from "./lead-card";
import { Icon } from "@/components/ui/icon";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { cn, formatCurrency } from "@/lib/utils";
import type { Stage, Lead } from "@/lib/queries";

const COLOR_HEADER: Record<
  string,
  { bar: string; bg: string; dot: string; text: string }
> = {
  neutral: {
    bar: "bg-foreground-muted",
    bg: "bg-surface",
    dot: "bg-foreground-muted",
    text: "text-foreground",
  },
  info: {
    bar: "bg-info",
    bg: "bg-info-soft/40",
    dot: "bg-info",
    text: "text-info",
  },
  positive: {
    bar: "bg-positive",
    bg: "bg-positive-soft/40",
    dot: "bg-positive",
    text: "text-positive",
  },
  warning: {
    bar: "bg-warning",
    bg: "bg-warning-soft/40",
    dot: "bg-warning",
    text: "text-warning",
  },
  negative: {
    bar: "bg-negative",
    bg: "bg-negative-soft/40",
    dot: "bg-negative",
    text: "text-negative",
  },
};

interface Props {
  stage: Stage;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onAddLead: (stageId: number) => void;
}

export function StageColumn({ stage, leads, onSelectLead, onAddLead }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
    data: { type: "stage", stage },
  });

  const totalValue = leads.reduce((s, l) => s + l.value, 0);
  const meta = COLOR_HEADER[stage.color] ?? COLOR_HEADER.neutral;

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-surface shadow-sm">
      {/* Top color bar */}
      <div className={cn("h-1 rounded-t-2xl", meta.bar)} />

      {/* header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", meta.dot)} />
            <span className="truncate text-sm font-semibold">{stage.name}</span>
            <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-muted px-1.5 text-[10px] font-semibold tabular-numbers text-foreground-muted">
              {leads.length}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] tabular-numbers text-foreground-muted">
            <span className="font-medium text-foreground">
              {formatCurrency(totalValue)}
            </span>
            <span>·</span>
            <span>{stage.probability_pct}%</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onAddLead(stage.id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-muted hover:text-foreground"
          aria-label="Añadir lead"
          title="Añadir lead"
        >
          <Icon icon={Add01Icon} size={14} />
        </button>
      </div>

      {/* drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto p-2.5 transition-colors min-h-32",
          isOver && cn("ring-2 ring-inset", `ring-${stage.color === "neutral" ? "foreground" : stage.color}/40`),
          meta.bg,
        )}
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.length === 0 ? (
            <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border text-[11px] text-muted-foreground">
              Sin leads
            </div>
          ) : (
            leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onSelect={onSelectLead} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
