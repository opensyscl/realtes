"use client";

import { useState } from "react";
import {
  ArrowUpRight01Icon,
  PauseIcon,
  PlayIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  useChannelPublications,
  usePublishToChannel,
  useSyncChannel,
  useSetChannelStatus,
  useUnpublishChannel,
  type ChannelPublicationRow,
} from "@/lib/queries";
import { toast } from "@/lib/toast";

type Tone = "positive" | "warning" | "negative" | "info" | "neutral";

const STATUS: Record<string, { label: string; tone: Tone }> = {
  published: { label: "Publicado", tone: "positive" },
  paused: { label: "Pausado", tone: "warning" },
  syncing: { label: "Sincronizando", tone: "info" },
  queued: { label: "En cola", tone: "info" },
  error: { label: "Error", tone: "negative" },
  closed: { label: "Cerrado", tone: "neutral" },
  draft: { label: "Borrador", tone: "neutral" },
};

interface Props {
  propertyId: number;
}

/**
 * Hub de Canales — estado y acciones de publicación de la propiedad en cada
 * portal. Reemplaza a MlPublicationButtons: una fila por canal, con el ciclo
 * de vida genérico del Hub (publicado / pausado / sincronizando / error).
 */
export function ChannelsPublicationCard({ propertyId }: Props) {
  const { data: rows, isLoading } = useChannelPublications(propertyId);
  const publish = usePublishToChannel(propertyId);
  const sync = useSyncChannel(propertyId);
  const setStatus = useSetChannelStatus(propertyId);
  const unpublish = useUnpublishChannel(propertyId);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (
    channel: string,
    action: () => Promise<unknown>,
    okMsg: string,
  ) => {
    setBusy(channel);
    try {
      await action();
      toast.success(okMsg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Operación fallida");
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        <div className="h-12 animate-pulse rounded-2xl bg-surface-muted/40" />
        <div className="h-12 animate-pulse rounded-2xl bg-surface-muted/40" />
      </div>
    );
  }

  if (!rows?.length) return null;

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Publicar en canales
      </span>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <ChannelRow
            key={row.channel.slug}
            row={row}
            busy={busy === row.channel.slug}
            onPublish={() =>
              run(
                row.channel.slug,
                () => publish.mutateAsync({ channel: row.channel.slug }),
                `Publicado en ${row.channel.name}`,
              )
            }
            onSync={() =>
              run(
                row.channel.slug,
                () => sync.mutateAsync(row.channel.slug),
                `Sincronizado con ${row.channel.name}`,
              )
            }
            onPause={() =>
              run(
                row.channel.slug,
                () =>
                  setStatus.mutateAsync({
                    channel: row.channel.slug,
                    status: "paused",
                  }),
                "Publicación pausada",
              )
            }
            onResume={() =>
              run(
                row.channel.slug,
                () =>
                  setStatus.mutateAsync({
                    channel: row.channel.slug,
                    status: "published",
                  }),
                "Publicación reactivada",
              )
            }
            onUnpublish={() =>
              run(
                row.channel.slug,
                () => unpublish.mutateAsync(row.channel.slug),
                `Despublicado de ${row.channel.name}`,
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

interface RowProps {
  row: ChannelPublicationRow;
  busy: boolean;
  onPublish: () => void;
  onSync: () => void;
  onPause: () => void;
  onResume: () => void;
  onUnpublish: () => void;
}

function ChannelRow({
  row,
  busy,
  onPublish,
  onSync,
  onPause,
  onResume,
  onUnpublish,
}: RowProps) {
  const { channel, publication } = row;
  const available = channel.is_active && channel.has_driver;
  const connected = channel.connection?.status === "connected";
  const st = publication ? STATUS[publication.status] ?? STATUS.draft : null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-muted/20 px-3 py-2.5">
      {/* Cabecera: canal + estado */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-foreground">
          {channel.name}
        </span>
        {st ? (
          <Badge variant={st.tone} className="text-[10px]">
            {st.label}
          </Badge>
        ) : !available ? (
          <span className="text-[10px] text-foreground-muted">Próximamente</span>
        ) : !connected ? (
          <span className="text-[10px] text-foreground-muted">Sin conectar</span>
        ) : (
          <span className="text-[10px] text-foreground-muted">No publicado</span>
        )}
      </div>

      {/* Sub-línea contextual */}
      {publication?.external_id && (
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
          {publication.external_id}
        </div>
      )}
      {publication?.last_error && (
        <div className="mt-1 text-[10px] text-negative">
          ⚠ {publication.last_error}
        </div>
      )}
      {!available && !publication && channel.description && (
        <div className="mt-0.5 text-[10px] text-muted-foreground">
          {channel.description}
        </div>
      )}
      {available && !connected && (
        <div className="mt-0.5 text-[10px] text-muted-foreground">
          Conectalo en{" "}
          <a
            href="/ajustes?tab=integraciones"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Ajustes → Integraciones
          </a>
        </div>
      )}

      {/* Acciones */}
      {available && connected && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {!publication || publication.status === "closed" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={onPublish}
            >
              {busy && (
                <Icon icon={RefreshIcon} size={12} className="animate-spin" />
              )}
              Publicar
            </Button>
          ) : (
            <>
              {publication.external_url && (
                <a
                  href={publication.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Icon icon={ArrowUpRight01Icon} size={12} />
                    Ver
                  </Button>
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={onSync}
                title="Re-enviar título, precio, fotos y atributos al canal"
              >
                <Icon
                  icon={RefreshIcon}
                  size={12}
                  className={busy ? "animate-spin" : ""}
                />
                Sincronizar
              </Button>
              {publication.status === "published" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={onPause}
                >
                  <Icon icon={PauseIcon} size={12} />
                  Pausar
                </Button>
              )}
              {publication.status === "paused" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={onResume}
                >
                  <Icon icon={PlayIcon} size={12} />
                  Reactivar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => {
                  if (confirm(`¿Despublicar de ${channel.name}?`)) onUnpublish();
                }}
              >
                Despublicar
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
