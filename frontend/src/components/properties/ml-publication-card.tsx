"use client";

import { useState } from "react";
import {
  ArrowUpRight01Icon,
  PauseIcon,
  PlayIcon,
  RefreshIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  useMlIntegration,
  useMlPublication,
  usePublishToMl,
  useUpdateMlPublication,
  useSetMlPublicationStatus,
  useDeleteMlPublication,
} from "@/lib/queries";
import { toast } from "@/lib/toast";

const STATUS_LABEL: Record<
  string,
  { label: string; tone: "positive" | "warning" | "negative" | "info" }
> = {
  active: { label: "Activa", tone: "positive" },
  paused: { label: "Pausada", tone: "warning" },
  closed: { label: "Cerrada", tone: "negative" },
  under_review: { label: "En revisión", tone: "info" },
};

interface Props {
  propertyId: number;
}

/**
 * Botones inline de gestión de la publicación en Mercado Libre.
 * Se renderiza dentro del card "Compartir" para tener todas las acciones
 * de distribución de la propiedad en un mismo lugar.
 */
export function MlPublicationButtons({ propertyId }: Props) {
  const integration = useMlIntegration();
  const publication = useMlPublication(propertyId);
  const publish = usePublishToMl(propertyId);
  const update = useUpdateMlPublication(propertyId);
  const setStatus = useSetMlPublicationStatus(propertyId);
  const removePub = useDeleteMlPublication(propertyId);
  const [error, setError] = useState<string | null>(null);

  const connected = integration.data?.connected ?? false;
  const pub = publication.data;
  const status = pub ? STATUS_LABEL[pub.ml_status] ?? STATUS_LABEL.active : null;

  const isLoading =
    publish.isPending ||
    update.isPending ||
    setStatus.isPending ||
    removePub.isPending;

  const handleAction = async <T,>(
    action: () => Promise<T>,
    successMsg: string,
  ) => {
    setError(null);
    try {
      await action();
      toast.success(successMsg);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Operación fallida";
      setError(msg);
      toast.error(msg);
    }
  };

  // Sin conexión a ML → CTA para conectar.
  if (!connected) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border-subtle bg-surface-muted/30 px-3 py-2 text-[11px]">
        <Icon icon={AlertCircleIcon} size={12} className="text-foreground-muted" />
        <span>
          Conectá Mercado Libre en{" "}
          <a
            href="/ajustes?tab=integraciones"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Ajustes → Integraciones
          </a>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {publication.isLoading ? (
        <div className="h-7 w-32 animate-pulse rounded-lg bg-surface-muted/40" />
      ) : pub ? (
        <>
          {/* Status row */}
          <div className="flex items-center gap-2 text-[11px] tabular-numbers">
            <span className="text-muted-foreground">ML</span>
            {status && (
              <Badge variant={status.tone} className="text-[10px]">
                {status.label}
              </Badge>
            )}
            <span className="font-mono text-muted-foreground">
              {pub.ml_item_id}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {pub.ml_permalink && (
              <a href={pub.ml_permalink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Icon icon={ArrowUpRight01Icon} size={13} />
                  Ver en ML
                </Button>
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() =>
                handleAction(() => update.mutateAsync(), "Sincronizada con ML")
              }
              title="Re-enviar título, precio, fotos y atributos a ML"
            >
              <Icon icon={RefreshIcon} size={13} />
              Sincronizar
            </Button>
            {pub.ml_status === "active" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() =>
                  handleAction(
                    () => setStatus.mutateAsync("paused"),
                    "Publicación pausada",
                  )
                }
              >
                <Icon icon={PauseIcon} size={13} />
                Pausar
              </Button>
            ) : pub.ml_status === "paused" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() =>
                  handleAction(
                    () => setStatus.mutateAsync("active"),
                    "Publicación reactivada",
                  )
                }
              >
                <Icon icon={PlayIcon} size={13} />
                Reactivar
              </Button>
            ) : null}
            {pub.ml_status !== "closed" && (
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => {
                  if (
                    confirm(
                      "¿Despublicar de Mercado Libre? Cierra el aviso (no se puede recuperar).",
                    )
                  ) {
                    handleAction(
                      () => removePub.mutateAsync(),
                      "Publicación cerrada en ML",
                    );
                  }
                }}
              >
                Despublicar
              </Button>
            )}
          </div>

          {pub.last_error && (
            <div className="text-[11px] text-negative">⚠ {pub.last_error}</div>
          )}
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() =>
            handleAction(async () => {
              const r = await publish.mutateAsync();
              if (r.ml_permalink) {
                setTimeout(() => window.open(r.ml_permalink!, "_blank"), 300);
              }
            }, "Propiedad publicada en Mercado Libre")
          }
        >
          {publish.isPending ? (
            <>
              <Icon icon={RefreshIcon} size={13} className="animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <span
                className="flex h-4 w-4 items-center justify-center rounded-md text-[9px] font-bold"
                style={{ backgroundColor: "#FFE600", color: "#1f2937" }}
              >
                ML
              </span>
              Publicar en Mercado Libre
            </>
          )}
        </Button>
      )}

      {error && (
        <div className="rounded-xl border border-negative/30 bg-negative-soft/30 px-3 py-2 text-[11px] text-negative">
          {error}
        </div>
      )}
    </div>
  );
}

// Alias retro-compatible por si alguien sigue importando MlPublicationCard.
export { MlPublicationButtons as MlPublicationCard };
