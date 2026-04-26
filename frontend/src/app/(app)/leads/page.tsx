"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Add01Icon, RankingIcon, Settings01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StageColumn } from "@/components/leads/stage-column";
import { LeadCard } from "@/components/leads/lead-card";
import { LeadPanel } from "@/components/leads/lead-panel";
import { PipelineManager } from "@/components/leads/pipeline-manager";
import {
  usePipelines,
  useLeadsBoard,
  useMoveLead,
  useSaveLead,
  type Lead,
} from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export default function LeadsPage() {
  const { data: pipelines, isLoading: loadingPipelines } = usePipelines();
  const [pipelineId, setPipelineId] = useState<number | null>(null);
  const pipeline = pipelines?.find((p) => p.id === pipelineId) ?? pipelines?.[0];
  const stages = pipeline?.stages ?? [];

  const { data: boardData, isLoading } = useLeadsBoard(pipeline?.id);
  const move = useMoveLead();
  const saveLead = useSaveLead();

  // Optimistic local state for the board
  const [board, setBoard] = useState<Record<string, Lead[]>>({});
  const [active, setActive] = useState<Lead | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);

  // Sync server data → local
  useMemo(() => {
    if (boardData) {
      setBoard(boardData);
    }
  }, [boardData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findLead = (id: number): { lead: Lead; stageId: number } | null => {
    for (const [sid, leads] of Object.entries(board)) {
      const found = leads.find((l) => l.id === id);
      if (found) return { lead: found, stageId: Number(sid) };
    }
    return null;
  };

  const handleDragStart = (e: DragStartEvent) => {
    const found = findLead(Number(e.active.id));
    if (found) setActive(found.lead);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    if (activeData?.type !== "lead") return;

    const activeLead = activeData.lead as Lead;
    const fromStageId = activeLead.stage_id;

    let toStageId: number;
    if (overData?.type === "stage") {
      toStageId = (overData.stage as { id: number }).id;
    } else if (overData?.type === "lead") {
      toStageId = (overData.lead as Lead).stage_id;
    } else {
      return;
    }

    if (fromStageId === toStageId) return;

    setBoard((prev) => {
      const next = { ...prev };
      next[String(fromStageId)] = (next[String(fromStageId)] ?? []).filter(
        (l) => l.id !== activeLead.id,
      );
      const target = (next[String(toStageId)] ?? []).slice();
      target.push({ ...activeLead, stage_id: toStageId });
      next[String(toStageId)] = target;
      return next;
    });
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActive(null);
    const { active, over } = e;
    if (!over) return;

    const activeData = active.data.current;
    if (activeData?.type !== "lead") return;

    const activeLead = activeData.lead as Lead;
    const overData = over.data.current;

    let toStageId: number;
    let toIndex: number;

    if (overData?.type === "stage") {
      toStageId = (overData.stage as { id: number }).id;
      toIndex = (board[String(toStageId)] ?? []).length - 1;
    } else if (overData?.type === "lead") {
      const overLead = overData.lead as Lead;
      toStageId = overLead.stage_id;
      const list = board[String(toStageId)] ?? [];
      toIndex = list.findIndex((l) => l.id === overLead.id);
    } else {
      return;
    }

    if (toIndex < 0) toIndex = 0;

    // Reorder in local state for snappy UX
    setBoard((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = next[k].filter((l) => l.id !== activeLead.id);
      });
      const list = (next[String(toStageId)] ?? []).slice();
      list.splice(toIndex, 0, { ...activeLead, stage_id: toStageId });
      next[String(toStageId)] = list;
      return next;
    });

    // Persist
    try {
      await move.mutateAsync({
        leadId: activeLead.id,
        stageId: toStageId,
        position: toIndex,
      });
    } catch (err) {
      console.error("move failed", err);
    }
  };

  const totalOpen = stages
    .filter((s) => !s.is_won && !s.is_lost)
    .reduce((sum, s) => sum + (board[String(s.id)]?.length ?? 0), 0);
  const totalValue = stages
    .filter((s) => !s.is_won && !s.is_lost)
    .reduce(
      (sum, s) =>
        sum +
        (board[String(s.id)] ?? []).reduce((acc, l) => acc + l.value, 0),
      0,
    );

  const handleAddLead = async (stageId: number) => {
    if (!pipeline) return;
    const title = prompt("Título del nuevo lead:");
    if (!title) return;
    await saveLead.mutateAsync({
      pipeline_id: pipeline.id,
      stage_id: stageId,
      title,
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Icon icon={RankingIcon} size={13} />
              Pipeline
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {pipeline?.name ?? "Cargando..."}
            </h1>
            {(pipelines?.length ?? 0) > 1 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {pipelines?.map((p) => {
                  const active = (pipelineId ?? pipelines?.[0]?.id) === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPipelineId(p.id)}
                      className={`h-7 rounded-full border px-3 text-[11px] font-medium transition-colors ${
                        active
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-surface text-foreground-muted hover:bg-surface-muted"
                      }`}
                    >
                      {p.name}
                      {p.purpose === "captacion" && (
                        <span className="ml-1.5 rounded-full bg-warning-soft px-1.5 py-0.5 text-[9px] font-semibold text-warning">
                          Captación
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Leads abiertos
              </div>
              <div className="text-base font-semibold tabular-numbers">
                {totalOpen} · {formatCurrency(totalValue)}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setManagerOpen(true)}
              title="Configurar pipelines y stages"
            >
              <Icon icon={Settings01Icon} size={14} />
              Configurar
            </Button>
            <Button
              onClick={() => stages[0] && handleAddLead(stages[0].id)}
              disabled={!stages.length}
            >
              <Icon icon={Add01Icon} size={14} />
              Nuevo lead
            </Button>
          </div>
        </div>
      </div>

      {/* board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActive(null)}
        >
          <div className="flex h-full gap-3 px-6 py-5">
            {loadingPipelines || isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-72 shrink-0 animate-pulse rounded-2xl bg-surface-muted/50"
                />
              ))
            ) : (
              stages.map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  leads={board[String(stage.id)] ?? []}
                  onSelectLead={setSelected}
                  onAddLead={handleAddLead}
                />
              ))
            )}
          </div>

          <DragOverlay>
            {active && <LeadCard lead={active} onSelect={() => {}} isOverlay />}
          </DragOverlay>
        </DndContext>
      </div>

      {selected && (
        <LeadPanel
          lead={selected}
          onClose={() => setSelected(null)}
          pipelinePurpose={pipeline?.purpose}
        />
      )}

      <PipelineManager open={managerOpen} onClose={() => setManagerOpen(false)} />
    </div>
  );
}
