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

  /**
   * Confirmación inline (no bloqueante) — toast con dos botones Confirmar/Cancelar.
   * Resuelve `true` si el usuario confirma, `false` si cancela o cierra.
   *
   * @example
   * const ok = await toast.confirm({
   *   title: "¿Publicar la propiedad?",
   *   description: "Será visible en el escaparate público.",
   *   confirmLabel: "Publicar",
   *   cancelLabel: "Cancelar",
   * });
   * if (ok) await publish();
   */
  confirm: (opts: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    duration?: number;
  }): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      let resolved = false;
      let toastId = "";
      const settle = (v: boolean) => {
        if (resolved) return;
        resolved = true;
        if (toastId) sileo.dismiss(toastId);
        resolve(v);
      };

      const description = (
        <div className="space-y-2.5">
          {opts.description && (
            <p className="text-[13px] text-foreground-muted">
              {opts.description}
            </p>
          )}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => settle(false)}
              className="inline-flex h-8 items-center rounded-full border border-border bg-surface px-3 text-[12px] font-medium text-foreground-muted hover:bg-surface-muted"
            >
              {opts.cancelLabel ?? "Cancelar"}
            </button>
            <button
              type="button"
              onClick={() => settle(true)}
              className={
                "inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold text-white transition-colors " +
                (opts.danger
                  ? "bg-negative hover:bg-negative/90"
                  : "bg-primary hover:bg-primary/90")
              }
            >
              {opts.confirmLabel ?? "Confirmar"}
            </button>
          </div>
        </div>
      );

      toastId = sileo.show({
        title: opts.title,
        description,
        type: "info",
        duration: opts.duration ?? 0, // 0 = no auto-close
      });
    }),

  /**
   * Confirmación + ejecución: muestra confirm con sileo, si confirma corre
   * la promise y muestra loading/success/error. Atajo del patrón completo
   * que usábamos en el ERP con customSileo.action + customSileo.promise.
   */
  confirmAndRun: async <T,>(opts: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    run: () => Promise<T>;
    loading?: { title: string; description?: string };
    success?: { title: string; description?: string } | ((data: T) => { title: string; description?: string });
    error?: { title: string; description?: string } | ((err: unknown) => { title: string; description?: string });
  }): Promise<T | null> => {
    const ok = await toast.confirm({
      title: opts.title,
      description: opts.description,
      confirmLabel: opts.confirmLabel,
      cancelLabel: opts.cancelLabel,
    });
    if (!ok) return null;
    return sileo.promise(opts.run(), {
      loading: opts.loading ?? { title: "Procesando..." },
      success: (opts.success ?? { title: "Listo" }) as never,
      error: (opts.error ?? ((e: unknown) => ({
        title: "Error",
        description: e instanceof Error ? e.message : String(e),
      }))) as never,
    });
  },
};
