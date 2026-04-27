"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail01Icon,
  CallIcon,
  WhatsappIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  UserCircleIcon,
  ArrowUp02Icon,
  CheckmarkCircle02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import {
  usePropertyLeads,
  useLeadActivities,
  useAddLeadActivity,
  useSaveLead,
  type Lead,
  type LeadActivity,
} from "@/lib/queries";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<string, "info" | "positive" | "negative" | "neutral"> = {
  open: "info",
  won: "positive",
  lost: "negative",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Abierto",
  won: "Ganado",
  lost: "Perdido",
};

function TabBtn({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors",
        active ? "text-foreground" : "text-foreground-muted hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-numbers",
          active
            ? "bg-foreground text-accent-foreground"
            : "bg-surface-muted text-foreground-muted",
        )}
      >
        {count}
      </span>
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
      )}
    </button>
  );
}

export function PropertyMessagesDrawer({
  propertyId,
  trigger,
}: {
  propertyId: number;
  trigger: React.ReactNode;
}) {
  const { data: leads = [], isLoading } = usePropertyLeads(propertyId);
  const [activeLeadId, setActiveLeadId] = useState<number | null>(null);
  const [tab, setTab] = useState<"consultas" | "interesados">("consultas");

  // Heurística: un lead se considera "interesado" si el agente ya lo
  // calificó (probability_pct >= 50) o si fue ganado/convertido.
  const isInterested = (l: Lead) =>
    (l.probability_pct ?? 0) >= 50 || l.status === "won";

  const consultas = leads.filter((l) => !isInterested(l));
  const interesados = leads.filter(isInterested);
  const visibleLeads = tab === "consultas" ? consultas : interesados;

  const activeLead = leads.find((l) => l.id === activeLeadId) ?? null;

  return (
    <Drawer position="right" onOpenChange={(open) => !open && setActiveLeadId(null)}>
      <DrawerTrigger render={trigger as React.ReactElement} />
      <DrawerPopup>
        <DrawerHeader>
          {activeLead ? (
            <>
              <button
                type="button"
                onClick={() => setActiveLeadId(null)}
                className="-ml-1 mb-1 inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground-muted hover:text-foreground"
              >
                <Icon icon={ArrowLeft01Icon} size={12} />
                Volver
              </button>
              <DrawerTitle>{activeLead.contact_name || "Consulta"}</DrawerTitle>
              <DrawerDescription>
                {activeLead.contact_email || activeLead.contact_phone || "Conversación"}
              </DrawerDescription>
            </>
          ) : (
            <>
              <DrawerTitle>Consultas de la propiedad</DrawerTitle>
              <DrawerDescription>
                {isLoading
                  ? "Cargando…"
                  : leads.length === 0
                    ? "Aún no hay mensajes ni consultas."
                    : `${consultas.length} ${consultas.length === 1 ? "consulta nueva" : "consultas nuevas"} · ${interesados.length} ${interesados.length === 1 ? "interesado" : "interesados"}`}
              </DrawerDescription>
            </>
          )}
        </DrawerHeader>

        {/* Tabs Consultas / Interesados (solo en lista, no en conversación) */}
        {!activeLead && leads.length > 0 && (
          <div className="border-b border-border-subtle px-4">
            <div className="flex gap-1">
              <TabBtn
                active={tab === "consultas"}
                onClick={() => setTab("consultas")}
                label="Consultas"
                count={consultas.length}
              />
              <TabBtn
                active={tab === "interesados"}
                onClick={() => setTab("interesados")}
                label="Interesados"
                count={interesados.length}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {activeLead ? (
            <ConversationView lead={activeLead} />
          ) : (
            <div className="space-y-3 px-4 py-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-24 animate-pulse bg-surface-muted/40" />
                ))
              ) : visibleLeads.length === 0 ? (
                <Card className="p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
                    <Icon icon={Mail01Icon} size={20} />
                  </div>
                  <h3 className="mt-3 text-base font-semibold">
                    {leads.length === 0
                      ? "Sin consultas"
                      : tab === "consultas"
                        ? "Sin consultas pendientes"
                        : "Sin interesados aún"}
                  </h3>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {leads.length === 0
                      ? "Cuando alguien te contacte por esta propiedad desde el escaparate público o WhatsApp, aparecerá acá."
                      : tab === "consultas"
                        ? "Todas las consultas recibidas ya fueron calificadas como interesados."
                        : "Marca una consulta como interesado desde la conversación para verla acá."}
                  </p>
                </Card>
              ) : (
                visibleLeads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    onOpen={() => setActiveLeadId(lead.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>

        <DrawerFooter>
          <DrawerClose render={<Button variant="outline">Cerrar</Button>} />
          {!activeLead && leads.length > 0 && (
            <Link href="/leads" className="ml-auto">
              <Button>
                Ir al pipeline
                <Icon icon={ArrowRight01Icon} size={13} />
              </Button>
            </Link>
          )}
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}

function LeadRow({
  lead,
  onOpen,
}: {
  lead: Lead;
  onOpen: () => void;
}) {
  const tone = STATUS_TONE[lead.status] ?? "neutral";
  const label = STATUS_LABEL[lead.status] ?? lead.status;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left transition-transform hover:-translate-y-0.5"
    >
      <Card className="p-4 hover:border-primary/40 hover:shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-info-soft text-info">
            <Icon icon={UserCircleIcon} size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-[14px] font-semibold">
                {lead.contact_name || lead.title || "Consulta sin nombre"}
              </h4>
              <Badge variant={tone}>{label}</Badge>
              {lead.source && (
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] capitalize text-foreground-muted">
                  {lead.source}
                </span>
              )}
            </div>

            {(lead.contact_email || lead.contact_phone) && (
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-foreground-muted">
                {lead.contact_email && (
                  <span className="inline-flex items-center gap-1">
                    <Icon icon={Mail01Icon} size={11} />
                    {lead.contact_email}
                  </span>
                )}
                {lead.contact_phone && (
                  <span className="inline-flex items-center gap-1">
                    <Icon icon={CallIcon} size={11} />
                    {lead.contact_phone}
                  </span>
                )}
              </div>
            )}

            {lead.notes && (
              <p className="mt-2 line-clamp-2 text-[13px] text-foreground-muted">
                {lead.notes}
              </p>
            )}

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[10px] tabular-numbers text-foreground-muted">
                {formatRelative(lead.created_at)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                Ver conversación
                <Icon icon={ArrowRight01Icon} size={10} />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}

function ConversationView({ lead }: { lead: Lead }) {
  const { data, isLoading } = useLeadActivities(lead.id);
  const add = useAddLeadActivity(lead.id);
  const saveLead = useSaveLead(lead.id);
  const [reply, setReply] = useState("");

  const isInterested =
    (lead.probability_pct ?? 0) >= 50 || lead.status === "won";

  const toggleInterested = async () => {
    const next = isInterested ? 20 : 70;
    await toast.promise(
      saveLead.mutateAsync({
        probability_pct: next,
      } as Parameters<typeof saveLead.mutateAsync>[0]),
      {
        loading: { title: isInterested ? "Quitando…" : "Marcando…" },
        success: {
          title: isInterested
            ? "Movido a Consultas"
            : "Marcado como Interesado",
        },
        error: (err: unknown) => ({
          title: "Error",
          description: err instanceof Error ? err.message : "",
        }),
      },
    );
  };

  const activities = data?.data ?? [];

  // Mensaje inicial sintético desde lead.notes — sólo si NINGUNA actividad ya
  // tiene ese mismo body (PublicController::storeLead crea una activity tipo
  // 'note' con body=mensaje, así que mostrar también el seed duplica).
  const notesAlreadyInActivities =
    lead.notes &&
    activities.some((a) => (a.body ?? "").trim() === (lead.notes ?? "").trim());

  const seedMessage: LeadActivity | null =
    lead.notes && !notesAlreadyInActivities
      ? {
          id: -1,
          type: "message_in",
          title: null,
          body: lead.notes,
          occurred_at: lead.created_at,
          user: null,
          payload: null,
        }
      : null;

  // Las activities con body == lead.notes que vinieron del escaparate las
  // re-tipamos como mensajes entrantes del cliente (en vez de notes salientes
  // del agente) para que se rendericen a la izquierda en gris.
  const normalized = activities.map((a) => {
    const isLeadCapture =
      lead.notes &&
      (a.body ?? "").trim() === (lead.notes ?? "").trim() &&
      !a.user;
    return isLeadCapture
      ? { ...a, type: "message_in" as const, title: null }
      : a;
  });

  const messages: LeadActivity[] = [
    ...(seedMessage ? [seedMessage] : []),
    ...normalized,
  ];

  const sendReply = async () => {
    const body = reply.trim();
    if (!body) return;
    try {
      await toast.promise(
        add.mutateAsync({ type: "message_out", body }),
        {
          loading: { title: "Enviando mensaje…" },
          success: { title: "Mensaje enviado" },
          error: (e: unknown) => ({
            title: "Error",
            description: e instanceof Error ? e.message : "",
          }),
        },
      );
      setReply("");
    } catch {
      // toast ya muestra el error
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Acción rápida: marcar/desmarcar como Interesado */}
      <div className="border-b border-border-subtle bg-surface px-4 py-2">
        <button
          type="button"
          onClick={toggleInterested}
          disabled={saveLead.isPending}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors",
            isInterested
              ? "border-positive/40 bg-positive-soft/40 text-positive hover:bg-positive-soft/60"
              : "border-border bg-surface-muted/40 text-foreground-muted hover:bg-surface-muted/70",
            saveLead.isPending && "cursor-wait opacity-60",
          )}
        >
          <Icon
            icon={isInterested ? CheckmarkCircle02Icon : StarIcon}
            size={11}
          />
          {isInterested ? "Marcado como Interesado" : "Marcar como Interesado"}
        </button>
      </div>

      {/* Tarjeta compacta de contacto del lead */}
      <ContactCard lead={lead} />

      {/* Mensajes */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-12 animate-pulse rounded-xl bg-surface-muted/40" />
            <div className="h-12 animate-pulse rounded-xl bg-surface-muted/40" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-[12px] text-foreground-muted">
            Aún no hay mensajes en esta conversación.
          </p>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      {/* Input para responder */}
      <div className="border-t border-border-subtle bg-surface-muted/30 p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                sendReply();
              }
            }}
            placeholder={`Responder a ${lead.contact_name || "la consulta"}…`}
            rows={2}
            className="resize-none"
          />
          <Button
            onClick={sendReply}
            disabled={!reply.trim() || add.isPending}
            size="sm"
            className="shrink-0"
          >
            <Icon icon={ArrowUp02Icon} size={13} />
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-foreground-muted">
          ⌘/Ctrl + Enter para enviar · Se guarda como actividad en el lead
        </p>
      </div>
    </div>
  );
}

function ContactCard({ lead }: { lead: Lead }) {
  if (!lead.contact_email && !lead.contact_phone) return null;
  const phoneDigits = (lead.contact_phone ?? "").replace(/[^0-9]/g, "");

  return (
    <div className="mx-4 mb-3 mt-3 rounded-2xl border border-border-subtle bg-surface-muted/40 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Contacto
      </div>
      <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {lead.contact_email && (
          <a
            href={`mailto:${lead.contact_email}`}
            className="inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-[12px] text-foreground transition-colors hover:bg-surface/70"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
              <Icon icon={Mail01Icon} size={12} />
            </span>
            <span className="truncate">{lead.contact_email}</span>
          </a>
        )}
        {lead.contact_phone && (
          <a
            href={`tel:${lead.contact_phone}`}
            className="inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-[12px] text-foreground transition-colors hover:bg-surface/70"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-positive-soft text-positive">
              <Icon icon={CallIcon} size={12} />
            </span>
            <span className="truncate tabular-numbers">{lead.contact_phone}</span>
          </a>
        )}
      </div>
      {lead.contact_phone && phoneDigits && (
        <a
          href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hola ${lead.contact_name || ""}, te escribo desde Valencia Pro.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/15 px-3 py-1 text-[11px] font-semibold text-[#1da851] transition-colors hover:bg-[#25D366]/25"
        >
          <Icon icon={WhatsappIcon} size={11} />
          Abrir WhatsApp
        </a>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: LeadActivity }) {
  const isOut =
    message.type === "message_out" ||
    message.type === "note" ||
    !!message.user;

  return (
    <div className={cn("flex", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-[13px]",
          isOut
            ? "bg-primary text-white"
            : "bg-surface-muted text-foreground",
        )}
      >
        {message.title && (
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {message.title}
          </div>
        )}
        <p className="whitespace-pre-line">{message.body || "—"}</p>
        <div
          className={cn(
            "mt-1 flex items-center gap-1.5 text-[10px] tabular-numbers",
            isOut ? "text-white/70" : "text-foreground-muted",
          )}
        >
          {isOut && message.user?.name && <span>{message.user.name} ·</span>}
          {!isOut && <span>Cliente ·</span>}
          <span>{formatRelative(message.occurred_at)}</span>
        </div>
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
