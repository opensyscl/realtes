"use client";

import { useRef, useState } from "react";
import {
  CloudUploadIcon,
  Cancel01Icon,
  File02Icon,
  Delete02Icon,
  Download01Icon,
  ImageUploadIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Icon } from "@/components/ui/icon";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  type Document,
} from "@/lib/queries";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type Owner = "properties" | "contracts";

interface Props {
  owner: Owner;
  ownerId: number;
}

const CATEGORIES = [
  "contrato",
  "identidad",
  "nomina",
  "aval",
  "inventario",
  "reglamento",
  "cedula_habitabilidad",
  "certificado_energetico",
  "planos",
  "foto",
  "factura",
  "otros",
];

const MAX_BYTES = 10 * 1024 * 1024; // 10MB (debe coincidir con backend)

export function DocumentDropZone({ owner, ownerId }: Props) {
  const { data, isLoading } = useDocuments(owner, ownerId);
  const upload = useUploadDocument(owner, ownerId);
  const del = useDeleteDocument();
  const confirm = useConfirm();

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<File[]>([]);
  const [category, setCategory] = useState<string>("otros");
  const [description, setDescription] = useState<string>("");

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted: File[] = [];
    const rejected: string[] = [];
    Array.from(files).forEach((f) => {
      if (f.size > MAX_BYTES) rejected.push(f.name);
      else accepted.push(f);
    });
    if (rejected.length) {
      toast.error({
        title: `${rejected.length} archivo(s) demasiado grandes`,
        description: `Máximo 10MB · ${rejected.join(", ")}`,
      });
    }
    if (accepted.length) setPending((prev) => [...prev, ...accepted]);
  };

  const removePending = (idx: number) => {
    setPending((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitUpload = async () => {
    if (pending.length === 0) return;
    const files = pending;
    const cat = category;
    const desc = description.trim();

    try {
      await toast.promise(
        Promise.all(
          files.map((file) =>
            upload.mutateAsync({
              file,
              category: cat,
              description: desc || undefined,
            }),
          ),
        ),
        {
          loading: {
            title: `Subiendo ${files.length} documento${files.length > 1 ? "s" : ""}...`,
          },
          success: {
            title:
              files.length === 1
                ? "Documento subido"
                : `${files.length} documentos subidos`,
          },
          error: { title: "Error al subir el documento" },
        },
      );

      setPending([]);
      setDescription("");
      setCategory("otros");
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      // toast.promise ya muestra el error; no re-lanzamos para no
      // tirar un unhandled rejection en consola.
    }
  };

  const handleDelete = async (doc: Document) => {
    const ok = await confirm({
      title: "¿Eliminar documento?",
      description: `${doc.name} se borrará de la propiedad y del almacenamiento.`,
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!ok) return;

    await toast.promise(del.mutateAsync(doc.id), {
      loading: { title: "Eliminando..." },
      success: { title: "Documento eliminado" },
      error: { title: "No se pudo eliminar" },
    });
  };

  const docs = data ?? [];

  return (
    <div className="space-y-4">
      {/* Drop zone */}
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
          "rounded-3xl border-2 border-dashed bg-surface-muted/30 p-6 text-center transition-colors",
          dragOver
            ? "border-foreground/50 bg-surface-muted"
            : "border-border hover:border-foreground/30",
        )}
      >
        {pending.length > 0 ? (
          <div className="space-y-3">
            <ul className="space-y-1.5">
              {pending.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-center gap-2 text-sm"
                >
                  <Icon icon={File02Icon} size={14} />
                  <span className="font-medium">{f.name}</span>
                  <span className="text-xs text-foreground-muted">
                    {formatSize(f.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    className="ml-1 text-foreground-muted hover:text-negative"
                    aria-label="Quitar archivo"
                  >
                    <Icon icon={Cancel01Icon} size={13} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <NativeSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </NativeSelect>
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 rounded-full border border-border bg-surface px-4 text-xs outline-none placeholder:text-foreground-muted focus:border-foreground/40"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={upload.isPending}
              >
                Añadir más
              </Button>
              <Button onClick={submitUpload} disabled={upload.isPending}>
                <Icon icon={CloudUploadIcon} size={14} />
                {upload.isPending
                  ? "Subiendo..."
                  : `Subir ${pending.length} documento${pending.length > 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="block w-full"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
              <Icon icon={CloudUploadIcon} size={20} />
            </div>
            <div className="mt-3 text-sm font-medium">
              Arrastra archivos aquí o haz clic para seleccionar
            </div>
            <div className="mt-1 text-xs text-foreground-muted">
              Hasta 10MB cada uno · PDF, imágenes, documentos.
            </div>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <Card className="h-32 animate-pulse bg-surface-muted/50" />
      ) : docs.length === 0 ? (
        <Card className="p-8 text-center text-sm text-foreground-muted">
          No hay documentos todavía. Sube el primero arriba.
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {docs.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              onDelete={() => handleDelete(doc)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function DocumentRow({ doc, onDelete }: { doc: Document; onDelete: () => void }) {
  const Ic: IconSvgElement = doc.mime_type.startsWith("image/")
    ? ImageUploadIcon
    : File02Icon;

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
        <Icon icon={Ic} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium">{doc.name}</span>
          <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground-muted">
            {doc.category.replace(/_/g, " ")}
          </span>
        </div>
        <div className="truncate text-[11px] text-foreground-muted">
          {doc.description ?? doc.file_name} · {formatSize(doc.size)} ·{" "}
          {new Date(doc.created_at).toLocaleDateString("es-ES")}
        </div>
      </div>
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted hover:text-foreground"
        aria-label="Abrir"
      >
        <Icon icon={Download01Icon} size={14} />
      </a>
      <button
        type="button"
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-negative-soft hover:text-negative"
        aria-label="Eliminar"
      >
        <Icon icon={Delete02Icon} size={14} />
      </button>
    </li>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
