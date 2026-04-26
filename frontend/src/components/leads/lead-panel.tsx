"use client";

import { useEffect, useState } from "react";
import {
  Cancel01Icon,
  CallIcon,
  Mail01Icon,
  CalendarSetting01Icon,
  TextFontIcon,
  CheckmarkCircle02Icon,
  HouseIcon,
  Coins01Icon,
  Agreement02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import {
  useLead,
  useLeadActivities,
  useAddLeadActivity,
  useDeleteLead,
  type Lead,
} from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";
import { ConvertLeadDialog } from "./convert-lead-dialog";
import { CaptacionConvertDialog } from "./captacion-convert-dialog";

const ACTIVITY_ICON: Record<string, IconSvgElement> = {
  note: TextFontIcon,
  call: CallIcon,
  email: Mail01Icon,
  meeting: Agreement02Icon,
  visit_scheduled: CalendarSetting01Icon,
  stage_change: CheckmarkCircle02Icon,
  won: CheckmarkCircle02Icon,
  lost: Cancel01Icon,
};

interface Props {
  lead: Lead | null;
  onClose: () => void;
  pipelinePurpose?: string;
}

export function LeadPanel({ lead, onClose, pipelinePurpose }: Props) {
  const isCaptacion = pipelinePurpose === "captacion";
  const { data: full } = useLead(lead?.id);
  const { data: activitiesData } = useLeadActivities(lead?.id);
  const addActivity = useAddLeadActivity(lead?.id ?? 0);
  const del = useDeleteLead();

  const [activityType, setActivityType] = useState<
    "note" | "call" | "email" | "meeting" | "visit_scheduled"
  >("note");
  const [activityBody, setActivityBody] = useState("");
  const [convertOpen, setConvertOpen] = useState(false);

  useEffect(() => {
    setActivityBody("");
    setActivityType("note");
  }, [lead?.id]);

  if (!lead) return null;

  const display = full ?? lead;
  const activities = activitiesData?.data ?? [];

  const submitActivity = async () => {
    if (!activityBody.trim()) return;
    await addActivity.mutateAsync({ type: activityType, body: activityBody });
    setActivityBody("");
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el lead "${display.title}"?`)) return;
    await del.mutateAsync(display.id);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col overflow-hidden border-l border-border bg-surface shadow-2xl">
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span className="tabular-numbers">{display.code}</span>
              <span>·</span>
              <Badge
                variant={
                  display.status === "won"
                    ? "positive"
                    : display.status === "lost"
                      ? "negative"
                      : "neutral"
                }
                className="text-[10px]"
              >
                {display.status === "won"
                  ? "Ganado"
                  : display.status === "lost"
                    ? "Perdido"
                    : "Abierto"}
              </Badge>
            </div>
            <h2 className="mt-1 text-lg font-semibold leading-tight">{display.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
            aria-label="Cerrar"
          >
            <Icon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Valor" value={formatCurrency(display.value)} />
            <Stat label="Probabilidad" value={`${display.probability_pct}%`} />
            <Stat
              label="Cierre"
              value={display.expected_close_date ?? "—"}
              small
            />
          </div>

          {/* Contact */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Contacto
            </h3>
            <div className="space-y-2 rounded-2xl border border-border-subtle p-3 text-sm">
              {display.contact_name && (
                <div className="flex items-center gap-2">
                  <Avatar name={display.contact_name} size="sm" />
                  <span className="font-medium">{display.contact_name}</span>
                </div>
              )}
              <div className="grid grid-cols-1 gap-1 text-xs text-foreground-muted">
                {display.contact_email && (
                  <a
                    href={`mailto:${display.contact_email}`}
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <Icon icon={Mail01Icon} size={12} />
                    {display.contact_email}
                  </a>
                )}
                {display.contact_phone && (
                  <a
                    href={`tel:${display.contact_phone}`}
                    className="inline-flex items-center gap-1.5 hover:text-foreground tabular-numbers"
                  >
                    <Icon icon={CallIcon} size={12} />
                    {display.contact_phone}
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Requirements */}
          {display.requirements && Object.keys(display.requirements).length > 0 && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Requerimientos
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {display.requirements.bedrooms_min !== undefined && (
                  <Badge variant="neutral">
                    <Icon icon={HouseIcon} size={11} />
                    {display.requirements.bedrooms_min}+ hab
                  </Badge>
                )}
                {display.requirements.max_price !== undefined && (
                  <Badge variant="neutral">
                    <Icon icon={Coins01Icon} size={11} />
                    Hasta {formatCurrency(display.requirements.max_price)}
                  </Badge>
                )}
                {display.requirements.zones?.map((z) => (
                  <Badge key={z} variant="outline">
                    {z}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {display.notes && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Notas
              </h3>
              <p className="whitespace-pre-line rounded-2xl bg-surface-muted/50 p-3 text-sm">
                {display.notes}
              </p>
            </section>
          )}

          {/* Add activity */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Registrar actividad
            </h3>
            <div className="space-y-2 rounded-2xl border border-border-subtle p-3">
              <div className="flex items-center gap-2">
                <Field label="" className="flex-shrink-0">
                  <NativeSelect
                    value={activityType}
                    onChange={(e) =>
                      setActivityType(e.target.value as typeof activityType)
                    }
                    className="w-36"
                  >
                    <option value="note">Nota</option>
                    <option value="call">Llamada</option>
                    <option value="email">Email</option>
                    <option value="meeting">Reunión</option>
                    <option value="visit_scheduled">Visita</option>
                  </NativeSelect>
                </Field>
              </div>
              <Textarea
                rows={2}
                placeholder="Escribe la actividad..."
                value={activityBody}
                onChange={(e) => setActivityBody(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={submitActivity}
                  disabled={addActivity.isPending || !activityBody.trim()}
                >
                  Añadir
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
              {activities.length === 0 ? (
                <li className="rounded-2xl border border-border-subtle p-4 text-center text-xs text-foreground-muted">
                  Sin actividad todavía.
                </li>
              ) : (
                activities.map((a) => {
                  const ico = ACTIVITY_ICON[a.type] ?? TextFontIcon;
                  return (
                    <li
                      key={a.id}
                      className="flex gap-3 rounded-2xl border border-border-subtle p-3"
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl",
                          a.type === "won"
                            ? "bg-positive-soft text-positive"
                            : a.type === "lost"
                              ? "bg-negative-soft text-negative"
                              : a.type === "stage_change"
                                ? "bg-info-soft text-info"
                                : "bg-surface-muted text-foreground-muted",
                        )}
                      >
                        <Icon icon={ico} size={13} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-sm font-medium">
                            {a.title ?? activityLabel(a.type)}
                          </div>
                          <span className="shrink-0 text-[10px] tabular-numbers text-muted-foreground">
                            {new Date(a.occurred_at).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {a.body && (
                          <div className="mt-0.5 text-xs text-foreground-muted whitespace-pre-line">
                            {a.body}
                          </div>
                        )}
                        {a.user && (
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {a.user.name}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        </div>

        {/* footer actions */}
        <div className="flex items-center justify-between gap-2 border-t border-border-subtle p-4">
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            Eliminar
          </Button>
          <div className="flex items-center gap-2">
            {display.converted_contract_id ? (
              <Badge variant="positive">
                <Icon icon={CheckmarkCircle02Icon} size={11} />
                Convertido a contrato #{display.converted_contract_id}
              </Badge>
            ) : display.property && isCaptacion ? (
              <Badge variant="positive">
                <Icon icon={CheckmarkCircle02Icon} size={11} />
                Propiedad creada · {display.property.code}
              </Badge>
            ) : isCaptacion ? (
              <Button onClick={() => setConvertOpen(true)}>
                <Icon icon={HouseIcon} size={14} />
                Crear propiedad
              </Button>
            ) : (
              <Button onClick={() => setConvertOpen(true)}>
                <Icon icon={Agreement02Icon} size={14} />
                Convertir a contrato
              </Button>
            )}
          </div>
        </div>
      </aside>

      {isCaptacion ? (
        <CaptacionConvertDialog
          lead={display}
          open={convertOpen}
          onClose={() => setConvertOpen(false)}
          onConverted={() => {
            setConvertOpen(false);
            onClose();
          }}
        />
      ) : (
        <ConvertLeadDialog
          lead={display}
          open={convertOpen}
          onClose={() => setConvertOpen(false)}
          onConverted={() => {
            setConvertOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-semibold tabular-numbers",
          small ? "text-sm" : "text-base",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function activityLabel(type: string): string {
  const labels: Record<string, string> = {
    note: "Nota",
    call: "Llamada",
    email: "Email",
    meeting: "Reunión",
    visit_scheduled: "Visita agendada",
    stage_change: "Cambio de etapa",
    won: "Lead ganado",
    lost: "Lead perdido",
  };
  return labels[type] ?? type;
}
