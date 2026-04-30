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
  active: { label: "Activa en ML", tone: "positive" },
  paused: { label: "Pausada en ML", tone: "warning" },
  closed: { label: "Cerrada en ML", tone: "negative" },
  under_review: { label: "En revisión ML", tone: "info" },
};

interface Props {
  propertyId: number;
}

export function MlPublicationCard({ propertyId }: Props) {
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

  // Si la integración no está conectada, mostramos solo un CTA al ajuste.
  if (!connected) {
    return (
      <>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mercado Libre
        </span>
        <div className="flex items-start gap-2 rounded-2xl border border-border-subtle bg-surface-muted/30 px-3 py-2.5 text-xs">
          <Icon icon={AlertCircleIcon} size={13} className="mt-0.5 text-foreground-muted" />
          <div>
            Conectá tu cuenta de Mercado Libre desde{" "}
            <a
              href="/ajustes?tab=integraciones"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Ajustes → Integraciones
            </a>{" "}
            para publicar.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mercado Libre
        </span>
        {status && (
          <Badge variant={status.tone} className="text-[10px]">
            {status.label}
          </Badge>
        )}
      </div>

      {publication.isLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-surface-muted/40" />
      ) : pub ? (
        <>
          <div className="space-y-1 rounded-2xl border border-border-subtle bg-surface-muted/30 px-3 py-2.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Item ID</span>
              <span className="font-mono tabular-numbers">{pub.ml_item_id}</span>
            </div>
            {pub.published_at && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Publicada</span>
                <span className="tabular-numbers">
                  {new Date(pub.published_at).toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            {pub.last_error && (
              <div className="mt-1 text-negative">⚠ {pub.last_error}</div>
            )}
          </div>

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
        </>
      ) : (
        <>
          <p className="text-xs text-foreground-muted">
            Esta propiedad todavía no está publicada en Mercado Libre / Portal
            Inmobiliario.
          </p>
          <Button
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
                <Icon icon={CheckmarkCircle02Icon} size={13} />
                Publicar en Mercado Libre
              </>
            )}
          </Button>
        </>
      )}

      {error && (
        <div className="rounded-xl border border-negative/30 bg-negative-soft/30 px-3 py-2 text-[11px] text-negative">
          {error}
        </div>
      )}
    </>
  );
}
