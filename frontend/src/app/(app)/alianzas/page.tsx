"use client";

import { useRef, useState } from "react";
import {
  Add01Icon,
  Building03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Edit02Icon,
  GiftIcon,
  ImageUpload01Icon,
  InstagramIcon,
  Link01Icon,
  CallIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import {
  useAlliances,
  useSaveAlliance,
  useDeleteAlliance,
  useUploadAllianceImage,
  type Alliance,
  type AllianceInput,
} from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";

type DraftAlliance = AllianceInput & { tempId?: string };

export default function AlianzasPage() {
  const { data: alliances = [], isLoading } = useAlliances();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const remove = useDeleteAlliance();
  const confirm = useConfirm();

  const handleDelete = async (id: number, name: string) => {
    const ok = await confirm({
      title: "¿Eliminar alianza?",
      description: `La empresa "${name}" se eliminará. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (ok) await remove.mutateAsync(id);
  };

  const editing =
    editingId === "new"
      ? null
      : (alliances.find((a) => a.id === editingId) ?? null);

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alianzas</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Empresas asociadas que ofrecen beneficios a tus clientes.
          </p>
        </div>
        <Button onClick={() => setEditingId("new")}>
          <Icon icon={Add01Icon} size={14} />
          Agregar alianza
        </Button>
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-28 animate-pulse bg-surface-muted/40" />
          ))
        ) : alliances.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
              <Icon icon={GiftIcon} size={20} />
            </div>
            <h3 className="mt-4 text-base font-semibold">Aún no hay alianzas</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Crea tu primera empresa aliada para ofrecer beneficios a tus
              clientes.
            </p>
            <Button className="mt-4" onClick={() => setEditingId("new")}>
              <Icon icon={Add01Icon} size={14} />
              Agregar alianza
            </Button>
          </Card>
        ) : (
          alliances.map((a) => (
            <AllianceRow
              key={a.id}
              alliance={a}
              onEdit={() => setEditingId(a.id)}
              onDelete={() => handleDelete(a.id, a.name)}
            />
          ))
        )}
      </div>

      {/* Drawer de edición */}
      {editingId !== null && (
        <AllianceFormDrawer
          alliance={editing}
          onClose={() => setEditingId(null)}
          onSaved={() => setEditingId(null)}
        />
      )}

    </div>
  );
}

function AllianceRow({
  alliance,
  onEdit,
  onDelete,
}: {
  alliance: Alliance;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex items-start gap-4 p-4">
      {/* Logo */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted">
        {alliance.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alliance.logo_url}
            alt={alliance.name}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          <Icon icon={Building03Icon} size={20} className="text-foreground-muted" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold">{alliance.name}</h3>
          {alliance.is_published ? (
            <Badge variant="positive">Activa</Badge>
          ) : (
            <Badge variant="neutral">Inactiva</Badge>
          )}
        </div>
        {alliance.description && (
          <p className="mt-0.5 line-clamp-1 text-[13px] text-foreground-muted">
            {alliance.description}
          </p>
        )}
        {alliance.benefit_title && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft/50 px-2.5 py-1 text-[11px] font-medium text-primary">
            <Icon icon={GiftIcon} size={11} />
            {alliance.benefit_title}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-foreground-muted">
          {alliance.phone && (
            <span className="inline-flex items-center gap-1">
              <Icon icon={CallIcon} size={11} />
              {alliance.phone}
            </span>
          )}
          {alliance.whatsapp && (
            <span className="inline-flex items-center gap-1">
              <Icon icon={WhatsappIcon} size={11} />
              {alliance.whatsapp}
            </span>
          )}
          {alliance.instagram && (
            <span className="inline-flex items-center gap-1">
              <Icon icon={InstagramIcon} size={11} />
              {alliance.instagram}
            </span>
          )}
          {alliance.website_url && (
            <a
              href={alliance.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <Icon icon={Link01Icon} size={11} />
              Sitio web
            </a>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Icon icon={Edit02Icon} size={13} />
          Editar
        </Button>
        <Button variant="destructive-outline" size="sm" onClick={onDelete}>
          <Icon icon={Delete02Icon} size={13} />
        </Button>
      </div>
    </Card>
  );
}

function AllianceFormDrawer({
  alliance,
  onClose,
  onSaved,
}: {
  alliance: Alliance | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = !!alliance;
  const save = useSaveAlliance(alliance?.id);
  const upload = useUploadAllianceImage();
  const logoInput = useRef<HTMLInputElement>(null);
  const benefitInput = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<DraftAlliance>(() => ({
    name: alliance?.name ?? "",
    logo_url: alliance?.logo_url ?? "",
    description: alliance?.description ?? "",
    benefit_title: alliance?.benefit_title ?? "",
    benefit_image_url: alliance?.benefit_image_url ?? "",
    benefit_detail: alliance?.benefit_detail ?? "",
    phone: alliance?.phone ?? "",
    whatsapp: alliance?.whatsapp ?? "",
    instagram: alliance?.instagram ?? "",
    website_url: alliance?.website_url ?? "",
    is_published: alliance?.is_published ?? true,
  }));

  const set = <K extends keyof DraftAlliance>(k: K, v: DraftAlliance[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    if (!draft.name?.trim()) return;
    const cleaned: AllianceInput = {};
    for (const [k, v] of Object.entries(draft)) {
      if (v === "" || v === undefined) continue;
      // @ts-expect-error indexed assign
      cleaned[k] = v;
    }
    await save.mutateAsync(cleaned);
    onSaved();
  };

  const handleUpload = async (
    file: File,
    kind: "logo" | "benefit",
  ) => {
    const r = await upload.mutateAsync({ file, kind });
    if (kind === "logo") set("logo_url", r.url);
    else set("benefit_image_url", r.url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-[640px] flex-col overflow-hidden bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {isEditing ? "Editar alianza" : "Nueva alianza"}
            </h2>
            <p className="text-xs text-foreground-muted">
              Empresa aliada y beneficio que ofrece a tus clientes
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
          >
            <Icon icon={Cancel01Icon} size={14} />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <SectionTitle>Empresa</SectionTitle>
          <Field label="Nombre de la empresa *">
            <Input
              value={draft.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej. Casa Top"
              maxLength={160}
            />
          </Field>

          <Field label="Logo" hint="Cuadrado, fondo transparente preferido">
            <ImagePicker
              url={draft.logo_url ?? ""}
              uploading={upload.isPending}
              onPick={() => logoInput.current?.click()}
              onClear={() => set("logo_url", "")}
            />
            <input
              ref={logoInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f, "logo");
                e.target.value = "";
              }}
            />
          </Field>

          <Field label="Descripción">
            <Textarea
              value={draft.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tu hogar a tu estilo"
              rows={2}
              maxLength={500}
            />
          </Field>

          <SectionTitle>Beneficio</SectionTitle>
          <Field label="Título del beneficio">
            <Input
              value={draft.benefit_title ?? ""}
              onChange={(e) => set("benefit_title", e.target.value)}
              placeholder="Beneficio exclusivo"
              maxLength={160}
            />
          </Field>

          <Field label="Imagen del beneficio">
            <ImagePicker
              url={draft.benefit_image_url ?? ""}
              uploading={upload.isPending}
              onPick={() => benefitInput.current?.click()}
              onClear={() => set("benefit_image_url", "")}
              wide
            />
            <input
              ref={benefitInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f, "benefit");
                e.target.value = "";
              }}
            />
          </Field>

          <Field label="Detalle del beneficio">
            <Textarea
              value={draft.benefit_detail ?? ""}
              onChange={(e) => set("benefit_detail", e.target.value)}
              placeholder="10% de descuento por asociación de Valencia Propiedades"
              rows={3}
              maxLength={5000}
            />
          </Field>

          <SectionTitle>Información de contacto</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Teléfono">
              <Input
                value={draft.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+56 9 3330 4614"
                leading={<Icon icon={CallIcon} size={13} />}
              />
            </Field>
            <Field label="WhatsApp">
              <Input
                value={draft.whatsapp ?? ""}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="56933304614"
                leading={<Icon icon={WhatsappIcon} size={13} />}
              />
            </Field>
            <Field label="Instagram">
              <Input
                value={draft.instagram ?? ""}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="@casatopcl"
                leading={<Icon icon={InstagramIcon} size={13} />}
              />
            </Field>
            <Field label="Sitio web">
              <Input
                type="url"
                value={draft.website_url ?? ""}
                onChange={(e) => set("website_url", e.target.value)}
                placeholder="https://casatop.cl"
                leading={<Icon icon={Link01Icon} size={13} />}
              />
            </Field>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface-muted/30 p-3">
            <input
              type="checkbox"
              id="alliance-published"
              checked={!!draft.is_published}
              onChange={(e) => set("is_published", e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-primary"
            />
            <label
              htmlFor="alliance-published"
              className="cursor-pointer text-[13px]"
            >
              Visible para los clientes (publicada)
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border-subtle bg-surface-muted/40 px-6 py-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} loading={save.isPending}>
            <Icon icon={CheckmarkCircle02Icon} size={14} />
            {isEditing ? "Guardar cambios" : "Crear alianza"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-0">
      {children}
    </h3>
  );
}

function ImagePicker({
  url,
  uploading,
  onPick,
  onClear,
  wide,
}: {
  url: string;
  uploading?: boolean;
  onPick: () => void;
  onClear: () => void;
  wide?: boolean;
}) {
  if (url) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border bg-surface-muted",
          wide ? "aspect-[16/9]" : "h-32 w-32",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="h-full w-full object-contain" />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="outline" size="sm" onClick={onPick}>
            Cambiar
          </Button>
          <Button variant="destructive-outline" size="sm" onClick={onClear}>
            <Icon icon={Delete02Icon} size={13} />
          </Button>
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-medium">
              Subiendo…
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-surface-muted/30 p-4 text-foreground-muted transition-colors hover:border-primary/40 hover:bg-primary-soft/10",
        wide ? "aspect-[16/9] w-full" : "h-32 w-32",
      )}
    >
      <Icon icon={ImageUpload01Icon} size={20} />
      <span className="text-[11px] font-medium">
        {uploading ? "Subiendo…" : "Subir imagen"}
      </span>
    </button>
  );
}
