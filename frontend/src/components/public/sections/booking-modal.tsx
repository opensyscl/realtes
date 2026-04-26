"use client";

import { useEffect } from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

/**
 * Modal que abre el calendario configurado por la agencia (Cal.com / Google /
 * cualquier link público) embebido en un iframe a pantalla completa.
 */
export function BookingModal({
  open,
  url,
  onClose,
  title = "Agendar visita",
}: {
  open: boolean;
  url: string;
  onClose: () => void;
  title?: string;
}) {
  // Cerrar con ESC + bloquear scroll del body
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-image"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted"
            aria-label="Cerrar"
          >
            <Icon icon={Cancel01Icon} size={14} />
          </button>
        </div>
        <iframe
          src={url}
          title={title}
          className="h-full w-full flex-1 border-0"
          allow="camera; microphone; fullscreen"
        />
      </div>
    </div>
  );
}
