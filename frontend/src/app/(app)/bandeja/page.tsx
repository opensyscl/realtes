"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Mail01Icon,
  Search01Icon,
  CallIcon,
  WhatsappIcon,
  PropertyNewIcon,
  UserCircleIcon,
  ArrowRight01Icon,
  ArrowUp02Icon,
  CheckmarkCircle02Icon,
  StarIcon,
  FilterIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import {
  useLeadsInbox,
  useLeadActivities,
  useAddLeadActivity,
  useSaveLead,
  type Lead,
  type LeadActivity,
} from "@/lib/queries";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "web", label: "Web" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "portal", label: "Portal" },
  { value: "referido", label: "Referido" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "open", label: "Abiertos" },
  { value: "won", label: "Ganados" },
  { value: "lost", label: "Perdidos" },
];

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

export default function BandejaPage() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("open");
  const [activeId, setActiveId] = useState<number | null>(null);

  const { data: leads = [], isLoading } = useLeadsInbox({
    search: search || undefined,
    source: source || undefined,
    status: status || undefined,
  });

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeId) ?? null,
    [leads, activeId],
  );

  // Auto-selecciona el primer lead cuando carga si no hay ninguno activo
  if (!activeLead && leads.length > 0 && activeId === null) {
    setActiveId(leads[0].id);
  }

  const openCount = leads.filter((l) => l.status === "open").length;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col px-6 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bandeja de entrada</h1>
          <p className="mt-0.5 text-sm text-foreground-muted">
            Consultas y mensajes recibidos desde tu sitio público y portales.
            {leads.length > 0 && (
              <>
                {" "}
                <strong>{leads.length}</strong>{" "}
                {leads.length === 1 ? "consulta" : "consultas"} ·{" "}
                <strong>{openCount}</strong> abiertas
              </>
            )}
          </p>
        </div>
      </div>

      {/* Layout split */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* Lista izquierda */}
        <Card className="flex w-[420px] shrink-0 flex-col overflow-hidden p-0">
          <div className="space-y-2 border-b border-border-subtle p-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o mensaje…"
              leading={<Icon icon={Search01Icon} size={14} />}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <Icon
                icon={FilterIcon}
                size={11}
                className="text-foreground-muted"
              />
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value || "all"}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                    status === opt.value
                      ? "border-foreground bg-foreground text-accent-foreground"
                      : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {SOURCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value || "all-src"}
                  type="button"
                  onClick={() => setSource(opt.value)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                    source === opt.value
                      ? "border-primary/40 bg-primary-soft/30 text-primary"
                      : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[88px] animate-pulse border-b border-border-subtle bg-surface-muted/30"
                />
              ))
            ) : leads.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
                  <Icon icon={Mail01Icon} size={20} />
                </div>
                <h3 className="mt-3 text-sm font-semibold">Bandeja vacía</h3>
                <p className="mt-1 text-[12px] text-foreground-muted">
                  Cuando alguien te contacte desde el escaparate público
                  aparecerá acá.
                </p>
              </div>
            ) : (
              leads.map((lead) => (
                <InboxItem
                  key={lead.id}
                  lead={lead}
                  active={lead.id === activeId}
                  onClick={() => setActiveId(lead.id)}
                />
              ))
            )}
          </div>
        </Card>

        {/* Conversación derecha */}
        <Card className="flex min-w-0 flex-1 flex-col overflow-hidden p-0">
          {activeLead ? (
            <ConversationPanel lead={activeLead} />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-surface-muted text-foreground-muted">
                  <Icon icon={Mail01Icon} size={24} />
                </div>
                <p className="mt-3 text-sm text-foreground-muted">
                  Selecciona una consulta para ver la conversación.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function InboxItem({
  lead,
  active,
  onClick,
}: {
  lead: Lead;
  active: boolean;
  onClick: () => void;
}) {
  const isNew = lead.status === "open";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full border-b border-border-subtle px-4 py-3 text-left transition-colors",
        active
          ? "bg-primary-soft/30"
          : "hover:bg-surface-muted/50",
      )}
    >
      <div className="flex items-start gap-2.5">
        {isNew && !active && (
          <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-info" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "truncate text-[13px]",
                isNew ? "font-bold" : "font-medium text-foreground-muted",
              )}
            >
              {lead.contact_name || "Consulta sin nombre"}
            </span>
            <span className="shrink-0 text-[10px] tabular-numbers text-foreground-muted">
              {formatRelative(lead.last_activity_at ?? lead.created_at)}
            </span>
          </div>
          {lead.property?.title && (
            <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-foreground-muted">
              <Icon icon={PropertyNewIcon} size={10} />
              {lead.property.title}
            </div>
          )}
          <p
            className={cn(
              "mt-1 line-clamp-2 text-[12px]",
              isNew ? "text-foreground" : "text-foreground-muted",
            )}
          >
            {lead.notes || "(sin mensaje)"}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            {lead.source && (
              <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-foreground-muted">
                {lead.source}
              </span>
            )}
            {lead.status !== "open" && (
              <Badge variant={STATUS_TONE[lead.status] ?? "neutral"}>
                {STATUS_LABEL[lead.status] ?? lead.status}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function ConversationPanel({ lead }: { lead: Lead }) {
  const { data, isLoading } = useLeadActivities(lead.id);
  const add = useAddLeadActivity(lead.id);
  const saveLead = useSaveLead(lead.id);
  const [reply, setReply] = useState("");

  const isInterested = (lead.probability_pct ?? 0) >= 50 || lead.status === "won";
  const activities = data?.data ?? [];

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
      await toast.promise(add.mutateAsync({ type: "message_out", body }), {
        loading: { title: "Enviando…" },
        success: { title: "Mensaje enviado" },
        error: (e: unknown) => ({
          title: "Error",
          description: e instanceof Error ? e.message : "",
        }),
      });
      setReply("");
    } catch {}
  };

  const toggleInterested = async () => {
    const next = isInterested ? 20 : 70;
    await toast.promise(
      saveLead.mutateAsync({ probability_pct: next } as Parameters<
        typeof saveLead.mutateAsync
      >[0]),
      {
        loading: { title: isInterested ? "Quitando…" : "Marcando…" },
        success: {
          title: isInterested
            ? "Movido a Consultas"
            : "Marcado como Interesado",
        },
        error: (e: unknown) => ({
          title: "Error",
          description: e instanceof Error ? e.message : "",
        }),
      },
    );
  };

  const phoneDigits = (lead.contact_phone ?? "").replace(/[^0-9]/g, "");

  return (
    <>
      {/* Header de la conversación */}
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-info-soft text-info">
              <Icon icon={UserCircleIcon} size={16} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">
                {lead.contact_name || "Consulta"}
              </h2>
              <p className="truncate text-[11px] text-foreground-muted">
                {lead.contact_email || lead.contact_phone || "Sin contacto"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {lead.contact_phone && phoneDigits && (
            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white hover:scale-110 transition-transform"
              title="WhatsApp"
            >
              <Icon icon={WhatsappIcon} size={13} />
            </a>
          )}
          {lead.contact_phone && (
            <a
              href={`tel:${lead.contact_phone}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-foreground hover:bg-surface-muted/70"
              title="Llamar"
            >
              <Icon icon={CallIcon} size={13} />
            </a>
          )}
          {lead.contact_email && (
            <a
              href={`mailto:${lead.contact_email}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-foreground hover:bg-surface-muted/70"
              title="Email"
            >
              <Icon icon={Mail01Icon} size={13} />
            </a>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleInterested}
            disabled={saveLead.isPending}
            className={cn(
              isInterested && "border-positive/40 bg-positive-soft/40 text-positive",
            )}
          >
            <Icon
              icon={isInterested ? CheckmarkCircle02Icon : StarIcon}
              size={11}
            />
            {isInterested ? "Interesado" : "Marcar interesado"}
          </Button>
        </div>
      </div>

      {/* Sub-header con datos de propiedad */}
      {lead.property && (
        <Link
          href={`/propiedades/${lead.property.id}`}
          className="flex items-center justify-between gap-3 border-b border-border-subtle bg-surface-muted/30 px-5 py-2.5 hover:bg-surface-muted/50"
        >
          <div className="flex items-center gap-2 text-[12px]">
            <Icon
              icon={PropertyNewIcon}
              size={12}
              className="text-foreground-muted"
            />
            <span className="text-foreground-muted">Sobre:</span>
            <strong className="text-foreground">{lead.property.title}</strong>
            <span className="font-mono text-foreground-muted">
              ({lead.property.code})
            </span>
          </div>
          <Icon
            icon={ArrowRight01Icon}
            size={11}
            className="text-foreground-muted"
          />
        </Link>
      )}

      {/* Mensajes */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-12 animate-pulse rounded-xl bg-surface-muted/40" />
            <div className="ml-12 h-12 animate-pulse rounded-xl bg-surface-muted/40" />
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
    </>
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
          isOut ? "bg-primary text-white" : "bg-surface-muted text-foreground",
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
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffMin < 1440) return `hace ${Math.floor(diffMin / 60)} h`;
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
