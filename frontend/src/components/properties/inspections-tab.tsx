"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Add01Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Delete02Icon,
  KeyIcon,
  TaskDone02Icon,
  WrenchIcon,
  InspectCodeIcon,
  Note02Icon,
  ImageUploadIcon,
  CloudUploadIcon,
  UserIcon,
  ZapIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Edit02Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerPopup,
  DrawerHeader,
  DrawerTitle,
  DrawerPanel,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  usePropertyInspections,
  useCreateInspection,
  useUpdateInspection,
  useDeleteInspection,
  useUploadInspectionPhoto,
  useUpdateInspectionPhoto,
  useDeleteInspectionPhoto,
  type PropertyInspection,
  type InspectionType,
  type InspectionCondition,
  type InspectionPhoto,
} from "@/lib/queries";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface Props {
  propertyId: number;
  contractId?: number | null;
}

const TYPE_META: Record<
  InspectionType,
  {
    label: string;
    short: string;
    icon: IconSvgElement;
    tone: "info" | "positive" | "warning" | "negative" | "neutral";
  }
> = {
  entrega: { label: "Entrega al arrendatario", short: "Entrega", icon: KeyIcon, tone: "info" },
  recepcion: { label: "Recepción del inmueble", short: "Recepción", icon: TaskDone02Icon, tone: "positive" },
  inspeccion: { label: "Inspección periódica", short: "Inspección", icon: InspectCodeIcon, tone: "neutral" },
  devolucion: { label: "Devolución / salida", short: "Devolución", icon: TaskDone02Icon, tone: "warning" },
  reparacion: { label: "Reparación / daños", short: "Reparación", icon: WrenchIcon, tone: "negative" },
  otro: { label: "Otro", short: "Otro", icon: Note02Icon, tone: "neutral" },
};

const CONDITION_LABEL: Record<InspectionCondition, string> = {
  excelente: "Excelente",
  bueno: "Bueno",
  regular: "Regular",
  malo: "Malo",
};

const CONDITION_TONE: Record<
  InspectionCondition,
  "positive" | "info" | "warning" | "negative"
> = {
  excelente: "positive",
  bueno: "info",
  regular: "warning",
  malo: "negative",
};

// Tags rápidos para clasificar fotos dentro de una acta
const PHOTO_TAGS = [
  "general",
  "cocina",
  "baño",
  "dormitorio",
  "living",
  "fachada",
  "balcón",
  "estacionamiento",
  "bodega",
  "medidor",
  "daño",
  "llaves",
];

