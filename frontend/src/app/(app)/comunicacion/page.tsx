"use client";

import { useEffect, useState } from "react";
import {
  Mail01Icon,
  Add01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ClockIcon,
  Cancel01Icon,
  Search01Icon,
  ZapIcon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import {
  useEmailTemplates,
  useSaveEmailTemplate,
  usePreviewEmail,
  useSendEmail,
  useEmailLogs,
  useSearchRecipients,
  type EmailTemplate,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export default function ComunicacionPage() {
  const { data, isLoading } = useEmailTemplates();
  const templates = data?.data ?? [];
  const tags = data?.available_tags ?? {};
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tab, setTab] = useState<"templates" | "logs">("templates");
  const [sending, setSending] = useState<EmailTemplate | null>(null);

  // Auto-select first template
  useEffect(() => {
    if (!selectedId && templates.length > 0) {
      setSelectedId(templates[0].id);
    }
  }, [templates, selectedId]);

  const selected = templates.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Icon icon={Mail01Icon} size={13} />
            Comunicación
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Plantillas de email
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Edita, vista previa y envía emails con merge tags. Cada envío queda
            registrado en el log.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={tab === "templates" ? "primary" : "outline"} onClick={() => setTab("templates")}>
            Plantillas
          </Button>
          <Button variant={tab === "logs" ? "primary" : "outline"} onClick={() => setTab("logs")}>
            Histórico
          </Button>
        </div>
      </div>

      {tab === "templates" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
          {/* Sidebar templates */}
          <Card className="overflow-hidden">
            <div className="border-b border-border-subtle px-4 py-3">
              <h3 className="text-sm font-semibold">Plantillas</h3>
              <p className="mt-0.5 text-[11px] text-foreground-muted">
                {templates.length} disponibles
              </p>
            </div>
            <ul className="max-h-[600px] overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="h-14 animate-pulse border-b border-border-subtle bg-surface-muted/30" />
                ))
              ) : (
                templates.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-border-subtle px-4 py-3 text-left transition-colors last:border-b-0",
                        selectedId === t.id
                          ? "bg-surface-muted"
                          : "hover:bg-surface-muted/50",
                      )}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info">
                        <Icon icon={Mail01Icon} size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{t.name}</div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {t.audience}
                          </Badge>
                          {t.is_system && (
                            <Badge variant="info" className="text-[10px]">
                              sistema
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </Card>

          {/* Editor + preview */}
          {selected ? (
            <TemplateEditor
              template={selected}
              tags={tags}
              onSend={() => setSending(selected)}
            />
          ) : (
            <Card className="flex h-96 items-center justify-center text-sm text-foreground-muted">
              Selecciona una plantilla
            </Card>
          )}
        </div>
      ) : (
        <LogsTab />
      )}

      <SendDialog
        template={sending}
        onClose={() => setSending(null)}
      />

      {/* Suprime warnings */}
      <span className="hidden">
        <Icon icon={Add01Icon} size={1} />
      </span>
    </div>
  );
}

