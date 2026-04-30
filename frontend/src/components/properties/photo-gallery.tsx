"use client";

import { useEffect, useRef, useState } from "react";
import {
  CloudUploadIcon,
  Cancel01Icon,
  Delete02Icon,
  StarIcon,
  ImageUploadIcon,
  Exchange02Icon,
  DragDropIcon,
  ImageDone02Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  usePhotos,
  useUploadPhoto,
  useSetCoverPhoto,
  useDeleteDocument,
  useReorderPhotos,
  useReplacePhoto,
  useApplyWatermark,
  useApplyWatermarkAll,
  useAgencyWatermark,
  type Document,
} from "@/lib/queries";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface Props {
  propertyId: number;
  coverUrl: string | null;
}

export function PhotoGallery({ propertyId, coverUrl }: Props) {
  const { data, isLoading } = usePhotos(propertyId);
  const { data: wmData } = useAgencyWatermark();
  const upload = useUploadPhoto(propertyId);
  const setCover = useSetCoverPhoto(propertyId);
  const del = useDeleteDocument();
  const reorder = useReorderPhotos(propertyId);
  const replace = useReplacePhoto(propertyId);
  const watermark = useApplyWatermark(propertyId);
  const watermarkAll = useApplyWatermarkAll(propertyId);
  const confirm = useConfirm();

  const watermarkEnabled =
    wmData?.settings?.enabled === true && wmData?.settings?.manual_apply_enabled !== false;

  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<Document | null>(null);
  // Estado optimista para que el reorder se vea instantáneo
  const [order, setOrder] = useState<Document[]>([]);

  useEffect(() => {
    if (data) setOrder(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;

    await toast.promise(
      Promise.all(images.map((f) => upload.mutateAsync(f))),
      {
        loading: { title: `Subiendo ${images.length} foto${images.length > 1 ? "s" : ""}...` },
        success: { title: `${images.length} foto${images.length > 1 ? "s subidas" : " subida"}` },
        error: { title: "Error al subir" },
      },
    );
  };

  const handleReplaceSelect = (photoId: number) => {
    setReplaceTargetId(photoId);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (files: FileList | null) => {
    if (!files || !files[0] || !replaceTargetId) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const targetId = replaceTargetId;

    await toast.promise(
      replace.mutateAsync({ photoId: targetId, file }),
      {
        loading: { title: "Reemplazando..." },
        success: { title: "Foto reemplazada" },
        error: { title: "Error al reemplazar" },
      },
    );

    setReplaceTargetId(null);
    if (replaceInputRef.current) replaceInputRef.current.value = "";
  };

  const handleApplyWatermark = async (photoId: number) => {
    await toast.promise(watermark.mutateAsync(photoId), {
      loading: { title: "Aplicando marca de agua..." },
      success: { title: "Marca de agua aplicada" },
      error: (err: unknown) => ({
        title: "No se pudo aplicar",
        description: err instanceof Error ? err.message : "",
      }),
    });
  };

  const handleApplyWatermarkAll = async () => {
    const ok = await confirm({
      title: "¿Aplicar marca de agua a todas las fotos?",
      description:
        "Las fotos existentes (incluida la portada) se reprocesarán. Esto puede tardar unos segundos según la cantidad de fotos. La operación es irreversible — guarda las originales si las necesitás.",
      confirmLabel: "Aplicar a todas",
      danger: false,
    });
    if (!ok) return;

    await toast.promise(watermarkAll.mutateAsync(true), {
      loading: { title: "Procesando todas las fotos..." },
      success: (data) => ({
        title: "Marca de agua aplicada",
        description: `${data.applied} foto${data.applied === 1 ? "" : "s"} procesada${data.applied === 1 ? "" : "s"}${data.skipped ? `, ${data.skipped} omitida${data.skipped === 1 ? "" : "s"}` : ""}`,
      }),
      error: (err: unknown) => ({
        title: "No se pudo aplicar",
        description: err instanceof Error ? err.message : "",
      }),
    });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = order.findIndex((p) => p.id === active.id);
    const newIdx = order.findIndex((p) => p.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const next = arrayMove(order, oldIdx, newIdx);
    setOrder(next);
    reorder.mutate(next.map((p) => p.id));
  };

  const photos = order;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Galería de fotos</h3>
          <p className="text-xs text-foreground-muted">
            {photos.length} foto{photos.length !== 1 && "s"}.{" "}
            {photos.length > 1 && (
              <span className="inline-flex items-center gap-1">
                <Icon icon={DragDropIcon} size={11} />
                Arrastra para reordenar.
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {watermarkEnabled && photos.length > 0 && (
            <Button
              variant="outline"
              onClick={handleApplyWatermarkAll}
              loading={watermarkAll.isPending}
              title="Aplicar la marca de agua actual a TODAS las fotos (útil para fotos viejas)"
            >
              <Icon icon={ImageDone02Icon} size={14} />
              Aplicar marca a todas
            </Button>
          )}
          <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
            <Icon icon={CloudUploadIcon} size={14} />
            {upload.isPending ? "Subiendo..." : "Añadir foto"}
          </Button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleReplaceFile(e.target.files)}
      />

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-3xl border-2 border-dashed p-3 transition-colors",
          dragOver
            ? "border-foreground/50 bg-surface-muted/40"
            : photos.length === 0
              ? "border-border bg-surface-muted/20"
              : "border-transparent",
        )}
      >
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-surface-muted/50"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
              <Icon icon={ImageUploadIcon} size={20} />
            </div>
            <h3 className="mt-3 text-sm font-semibold">Aún no hay fotos</h3>
            <p className="mt-1 text-xs text-foreground-muted">
              Arrastra varias imágenes aquí o usa el botón de arriba.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((p, i) => (
                  <SortablePhoto
                    key={p.id}
                    photo={p}
                    index={i + 1}
                    isCover={coverUrl === p.url}
                    onZoom={() => setLightbox(p)}
                    onSetCover={() => {
                      setCover.mutate(p.id);
                      toast.success("Foto marcada como portada");
                    }}
                    onReplace={() => handleReplaceSelect(p.id)}
                    onApplyWatermark={
                      watermarkEnabled
                        ? () => handleApplyWatermark(p.id)
                        : undefined
                    }
                    onDelete={async () => {
                      const ok = await confirm({
                        title: "¿Eliminar esta foto?",
                        description: "Esta acción no se puede deshacer.",
                        confirmLabel: "Eliminar",
                        danger: true,
                      });
                      if (ok) {
                        del.mutate(p.id);
                        toast.success("Foto eliminada");
                      }
                    }}
                    isReplacing={replace.isPending && replaceTargetId === p.id}
                    isApplyingWatermark={
                      watermark.isPending &&
                      watermark.variables === p.id
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-6"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt={lightbox.name}
            className="max-h-[90vh] max-w-full rounded-2xl object-contain"
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground hover:bg-surface-muted"
            aria-label="Cerrar"
          >
            <Icon icon={Cancel01Icon} size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

function SortablePhoto({
  photo: p,
  index,
  isCover,
  onZoom,
  onSetCover,
  onReplace,
  onApplyWatermark,
  onDelete,
  isReplacing,
  isApplyingWatermark,
}: {
  photo: Document;
  index: number;
  isCover: boolean;
  onZoom: () => void;
  onSetCover: () => void;
  onReplace: () => void;
  onApplyWatermark?: () => void;
  onDelete: () => void;
  isReplacing: boolean;
  isApplyingWatermark?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: p.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-2xl border bg-surface-muted",
        isCover ? "border-foreground" : "border-border",
        isDragging && "z-20 opacity-90 shadow-image scale-[1.02]",
      )}
    >
      {/* Drag handle (cubre toda la imagen excepto las acciones) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={p.url}
        alt={p.name}
        className={cn(
          "h-full w-full object-cover transition-transform group-hover:scale-105",
          isReplacing && "opacity-40",
        )}
        onDoubleClick={onZoom}
        {...attributes}
        {...listeners}
      />

      {/* Loading overlay durante replace o aplicación de watermark */}
      {(isReplacing || isApplyingWatermark) && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[11px] font-medium shadow-card">
            <Icon icon={ZapIcon} size={11} />
            {isApplyingWatermark ? "Aplicando marca..." : "Reemplazando..."}
          </div>
        </div>
      )}

      {/* Index pill (orden) */}
      <span className="absolute left-2 top-2 z-10 inline-flex items-center justify-center rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold tabular-numbers text-white backdrop-blur">
        {index}
      </span>

      {/* Cover badge */}
      {isCover && (
        <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
          <Icon icon={StarIcon} size={10} />
          Portada
        </span>
      )}

      {/* Acciones flotantes */}
      <div className="absolute inset-x-2 bottom-2 z-10 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!isCover && (
          <ActionBtn
            icon={StarIcon}
            label="Portada"
            onClick={onSetCover}
            title="Marcar como portada"
            withLabel
          />
        )}
        <ActionBtn
          icon={Exchange02Icon}
          onClick={onReplace}
          title="Reemplazar imagen"
          aria-label="Reemplazar"
        />
        {onApplyWatermark && (
          <ActionBtn
            icon={ImageDone02Icon}
            onClick={onApplyWatermark}
            title="Aplicar marca de agua"
            aria-label="Aplicar marca de agua"
          />
        )}
        <ActionBtn
          icon={Delete02Icon}
          onClick={onDelete}
          title="Eliminar"
          tone="danger"
          aria-label="Eliminar"
        />
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  title,
  tone,
  withLabel,
  ...rest
}: {
  icon: Parameters<typeof Icon>[0]["icon"];
  label?: string;
  onClick: () => void;
  title: string;
  tone?: "danger";
  withLabel?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full bg-surface text-foreground shadow-card transition-colors",
        withLabel ? "px-2 text-[10px] font-medium" : "w-7 justify-center",
        tone === "danger"
          ? "hover:bg-negative-soft hover:text-negative"
          : "hover:bg-surface-muted",
      )}
      title={title}
      {...rest}
    >
      <Icon icon={icon} size={11} />
      {withLabel && label}
    </button>
  );
}
