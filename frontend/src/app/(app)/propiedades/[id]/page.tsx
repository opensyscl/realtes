"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import {
  ArrowLeft01Icon,
  Edit02Icon,
  Delete02Icon,
  PropertyNewIcon,
  Building03Icon,
  BedSingle01Icon,
  Bathtub01Icon,
  RulerIcon,
  LocationStar01Icon,
  CashIcon,
  Coins01Icon,
  Tag01Icon,
  CalendarSetting01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ClockIcon,
  Loading03Icon,
  CallIcon,
  Mail01Icon,
  Link01Icon,
  Copy01Icon,
  InformationCircleIcon,
  Agreement02Icon,
  DocumentAttachmentIcon,
  Time01Icon,
  Home05Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useAuthStore } from "@/store/auth";
import {
  useProperty,
  useDeleteProperty,
  useCharges,
  useShareProperty,
  usePropertyHistory,
  useSaveProperty,
  type Charge,
  type PropertyEvent,
} from "@/lib/queries";
import { DocumentDropZone } from "@/components/documents/document-dropzone";
import { PropertyMessagesDrawer } from "@/components/properties/property-messages-drawer";
import { toast } from "@/lib/toast";
import { usePropertyLeads } from "@/lib/queries";
import { PropertyGalleryHero } from "@/components/properties/property-gallery-hero";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_VARIANT: Record<
  string,
  { label: string; tone: "positive" | "info" | "warning" | "neutral" | "negative" }
> = {
  disponible: { label: "Disponible", tone: "positive" },
  arrendada: { label: "Arrendada", tone: "info" },
  vendida: { label: "Vendida", tone: "negative" },
  reservada: { label: "Reservada", tone: "warning" },
  mantenimiento: { label: "En mantenimiento", tone: "warning" },
};

type TabId = "info" | "contrato" | "cargos" | "documentos" | "historial";

