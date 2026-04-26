"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Settings01Icon,
  UserIcon,
  Building03Icon,
  SquareLock02Icon,
  Logout01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  ZapIcon,
  Image01Icon,
  QrCode01Icon,
} from "@hugeicons/core-free-icons";

import { WatermarkTab } from "@/components/settings/watermark-tab";
import { QrTab } from "@/components/settings/qr-tab";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import {
  useUpdateProfile,
  useLogout,
  useBillingMe,
  useCancelPlan,
  useReactivatePlan,
  useApiTokens,
  useCreateApiToken,
  useDeleteApiToken,
  useAgencySettings,
  useUpdateAgencySettings,
  type ApiToken,
} from "@/lib/queries";
import { SUPPORTED_CURRENCIES } from "@/lib/utils";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { cn, formatCurrency } from "@/lib/utils";

type TabId = "perfil" | "agencia" | "marca_agua" | "qr" | "facturacion" | "distribucion" | "api" | "seguridad";

const TABS: { id: TabId; label: string; icon: Parameters<typeof Icon>[0]["icon"] }[] = [
  { id: "perfil", label: "Perfil", icon: UserIcon },
  { id: "agencia", label: "Agencia", icon: Building03Icon },
  { id: "marca_agua", label: "Marca de agua", icon: Image01Icon },
  { id: "qr", label: "QR", icon: QrCode01Icon },
  { id: "facturacion", label: "Facturación", icon: ZapIcon },
  { id: "distribucion", label: "Distribución", icon: ZapIcon },
  { id: "api", label: "API & Tokens", icon: SquareLock02Icon },
  { id: "seguridad", label: "Seguridad", icon: SquareLock02Icon },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("perfil");

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Icon icon={Settings01Icon} size={13} />
          Ajustes
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Gestiona tu perfil, los datos de la agencia y la seguridad de tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        {/* Sidebar de tabs */}
        <nav className="space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              <Icon icon={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "perfil" && <PerfilTab />}
          {tab === "agencia" && <AgenciaTab />}
          {tab === "marca_agua" && <WatermarkTab />}
          {tab === "qr" && <QrTab />}
          {tab === "facturacion" && <FacturacionTab />}
          {tab === "distribucion" && <DistribucionTab />}
          {tab === "api" && <ApiTokensTab />}
          {tab === "seguridad" && <SeguridadTab />}
        </div>
      </div>
    </div>
  );
}

// --------------------- Facturación ---------------------
function FacturacionTab() {
  const { data, isLoading } = useBillingMe();
  const cancel = useCancelPlan();
  const reactivate = useReactivatePlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (isLoading || !data) {
    return <Card className="h-72 animate-pulse bg-surface-muted/40" />;
  }

  const a = data.agency;
  const plan = data.plan;

  const STATUS_LABEL: Record<string, { label: string; tone: "positive" | "warning" | "negative" | "info" }> = {
    trialing: { label: "En prueba", tone: "info" },
    active: { label: "Activa", tone: "positive" },
    past_due: { label: "Pago pendiente", tone: "warning" },
    cancelled: { label: "Cancelada", tone: "negative" },
  };
  const status = STATUS_LABEL[a.subscription_status] ?? STATUS_LABEL.trialing;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Plan actual
            </h3>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold tracking-tight">{plan.name}</span>
              <Badge variant={status.tone}>{status.label}</Badge>
            </div>
            {plan.price_monthly > 0 ? (
              <p className="mt-1 text-sm text-foreground-muted tabular-numbers">
                {formatCurrency(plan.price_monthly)} /mes ·{" "}
                {a.billing_cycle === "yearly" ? "facturación anual" : "facturación mensual"}
              </p>
            ) : (
              <p className="mt-1 text-sm text-foreground-muted">Plan gratuito</p>
            )}
            {a.is_trialing && (
              <p className="mt-2 text-xs text-info">
                <strong className="tabular-numbers">{a.trial_days_left} día{a.trial_days_left !== 1 && "s"}</strong>{" "}
                de prueba gratuita restante
              </p>
            )}
            {a.current_period_end && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Próxima renovación:{" "}
                <span className="tabular-numbers">
                  {new Date(a.current_period_end).toLocaleDateString("es-ES")}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button onClick={() => setUpgradeOpen(true)}>
              Cambiar plan
            </Button>
            {a.subscription_status === "active" && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("¿Cancelar tu suscripción? Mantendrás acceso hasta el fin de período.")) {
                    cancel.mutate();
                  }
                }}
                className="text-[11px] text-foreground-muted hover:text-negative"
              >
                Cancelar suscripción
              </button>
            )}
            {a.subscription_status === "cancelled" && (
              <button
                type="button"
                onClick={() => reactivate.mutate()}
                className="text-[11px] font-medium text-positive hover:underline"
              >
                Reactivar
              </button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Uso actual
        </h3>
        <ul className="space-y-4">
          <UsageRow
            label="Propiedades"
            current={data.usage.properties.current}
            limit={data.usage.properties.limit}
          />
          <UsageRow
            label="Usuarios"
            current={data.usage.users.current}
            limit={data.usage.users.limit}
          />
          <UsageRow
            label="Leads activos"
            current={data.usage.active_leads.current}
            limit={data.usage.active_leads.limit}
          />
          <UsageRow
            label="Pipelines"
            current={data.usage.pipelines.current}
            limit={data.usage.pipelines.limit}
          />
        </ul>
      </Card>

      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}

function UsageRow({
  label,
  current,
  limit,
}: {
  label: string;
  current: number;
  limit: number | null;
}) {
  const isUnlimited = limit === -1 || limit === null;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((current / Math.max(1, limit!)) * 100));
  const danger = pct >= 90;
  const warning = pct >= 75 && !danger;

  return (
    <li>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-numbers text-foreground-muted">
          {current} {isUnlimited ? <span className="text-muted-foreground">/ ∞</span> : `/ ${limit}`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isUnlimited
              ? "bg-foreground-muted/20"
              : danger
                ? "bg-negative"
                : warning
                  ? "bg-warning"
                  : "bg-positive",
          )}
          style={{ width: isUnlimited ? "8%" : `${pct}%` }}
        />
      </div>
    </li>
  );
}

