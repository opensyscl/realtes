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
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  type Document,
} from "@/lib/queries";
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

export function DocumentDropZone({ owner, ownerId }: Props) {
  const { data, isLoading } = useDocuments(owner, ownerId);
  const upload = useUploadDocument(owner, ownerId);
  const del = useDeleteDocument();

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("otros");
  const [description, setDescription] = useState<string>("");

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPending(files[0]);
  };

  const submitUpload = async () => {
    if (!pending) return;
    await upload.mutateAsync({
      file: pending,
      category,
      description: description || undefined,
    });
    setPending(null);
    setDescription("");
    setCategory("otros");
  };

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
        {pending ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Icon icon={File02Icon} size={16} />
              <span className="font-medium">{pending.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatSize(pending.size)}
              </span>
              <button
                onClick={() => setPending(null)}
                className="ml-1 text-muted-foreground hover:text-negative"
                aria-label="Quitar archivo"
              >
                <Icon icon={Cancel01Icon} size={13} />
              </button>
            </div>
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
                className="h-10 rounded-full border border-border bg-surface px-4 text-xs outline-none placeholder:text-muted-foreground focus:border-foreground/40"
              />
            </div>
            <Button onClick={submitUpload} disabled={upload.isPending}>
              <Icon icon={CloudUploadIcon} size={14} />
              {upload.isPending ? "Subiendo..." : "Subir documento"}
            </Button>
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
              Arrastra un archivo aquí o haz clic para seleccionar
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Hasta 10MB · PDF, imágenes, documentos.
            </div>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <Card className="h-32 animate-pulse bg-surface-muted/50" />
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="p-8 text-center text-sm text-foreground-muted">
          No hay documentos todavía. Sube el primero arriba.
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data!.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} onDelete={() => del.mutate(doc.id)} />
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
        <div className="truncate text-[11px] text-muted-foreground">
          {doc.description ?? doc.file_name} · {formatSize(doc.size)} ·{" "}
          {new Date(doc.created_at).toLocaleDateString("es-ES")}
        </div>
      </div>
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        aria-label="Abrir"
      >
        <Icon icon={Download01Icon} size={14} />
      </a>
      <button
        type="button"
        onClick={() => {
          if (confirm(`¿Eliminar ${doc.name}?`)) onDelete();
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-negative-soft hover:text-negative"
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