const TABS: { id: TabId; label: string; icon: IconSvgElement }[] = [
  { id: "info", label: "Información", icon: InformationCircleIcon },
  { id: "contrato", label: "Contrato activo", icon: Agreement02Icon },
  { id: "cargos", label: "Cargos", icon: CashIcon },
  { id: "documentos", label: "Documentos", icon: DocumentAttachmentIcon },
  { id: "historial", label: "Historial", icon: Time01Icon },
];

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("info");
  const [copied, setCopied] = useState(false);
  const { data: p, isLoading } = useProperty(id);
  const del = useDeleteProperty();
  const agencySlug = useAuthStore((s) => s.user?.agency?.slug);

  const handleDelete = async () => {
    if (!p) return;
    const ok = await toast.confirm({
      title: `¿Eliminar "${p.title}"?`,
      description: "La propiedad se podrá restaurar desde la papelera.",
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!ok) return;
    await del.mutateAsync(p.id);
    toast.success("Propiedad eliminada");
    router.push("/propiedades");
  };

  const handleCopyPublic = async () => {
    if (!agencySlug || !p) return;
    const url = `${window.location.origin}/p/${agencySlug}/${p.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="px-6 py-6">
        <Card className="h-72 animate-pulse bg-surface-muted/50" />
      </div>
    );
  }
  if (!p) {
    return (
      <div className="px-6 py-6 text-center text-foreground-muted">
        Propiedad no encontrada.
      </div>
    );
  }

  const status = STATUS_VARIANT[p.status] ?? { label: p.status, tone: "neutral" as const };
  const isRent = !!p.price_rent;

  return (
    <div className="px-6 py-6">
      {/* Breadcrumb + acciones top-right */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/propiedades"
          className="inline-flex items-center gap-1.5 text-xs text-foreground-muted transition-colors hover:text-foreground"
        >
          <Icon icon={ArrowLeft01Icon} size={13} /> Propiedades
        </Link>
        <PropertyMessagesButton propertyId={p.id} />
      </div>

      {/* Header: título + badges + dirección */}
      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
              isRent ? "bg-info" : "bg-positive",
            )}
          >
            {p.listing_type}
          </span>
          <Badge variant={status.tone}>{status.label}</Badge>
          <span className="font-mono text-[11px] tabular-numbers text-foreground-muted">
            {p.code}
          </span>
          <span className="text-[11px] capitalize text-foreground-muted">
            · {p.type}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {p.title}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground-muted">
          <Icon icon={LocationStar01Icon} size={13} />
          {p.address}
          {p.floor && `, ${p.floor}`}
          {p.door && ` ${p.door}`} — {p.city}
        </p>
      </div>

      {/* Galería a la izquierda · Opciones a la derecha (estilo anterior) */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Galería estilo Airbnb */}
        <PropertyGalleryHero
          propertyId={p.id}
          fallbackUrl={p.cover_image_url}
          alt={p.title}
        />

        {/* Panel lateral: precio + acciones */}
        <div className="flex flex-col gap-3">
          {/* Toggle rápido: disponibilidad */}
          <AvailabilityToggle propertyId={p.id} status={p.status} />

          {/* Precio destacado */}
          <Card className="p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {isRent ? "Renta mensual" : "Precio venta"}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-numbers tracking-tight sm:text-3xl">
                {p.price_rent
                  ? formatCurrency(p.price_rent)
                  : p.price_sale
                    ? formatCurrency(p.price_sale)
                    : "—"}
              </span>
              {isRent && (
                <span className="text-sm font-medium text-foreground-muted">
                  /mes
                </span>
              )}
            </div>
            {(p.price_rent && p.price_sale) || p.community_fee ? (
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-foreground-muted tabular-numbers">
                {p.price_rent && p.price_sale && (
                  <span>Venta {formatCurrency(p.price_sale)}</span>
                )}
                {p.community_fee && (
                  <span className="inline-flex items-center gap-1">
                    <Icon icon={Coins01Icon} size={11} />
                    Comunidad {formatCurrency(p.community_fee)}
                  </span>
                )}
              </div>
            ) : null}
            <Link href={`/propiedades/${p.id}/editar`} className="mt-4 block">
              <Button className="w-full">
                <Icon icon={Edit02Icon} size={14} />
                Editar propiedad
              </Button>
            </Link>
          </Card>

          {/* Marketplace */}
          <Card className="space-y-2 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Marketplace
            </span>
            <ShareToggle
              propertyId={p.id}
              isShared={p.is_shared ?? false}
              sharePct={p.share_pct ?? 50}
            />
          </Card>

          {/* Compartir público */}
          {agencySlug && (
            <Card className="space-y-2 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Compartir
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPublic}
                  title="Copiar URL pública"
                >
                  <Icon
                    icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                    size={13}
                  />
                  {copied ? "¡Copiada!" : "Copiar URL"}
                </Button>
                <Link
                  href={`/p/${agencySlug}/${p.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Icon icon={Link01Icon} size={13} />
                    Ver pública
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Zona peligrosa */}
          <Button
            variant="destructive-outline"
            size="sm"
            onClick={handleDelete}
            className="w-full"
          >
            <Icon icon={Delete02Icon} size={13} />
            Eliminar propiedad
          </Button>
        </div>
      </div>

      {/* Key metrics row con tonos */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KeyMetric
          icon={CashIcon}
          label="Renta"
          value={p.price_rent ? formatCurrency(p.price_rent) : "—"}
          tone="positive"
          suffix={p.price_rent ? "/mes" : undefined}
        />
        <KeyMetric
          icon={BedSingle01Icon}
          label="Habitaciones"
          value={p.bedrooms.toString()}
          tone="info"
        />
        <KeyMetric
          icon={Bathtub01Icon}
          label="Baños"
          value={p.bathrooms.toString()}
          tone="info"
        />
        <KeyMetric
          icon={RulerIcon}
          label="Superficie"
          value={p.area_sqm ? `${p.area_sqm}` : "—"}
          tone="warning"
          suffix={p.area_sqm ? "m²" : undefined}
        />
        <KeyMetric
          icon={Coins01Icon}
          label="Comunidad"
          value={p.community_fee ? formatCurrency(p.community_fee) : "—"}
          tone="neutral"
        />
        <KeyMetric
          icon={Building03Icon}
          label="Edificio"
          value={p.building?.name ?? "Indep."}
          tone="neutral"
        />
      </div>

      {/* Tabs en pills con iconos */}
      <div className="mt-7 inline-flex items-center gap-0.5 rounded-2xl border border-border bg-surface-muted/60 p-1 shadow-button-secondary">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all duration-200",
                active
                  ? "bg-surface text-foreground shadow-card"
                  : "text-foreground-muted hover:bg-surface/60 hover:text-foreground",
              )}
            >
              <Icon
                icon={t.icon}
                size={13}
                className={cn(active && "text-primary")}
              />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {tab === "info" && <InfoTab property={p} />}
        {tab === "contrato" && <ContractTab property={p} />}
        {tab === "cargos" && <ChargesTab propertyId={p.id} contractId={p.active_contract?.id} />}
        {tab === "documentos" && <DocumentDropZone owner="properties" ownerId={p.id} />}
        {tab === "historial" && <HistoryTab propertyId={p.id} currentStatus={p.status} />}
      </div>
    </div>
  );
}

