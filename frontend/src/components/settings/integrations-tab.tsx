"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  PlugSocketIcon,
  Globe02Icon,
  Calendar03Icon,
  Mail01Icon,
  WhatsappIcon,
  InstagramIcon,
  MessengerIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  useMlIntegration,
  useConnectMl,
  useDisconnectMl,
  useUpdateMlSettings,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  category: "portales" | "leads" | "calendario" | "comunicacion";
  status: "available" | "coming_soon";
  /** Icon overlay arriba-izquierda de la card. Si null, se renderiza el logo brand. */
  icon?: IconSvgElement;
  /** Si true, renderea un badge "ML" amarillo en lugar del icono. */
  brand?: "mercadolibre" | "idealista" | "toctoc" | "portal" | null;
}

const COMING_SOON: IntegrationDef[] = [
  {
    id: "portal-inmobiliario",
    name: "Portal Inmobiliario",
    description: "Publicación automática en el portal #1 de Chile.",
    category: "portales",
    status: "coming_soon",
    brand: "portal",
  },
  {
    id: "toctoc",
    name: "Toctoc",
    description: "Sincroniza tus propiedades con Toctoc.com.",
    category: "portales",
    status: "coming_soon",
    brand: "toctoc",
  },
  {
    id: "idealista",
    name: "Idealista",
    description: "Para corredoras con cartera en España.",
    category: "portales",
    status: "coming_soon",
    brand: "idealista",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sincroniza visitas con tu calendario.",
    category: "calendario",
    status: "coming_soon",
    icon: Calendar03Icon,
  },
  {
    id: "whatsapp-business",
    name: "WhatsApp Business",
    description: "Captura leads desde tu número WhatsApp Business.",
    category: "comunicacion",
    status: "coming_soon",
    icon: WhatsappIcon,
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Lee mensajes y comentarios desde tu perfil.",
    category: "comunicacion",
    status: "coming_soon",
    icon: InstagramIcon,
  },
  {
    id: "messenger",
    name: "Facebook Messenger",
    description: "Bandeja unificada con tu página de Facebook.",
    category: "comunicacion",
    status: "coming_soon",
    icon: MessengerIcon,
  },
  {
    id: "smtp",
    name: "Email (SMTP)",
    description: "Conecta tu propio servidor SMTP para envíos.",
    category: "comunicacion",
    status: "coming_soon",
    icon: Mail01Icon,
  },
];

export function IntegrationsTab() {
  const [banner, setBanner] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  // Lee ?ml=connected | ?ml=error&reason=... que viene del callback OAuth.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ml = params.get("ml");
    if (!ml) return;

    if (ml === "connected") {
      const userId = params.get("user");
      setBanner({
        kind: "success",
        text: userId
          ? `Mercado Libre conectado correctamente (cuenta ${userId}).`
          : "Mercado Libre conectado correctamente.",
      });
    } else if (ml === "error") {
      const reason = params.get("reason") ?? "Error desconocido";
      setBanner({
        kind: "error",
        text: `No se pudo conectar Mercado Libre: ${decodeURIComponent(reason)}`,
      });
    }

    // Limpia los query params para que el banner no aparezca en cada refresh.
    const clean = window.location.pathname + window.location.hash;
    window.history.replaceState({}, "", clean);
    const t = setTimeout(() => setBanner(null), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-4">
      {/* Banner de respuesta del callback */}
      {banner && (
        <Card
          className={cn(
            "flex items-start gap-3 border-2 p-4",
            banner.kind === "success"
              ? "border-positive/30 bg-positive-soft/30"
              : "border-negative/30 bg-negative-soft/30",
          )}
        >
          <Icon
            icon={
              banner.kind === "success" ? CheckmarkCircle02Icon : AlertCircleIcon
            }
            size={18}
            className={
              banner.kind === "success" ? "text-positive" : "text-negative"
            }
          />
          <div className="flex-1 text-sm">{banner.text}</div>
          <button
            onClick={() => setBanner(null)}
            className="text-xs text-foreground-muted hover:text-foreground"
          >
            cerrar
          </button>
        </Card>
      )}

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon icon={PlugSocketIcon} size={20} />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Integraciones
            </h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Conecta Realtes con portales, calendarios y canales de
              comunicación. Cada integración usa OAuth seguro y puedes
              desconectarla en cualquier momento.
            </p>
          </div>
        </div>
      </Card>

      {/* Disponibles */}
      <section>
        <SectionTitle>Disponibles ahora</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MercadoLibreCard />
        </div>
      </section>

      {/* Próximamente */}
      <section>
        <SectionTitle>Próximamente</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMING_SOON.map((it) => (
            <ComingSoonCard key={it.id} integration={it} />
          ))}
        </div>
      </section>

      {/* Footer info */}
      <Card className="p-4">
        <div className="flex items-start gap-3 text-xs text-foreground-muted">
          <Icon icon={Globe02Icon} size={14} className="mt-0.5 shrink-0" />
          <div>
            ¿Necesitas una integración que no está acá?{" "}
            <a
              href="mailto:hola@bookforce.io?subject=Integraci%C3%B3n%20Realtes"
              className="text-foreground underline-offset-2 hover:underline"
            >
              Escríbenos
            </a>{" "}
            con el caso y la sumamos a la roadmap.
          </div>
        </div>
      </Card>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h4>
  );
}