function DistribucionTab() {
  const user = useAuthStore((s) => s.user);
  const slug = user?.agency?.slug;
  const [copied, setCopied] = useState<string | null>(null);

  if (!slug) {
    return (
      <Card className="p-6 text-center text-foreground-muted">
        Sin agencia asociada.
      </Card>
    );
  }

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://realstate.local";
  const feeds = [
    {
      id: "json",
      label: "JSON genérico",
      description:
        "Formato JSON estándar compatible con la mayoría de portales y agregadores. Útil para integraciones custom.",
      url: `${baseUrl}/api/feeds/${slug}/properties.json`,
    },
    {
      id: "idealista",
      label: "XML Idealista",
      description:
        "Feed XML con la especificación propietaria de Idealista. Configúralo en su backoffice de portales.",
      url: `${baseUrl}/api/feeds/${slug}/idealista.xml`,
    },
    {
      id: "public",
      label: "Escaparate público",
      description:
        "URL pública de tu agencia. Compártela en redes sociales o desde Google My Business.",
      url: `${baseUrl}/p/${slug}`,
    },
  ];

  const copy = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Distribución de propiedades
        </h3>
        <p className="mt-1 text-xs text-foreground-muted">
          Comparte estas URLs con portales (Idealista, Fotocasa, Pisos.com…) para que
          publiquen tus propiedades automáticamente. Solo se exponen las propiedades
          marcadas como <strong>publicadas</strong> y en estado <strong>disponible</strong>.
        </p>
      </div>

      <ul className="space-y-3">
        {feeds.map((f) => (
          <li
            key={f.id}
            className="rounded-2xl border border-border-subtle p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{f.label}</div>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  {f.description}
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-surface-muted/40 px-3 py-1.5">
                  <code className="flex-1 truncate text-[11px] tabular-numbers text-foreground-muted">
                    {f.url}
                  </code>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-medium text-foreground-muted hover:text-foreground"
                  >
                    abrir
                  </a>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copy(f.id, f.url)}
              >
                <Icon
                  icon={copied === f.id ? CheckmarkCircle02Icon : Copy01Icon}
                  size={13}
                />
                {copied === f.id ? "¡Copiada!" : "Copiar"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-2xl bg-info-soft p-3 text-xs text-info">
        Los feeds se cachean 15 minutos. Si publicas cambios urgentes, espera unos
        minutos a que el portal reciba la actualización.
      </div>
    </Card>
  );
}

// --------------------- Perfil ---------------------
const profileSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  avatar_url: z.string().url("URL inválida").optional().or(z.literal("")),
});
type ProfileForm = z.infer<typeof profileSchema>;

