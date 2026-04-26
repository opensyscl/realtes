"use client";

import { sileo } from "sileo";

/**
 * Wrapper sobre `sileo` con API más simple: acepta string directo o el objeto
 * completo. Para confirms bloqueantes (yes/no antes de actuar) usa un dialog
 * modal — sileo es para notificaciones y action toasts (con undo).
 */
type ToastInput = string | { title: string; description?: string; duration?: number };

function normalize(input: ToastInput) {
  return typeof input === "string" ? { title: input } : input;
}

export const toast = {
  success: (input: ToastInput) => sileo.success(normalize(input)),
  error: (input: ToastInput) => sileo.error(normalize(input)),
  info: (input: ToastInput) => sileo.info(normalize(input)),
  warning: (input: ToastInput) => sileo.warning(normalize(input)),
  show: (input: ToastInput) => sileo.show(normalize(input)),
  dismiss: (id: string) => sileo.dismiss(id),
  clear: () => sileo.clear(),

  /**
   * Toast con un botón de acción (típicamente "Deshacer" después de borrar).
   * @example
   * toast.action({ title: "Foto eliminada", description: "...", buttonLabel: "Deshacer", onAction: undo });
   */
  action: (opts: {
    title: string;
    description?: string;
    buttonLabel: string;
    onAction: () => void;
    duration?: number;
  }) =>
    sileo.action({
      title: opts.title,
      description: opts.description,
      duration: opts.duration ?? 5000,
      button: { title: opts.buttonLabel, onClick: opts.onAction },
    }),

  /**
   * Toast que sigue una promise: loading mientras corre, success/error al terminar.
   */
  promise: sileo.promise,
};