// ============================================================
// Mercado Libre — la única funcional por ahora
// ============================================================
const TIER_OPTIONS: { id: string; label: string; hint: string }[] = [
  { id: "auto", label: "Auto (mejor gratis disponible)", hint: "Usa free → gold premium → gold → silver, lo primero con fee 0" },
  { id: "free", label: "Gratuita", hint: "Solo si tu cuenta tiene listings free disponibles" },
  { id: "silver", label: "Plata", hint: "Mid exposure · aparece en Portal Inmobiliario" },
  { id: "gold", label: "Oro", hint: "High exposure" },
  { id: "gold_premium", label: "Oro Premium", hint: "Highest exposure (top en búsquedas)" },
];

function MercadoLibreCard() {
  const { data, isLoading } = useMlIntegration();
  const connect = useConnectMl();
  const disconnect = useDisconnectMl();
  const updateSettings = useUpdateMlSettings();

  const connected = data?.connected ?? false;
  const expiresAt = data?.expires_at ? new Date(data.expires_at) : null;
  const expired = expiresAt && expiresAt.getTime() < Date.now();

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <MlBrand />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">
                Mercado Libre Inmobiliaria
              </span>
              {connected && !expired && (
                <Badge variant="positive" className="text-[10px]">
                  Conectado
                </Badge>
              )}
              {connected && expired && (
                <Badge variant="warning" className="text-[10px]">
                  Token expirado
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Publicá propiedades, recibí leads VIS (WhatsApp, llamadas,
              visitas) y sincronizá estados.
            </p>
          </div>
        </div>
      </div>

      {/* Estado detallado */}
      {isLoading ? (
        <div className="h-12 animate-pulse rounded-xl bg-surface-muted/50" />
      ) : connected ? (
        <div className="rounded-2xl border border-border-subtle bg-surface-muted/30 px-3 py-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-foreground-muted">Cuenta ML</span>
            <span className="font-mono tabular-numbers">
              {data?.ml_user_id ?? "—"}
            </span>
          </div>
          {data?.connected_at && (
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-foreground-muted">Conectada el</span>
              <span className="tabular-numbers">
                {new Date(data.connected_at).toLocaleDateString("es-CL", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          {data?.last_error && (
            <div className="mt-2 text-negative">
              ⚠ {data.last_error}
            </div>
          )}
        </div>
      ) : null}

      {/* Settings de publicación (solo si está conectado) */}
      {connected && !isLoading && (
        <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface-muted/20 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Preferencias de publicación
          </div>

          <div>
            <label className="text-xs font-medium">Tier por defecto</label>
            <select
              value={data?.default_listing_type ?? "auto"}
              onChange={(e) =>
                updateSettings.mutate({ default_listing_type: e.target.value })
              }
              disabled={updateSettings.isPending}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {TIER_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-foreground-muted">
              {TIER_OPTIONS.find((t) => t.id === (data?.default_listing_type ?? "auto"))?.hint}
            </p>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium">Confirmar antes de cobrar</div>
              <div className="text-[10px] text-foreground-muted">
                Te muestra un modal con los tiers y fees antes de publicar.
                Si lo apagás, publicamos directo con el tier por defecto.
              </div>
            </div>
            <input
              type="checkbox"
              checked={data?.confirm_before_charge ?? true}
              onChange={(e) =>
                updateSettings.mutate({ confirm_before_charge: e.target.checked })
              }
              disabled={updateSettings.isPending}
              className="h-4 w-4 accent-primary"
            />
          </label>
        </div>
      )}

      {/* Lista de capabilities */}
      {!connected && (
        <ul className="space-y-1.5 text-xs text-foreground-muted">
          {[
            "Publicación automática de propiedades",
            "Sincronización bidireccional de estado",
            "Captura de leads VIS al CRM",
            "Soporta venta y arriendo (CLP)",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Icon
                icon={CheckmarkCircle02Icon}
                size={12}
                className="mt-0.5 shrink-0 text-positive"
              />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Acciones */}
      <div className="mt-auto flex items-center justify-end gap-2 border-t border-border-subtle pt-4">
        {connected ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => connect.mutate()}
              disabled={connect.isPending}
              title="Repetir flujo OAuth (útil si el token expiró)"
            >
              Reconectar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (
                  confirm(
                    "¿Desconectar Mercado Libre? Las publicaciones existentes seguirán activas en ML pero no las vas a poder gestionar desde Realtes.",
                  )
                ) {
                  disconnect.mutate();
                }
              }}
              disabled={disconnect.isPending}
            >
              <Icon icon={Logout01Icon} size={13} />
              Desconectar
            </Button>
          </>
        ) : (
          <Button
            onClick={() => connect.mutate()}
            disabled={connect.isPending}
          >
            {connect.isPending ? "Redirigiendo..." : "Conectar"}
            <Icon icon={ArrowRight01Icon} size={13} />
          </Button>
        )}
      </div>
    </Card>
  );
}

function MlBrand() {
  // Logo brand de ML — caja amarilla con "ML" en negro, redondeada a tono con la app.
  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold"
      style={{
        backgroundColor: "#FFE600",
        color: "#1f2937",
        letterSpacing: "-0.5px",
      }}
    >
      ML
    </span>
  );
}

// ============================================================
// Coming soon
// ============================================================
function ComingSoonCard({ integration }: { integration: IntegrationDef }) {
  return (
    <Card className="flex h-full flex-col gap-3 p-5 opacity-70 grayscale transition-opacity hover:opacity-100">
      <div className="flex items-start gap-3">
        <ComingSoonIcon integration={integration} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold tracking-tight">
              {integration.name}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-foreground-muted">
            {integration.description}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-3">
        <Badge variant="outline" className="text-[10px]">
          Próximamente
        </Badge>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {CATEGORY_LABEL[integration.category]}
        </span>
      </div>
    </Card>
  );
}

function ComingSoonIcon({ integration }: { integration: IntegrationDef }) {
  if (integration.brand === "portal") {
    return (
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-bold text-white"
        style={{ backgroundColor: "#0066cc" }}
      >
        PI
      </span>
    );
  }
  if (integration.brand === "toctoc") {
    return (
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-bold text-white"
        style={{ backgroundColor: "#ff6900" }}
      >
        TT
      </span>
    );
  }
  if (integration.brand === "idealista") {
    return (
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-bold text-white"
        style={{ backgroundColor: "#7cb342" }}
      >
        ID
      </span>
    );
  }
  if (integration.icon) {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-muted">
        <Icon icon={integration.icon} size={18} />
      </span>
    );
  }
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-muted">
      <Icon icon={PlugSocketIcon} size={18} />
    </span>
  );
}

const CATEGORY_LABEL: Record<IntegrationDef["category"], string> = {
  portales: "Portal",
  leads: "Leads",
  calendario: "Calendario",
  comunicacion: "Comunicación",
};