function PerfilTab() {
  const user = useAuthStore((s) => s.user);
  const update = useUpdateProfile();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      avatar_url: user?.avatar_url ?? "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setSuccess(false);
    await update.mutateAsync({
      name: data.name,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  });

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Avatar name={user?.name ?? "?"} src={user?.avatar_url} size="lg" />
        <div>
          <h2 className="text-lg font-semibold">{user?.name}</h2>
          <p className="text-sm text-foreground-muted">{user?.email}</p>
          <Badge variant="outline" className="mt-1 capitalize">
            {user?.role}
          </Badge>
        </div>
      </div>

      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Datos personales
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nombre completo *" error={errors.name?.message}>
          <Input {...register("name")} />
        </Field>
        <Field label="Teléfono" error={errors.phone?.message}>
          <Input {...register("phone")} placeholder="+34 6XX XXX XXX" />
        </Field>
        <Field
          label="URL de avatar"
          hint="Cualquier imagen pública"
          error={errors.avatar_url?.message}
        >
          <Input {...register("avatar_url")} placeholder="https://..." />
        </Field>

        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
          {success && (
            <span className="inline-flex items-center gap-1.5 text-xs text-positive">
              <Icon icon={CheckmarkCircle02Icon} size={13} />
              Perfil actualizado
            </span>
          )}
          <Button
            type="submit"
            className="ml-auto"
            disabled={isSubmitting || update.isPending || !isDirty}
          >
            {update.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// --------------------- Agencia ---------------------
function AgenciaTab() {
  const user = useAuthStore((s) => s.user);
  const agency = user?.agency;
  const { data: settings, isLoading } = useAgencySettings();
  const update = useUpdateAgencySettings();

  // La moneda actual viene del servidor — usar settings, fallback al user en cache.
  const currency = settings?.currency ?? agency?.currency ?? "CLP";
  const selectedCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  const sample = 1500000;

  const handleCurrencyChange = (code: string, locale: string) => {
    update.mutate({ currency: code, locale });
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Información de la agencia
        </h3>

        <dl className="space-y-3 text-sm">
          <Row label="Nombre">{agency?.name ?? "—"}</Row>
          <Row label="Slug / Subdominio">
            <span className="tabular-numbers">{agency?.slug ?? "—"}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {agency?.slug}.realstatevalencia.com
            </span>
          </Row>
          <Row label="Plan">
            <Badge variant="info" className="capitalize">
              {agency?.plan ?? "—"}
            </Badge>
          </Row>
        </dl>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Moneda y región
            </h3>
            <p className="mt-1 text-xs text-foreground-muted">
              Define cómo se muestran los precios en toda la app: dashboard,
              listings, contratos, facturación.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-surface-muted/50" />
        ) : (
          <div className="space-y-4">
            <Field label="Moneda">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {SUPPORTED_CURRENCIES.map((c) => {
                  const active = currency === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCurrencyChange(c.code, c.locale)}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft/40 ring-2 ring-primary/30"
                          : "border-border-subtle bg-surface hover:border-border hover:bg-surface-muted/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-2xl font-mono text-sm font-bold",
                          active
                            ? "bg-primary text-white"
                            : "bg-surface-muted text-foreground",
                        )}
                      >
                        {c.symbol}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{c.code}</span>
                          {active && (
                            <Icon
                              icon={CheckmarkCircle02Icon}
                              size={12}
                              className="text-primary"
                            />
                          )}
                        </div>
                        <div className="truncate text-[11px] text-foreground-muted">
                          {c.label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Field>

            {selectedCurrency && (
              <div className="rounded-2xl bg-surface-muted/40 p-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Vista previa
                </div>
                <div className="mt-1.5 flex items-baseline gap-3">
                  <span className="text-2xl font-bold tabular-numbers tracking-tight">
                    {new Intl.NumberFormat(selectedCurrency.locale, {
                      style: "currency",
                      currency: selectedCurrency.code,
                      maximumFractionDigits: 0,
                    }).format(sample)}
                  </span>
                  <span className="text-xs text-foreground-muted">
                    locale {selectedCurrency.locale}
                  </span>
                </div>
              </div>
            )}

            {update.isPending && (
              <div className="text-xs text-foreground-muted">Guardando...</div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

// --------------------- Seguridad ---------------------
const passwordSchema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    password_confirmation: z.string().min(8),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

function SeguridadTab() {
  const update = useUpdateProfile();
  const logout = useLogout();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setSuccess(false);
    await update.mutateAsync({
      password: data.password,
      password_confirmation: data.password_confirmation,
    });
    setSuccess(true);
    reset();
  });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Cambiar contraseña
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Nueva contraseña *" error={errors.password?.message}>
            <Input type="password" {...register("password")} autoComplete="new-password" />
          </Field>
          <Field label="Confirma contraseña *" error={errors.password_confirmation?.message}>
            <Input
              type="password"
              {...register("password_confirmation")}
              autoComplete="new-password"
            />
          </Field>

          <div className="flex items-center justify-between border-t border-border-subtle pt-4">
            {success && (
              <span className="inline-flex items-center gap-1.5 text-xs text-positive">
                <Icon icon={CheckmarkCircle02Icon} size={13} />
                Contraseña actualizada
              </span>
            )}
            <Button
              type="submit"
              className="ml-auto"
              disabled={isSubmitting || update.isPending}
            >
              {update.isPending ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Cerrar sesión
        </h3>
        <p className="mb-4 text-sm text-foreground-muted">
          Cierra tu sesión actual y elimina tu token de acceso de este dispositivo.
        </p>
        <Button variant="outline" onClick={() => logout.mutate()}>
          <Icon icon={Logout01Icon} size={14} />
          Cerrar sesión
        </Button>
      </Card>
    </div>
  );
}

// --------------------- API Tokens ---------------------
function ApiTokensTab() {
  const { data, isLoading } = useApiTokens();
  const create = useCreateApiToken();
  const del = useDeleteApiToken();
  const [showCreate, setShowCreate] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  const apiBase =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL ?? window.location.origin.replace(":3001", ":58000")
      : "";

  const copyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header explicativo */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon icon={SquareLock02Icon} size={20} />
          </span>
          <div className="flex-1">
            <h3 className="text-base font-semibold tracking-tight">
              API Keys para uso externo
            </h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Crea tokens de acceso para usar tus datos (propiedades, leads,
              contratos) desde otras aplicaciones, scripts o integraciones.
              Cada token está vinculado a tu agencia.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-muted px-3 py-1.5 font-mono text-[11px] tabular-numbers">
              <span className="text-muted-foreground">Base URL:</span>
              <span>{apiBase}/api</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Token recién creado (visible solo una vez) */}
      {newToken && (
        <Card className="border-2 border-positive/30 bg-positive-soft/30 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-positive">
                <Icon icon={CheckmarkCircle02Icon} size={15} />
                Token creado correctamente
              </div>
              <p className="mt-1 text-xs text-foreground-muted">
                Copia este token <strong>ahora</strong> — no podrás volver a
                verlo después.
              </p>
              <div className="mt-3 flex items-center gap-2 overflow-hidden rounded-2xl border border-border bg-surface px-3 py-2.5">
                <code className="flex-1 truncate font-mono text-xs">{newToken}</code>
                <button
                  type="button"
                  onClick={() => copyToken(newToken)}
                  className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-semibold text-accent-foreground hover:bg-foreground/90"
                >
                  <Icon
                    icon={tokenCopied ? CheckmarkCircle02Icon : Copy01Icon}
                    size={12}
                  />
                  {tokenCopied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNewToken(null)}
              className="text-xs text-foreground-muted hover:text-foreground"
            >
              Ya lo guardé
            </button>
          </div>
        </Card>
      )}

      {/* Lista de tokens */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Tus API keys</h3>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Icon icon={ZapIcon} size={13} />
            Crear nueva
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-2xl bg-surface-muted/50"
              />
            ))}
          </div>
        ) : (data?.data.length ?? 0) === 0 ? (
          <div className="py-8 text-center text-sm text-foreground-muted">
            Aún no tienes API keys. Crea una para empezar a usar la API desde
            otros proyectos.
          </div>
        ) : (
          <ul className="space-y-2">
            {data?.data.map((t) => (
              <TokenRow key={t.id} token={t} onDelete={() => del.mutate(t.id)} />
            ))}
          </ul>
        )}
      </Card>

      {/* Snippet de uso + link a docs completas */}
      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cómo usarla
          </h3>
          <a
            href="/docs/api"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium hover:bg-surface-muted"
          >
            Ver documentación completa →
          </a>
        </div>
        <pre className="overflow-x-auto rounded-2xl bg-neutral-800 p-4 text-[11px] text-neutral-100">
{`# Listar propiedades
curl -H "Authorization: Bearer TU_TOKEN" \\
     -H "Accept: application/json" \\
     ${apiBase}/api/properties

# Crear un lead
curl -X POST \\
     -H "Authorization: Bearer TU_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{"title":"Nuevo","contact_name":"Juan","contact_email":"j@x.com","pipeline_id":1,"stage_id":1}' \\
     ${apiBase}/api/leads`}
        </pre>
      </Card>

      {showCreate && (
        <CreateTokenDialog
          availableAbilities={data?.available_abilities ?? []}
          onClose={() => setShowCreate(false)}
          onCreated={(plainText) => {
            setNewToken(plainText);
            setShowCreate(false);
          }}
          submitting={create.isPending}
          mutate={create.mutateAsync}
        />
      )}
    </div>
  );
}