function AvailabilityToggle({
  propertyId,
  status,
}: {
  propertyId: number;
  status: string;
}) {
  const save = useSaveProperty(propertyId);
  const canToggle = status === "disponible" || status === "mantenimiento";
  const isOn = status === "disponible";

  const handleToggle = () => {
    if (!canToggle || save.isPending) return;
    save.mutate({ status: isOn ? "mantenimiento" : "disponible" });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Disponibilidad
          </div>
          <div className="mt-0.5 text-sm font-semibold">
            {isOn
              ? "Activa · visible"
              : status === "mantenimiento"
                ? "En mantenimiento"
                : STATUS_VARIANT[status]?.label ?? status}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label={isOn ? "Pausar propiedad" : "Activar propiedad"}
          onClick={handleToggle}
          disabled={!canToggle || save.isPending}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors",
            isOn ? "bg-positive border-positive" : "bg-surface-muted border-border",
            (!canToggle || save.isPending) && "cursor-not-allowed opacity-60",
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
              isOn ? "translate-x-6" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
      {!canToggle && (
        <p className="mt-2 text-[11px] text-foreground-muted">
          Estado controlado por contrato — finaliza el arriendo para reactivar.
        </p>
      )}
    </Card>
  );
}

function PropertyMessagesButton({ propertyId }: { propertyId: number }) {
  const { data: leads = [] } = usePropertyLeads(propertyId);
  const count = leads.length;
  const openCount = leads.filter((l) => l.status === "open").length;

  return (
    <PropertyMessagesDrawer
      propertyId={propertyId}
      trigger={
        <button
          type="button"
          className="relative inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          <Icon icon={Mail01Icon} size={13} />
          Mensajes
          {count > 0 && (
            <span
              className={cn(
                "ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-numbers",
                openCount > 0
                  ? "bg-info text-white"
                  : "bg-surface-muted text-foreground-muted",
              )}
            >
              {count}
            </span>
          )}
        </button>
      }
    />
  );
}

function ShareToggle({
  propertyId,
  isShared,
  sharePct,
}: {
  propertyId: number;
  isShared: boolean;
  sharePct: number;
}) {
  const share = useShareProperty(propertyId);

  const handleToggle = async () => {
    if (isShared) {
      const ok = await toast.confirm({
        title: "¿Quitar del marketplace?",
        description: "La propiedad dejará de estar disponible para otros brokers.",
        confirmLabel: "Quitar",
      });
      if (!ok) return;
      await share.mutateAsync({ is_shared: false });
    } else {
      await share.mutateAsync({ is_shared: true, share_pct: sharePct });
    }
  };

  return (
    <Button
      variant={isShared ? "primary" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={share.isPending}
      title={isShared ? "Compartida — click para quitar" : "Compartir en marketplace"}
    >
      <Icon icon={Building03Icon} size={14} />
      {isShared ? `Compartida ${sharePct}%` : "Compartir broker"}
    </Button>
  );
}

function KeyMetric({
  icon,
  label,
  value,
  suffix,
  tone = "neutral",
}: {
  icon: IconSvgElement;
  label: string;
  value: string;
  suffix?: string;
  tone?: "neutral" | "positive" | "info" | "warning" | "negative";
}) {
  const iconCls = {
    neutral: "bg-surface-muted text-foreground",
    positive: "bg-positive-soft text-positive",
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
    negative: "bg-negative-soft text-negative",
  }[tone];

  const toneVar = {
    neutral: "var(--color-foreground-muted)",
    positive: "var(--color-positive)",
    info: "var(--color-info)",
    warning: "var(--color-warning)",
    negative: "var(--color-negative)",
  }[tone];

  return (
    <Card className="group relative isolate flex items-center gap-3 overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30"
        style={{ backgroundColor: toneVar }}
      />
      <span
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
          iconCls,
        )}
      >
        <Icon icon={icon} size={16} />
      </span>
      <div className="relative min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="truncate text-sm font-bold tabular-numbers">{value}</span>
          {suffix && (
            <span className="text-[10px] font-medium text-foreground-muted">{suffix}</span>
          )}
        </div>
      </div>
    </Card>
  );
}

