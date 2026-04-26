"use client";

import { useState } from "react";
import {
  Cancel01Icon,
  Add01Icon,
  Delete02Icon,
  Edit02Icon,
  CheckmarkCircle02Icon,
  RankingIcon,
  DragDropHorizontalIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  usePipelines,
  useSavePipeline,
  useDeletePipeline,
  useSaveStage,
  useDeleteStage,
  useReorderStages,
  type Pipeline,
  type Stage,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PipelineManager({ open, onClose }: Props) {
  const { data: pipelines } = usePipelines();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const selected =
    pipelines?.find((p) => p.id === selectedId) ??
    pipelines?.[0] ??
    null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 pt-[5vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-subtle p-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Icon icon={RankingIcon} size={13} />
              Configuración
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Pipelines y stages
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
          >
            <Icon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
          {/* Sidebar de pipelines */}
          <aside className="border-b border-border-subtle p-3 lg:border-b-0 lg:border-r">
            <div className="mb-2 flex items-center justify-between px-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pipelines
              </h3>
              <button
                onClick={() => {
                  setCreating(true);
                  setSelectedId(null);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                title="Nuevo pipeline"
              >
                <Icon icon={Add01Icon} size={13} />
              </button>
            </div>
            <ul className="space-y-1">
              {pipelines?.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      setSelectedId(p.id);
                      setCreating(false);
                    }}
                    className={cn(
                      "flex w-full items-start justify-between gap-2 rounded-xl px-3 py-2 text-left transition-colors",
                      !creating && (selectedId === p.id || (!selectedId && pipelines[0]?.id === p.id))
                        ? "bg-surface-muted"
                        : "hover:bg-surface-muted/50",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{p.name}</span>
                        {p.is_default && (
                          <Badge variant="info" className="text-[9px]">
                            default
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 text-[10px] capitalize text-foreground-muted">
                        {p.purpose} · {p.stages.length} stages
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Editor del pipeline seleccionado o creación */}
          <div className="p-5">
            {creating ? (
              <PipelineCreator onCreated={(id) => { setSelectedId(id); setCreating(false); }} />
            ) : selected ? (
              <PipelineEditor pipeline={selected} />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-foreground-muted">
                Selecciona un pipeline o crea uno nuevo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Crear pipeline nuevo ----------
function PipelineCreator({ onCreated }: { onCreated: (id: number) => void }) {
  const save = useSavePipeline();
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState<"alquiler" | "venta" | "captacion" | "otros">("alquiler");

  const handle = async () => {
    if (!name.trim()) return;
    const p = await save.mutateAsync({ name, purpose });
    onCreated(p.id);
  };

  return (
    <div className="max-w-md space-y-4">
      <h3 className="text-base font-semibold">Nuevo pipeline</h3>
      <Field label="Nombre del pipeline">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Captación residencial"
          autoFocus
        />
      </Field>
      <Field label="Propósito">
        <NativeSelect value={purpose} onChange={(e) => setPurpose(e.target.value as typeof purpose)}>
          <option value="alquiler">Alquiler</option>
          <option value="venta">Venta</option>
          <option value="captacion">Captación</option>
          <option value="otros">Otros</option>
        </NativeSelect>
      </Field>
      <p className="text-xs text-foreground-muted">
        Se crearán 4 stages por defecto (Nuevo · En proceso · Ganado · Perdido).
        Podrás editarlos después.
      </p>
      <Button onClick={handle} disabled={save.isPending || !name.trim()}>
        {save.isPending ? "Creando..." : "Crear pipeline"}
      </Button>
    </div>
  );
}

// ---------- Editor de pipeline existente ----------
function PipelineEditor({ pipeline }: { pipeline: Pipeline }) {
  const savePipeline = useSavePipeline(pipeline.id);
  const delPipeline = useDeletePipeline();
  const reorder = useReorderStages(pipeline.id);
  const [name, setName] = useState(pipeline.name);
  const [purpose, setPurpose] = useState(pipeline.purpose);

  const updateMeta = async () => {
    await savePipeline.mutateAsync({ name, purpose });
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el pipeline "${pipeline.name}"?`)) return;
    await delPipeline.mutateAsync(pipeline.id);
  };

  const moveStage = async (idx: number, dir: -1 | 1) => {
    const stages = [...pipeline.stages].sort((a, b) => a.position - b.position);
    const target = idx + dir;
    if (target < 0 || target >= stages.length) return;
    [stages[idx], stages[target]] = [stages[target], stages[idx]];
    await reorder.mutateAsync(stages.map((s) => s.id));
  };

  return (
    <div className="space-y-5">
      {/* Meta */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_auto]">
        <Field label="Nombre">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Propósito">
          <NativeSelect
            value={purpose}
            onChange={(e) =>
              setPurpose(e.target.value as Pipeline["purpose"])
            }
          >
            <option value="alquiler">Alquiler</option>
            <option value="venta">Venta</option>
            <option value="captacion">Captación</option>
            <option value="otros">Otros</option>
          </NativeSelect>
        </Field>
        <div className="flex items-end gap-2">
          <Button
            size="sm"
            onClick={updateMeta}
            disabled={savePipeline.isPending}
          >
            Guardar
          </Button>
          {!pipeline.is_default && (
            <Button size="sm" variant="outline" onClick={handleDelete}>
              <Icon icon={Delete02Icon} size={13} />
            </Button>
          )}
        </div>
      </div>

      {/* Stages */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Stages</h3>
          <NewStageButton pipelineId={pipeline.id} />
        </div>
        <ul className="space-y-2">
          {[...pipeline.stages]
            .sort((a, b) => a.position - b.position)
            .map((s, idx, arr) => (
              <StageRow
                key={s.id}
                stage={s}
                pipelineId={pipeline.id}
                onMoveUp={idx > 0 ? () => moveStage(idx, -1) : undefined}
                onMoveDown={idx < arr.length - 1 ? () => moveStage(idx, 1) : undefined}
              />
            ))}
        </ul>
      </div>
    </div>
  );
}

function NewStageButton({ pipelineId }: { pipelineId: number }) {
  const save = useSaveStage(pipelineId);
  const handle = async () => {
    const name = prompt("Nombre del nuevo stage:");
    if (!name) return;
    await save.mutateAsync({ name, color: "neutral", probability_pct: 50 });
  };
  return (
    <Button size="sm" variant="outline" onClick={handle}>
      <Icon icon={Add01Icon} size={13} />
      Nuevo stage
    </Button>
  );
}

const COLOR_DOT: Record<string, string> = {
  neutral: "bg-foreground-muted",
  info: "bg-info",
  positive: "bg-positive",
  warning: "bg-warning",
  negative: "bg-negative",
};

function StageRow({
  stage,
  pipelineId,
  onMoveUp,
  onMoveDown,
}: {
  stage: Stage;
  pipelineId: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const save = useSaveStage(pipelineId, stage.id);
  const del = useDeleteStage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stage);

  const handleSave = async () => {
    await save.mutateAsync({
      name: draft.name,
      color: draft.color,
      probability_pct: draft.probability_pct,
      is_won: draft.is_won,
      is_lost: draft.is_lost,
    });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar stage "${stage.name}"?`)) return;
    await del.mutateAsync(stage.id);
  };

  if (editing) {
    return (
      <li className="rounded-2xl border border-foreground/30 bg-surface p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_100px_auto]">
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <NativeSelect
            value={draft.color}
            onChange={(e) => setDraft({ ...draft, color: e.target.value })}
          >
            <option value="neutral">Neutral</option>
            <option value="info">Azul</option>
            <option value="positive">Verde</option>
            <option value="warning">Amarillo</option>
            <option value="negative">Rojo</option>
          </NativeSelect>
          <Input
            type="number"
            min={0}
            max={100}
            value={draft.probability_pct}
            onChange={(e) =>
              setDraft({ ...draft, probability_pct: Number(e.target.value) })
            }
          />
          <div className="flex gap-1">
            <Button size="sm" onClick={handleSave} disabled={save.isPending}>
              <Icon icon={CheckmarkCircle02Icon} size={13} />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <Icon icon={Cancel01Icon} size={13} />
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-foreground-muted">
          <label className="inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={draft.is_won}
              onChange={(e) =>
                setDraft({ ...draft, is_won: e.target.checked, is_lost: e.target.checked ? false : draft.is_lost })
              }
            />
            Stage de ganado
          </label>
          <label className="inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={draft.is_lost}
              onChange={(e) =>
                setDraft({ ...draft, is_lost: e.target.checked, is_won: e.target.checked ? false : draft.is_won })
              }
            />
            Stage de perdido
          </label>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!onMoveUp}
          className="text-foreground-muted hover:text-foreground disabled:opacity-30"
          title="Subir"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!onMoveDown}
          className="text-foreground-muted hover:text-foreground disabled:opacity-30"
          title="Bajar"
        >
          ▼
        </button>
      </div>
      <span className={cn("h-2.5 w-2.5 rounded-full", COLOR_DOT[stage.color] ?? COLOR_DOT.neutral)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{stage.name}</span>
          {stage.is_won && (
            <Badge variant="positive" className="text-[10px]">
              Ganado
            </Badge>
          )}
          {stage.is_lost && (
            <Badge variant="negative" className="text-[10px]">
              Perdido
            </Badge>
          )}
        </div>
        <div className="text-[11px] tabular-numbers text-foreground-muted">
          Probabilidad: {stage.probability_pct}% · {stage.leads_count ?? 0} leads
        </div>
      </div>
      <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
        <Icon icon={Edit02Icon} size={13} />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleDelete}>
        <Icon icon={Delete02Icon} size={13} />
      </Button>
    </li>
  );
}

// Suprime warning DragDropHorizontal
void DragDropHorizontalIcon;