function TokenRow({
  token: t,
  onDelete,
}: {
  token: ApiToken;
  onDelete: () => void;
}) {
  const lastUsed = t.last_used_at
    ? new Date(t.last_used_at).toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Nunca";

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-3 transition-colors hover:bg-surface-muted/40">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted">
        <Icon icon={SquareLock02Icon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{t.name}</span>
          {t.abilities.includes("*") ? (
            <Badge variant="warning" className="text-[10px]">
              Acceso total
            </Badge>
          ) : (
            <Badge variant="info" className="text-[10px]">
              {t.abilities.length} scope{t.abilities.length === 1 ? "" : "s"}
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground tabular-numbers">
          <span>Último uso: {lastUsed}</span>
          <span>·</span>
          <span>{t.preview}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (confirm(`¿Revocar el token "${t.name}"? Las apps que lo usen dejarán de funcionar.`)) {
            onDelete();
          }
        }}
        className="rounded-xl p-2 text-foreground-muted transition-colors hover:bg-negative-soft hover:text-negative"
        aria-label="Revocar token"
      >
        <Icon icon={Logout01Icon} size={14} />
      </button>
    </li>
  );
}

const tokenSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
});

function CreateTokenDialog({
  availableAbilities,
  onClose,
  onCreated,
  submitting,
  mutate,
}: {
  availableAbilities: string[];
  onClose: () => void;
  onCreated: (plainText: string) => void;
  submitting: boolean;
  mutate: (data: { name: string; abilities?: string[] }) => Promise<{
    plain_text_token: string;
  }>;
}) {
  const [fullAccess, setFullAccess] = useState(true);
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof tokenSchema>>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const abilities = fullAccess ? ["*"] : selectedAbilities;
    if (!fullAccess && abilities.length === 0) {
      alert("Selecciona al menos un scope o usa acceso total");
      return;
    }
    const r = await mutate({ name: data.name, abilities });
    onCreated(r.plain_text_token);
  });

  const scopeAbilities = availableAbilities.filter((a) => a !== "*");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold tracking-tight">Crear API key</h3>
        <p className="mt-1 text-xs text-foreground-muted">
          Dale un nombre que recuerdes después (ej. "App móvil", "Cron diario").
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <Field label="Nombre" error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="App móvil de mi equipo"
              autoFocus
            />
          </Field>

          <div>
            <div className="mb-2 text-xs font-medium text-foreground">Permisos</div>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border-subtle p-3 transition-colors hover:bg-surface-muted/40">
                <input
                  type="radio"
                  checked={fullAccess}
                  onChange={() => setFullAccess(true)}
                  className="mt-0.5 accent-primary"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold">Acceso total</div>
                  <div className="text-[11px] text-foreground-muted">
                    Misma capacidad que tu sesión web. Recomendado para apps
                    propias.
                  </div>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border-subtle p-3 transition-colors hover:bg-surface-muted/40">
                <input
                  type="radio"
                  checked={!fullAccess}
                  onChange={() => setFullAccess(false)}
                  className="mt-0.5 accent-primary"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold">Solo lectura limitada</div>
                  <div className="text-[11px] text-foreground-muted">
                    Selecciona los scopes específicos.
                  </div>
                </div>
              </label>
            </div>

            {!fullAccess && (
              <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-surface-muted/40 p-3">
                {scopeAbilities.map((ab) => {
                  const checked = selectedAbilities.includes(ab);
                  return (
                    <label
                      key={ab}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-xs hover:bg-surface"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedAbilities((prev) =>
                            checked ? prev.filter((x) => x !== ab) : [...prev, ab],
                          )
                        }
                        className="accent-primary"
                      />
                      <span className="font-mono">{ab}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creando..." : "Crear token"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