// ============== Editor + preview ==============
function TemplateEditor({
  template,
  tags,
  onSend,
}: {
  template: EmailTemplate;
  tags: Record<string, string[]>;
  onSend: () => void;
}) {
  const save = useSaveEmailTemplate(template.id);
  const preview = usePreviewEmail();
  const [draft, setDraft] = useState(template);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(template);
  }, [template]);

  const update = <K extends keyof EmailTemplate>(key: K, value: EmailTemplate[K]) =>
    setDraft({ ...draft, [key]: value });

  const handleSave = async () => {
    await save.mutateAsync({
      name: draft.name,
      subject: draft.subject,
      body: draft.body,
      audience: draft.audience,
      is_active: draft.is_active,
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const insertTag = (tag: string) => {
    const ta = document.getElementById("body-textarea") as HTMLTextAreaElement;
    if (!ta) {
      update("body", draft.body + ` {{ ${tag} }}`);
      return;
    }
    const pos = ta.selectionStart;
    const before = draft.body.slice(0, pos);
    const after = draft.body.slice(pos);
    update("body", `${before}{{ ${tag} }}${after}`);
  };

  // Auto-preview con sample IDs (1) cuando cambia draft
  const renderedBody = preview.data?.body ?? draft.body;
  const renderedSubject = preview.data?.subject ?? draft.subject;

  useEffect(() => {
    const t = setTimeout(() => {
      preview.mutate({
        template_id: template.id,
        person_id: 1,
        contract_id: 1,
        charge_id: 1,
      });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id, draft.subject, draft.body]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* Editor */}
      <Card className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold">Editor</h3>
            <p className="mt-0.5 text-[11px] text-foreground-muted tabular-numbers">
              {template.code}
            </p>
          </div>
          <div className="flex gap-2">
            {savedFlash && (
              <span className="inline-flex items-center gap-1 text-[11px] text-positive">
                <Icon icon={CheckmarkCircle02Icon} size={11} />
                Guardado
              </span>
            )}
            <Button size="sm" variant="outline" onClick={onSend}>
              <Icon icon={Mail01Icon} size={13} />
              Enviar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={save.isPending}>
              {save.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Field label="Nombre">
            <Input value={draft.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Asunto">
            <Input value={draft.subject} onChange={(e) => update("subject", e.target.value)} />
          </Field>
          <Field label="Audiencia">
            <NativeSelect value={draft.audience} onChange={(e) => update("audience", e.target.value)}>
              <option value="tenant">Arrendatario</option>
              <option value="owner">Propietario</option>
              <option value="lead">Lead</option>
              <option value="internal">Interno</option>
            </NativeSelect>
          </Field>
          <Field label="Cuerpo (usa los tags al lado para insertar variables)">
            <Textarea
              id="body-textarea"
              rows={14}
              value={draft.body}
              onChange={(e) => update("body", e.target.value)}
            />
          </Field>
        </div>

        {/* Merge tags */}
        <div className="mt-4 border-t border-border-subtle pt-4">
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Variables disponibles (click para insertar)
          </h4>
          <div className="space-y-2">
            {Object.entries(tags).map(([group, items]) => (
              <div key={group}>
                <div className="text-[10px] font-medium text-muted-foreground">{group}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {items.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-foreground-muted hover:border-foreground/40 hover:text-foreground"
                    >
                      <Icon icon={Tag01Icon} size={9} />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card className="overflow-hidden">
        <div className="border-b border-border-subtle bg-surface-muted/40 px-5 py-3">
          <h3 className="text-sm font-semibold">Vista previa</h3>
          <p className="mt-0.5 text-[11px] text-foreground-muted">
            Renderizado con datos del primer contrato/cargo/persona como ejemplo.
          </p>
        </div>
        <div className="p-5">
          <div className="rounded-2xl border border-border-subtle bg-surface p-4">
            <div className="border-b border-border-subtle pb-3">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Asunto
              </div>
              <div className="mt-1 text-sm font-semibold">{renderedSubject}</div>
            </div>
            <div className="mt-3">
              <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {renderedBody}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============== Send dialog ==============
function SendDialog({
  template,
  onClose,
}: {
  template: EmailTemplate | null;
  onClose: () => void;
}) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [personId, setPersonId] = useState<number | null>(null);
  const [contractId, setContractId] = useState("");
  const [chargeId, setChargeId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentLogId, setSentLogId] = useState<number | null>(null);

  const recipients = useSearchRecipients(search);
  const send = useSendEmail();

  useEffect(() => {
    if (template) {
      setRecipientEmail("");
      setPersonId(null);
      setContractId("");
      setChargeId("");
      setSearch("");
      setError(null);
      setSentLogId(null);
    }
  }, [template]);

  if (!template) return null;

  const submit = async () => {
    setError(null);
    try {
      const r = await send.mutateAsync({
        template_id: template.id,
        recipient_email: recipientEmail,
        person_id: personId ?? undefined,
        contract_id: contractId ? Number(contractId) : undefined,
        charge_id: chargeId ? Number(chargeId) : undefined,
      });
      setSentLogId(r.log_id);
    } catch (e) {
      setError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((e as any).response?.data?.message as string | undefined) ??
          "Error al enviar.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Enviar email
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              {template.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
          >
            <Icon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        {sentLogId ? (
          <div className="mt-4 rounded-2xl border border-positive/20 bg-positive-soft p-3 text-xs text-positive">
            <div className="inline-flex items-center gap-1.5 font-semibold">
              <Icon icon={CheckmarkCircle02Icon} size={13} />
              Email enviado a Mailpit
            </div>
            <p className="mt-1 opacity-90">
              Log #{sentLogId}. Verifica en{" "}
              <a
                href="http://localhost:58025"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Mailpit
              </a>
              .
            </p>
            <button
              onClick={() => setSentLogId(null)}
              className="mt-2 text-[11px] underline opacity-70 hover:opacity-100"
            >
              Enviar otro
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              <Field label="Buscar destinatario">
                <Input
                  placeholder="nombre, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leading={<Icon icon={Search01Icon} size={14} />}
                />
              </Field>
              {recipients.data && recipients.data.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-2xl border border-border-subtle">
                  {recipients.data.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setPersonId(r.id);
                        setRecipientEmail(r.email);
                        setSearch("");
                      }}
                      className="flex w-full items-center gap-2 border-b border-border-subtle px-3 py-2 text-left text-xs hover:bg-surface-muted last:border-b-0"
                    >
                      <Avatar name={r.full_name} size="xs" />
                      <span className="flex-1 truncate">
                        <span className="block font-medium">{r.full_name}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {r.email}
                        </span>
                      </span>
                      <Badge variant="outline" className="text-[9px]">
                        {r.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
              <Field label="Email destino *">
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Contract ID">
                  <Input
                    type="number"
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    placeholder="opcional"
                  />
                </Field>
                <Field label="Charge ID">
                  <Input
                    type="number"
                    value={chargeId}
                    onChange={(e) => setChargeId(e.target.value)}
                    placeholder="opcional"
                  />
                </Field>
              </div>
              {error && (
                <div className="rounded-2xl border border-negative/20 bg-negative-soft p-2 text-[11px] text-negative">
                  {error}
                </div>
              )}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={submit}
                disabled={send.isPending || !recipientEmail}
              >
                <Icon icon={ZapIcon} size={13} />
                {send.isPending ? "Enviando..." : "Enviar ahora"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============== Logs tab ==============
function LogsTab() {
  const { data, isLoading } = useEmailLogs();
  const items = data?.data ?? [];

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
              <th className="h-11 px-6 text-left">Fecha</th>
              <th className="h-11 px-6 text-left">Plantilla</th>
              <th className="h-11 px-6 text-left">Destinatario</th>
              <th className="h-11 px-6 text-left">Asunto</th>
              <th className="h-11 px-6 text-left">Estado</th>
              <th className="h-11 px-6 text-left">Enviado por</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="h-12 px-6">
                    <div className="h-4 animate-pulse rounded bg-surface-muted" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-foreground-muted">
                  No hay envíos todavía.
                </td>
              </tr>
            ) : (
              items.map((l) => (
                <tr key={l.id} className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40">
                  <td className="h-12 px-6 text-xs tabular-numbers text-foreground-muted">
                    {new Date(l.created_at).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="h-12 px-6 text-xs">
                    {l.template?.name ?? <span className="opacity-50">—</span>}
                  </td>
                  <td className="h-12 px-6 text-xs tabular-numbers">
                    {l.recipient_email}
                  </td>
                  <td className="h-12 px-6 text-xs">
                    <span className="block max-w-xs truncate">{l.subject}</span>
                  </td>
                  <td className="h-12 px-6">
                    <Badge
                      variant={
                        l.status === "sent"
                          ? "positive"
                          : l.status === "queued"
                            ? "warning"
                            : "negative"
                      }
                      className="text-[10px]"
                    >
                      <Icon
                        icon={
                          l.status === "sent"
                            ? CheckmarkCircle02Icon
                            : l.status === "queued"
                              ? ClockIcon
                              : AlertCircleIcon
                        }
                        size={10}
                      />
                      {l.status === "sent" ? "Enviado" : l.status === "queued" ? "En cola" : "Falló"}
                    </Badge>
                  </td>
                  <td className="h-12 px-6 text-xs text-foreground-muted">
                    {l.sender?.name ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
