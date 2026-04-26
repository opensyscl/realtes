"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Home05Icon,
  UserCircleIcon,
  Calendar03Icon,
  AlertCircleIcon,
  Note01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import {
  usePropertyLease,
  useSavePropertyLease,
  useEndPropertyLease,
  type Property,
} from "@/lib/queries";
import { toast } from "@/lib/toast";
import { cn, formatCurrency } from "@/lib/utils";

const schema = z.object({
  tenant_full_name: z.string().min(2, "Mínimo 2 caracteres").max(200),
  tenant_nif: z.string().max(30).optional().or(z.literal("")),
  tenant_email: z.string().email("Email inválido"),
  tenant_phone: z.string().max(30).optional().or(z.literal("")),
  start_date: z.string().min(1, "Requerido"),
  duration_months: z.coerce.number().int().min(1).max(120).optional(),
  monthly_rent: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0).optional(),
  alert_days_before: z.coerce.number().int().min(0).max(365),
  auto_renew: z.boolean(),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const DURATIONS = [
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses (1 año)" },
  { value: "24", label: "24 meses (2 años)" },
  { value: "36", label: "36 meses (3 años)" },
  { value: "60", label: "60 meses (5 años)" },
];

const ALERT_DAYS = [
  { value: "15", label: "15 días antes" },
  { value: "30", label: "30 días antes" },
  { value: "60", label: "60 días antes" },
  { value: "90", label: "90 días antes" },
];

export function StepLease({ property }: { property?: Property }) {
  const confirm = useConfirm();
  const propertyId = property?.id;
  const { data: lease, isLoading } = usePropertyLease(propertyId);
  const save = useSavePropertyLease(propertyId ?? 0);
  const end = useEndPropertyLease(propertyId ?? 0);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenant_full_name: "",
      tenant_nif: "",
      tenant_email: "",
      tenant_phone: "",
      start_date: "",
      duration_months: 12,
      monthly_rent: undefined,
      deposit: undefined,
      alert_days_before: 30,
      auto_renew: false,
      notes: "",
    },
  });

  // Cuando llegan los datos del lease, prefill el form.
  // Si NO hay lease pero la propiedad tiene un cliente asignado (step Cliente),
  // prefill con esos datos para que no haya que reescribir.
  useEffect(() => {
    if (lease) {
      form.reset({
        tenant_full_name: lease.tenant?.full_name ?? "",
        tenant_nif: lease.tenant?.nif ?? "",
        tenant_email: lease.tenant?.email ?? "",
        tenant_phone: lease.tenant?.phone ?? "",
        start_date: lease.start_date ?? "",
        duration_months: undefined,
        monthly_rent: lease.monthly_rent,
        deposit: lease.deposit ?? undefined,
        alert_days_before: lease.alert_days_before,
        auto_renew: lease.auto_renew,
        notes: lease.notes ?? "",
      });
    } else if (property?.client) {
      form.reset({
        tenant_full_name: property.client.full_name ?? "",
        tenant_nif: "",
        tenant_email: property.client.email ?? "",
        tenant_phone: property.client.phone ?? "",
        start_date: "",
        duration_months: 12,
        monthly_rent: property.price_rent ?? undefined,
        deposit: property.price_rent ?? undefined,
        alert_days_before: 30,
        auto_renew: false,
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lease?.id, property?.client?.id]);

  const hasLease = !!lease;
  const hasClient = !!property?.client;

  const handleSave = form.handleSubmit(async (data) => {
    if (!propertyId) {
      toast.error("Guarda primero la propiedad");
      return;
    }
    await toast.promise(
      save.mutateAsync({
        tenant: {
          full_name: data.tenant_full_name,
          nif: data.tenant_nif || undefined,
          email: data.tenant_email,
          phone: data.tenant_phone || undefined,
        },
        start_date: data.start_date,
        duration_months: data.duration_months,
        monthly_rent: data.monthly_rent,
        deposit: data.deposit,
        alert_days_before: data.alert_days_before,
        auto_renew: data.auto_renew,
        notes: data.notes || undefined,
      }),
      {
        loading: { title: "Guardando contrato..." },
        success: { title: hasLease ? "Contrato actualizado" : "Contrato creado" },
        error: { title: "Error al guardar" },
      },
    );
  });

  const handleEnd = async () => {
    const ok = await confirm({
      title: "¿Finalizar arriendo?",
      description:
        "El contrato se marcará como finalizado y la propiedad volverá a estar disponible.",
      confirmLabel: "Finalizar",
      danger: true,
    });
    if (!ok) return;
    await end.mutateAsync();
    toast.success("Arriendo finalizado");
  };

  if (!propertyId) {
    return (
      <Card className="flex items-start gap-3 border-info/20 bg-info-soft/40 p-5">
        <Icon icon={AlertCircleIcon} size={18} className="mt-0.5 shrink-0 text-info" />
        <div className="text-sm">
          <strong>Guarda primero la propiedad.</strong>
          <p className="mt-1 text-foreground-muted">
            Una vez guardada podrás gestionar su arriendo desde aquí.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header — muestra el estado real (sin manualidad). Tres estados:
          1. Sin cliente ni contrato → vacío, animar a asignar cliente primero
          2. Con cliente (reservada) pero sin contrato → "Cliente asignado, falta firmar"
          3. Con contrato vigente → "Arriendo activo" verde con detalles */}
      <div
        className={cn(
          "flex items-start justify-between gap-3 rounded-2xl border p-4",
          hasLease
            ? "border-positive/30 bg-positive-soft/30"
            : hasClient
              ? "border-warning/30 bg-warning-soft/40"
              : "border-border bg-surface-muted/40",
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl",
              hasLease
                ? "bg-positive-soft text-positive"
                : hasClient
                  ? "bg-warning-soft text-warning"
                  : "bg-surface-muted text-foreground-muted",
            )}
          >
            <Icon icon={Home05Icon} size={18} />
          </span>
          <div>
            <div className="text-sm font-semibold tracking-tight">
              {hasLease
                ? "Arriendo activo"
                : hasClient
                  ? "Cliente asignado · Pendiente de firmar"
                  : "Sin arriendo activo"}
            </div>
            <p className="mt-0.5 text-xs text-foreground-muted">
              {hasLease
                ? `Contrato ${lease?.code} · ${lease?.tenant?.full_name ?? "—"} · desde ${lease?.start_date}`
                : hasClient
                  ? `${property?.client?.full_name} está asignado/a como cliente. Completa los datos para firmar el contrato.`
                  : 'Asigna un cliente en el step "Cliente" o crea el contrato directamente aquí.'}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
            hasLease
              ? "bg-positive text-white"
              : hasClient
                ? "bg-warning text-white"
                : "bg-surface text-foreground-muted",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              hasLease ? "bg-white" : hasClient ? "bg-white" : "bg-foreground-muted",
            )}
          />
          {hasLease ? "Arrendada" : hasClient ? "Reservada" : "Disponible"}
        </span>
      </div>

      {/* Banner cuando se prefilló desde el cliente */}
      {!hasLease && hasClient && (
        <div className="rounded-2xl border border-info/20 bg-info-soft/40 p-3 text-xs text-info">
          <Icon icon={CheckmarkCircle02Icon} size={12} className="mr-1 inline" />
          Pre-cargué los datos de <strong>{property?.client?.full_name}</strong>{" "}
          como arrendatario. Solo te falta completar fecha y monto del contrato.
        </div>
      )}

      {isLoading && (
        <Card className="h-40 animate-pulse bg-surface-muted/50" />
      )}

      {!isLoading && (
        <>
          {/* Datos del arrendatario */}
          <Section icon={UserCircleIcon} title="Datos del arrendatario">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Nombre completo *"
                error={form.formState.errors.tenant_full_name?.message}
              >
                <Input
                  {...form.register("tenant_full_name")}
                  placeholder="Nombre del arrendatario"
                />
              </Field>
              <Field label="RUT / DNI">
                <Input
                  {...form.register("tenant_nif")}
                  placeholder="12.345.678-9"
                />
              </Field>
              <Field label="Email *" error={form.formState.errors.tenant_email?.message}>
                <Input
                  type="email"
                  {...form.register("tenant_email")}
                  placeholder="email@ejemplo.com"
                />
              </Field>
              <Field label="Teléfono">
                <Input
                  {...form.register("tenant_phone")}
                  placeholder="+56 9 1234 5678"
                />
              </Field>
            </div>
          </Section>

          {/* Período del contrato */}
          <Section icon={Calendar03Icon} title="Período del contrato">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field
                label="Fecha de inicio *"
                error={form.formState.errors.start_date?.message}
              >
                <Input type="date" {...form.register("start_date")} />
              </Field>
              <Field label="Duración">
                <Controller
                  control={form.control}
                  name="duration_months"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectPopup>
                        {DURATIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                  )}
                />
              </Field>
              <Field
                label="Canon mensual"
                hint="En la moneda configurada de la propiedad"
                error={form.formState.errors.monthly_rent?.message}
              >
                <Input
                  type="number"
                  step="any"
                  min={0}
                  {...form.register("monthly_rent")}
                  placeholder="500000"
                />
              </Field>
              <Field label="Depósito (garantía)">
                <Input
                  type="number"
                  step="any"
                  min={0}
                  {...form.register("deposit")}
                  placeholder="500000"
                />
              </Field>
            </div>
          </Section>

          {/* Alertas y renovación */}
          <Section icon={AlertCircleIcon} title="Alertas y renovación" tone="warning">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr]">
              <Field label="Alertar antes de (días)">
                <Controller
                  control={form.control}
                  name="alert_days_before"
                  render={({ field }) => (
                    <Select
                      value={String(field.value ?? 30)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopup>
                        {ALERT_DAYS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Renovación automática">
                <Controller
                  control={form.control}
                  name="auto_renew"
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-2xl border px-3 text-sm transition-colors",
                        field.value
                          ? "border-primary bg-primary-soft/40 text-primary"
                          : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
                      )}
                    >
                      <Checkbox checked={!!field.value} size="sm" tabIndex={-1} />
                      <span className="font-medium">
                        {field.value ? "Sí, renovar al vencimiento" : "No"}
                      </span>
                    </button>
                  )}
                />
              </Field>
            </div>
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-warning">
              <Icon icon={CheckmarkCircle02Icon} size={11} />
              Recibirás un email de alerta cuando el contrato esté por vencer.
            </p>
          </Section>

          {/* Notas */}
          <Section icon={Note01Icon} title="Notas">
            <Textarea
              rows={4}
              {...form.register("notes")}
              placeholder="Notas adicionales sobre el arriendo..."
            />
          </Section>

          {/* Footer acciones */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface-muted/40 p-3">
            {hasLease ? (
              <Button
                type="button"
                variant="destructive-outline"
                onClick={handleEnd}
                loading={end.isPending}
              >
                <Icon icon={Cancel01Icon} size={13} />
                Finalizar arriendo
              </Button>
            ) : (
              <span className="text-xs text-foreground-muted">
                Al guardar, la propiedad pasa a{" "}
                <strong className="text-foreground">Arrendada</strong>{" "}
                {hasClient && (
                  <>
                    y <strong className="text-foreground">{property?.client?.full_name}</strong>{" "}
                    queda como arrendatario.
                  </>
                )}
              </span>
            )}
            <Button onClick={handleSave} loading={save.isPending}>
              {hasLease ? "Actualizar contrato" : "Crear contrato"}
            </Button>
          </div>

          {/* Resumen del contrato existente */}
          {lease && (
            <Card className="bg-positive-soft/20 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Contrato vigente</span>
                <span className="text-xs text-foreground-muted">
                  desde {lease.start_date} hasta {lease.end_date ?? "—"}
                </span>
              </div>
              <div className="mt-2 text-xs text-foreground-muted">
                Renta:{" "}
                <strong className="text-foreground">
                  {formatCurrency(lease.monthly_rent)}/mes
                </strong>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  tone = "primary",
  children,
}: {
  icon: Parameters<typeof Icon>[0]["icon"];
  title: string;
  tone?: "primary" | "warning";
  children: React.ReactNode;
}) {
  const cls =
    tone === "warning"
      ? "bg-warning-soft text-warning"
      : "bg-primary-soft text-primary";
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-xl", cls)}>
          <Icon icon={icon} size={13} />
        </span>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </Card>
  );
}
