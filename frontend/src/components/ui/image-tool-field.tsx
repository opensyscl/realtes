"use client";

import { useEffect, useRef, useState } from "react";
import { ImageTool } from "@/lib/image-tool";
import type {
  ImageToolOptions,
  ImageToolResult,
} from "@/lib/image-tool/types";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

/**
 * Opcional: función que sube el archivo recortado a un storage (R2, S3, etc.)
 * y devuelve la URL pública. Si no se provee, el field guarda el dataURL crudo.
 */
type UploadFn = (result: ImageToolResult) => Promise<string>;

export interface ImageToolFieldProps {
  /** Valor controlado: URL pública o dataURL de la imagen */
  value?: string | null;
  /** Se llama con la URL pública (si hay `upload`) o el dataURL */
  onChange?: (value: string) => void;
  /** Callback con el resultado completo del crop (file, blob, savings, etc.) */
  onResult?: (result: ImageToolResult) => void;
  /** Llamado cuando el user limpia/elimina la imagen */
  onClear?: () => void;
  /**
   * Función de upload. Recibe el resultado del crop, sube a storage y
   * devuelve la URL pública. Si no se provee, se usa el dataURL.
   */
  upload?: UploadFn;
  /** Aspect ratio del crop. "free" permite cualquier proporción */
  aspectRatio?: ImageToolOptions["aspectRatio"];
  /** Dimensiones objetivo del crop */
  cropWidth?: number;
  cropHeight?: number;
  /** Tamaño máximo final */
  maxWidth?: number;
  maxHeight?: number;
  /** Formato de salida (webp/png/jpeg) */
  format?: ImageToolOptions["format"];
  /** Calidad 0-100 */
  quality?: number;
  /** Permitir quitar fondo (requiere API key) */
  allowRemoveBg?: boolean;
  /** Texto del placeholder cuando no hay imagen */
  placeholder?: string;
  /** Texto del botón */
  buttonText?: string;
  /** Título del modal de edición */
  modalTitle?: string;
  /** Template registrado en `ImageTool.registerTemplate` ('logo', 'foto-perfil', etc.) */
  template?: string;
  /** Clases extra para el contenedor */
  className?: string;
}

/**
 * Wrapper React de la librería `image-tool` (vanilla TS) — provee:
 * - dropzone (drag&drop o click para seleccionar)
 * - modal de crop con cropper.js (cargado lazy via CDN)
 * - opción de remover fondo (remove.bg)
 * - compresión y conversión de formato (webp/png/jpeg)
 */
export function ImageToolField({
  value,
  onChange,
  onResult,
  onClear,
  upload,
  aspectRatio = "4:3",
  cropWidth,
  cropHeight,
  maxWidth = 1600,
  maxHeight = 1200,
  format = "webp",
  quality = 90,
  allowRemoveBg = false,
  placeholder = "Arrastra una imagen o haz clic",
  buttonText = "Seleccionar imagen",
  modalTitle = "Editor de imagen",
  template,
  className,
}: ImageToolFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolRef = useRef<ImageTool | null>(null);
  const [uploading, setUploading] = useState(false);
  // Mantener callbacks frescos sin re-instanciar la herramienta
  const cbRef = useRef({ onChange, onResult, onClear, upload });
  cbRef.current = { onChange, onResult, onClear, upload };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (template) {
      el.dataset.template = template;
    }

    const tool = new ImageTool(el, {
      aspectRatio,
      cropWidth,
      cropHeight,
      maxWidth,
      maxHeight,
      format,
      quality,
      allowRemoveBg,
      placeholder,
      buttonText,
      modalTitle,
      onComplete: async (result) => {
        cbRef.current.onResult?.(result);

        const uploadFn = cbRef.current.upload;
        if (!uploadFn) {
          // Sin upload configurado: solo devolvemos el dataURL crudo
          cbRef.current.onChange?.(result.dataUrl);
          return;
        }

        // Upload a storage (R2/S3/etc.) y devolver la URL pública
        setUploading(true);
        try {
          const url = await toast.promise(uploadFn(result), {
            loading: { title: "Subiendo imagen..." },
            success: { title: "Imagen guardada" },
            error: { title: "Error al subir la imagen" },
          });
          cbRef.current.onChange?.(url);
        } catch (err) {
          console.error("ImageToolField upload failed", err);
        } finally {
          setUploading(false);
        }
      },
      onCancel: () => {
        // intencional: no hacer nada al cancelar el crop
      },
    });

    toolRef.current = tool;

    return () => {
      tool.destroy();
      toolRef.current = null;
    };
    // Las opciones se establecen al montar; cambios posteriores requieren remount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar value externo → preview interno
  useEffect(() => {
    const tool = toolRef.current;
    if (!tool) return;
    if (value) {
      tool.setPreview(value);
    } else {
      tool.clear();
    }
  }, [value]);

  const handleClear = () => {
    toolRef.current?.clear();
    cbRef.current.onChange?.("");
    cbRef.current.onClear?.();
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={cn(
          "image-tool-dropzone min-h-[200px]",
          uploading && "pointer-events-none opacity-60",
          // Cuando hay imagen escondemos la dropzone para que el preview React la cubra.
          value && "invisible absolute pointer-events-none",
          className,
        )}
      />

      {/* Preview controlado por React (garantiza que se vea aunque el lib no actualice) */}
      {value && (
        <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Imagen de portada"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-foreground shadow-card hover:scale-105"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full bg-negative px-3 py-1.5 text-[12px] font-semibold text-white shadow-card hover:scale-105"
            >
              Quitar
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-medium shadow-card">
                Subiendo…
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input file oculto para el botón "Cambiar" — abre directamente el cropper del lib */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && toolRef.current) {
            toolRef.current.openEditor(file);
          }
          e.target.value = "";
        }}
      />

      {!value && uploading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-medium shadow-card">
            Subiendo…
          </div>
        </div>
      )}
    </div>
  );
}
