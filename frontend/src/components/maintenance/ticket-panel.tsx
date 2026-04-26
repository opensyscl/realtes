"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cancel01Icon,
  PropertyNewIcon,
  CallIcon,
  Calendar03Icon,
  CalendarSetting01Icon,
  Coins01Icon,
  CashIcon,
  TextFontIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Edit02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import {
  useMaintenanceTicket,
  useMaintenanceComments,
  useAddMaintenanceComment,
  useSaveMaintenanceTicket,
  type MaintenanceTicket,
} from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "neutral" | "info" | "warning" | "positive" | "negative"> = {
  abierto: "warning",
  en_progreso: "info",
  esperando_proveedor: "info",
  resuelto: "positive",
  cerrado: "neutral",
  cancelado: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  abierto: "Abierto",
  en_progreso: "En progreso",
  esperando_proveedor: "Esperando proveedor",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

const PRIORITY_TONE: Record<string, string> = {
  baja: "bg-positive-soft text-positive",
  media: "bg-info-soft text-info",
  alta: "bg-warning-soft text-warning",
  urgente: "bg-negative-soft text-negative",
};

const COMMENT_ICON: Record<string, IconSvgElement> = {
  comment: TextFontIcon,
  status_change: CheckmarkCircle02Icon,
  assignment: UserIcon,
  cost_update: CashIcon,
};

export function TicketPanel({
  ticket,
  onClose,
}: {
  ticket: MaintenanceTicket | null;
  onClose: () => void;
}) {
  const { data: full } = useMaintenanceTicket(ticket?.id);
  const { data: commentsData } = useMaintenanceComments(ticket?.id);
  const addComment = useAddMaintenanceComment(ticket?.id ?? 0);
  const save = useSaveMaintenanceTicket(ticket?.id);

  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(false);

  if (!ticket) return null;
  const t = full ?? ticket;
  const comments = commentsData?.data ?? [];

  const submitComment = async () => {
    if (!body.trim()) return;
    await addComment.mutateAsync(body);
    setBody("");
  };

  const updateStatus = async (status: string) => {
    await save.mutateAsync({ status });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[1px]" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col overflow-hidden border-l border-border bg-surface shadow-2xl">
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span className="tabular-numbers">{t.code}</span>
              <span>·</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] capitalize", PRIORITY_TONE[t.priority])}>
                {t.priority}
              </span>
              <span>·</span>
              <Badge variant={STATUS_VARIANT[t.status] ?? "neutral"} className="text-[10px]">
                {STATUS_LABEL[t.status] ?? t.status}
              </Badge>
            </div>
            <h2 className="mt-1 text-lg font-semibold leading-tight">{t.title}</h2>
            <div className="mt-1 text-xs text-foreground-muted capitalize">
              {t.category.replace(/_/g, " ")}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
            aria-label="Cerrar"
          >
            <Icon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick status */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cambiar estado
            </h3>
            <div className="flex flex-wrap gap-1">
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => updateStatus(k)}
                  disabled={t.status === k || save.isPending}
                  className={cn(
                    "h-7 rounded-full border px-2.5 text-[11px] font-medium transition-colors",
                    t.status === k
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
                    save.isPending && "opacity-50",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </section>

          {/* Property */}
          {t.property && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Propiedad
              </h3>
              <Link
                href={`/propiedades/${t.property.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border-subtle p-3 hover:bg-surface-muted/50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
                  <Icon icon={PropertyNewIcon} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{t.property.title}</div>
                  <div className="text-[11px] text-foreground-muted">
                    {t.property.address} · <span className="tabular-numbers">{t.property.code}</span>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Reporter + assignee */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Personas
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {t.reporter && (
                <PersonRow
                  label="Reportado por"
                  name={t.reporter.full_name}
                  meta={t.reporter.phone}
                  icon={CallIcon}
                />
              )}
              {t.assigned_to ? (
                <PersonRow
                  label="Asignado a"
                  name={t.assigned_to.name}
                  icon={UserIcon}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-border-subtle p-3 text-center text-xs text-foreground-muted">
                  Sin asignar
                </div>
              )}
            </div>
          </section>

          {/* Costs */}
          <section className="grid grid-cols-2 gap-2">
            <Stat
              icon={Coins01Icon}
              label="Coste estimado"
              value={t.estimated_cost ? formatCurrency(t.estimated_cost) : "—"}
            />
            <Stat
              icon={CashIcon}
              label="Coste real"
              value={t.actual_cost ? formatCurrency(t.actual_cost) : "—"}
            />
            {t.scheduled_for && (
              <Stat
                icon={CalendarSetting01Icon}
                label="Programado"
                value={t.scheduled_for}
              />
            )}
            {t.resolved_at && (
              <Stat
                icon={Calendar03Icon}
                label="Resuelto"
                value={new Date(t.resolved_at).toLocaleDateString("es-ES")}
              />
            )}
          </section>

          {/* Description */}
          {t.description && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Descripción
              </h3>
              <p className="whitespace-pre-line rounded-2xl bg-surface-muted/50 p-3 text-sm">
                {t.description}
              </p>
            </section>
          )}

          {/* Vendor edit */}
          {editing ? (
            <section className="space-y-2 rounded-2xl border border-border-subtle p-3">
              <Field label="Proveedor">
                <Input
                  defaultValue={t.vendor ?? ""}
                  onBlur={(e) => save.mutateAsync({ vendor: e.target.value || undefined })}
                />
              </Field>
              <Field label="Coste estimado (€)">
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={t.estimated_cost ?? ""}
                  onBlur={(e) =>
                    save.mutateAsync({
                      estimated_cost: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </Field>
              <Field label="Coste real (€)">
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={t.actual_cost ?? ""}
                  onBlur={(e) =>
                    save.mutateAsync({
                      actual_cost: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </Field>
              <div className="flex justify-end">
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cerrar edición
                </Button>
              </div>
            </section>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Icon icon={Edit02Icon} size={14} />
              Editar costes y proveedor
            </Button>
          )}

          {/* Comment composer */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Añadir comentario
            </h3>
            <div className="space-y-2 rounded-2xl border border-border-subtle p-3">
              <Textarea
                rows={2}
                placeholder="Escribe un comentario..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={submitComment}
                  disabled={addComment.isPending || !body.trim()}
                >
                  Publicar
                </Button>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Historial
            </h3>
            <ul className="space-y-2">
              {comments.length === 0 ? (
                <li className="rounded-2xl border border-border-subtle p-4 text-center text-xs text-foreground-muted">
                  Sin comentarios.
                </li>
              ) : (
                comments.map((c) => {
                  const ico = COMMENT_ICON[c.type] ?? TextFontIcon;
                  return (
                    <li
                      key={c.id}
                      className="flex gap-3 rounded-2xl border border-border-subtle p-3"
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl",
                          c.type === "status_change"
                            ? "bg-info-soft text-info"
                            : c.type === "assignment"
                              ? "bg-warning-soft text-warning"
                              : "bg-surface-muted text-foreground-muted",
                        )}
                      >
                        <Icon icon={ico} size={13} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-sm font-medium">
                            {c.user?.name ?? "Sistema"}
                          </div>
                          <span className="shrink-0 text-[10px] tabular-numbers text-muted-foreground">
                            {new Date(c.created_at).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="mt-0.5 whitespace-pre-line text-xs text-foreground-muted">
                          {c.body}
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        </div>
      </aside>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-subtle p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
        <Icon icon={icon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-semibold tabular-numbers">{value}</div>
      </div>
    </div>
  );
}

function PersonRow({
  label,
  name,
  meta,
  icon,
}: {
  label: string;
  name: string;
  meta?: string | null;
  icon: IconSvgElement;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-subtle p-3">
      <Avatar name={name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium">{name}</div>
        {meta && <div className="truncate text-[11px] text-foreground-muted tabular-numbers">{meta}</div>}
      </div>
      <Icon icon={icon} size={13} className="text-muted-foreground" />
    </div>
  );
}

// Suprime warning de variable no usada (icono Cancel)
void AlertCircleIcon;