export function InspectionsTab({ propertyId, contractId }: Props) {
  const { data: inspections = [], isLoading } = usePropertyInspections(propertyId);
  const [editing, setEditing] = useState<PropertyInspection | "new" | null>(null);
  const del = useDeleteInspection();

  // Cuando la lista refresca, mantengo el editing apuntando al objeto fresco
  // (necesario para que la galería se actualice al subir/editar fotos sin
  // que el usuario tenga que cerrar y abrir el drawer).
  const editingFresh = useMemo(() => {
    if (editing === null || editing === "new") return editing;
    const fresh = inspections.find((i) => i.id === editing.id);
    return fresh ?? editing;
  }, [editing, inspections]);

  const handleDelete = async (i: PropertyInspection) => {
    const ok = await toast.confirm({
      title: `¿Eliminar acta?`,
      description: `${i.title} — ${new Date(i.inspection_date).toLocaleDateString("es-CL")}. Las fotos también se borrarán.`,
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!ok) return;
    await toast.promise(del.mutateAsync(i.id), {
      loading: { title: "Eliminando..." },
      success: { title: "Acta eliminada" },
      error: { title: "No se pudo eliminar" },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header con botón crear */}
      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            Actas de inspección
          </h3>
          <p className="mt-1 text-xs text-foreground-muted">
            Respaldá el estado del inmueble en cada hito: entrega, inspecciones
            periódicas, devolución, reparaciones. Subí fotos con descripciones
            como evidencia.
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>
          <Icon icon={Add01Icon} size={14} />
          Nueva acta
        </Button>
      </Card>

      {/* Lista */}
      {isLoading ? (
        <Card className="h-32 animate-pulse bg-surface-muted/50" />
      ) : inspections.length === 0 ? (
        <Card className="p-10 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
            <Icon icon={InspectCodeIcon} size={20} />
          </span>
          <p className="text-sm font-medium">Sin actas todavía</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-foreground-muted">
            Cuando entregás el departamento al arrendatario, registrá una acta
            con fotos y firmas. Te servirá de respaldo para la devolución.
          </p>
          <Button className="mt-5" onClick={() => setEditing("new")}>
            <Icon icon={Add01Icon} size={14} />
            Crear primera acta
          </Button>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {inspections.map((i) => (
            <InspectionCard
              key={i.id}
              inspection={i}
              onView={() => setEditing(i)}
              onDelete={() => handleDelete(i)}
            />
          ))}
        </ul>
      )}

      {/* Drawer */}
      <Drawer
        position="right"
        open={editingFresh !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DrawerPopup>
          <DrawerPanel className="flex h-full w-full max-w-[720px] flex-col">
            {editingFresh && (
              <InspectionForm
                key={editingFresh === "new" ? "new" : `edit-${editingFresh.id}`}
                propertyId={propertyId}
                contractId={contractId ?? null}
                inspection={editingFresh === "new" ? null : editingFresh}
                onClose={() => setEditing(null)}
                onCreated={(created) => setEditing(created)}
              />
            )}
          </DrawerPanel>
        </DrawerPopup>
      </Drawer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card cover gallery — Airbnb-style asymmetric grid
// ─────────────────────────────────────────────────────────────────────────────

function CoverGallery({ photos }: { photos: InspectionPhoto[] }) {
  const HEIGHT = "h-52"; // slightly taller para que las thumbs no queden minúsculas

  if (photos.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-muted/40 text-foreground-muted",
          "h-32",
        )}
      >
        <Icon icon={ImageUploadIcon} size={18} />
        <span className="ml-2 text-xs">Sin fotos</span>
      </div>
    );
  }

  // 1 foto → full bleed
  if (photos.length === 1) {
    return (
      <div className={cn("relative overflow-hidden bg-surface-muted", HEIGHT)}>
        <PhotoImg p={photos[0]} className="h-full w-full object-cover" />
      </div>
    );
  }

  // 2 fotos → split 50/50
  if (photos.length === 2) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-0.5 overflow-hidden bg-surface-muted",
          HEIGHT,
        )}
      >
        <PhotoImg p={photos[0]} className="h-full w-full object-cover" />
        <PhotoImg p={photos[1]} className="h-full w-full object-cover" />
      </div>
    );
  }

  // 3 fotos → hero izquierda 60% + 2 stacked derecha (transición elegante hacia
  // el layout completo)
  if (photos.length === 3) {
    return (
      <div
        className={cn(
          "grid grid-cols-[1.5fr_1fr] gap-0.5 overflow-hidden bg-surface-muted",
          HEIGHT,
        )}
      >
        <PhotoImg p={photos[0]} className="h-full w-full object-cover" />
        <div className="grid grid-rows-2 gap-0.5">
          <PhotoImg p={photos[1]} className="h-full w-full object-cover" />
          <PhotoImg p={photos[2]} className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  // 4+ fotos → hero izquierda + 2×2 grid derecha (estilo Airbnb)
  // Visibles: 1 hero + 4 thumbnails = 5 fotos. Si hay >5, overlay "+N más" sobre la última.
  const remaining = photos.length - 5;
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-0.5 overflow-hidden bg-surface-muted",
        HEIGHT,
      )}
    >
      <PhotoImg p={photos[0]} className="h-full w-full object-cover" />
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
        <PhotoImg p={photos[1]} className="h-full w-full object-cover" />
        <PhotoImg p={photos[2]} className="h-full w-full object-cover" />
        <PhotoImg p={photos[3]} className="h-full w-full object-cover" />
        <div className="relative">
          {photos[4] ? (
            <PhotoImg
              p={photos[4]}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-surface-muted" />
          )}
          {remaining > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px] text-white">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold tabular-numbers backdrop-blur">
                +{remaining} más
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PhotoImg({
  p,
  className,
}: {
  p: InspectionPhoto;
  className?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={p.url} alt={p.description ?? p.name} className={className} />;
}

function InspectionCard({
  inspection: i,
  onView,
  onDelete,
}: {
  inspection: PropertyInspection;
  onView: () => void;
  onDelete: () => void;
}) {
  const meta = TYPE_META[i.type] ?? TYPE_META.otro;
  const fullySigned = i.signed_by_tenant && i.signed_by_landlord;

  return (
    <li>
      <Card
        onClick={onView}
        className={cn(
          "group cursor-pointer overflow-hidden p-0 transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.18)]",
        )}
      >
        <CoverGallery photos={i.photos} />

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={meta.tone}>
                  <Icon icon={meta.icon} size={10} />
                  {meta.short}
                </Badge>
                {i.condition && (
                  <Badge variant={CONDITION_TONE[i.condition]}>
                    {CONDITION_LABEL[i.condition]}
                  </Badge>
                )}
                {fullySigned && (
                  <Badge variant="positive">
                    <Icon icon={CheckmarkCircle02Icon} size={10} />
                    Firmada
                  </Badge>
                )}
              </div>
              <h4 className="mt-2 truncate text-[14px] font-semibold tracking-tight">
                {i.title}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-foreground-muted">
                <span className="inline-flex items-center gap-1">
                  <Icon icon={Calendar01Icon} size={11} />
                  {new Date(i.inspection_date).toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {i.inspector_name && (
                  <span className="inline-flex items-center gap-1">
                    <Icon icon={UserIcon} size={11} />
                    {i.inspector_name}
                  </span>
                )}
                <span>
                  {i.photos_count} foto{i.photos_count === 1 ? "" : "s"}
                </span>
              </div>
              {i.description && (
                <p className="mt-2 line-clamp-2 text-[12px] text-foreground-muted">
                  {i.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="shrink-0 rounded-full p-1.5 text-foreground-muted opacity-0 transition-all hover:bg-negative-soft hover:text-negative group-hover:opacity-100"
              aria-label="Eliminar"
            >
              <Icon icon={Delete02Icon} size={14} />
            </button>
          </div>
        </div>
      </Card>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inspection form drawer (header inline, not using DrawerHeader/Title)
// ─────────────────────────────────────────────────────────────────────────────

function InspectionForm({
  propertyId,
  contractId,
  inspection,
  onClose,
  onCreated,
}: {
  propertyId: number;
  contractId: number | null;
  inspection: PropertyInspection | null;
  onClose: () => void;
  onCreated: (i: PropertyInspection) => void;
}) {
  const isEdit = !!inspection;
  const create = useCreateInspection(propertyId);
  const update = useUpdateInspection();

  const [type, setType] = useState<InspectionType>(inspection?.type ?? "entrega");
  const [title, setTitle] = useState(inspection?.title ?? "");
  const [description, setDescription] = useState(inspection?.description ?? "");
  const [inspectionDate, setInspectionDate] = useState(
    inspection?.inspection_date ?? new Date().toISOString().slice(0, 10),
  );
  const [inspectorName, setInspectorName] = useState(inspection?.inspector_name ?? "");
  const [condition, setCondition] = useState<InspectionCondition | "">(
    inspection?.condition ?? "",
  );
  const [signedTenant, setSignedTenant] = useState(inspection?.signed_by_tenant ?? false);
  const [signedLandlord, setSignedLandlord] = useState(inspection?.signed_by_landlord ?? false);

  const canSubmit = useMemo(
    () => title.trim().length >= 3 && inspectionDate,
    [title, inspectionDate],
  );

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Completá título y fecha");
      return;
    }

    if (isEdit && inspection) {
      await toast.promise(
        update.mutateAsync({
          id: inspection.id,
          type,
          title: title.trim(),
          description: description.trim() || null,
          inspection_date: inspectionDate,
          inspector_name: inspectorName.trim() || null,
          condition: (condition || null) as InspectionCondition | null,
          signed_by_tenant: signedTenant,
          signed_by_landlord: signedLandlord,
        }),
        {
          loading: { title: "Guardando..." },
          success: { title: "Acta actualizada" },
          error: { title: "No se pudo guardar" },
        },
      );
    } else {
      try {
        const created = await toast.promise(
          create.mutateAsync({
            type,
            title: title.trim(),
            description: description.trim() || null,
            inspection_date: inspectionDate,
            inspector_name: inspectorName.trim() || null,
            condition: (condition || null) as InspectionCondition | null,
            contract_id: contractId,
          }),
          {
            loading: { title: "Creando acta..." },
            success: { title: "Acta creada — ahora subí las fotos" },
            error: { title: "No se pudo crear" },
          },
        );
        if (created) onCreated(created);
      } catch {
        // toast ya muestra el error
      }
    }
  };

  const meta = TYPE_META[type];

  return (
    <>
      {/* Header custom — más compacto que DrawerHeader y con icono */}
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-6 py-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              "bg-primary-soft text-primary",
            )}
          >
            <Icon icon={meta.icon} size={16} />
          </span>
          <div>
            <DrawerTitle className="text-[15px] font-semibold leading-tight">
              {isEdit ? title || "Editar acta" : "Nueva acta"}
            </DrawerTitle>
            <p className="text-[11px] text-foreground-muted">
              {isEdit
                ? `${meta.label} · ${inspection!.photos_count} foto${inspection!.photos_count === 1 ? "" : "s"}`
                : meta.label}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
          aria-label="Cerrar"
        >
          <Icon icon={Cancel01Icon} size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* Tipo */}
        <Field label="Tipo de acta">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.keys(TYPE_META) as InspectionType[]).map((k) => {
              const m = TYPE_META[k];
              const active = type === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setType(k)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all",
                    active
                      ? "border-foreground bg-foreground text-accent-foreground"
                      : "border-border bg-surface text-foreground-muted hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  <Icon icon={m.icon} size={13} />
                  <span className="truncate">{m.short}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Título" required>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Entrega depto Ñuñoa — María González"
            maxLength={200}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha" required>
            <Input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
            />
          </Field>
          <Field label="Estado del inmueble">
            <NativeSelect
              value={condition}
              onChange={(e) =>
                setCondition(e.target.value as InspectionCondition | "")
              }
            >
              <option value="">— sin definir —</option>
              {(Object.keys(CONDITION_LABEL) as InspectionCondition[]).map((k) => (
                <option key={k} value={k}>
                  {CONDITION_LABEL[k]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <Field label="Quién inspeccionó (opcional)">
          <Input
            value={inspectorName}
            onChange={(e) => setInspectorName(e.target.value)}
            placeholder="Nombre del corredor, del propietario, etc."
            maxLength={160}
          />
        </Field>

        <Field label="Descripción / observaciones generales">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles del estado, llaves entregadas, lecturas de medidores, observaciones generales..."
            rows={4}
            maxLength={5000}
          />
        </Field>

        {isEdit && (
          <Field label="Firmas">
            <div className="space-y-2">
              <SignToggle
                label="Firmada por el arrendatario"
                value={signedTenant}
                onChange={setSignedTenant}
                signedAt={inspection?.tenant_signed_at}
              />
              <SignToggle
                label="Firmada por el propietario / corredor"
                value={signedLandlord}
                onChange={setSignedLandlord}
                signedAt={inspection?.landlord_signed_at}
              />
            </div>
          </Field>
        )}

        {/* Galería editable — sólo en edición */}
        {isEdit && inspection && (
          <Field label={`Fotos del estado (${inspection.photos.length})`}>
            <PhotoGallery inspection={inspection} />
          </Field>
        )}

        {!isEdit && (
          <Card className="flex items-start gap-3 border-info/20 bg-info-soft/40 p-4">
            <Icon
              icon={ZapIcon}
              size={16}
              className="mt-0.5 shrink-0 text-info"
            />
            <p className="text-[12px] text-info">
              Guardá la acta primero. Después podrás subir fotos con
              descripción individual y registrar firmas.
            </p>
          </Card>
        )}
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>
          {isEdit ? "Cerrar" : "Cancelar"}
        </Button>
        <Button
          onClick={handleSubmit}
          loading={create.isPending || update.isPending}
          disabled={!canSubmit}
        >
          {isEdit ? "Guardar cambios" : "Crear y subir fotos"}
        </Button>
      </DrawerFooter>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground-muted">
        {label}
        {required && <span className="ml-0.5 text-negative">*</span>}
      </div>
      {children}
    </label>
  );
}

function SignToggle({
  label,
  value,
  onChange,
  signedAt,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  signedAt: string | null | undefined;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-[13px] transition-all",
        value
          ? "border-positive/30 bg-positive-soft/40 text-positive"
          : "border-border bg-surface text-foreground hover:border-foreground/30",
      )}
    >
      <span className="flex items-center gap-2">
        <Icon
          icon={value ? CheckmarkCircle02Icon : Cancel01Icon}
          size={14}
          className={value ? "text-positive" : "text-foreground-muted"}
        />
        <span className="font-medium">{label}</span>
      </span>
      {value && signedAt && (
        <span className="text-[10px] tabular-numbers text-foreground-muted">
          {new Date(signedAt).toLocaleDateString("es-CL")}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Photo gallery (drawer): grid + upload + click → lightbox/editor
// ─────────────────────────────────────────────────────────────────────────────

function PhotoGallery({ inspection }: { inspection: PropertyInspection }) {
  const upload = useUploadInspectionPhoto(inspection.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      toast.error("Sólo se aceptan imágenes");
      return;
    }
    await toast.promise(
      Promise.all(images.map((file) => upload.mutateAsync({ file }))),
      {
        loading: {
          title: `Subiendo ${images.length} foto${images.length > 1 ? "s" : ""}...`,
        },
        success: { title: "Fotos subidas — agregales descripción al hacer click" },
        error: { title: "Error al subir" },
      },
    );
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-muted/30 py-5 text-[12px] text-foreground-muted transition-colors hover:border-foreground/30 hover:bg-surface-muted hover:text-foreground"
      >
        <Icon icon={CloudUploadIcon} size={16} />
        Subir fotos · podés seleccionar varias (PNG, JPG · 10MB c/u)
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {inspection.photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {inspection.photos.map((p, idx) => (
            <PhotoTile
              key={p.id}
              photo={p}
              onClick={() => setActiveIdx(idx)}
            />
          ))}
        </ul>
      )}

      {/* Lightbox/editor */}
      {activeIdx !== null && inspection.photos[activeIdx] && (
        <Lightbox
          photos={inspection.photos}
          startIdx={activeIdx}
          onClose={() => setActiveIdx(null)}
        />
      )}
    </div>
  );
}

function PhotoTile({
  photo,
  onClick,
}: {
  photo: InspectionPhoto;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface-muted text-left transition-all hover:border-foreground/30"
      >
        <PhotoImg p={photo} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />

        {/* Overlay gradient + meta */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/75 via-black/35 to-transparent p-2.5">
          <div className="min-w-0 flex-1">
            {photo.tag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-foreground">
                <Icon icon={Tag01Icon} size={8} />
                {photo.tag}
              </span>
            )}
            {photo.description ? (
              <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-tight text-white">
                {photo.description}
              </p>
            ) : (
              <p className="mt-1 text-[10px] italic text-white/65">
                Sin descripción · click para editar
              </p>
            )}
          </div>
        </div>

        {/* Edit hint icon */}
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Icon icon={Edit02Icon} size={11} />
        </span>
      </button>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox (fullscreen viewer + per-photo editor)
// ─────────────────────────────────────────────────────────────────────────────

function Lightbox({
  photos,
  startIdx,
  onClose,
}: {
  photos: InspectionPhoto[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);

  // Si la lista refresca (nueva foto, edit), reanclar idx al objeto correcto
  const photo = photos[idx];
  if (!photo) {
    onClose();
    return null;
  }

  const goPrev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const goNext = () => setIdx((i) => (i + 1) % photos.length);

  // Atajos teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-[1280px] flex-col gap-3 p-4 lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image area */}
        <div className="relative flex flex-1 items-center justify-center">
          <PhotoImg
            p={photo}
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
          />

          {/* Prev/Next */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
                aria-label="Anterior"
              >
                <Icon icon={ArrowLeft01Icon} size={16} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
                aria-label="Siguiente"
              >
                <Icon icon={ArrowRight01Icon} size={16} />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium tabular-numbers text-white backdrop-blur">
            {idx + 1} / {photos.length}
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80 lg:hidden"
            aria-label="Cerrar"
          >
            <Icon icon={Cancel01Icon} size={14} />
          </button>
        </div>

        {/* Editor sidebar */}
        <div className="w-full shrink-0 lg:w-[340px]">
          <PhotoEditor photo={photo} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

function PhotoEditor({
  photo,
  onClose,
}: {
  photo: InspectionPhoto;
  onClose: () => void;
}) {
  const update = useUpdateInspectionPhoto();
  const del = useDeleteInspectionPhoto();

  const [description, setDescription] = useState(photo.description ?? "");
  const [note, setNote] = useState(photo.note ?? "");
  const [tag, setTag] = useState(photo.tag ?? "");

  // Cuando cambia la foto activa (nav prev/next), reset locales
  useEffect(() => {
    setDescription(photo.description ?? "");
    setNote(photo.note ?? "");
    setTag(photo.tag ?? "");
  }, [photo.id, photo.description, photo.note, photo.tag]);

  // Auto-save con debounce de 800ms
  useEffect(() => {
    const handler = setTimeout(() => {
      const dirty =
        description !== (photo.description ?? "") ||
        note !== (photo.note ?? "") ||
        tag !== (photo.tag ?? "");
      if (!dirty) return;
      update.mutate({
        mediaId: photo.id,
        description: description || null,
        note: note || null,
        tag: tag || null,
      });
    }, 800);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, note, tag]);

  const handleDelete = async () => {
    const ok = await toast.confirm({
      title: "¿Eliminar esta foto?",
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!ok) return;
    await toast.promise(del.mutateAsync(photo.id), {
      loading: { title: "Eliminando..." },
      success: { title: "Foto eliminada" },
      error: { title: "Error" },
    });
    onClose();
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-surface p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-semibold tracking-tight">
          Detalles de la foto
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-muted"
          aria-label="Cerrar"
        >
          <Icon icon={Cancel01Icon} size={14} />
        </button>
      </div>

      <Field label="Tag">
        <NativeSelect
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="text-[13px]"
        >
          <option value="">— sin tag —</option>
          {PHOTO_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <Field label="Descripción">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Qué se ve en esta foto? Ej: Mancha en muro del living, esquina sur"
          rows={3}
          maxLength={500}
        />
      </Field>

      <Field label="Nota interna">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Para vos / tu equipo. No la verá el arrendatario."
          rows={2}
          maxLength={500}
        />
      </Field>

      <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-3 text-[11px] text-foreground-muted">
        <span>
          {update.isPending ? "Guardando..." : "Guardado automático"}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-negative hover:bg-negative-soft"
        >
          <Icon icon={Delete02Icon} size={11} />
          Eliminar foto
        </button>
      </div>
    </div>
  );
}