function InfoTab({ property: p }: { property: ReturnType<typeof useProperty>["data"] }) {
  if (!p) return null;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Descripción
        </h3>
        <p className="whitespace-pre-line text-sm text-foreground-muted">
          {p.description ?? "Esta propiedad aún no tiene descripción."}
        </p>

        <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Características
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <CharacteristicItem
            icon={BedSingle01Icon}
            label="Habitaciones"
            value={p.bedrooms.toString()}
          />
          <CharacteristicItem
            icon={Bathtub01Icon}
            label="Baños"
            value={p.bathrooms.toString()}
          />
          <CharacteristicItem
            icon={RulerIcon}
            label="Superficie"
            value={p.area_sqm ? `${p.area_sqm} m²` : "—"}
          />
        </div>

        {p.features.length > 0 && (
          <>
            <h4 className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Amenidades
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {p.features.map((f) => (
                <Badge key={f} variant="outline" className="capitalize">
                  {f.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </>
        )}

        {p.tags.length > 0 && (
          <>
            <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <Badge key={t} variant="neutral">
                  <Icon icon={Tag01Icon} size={11} />
                  {t}
                </Badge>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Datos administrativos
        </h3>
        <dl className="space-y-3 text-sm">
          <Row label="Código">{p.code}</Row>
          <Row label="Operación">{p.listing_type}</Row>
          <Row label="Tipo">{p.type}</Row>
          <Row label="C.P.">{p.postal_code ?? "—"}</Row>
          {p.price_sale && <Row label="Precio venta">{formatCurrency(p.price_sale)}</Row>}
          <Row label="Creado">
            {new Date(p.created_at).toLocaleDateString("es-ES")}
          </Row>
          <Row label="Actualizado">
            {new Date(p.updated_at).toLocaleDateString("es-ES")}
          </Row>
        </dl>
      </Card>
    </div>
  );
}

function CharacteristicItem({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-muted/30 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-foreground">
        <Icon icon={icon} size={15} />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-bold tabular-numbers">{value}</div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium capitalize">{children}</dd>
    </div>
  );
}

function ContractTab({ property: p }: { property: ReturnType<typeof useProperty>["data"] }) {
  if (!p) return null;
  if (!p.active_contract) {
    return (
      <Card className="p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
          <Icon icon={CalendarSetting01Icon} size={20} />
        </div>
        <h3 className="mt-4 text-base font-semibold">Sin contrato activo</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Esta propiedad no tiene un contrato vigente. Crea uno para empezar a generar cargos.
        </p>
        <Link href="/contratos" className="mt-4 inline-block">
          <Button size="sm">Ver contratos</Button>
        </Link>
      </Card>
    );
  }

  const c = p.active_contract;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Contrato activo
          </div>
          <h3 className="mt-1 text-xl font-semibold tracking-tight tabular-numbers">
            {c.code}
          </h3>
        </div>
        <Link href={`/contratos/${c.id}`}>
          <Button variant="outline" size="sm">
            Ver contrato
          </Button>
        </Link>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Renta">{formatCurrency(c.monthly_rent)}/mes</Stat>
        <Stat label="Inicio">{c.start_date ?? "—"}</Stat>
        <Stat label="Fin">{c.end_date ?? "—"}</Stat>
      </dl>
    </Card>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-subtle p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold tabular-numbers">
        {children}
      </div>
    </div>
  );
}

const CHARGE_STATUS: Record<string, { label: string; tone: string; icon: IconSvgElement }> = {
  pendiente: { label: "Pendiente", tone: "text-warning", icon: ClockIcon },
  parcial: { label: "Parcial", tone: "text-info", icon: Loading03Icon },
  pagado: { label: "Pagado", tone: "text-positive", icon: CheckmarkCircle02Icon },
  vencido: { label: "Vencido", tone: "text-negative", icon: AlertCircleIcon },
  anulado: { label: "Anulado", tone: "text-foreground-muted", icon: AlertCircleIcon },
};

function ChargesTab({ contractId }: { propertyId: number; contractId?: number }) {
  const { data, isLoading } = useCharges(
    contractId ? { contract_id: contractId, per_page: 30 } : { per_page: 0 },
  );

  if (!contractId) {
    return (
      <Card className="p-10 text-center text-sm text-foreground-muted">
        Esta propiedad aún no tiene contrato — sin cargos asociados.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
              <th className="h-11 px-6 text-left">Código</th>
              <th className="h-11 px-6 text-left">Concepto</th>
              <th className="h-11 px-6 text-left">Vencimiento</th>
              <th className="h-11 px-6 text-right">Importe</th>
              <th className="h-11 px-6 text-right">Pagado</th>
              <th className="h-11 px-6 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="h-12 px-6">
                    <div className="h-4 animate-pulse rounded bg-surface-muted" />
                  </td>
                </tr>
              ))
            ) : (data?.data.length ?? 0) === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-foreground-muted">
                  Sin cargos.
                </td>
              </tr>
            ) : (
              data?.data.map((c: Charge) => {
                const status = CHARGE_STATUS[c.status] ?? CHARGE_STATUS.pendiente;
                return (
                  <tr key={c.id} className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40">
                    <td className="h-12 px-6 tabular-numbers font-medium">{c.code}</td>
                    <td className="h-12 px-6 capitalize">{c.concept}</td>
                    <td className="h-12 px-6 tabular-numbers text-foreground-muted">{c.due_date}</td>
                    <td className="h-12 px-6 text-right tabular-numbers">{formatCurrency(c.amount)}</td>
                    <td className="h-12 px-6 text-right tabular-numbers text-foreground-muted">
                      {formatCurrency(c.paid_amount)}
                    </td>
                    <td className="h-12 px-6">
                      <span className={cn("inline-flex items-center gap-1.5", status.tone)}>
                        <Icon icon={status.icon} size={13} />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ===========================================================
// History tab — timeline de eventos de la propiedad
// ===========================================================

const STATUS_COLORS: Record<string, string> = {
  disponible: "#15a86c",
  arrendada: "#2563eb",
  vendida: "#dc3545",
  reservada: "#e0a800",
  mantenimiento: "#f97316",
};

const STATUS_LABELS: Record<string, string> = {
  disponible: "Disponible",
  arrendada: "Arrendada",
  vendida: "Vendida",
  reservada: "Reservada",
  mantenimiento: "En mantenimiento",
};

const EVENT_LABELS: Record<string, { label: string; emoji?: string }> = {
  status_change: { label: "Cambio de estado" },
  client_assigned: { label: "Cliente asignado", emoji: "🤝" },
  client_removed: { label: "Cliente retirado" },
  lease_created: { label: "Arriendo iniciado", emoji: "📝" },
  lease_updated: { label: "Arriendo actualizado" },
  lease_ended: { label: "Arriendo finalizado" },
};

function HistoryTab({
  propertyId,
  currentStatus,
}: {
  propertyId: number;
  currentStatus: string;
}) {
  const { data, isLoading } = usePropertyHistory(propertyId);
  const [expanded, setExpanded] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card className="h-72 animate-pulse bg-surface-muted/50" />
    );
  }

  const events = data?.data ?? [];

  // Filtramos solo los cambios de estado para el timeline visual principal,
  // pero los demás eventos (cliente, lease) los anidamos como sub-eventos
  // bajo el cambio de estado más cercano en el tiempo.
  const statusEvents = events.filter((e) => e.type === "status_change");
  const otherEvents = events.filter((e) => e.type !== "status_change");

  if (statusEvents.length === 0 && otherEvents.length === 0) {
    return (
      <Card className="p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
          <Icon icon={Time01Icon} size={20} />
        </div>
        <h3 className="mt-4 text-base font-semibold">Sin historial todavía</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Los cambios de estado, asignación de clientes y contratos quedarán
          registrados aquí.
        </p>
      </Card>
    );
  }

  // Si no hay status events, hacemos uno sintético "actual"
  const timeline = statusEvents.length > 0 ? statusEvents : [];

  return (
    <div className="space-y-3">
      {/* Estado actual destacado al tope */}
      <Card className="flex items-center gap-3 p-4">
        <span
          className="flex h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: STATUS_COLORS[currentStatus] ?? "#9ca3af" }}
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Estado actual
        </span>
        <span className="text-sm font-semibold">
          {STATUS_LABELS[currentStatus] ?? currentStatus}
        </span>
      </Card>

      {/* Timeline */}
      <ol className="relative space-y-3 pl-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-px before:bg-border">
        {timeline.map((event, idx) => {
          const status = event.to_value ?? "disponible";
          const color = STATUS_COLORS[status] ?? "#9ca3af";
          const isCurrent = idx === 0;
          const isOpen = expanded === event.id;

          // Sub-eventos relacionados: ocurridos entre este status_change y el siguiente
          const eventDate = new Date(event.occurred_at).getTime();
          const nextDate =
            idx > 0
              ? new Date(timeline[idx - 1].occurred_at).getTime()
              : Number.POSITIVE_INFINITY;
          const subEvents = otherEvents.filter((e) => {
            const t = new Date(e.occurred_at).getTime();
            return t >= eventDate && t < nextDate;
          });

          return (
            <li key={event.id} className="relative">
              <span
                className="absolute -left-[18px] top-3 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background"
                style={{ backgroundColor: color }}
              >
                {isCurrent && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>

              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : event.id)}
                className={cn(
                  "group block w-full overflow-hidden rounded-2xl border text-left transition-all",
                  isCurrent
                    ? "border-transparent shadow-card"
                    : "border-border-subtle bg-surface hover:bg-surface-muted/40",
                )}
                style={
                  isCurrent
                    ? {
                        backgroundColor: `${color}1a`,
                        borderColor: `${color}33`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-[13px] font-bold uppercase tracking-wider"
                      style={{ color: isCurrent ? color : undefined }}
                    >
                      {STATUS_LABELS[status] ?? status}
                    </span>
                    {isCurrent && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: color, color: "white" }}
                      >
                        Actual
                      </span>
                    )}
                    {subEvents.length > 0 && (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] tabular-numbers text-foreground-muted">
                        {subEvents.length}{" "}
                        {subEvents.length === 1 ? "evento" : "eventos"}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-foreground-muted tabular-numbers">
                    {formatDateTime(event.occurred_at)}
                  </span>
                </div>

                <div className="border-t border-black/5 bg-white/40 px-4 py-2.5 text-[12px] italic text-foreground-muted">
                  La propiedad estuvo en estado &ldquo;
                  <span style={{ color }}>●</span>{" "}
                  <strong>{STATUS_LABELS[status] ?? status}</strong>&rdquo;
                  {event.from_value && (
                    <>
                      {" "}— anteriormente:{" "}
                      <strong>{STATUS_LABELS[event.from_value] ?? event.from_value}</strong>
                    </>
                  )}
                </div>
              </button>

              {/* Sub-eventos expandidos al hacer click */}
              {isOpen && subEvents.length > 0 && (
                <ul className="mt-2 space-y-1.5 rounded-2xl border border-border-subtle bg-surface-muted/30 p-3">
                  {subEvents.map((s) => (
                    <li key={s.id}>
                      <SubEvent event={s} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      {/* Eventos sueltos (sin status change correspondiente) */}
      {timeline.length === 0 && otherEvents.length > 0 && (
        <ul className="space-y-2">
          {otherEvents.map((s) => (
            <li key={s.id}>
              <SubEvent event={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SubEvent({ event }: { event: PropertyEvent }) {
  const meta = EVENT_LABELS[event.type] ?? { label: event.type };
  const snap = event.snapshot ?? {};

  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
          {meta.emoji ? (
            <span className="text-base">{meta.emoji}</span>
          ) : (
            <Icon icon={iconForEvent(event.type)} size={13} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold">{meta.label}</span>
            <span className="text-[10px] text-foreground-muted tabular-numbers">
              {formatDateTime(event.occurred_at)}
            </span>
          </div>
          <SubEventDetails event={event} snapshot={snap} />
          {event.user && (
            <div className="mt-1.5 text-[10px] text-muted-foreground">
              por {event.user.name}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function SubEventDetails({
  event,
  snapshot,
}: {
  event: PropertyEvent;
  snapshot: Record<string, unknown>;
}) {
  const tenant = snapshot.tenant as
    | { full_name?: string; email?: string; phone?: string; nif?: string }
    | undefined;

  if (event.type === "client_assigned" || event.type === "client_removed") {
    const client = snapshot as {
      full_name?: string;
      email?: string;
      phone?: string;
    };
    return (
      <div className="mt-1 text-xs text-foreground-muted">
        {event.type === "client_assigned" ? (
          <>
            <strong className="text-foreground">{client.full_name}</strong>
            {client.email && (
              <span className="ml-1.5 text-[11px]">
                · {client.email}
              </span>
            )}
            {client.phone && (
              <span className="ml-1.5 text-[11px]">· {client.phone}</span>
            )}
          </>
        ) : (
          <>
            Se retiró a{" "}
            <strong className="text-foreground">{client.full_name}</strong>
          </>
        )}
      </div>
    );
  }

  if (event.type === "lease_created" || event.type === "lease_updated") {
    return (
      <div className="mt-1 space-y-1 text-xs text-foreground-muted">
        {tenant && (
          <div>
            Arrendatario:{" "}
            <strong className="text-foreground">{tenant.full_name}</strong>
            {tenant.email && (
              <span className="ml-1.5 text-[11px]">· {tenant.email}</span>
            )}
            {tenant.nif && (
              <span className="ml-1.5 text-[11px]">· {tenant.nif}</span>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-3 text-[11px]">
          {snapshot.code !== undefined && (
            <span>
              Contrato{" "}
              <span className="font-mono font-semibold text-foreground">
                {String(snapshot.code)}
              </span>
            </span>
          )}
          {snapshot.start_date !== undefined && (
            <span>
              Desde{" "}
              <span className="tabular-numbers font-medium text-foreground">
                {String(snapshot.start_date)}
              </span>
            </span>
          )}
          {Boolean(snapshot.end_date) && (
            <span>
              hasta{" "}
              <span className="tabular-numbers font-medium text-foreground">
                {String(snapshot.end_date)}
              </span>
            </span>
          )}
          {snapshot.monthly_rent !== undefined &&
            snapshot.monthly_rent !== null && (
              <span>
                Renta{" "}
                <span className="tabular-numbers font-medium text-foreground">
                  {formatCurrency(Number(snapshot.monthly_rent))}/mes
                </span>
              </span>
            )}
        </div>
      </div>
    );
  }

  if (event.type === "lease_ended" && tenant) {
    return (
      <div className="mt-1 text-xs text-foreground-muted">
        Arrendatario:{" "}
        <strong className="text-foreground">{tenant.full_name}</strong>
        {snapshot.code !== undefined && (
          <span className="ml-2">
            (contrato{" "}
            <span className="font-mono">{String(snapshot.code)}</span>)
          </span>
        )}
      </div>
    );
  }

  return null;
}

function iconForEvent(type: string): IconSvgElement {
  switch (type) {
    case "client_assigned":
    case "client_removed":
      return UserCircleIcon;
    case "lease_created":
    case "lease_updated":
    case "lease_ended":
      return Home05Icon;
    default:
      return InformationCircleIcon;
  }
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
