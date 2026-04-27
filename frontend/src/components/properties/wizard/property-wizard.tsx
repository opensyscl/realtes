"use client";

import { useState } from "react";
import { useForm, Controller, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { toast } from "@/lib/toast";

import {
  useSaveProperty,
  usePropertyLease,
  useDocuments,
  usePhotos,
  type Property,
} from "@/lib/queries";
import { useAuthStore } from "@/store/auth";
import { PropertyStatusSelect } from "@/components/properties/property-status-select";
import { WizardShell, STEPS, type StepId } from "./wizard-shell";
import { StepBasic } from "./step-basic";
import { StepLocation } from "./step-location";
import { StepFeatures } from "./step-features";
import { StepInterior } from "./step-interior";
import { StepComodidades } from "./step-comodidades";
import { StepExterior } from "./step-exterior";
import { StepDebts } from "./step-debts";
import { StepOtros } from "./step-otros";
import { WizardSmartBar } from "./wizard-smart-bar";
import { WizardPreview } from "./wizard-preview";
import { StepOwner } from "./step-owner";
import { StepClient } from "./step-client";
import { StepAgent } from "./step-agent";
import { StepUrl } from "./step-url";
import { StepNotes } from "./step-notes";
import { StepMedia } from "./step-media";
import { StepBooking } from "./step-booking";
import { StepLease } from "./step-lease";

const wizardSchema = z.object({
  // Información básica
  title: z.string().min(2, "Mínimo 2 caracteres").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  cover_image_url: z.string().url("URL inválida").optional().or(z.literal("")),
  type: z.enum([
    "apartamento",
    "casa",
    "chalet",
    "oficina",
    "local",
    "parking",
    "trastero",
  ]),
  listing_type: z.enum(["alquiler", "venta", "ambos"]),
  status: z.enum([
    "disponible",
    "arrendada",
    "vendida",
    "reservada",
    "mantenimiento",
  ]),
  is_published: z.boolean(),
  is_exclusive: z.boolean(),
  currency: z.string().regex(/^[A-Z]{3}$/, "Código ISO 4217"),
  price_rent: z.coerce.number().min(0).optional(),
  price_sale: z.coerce.number().min(0).optional(),
  commission_pct: z.coerce.number().min(0).max(100).optional(),
  rol: z.string().max(60).optional().or(z.literal("")),
  captacion_date: z.string().optional().or(z.literal("")),
  captacion_source: z
    .enum(["particular", "portal", "referido", "web", "otro"])
    .optional()
    .or(z.literal("")),

  // Ubicación
  address: z.string().min(2, "La dirección es obligatoria").max(255),
  postal_code: z.string().max(10).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  province: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(2).optional().or(z.literal("")),
  floor: z.string().max(10).optional().or(z.literal("")),
  door: z.string().max(10).optional().or(z.literal("")),

  // Características
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  bathrooms: z.coerce.number().min(0).max(10).optional(),
  area_sqm: z.coerce.number().int().min(1).max(100000).optional(),
  community_fee: z.coerce.number().min(0).optional(),
  parking_spaces: z.coerce.number().int().min(0).max(50).optional(),
  year_built: z.coerce.number().int().min(1800).max(new Date().getFullYear() + 5).optional(),
  orientation: z
    .enum([
      "norte","sur","oriente","poniente",
      "nororiente","norponiente","suroriente","surponiente",
    ])
    .optional()
    .or(z.literal("")),
  floors_count: z.coerce.number().int().min(1).max(200).optional(),
  units_per_floor: z.coerce.number().int().min(1).max(200).optional(),
  terrace_sqm: z.coerce.number().int().min(0).max(100000).optional(),
  built_sqm: z.coerce.number().int().min(0).max(100000).optional(),

  // Interior
  condition: z
    .enum(["excelente", "bueno", "regular", "a_reformar"])
    .optional()
    .or(z.literal("")),
  suites_count: z.coerce.number().int().min(0).max(20).optional(),
  service_rooms: z.coerce.number().int().min(0).max(10).optional(),
  living_rooms: z.coerce.number().int().min(0).max(10).optional(),
  service_bathrooms: z.coerce.number().int().min(0).max(10).optional(),
  floor_type: z
    .enum([
      "piso_flotante","ceramica","madera","porcelanato",
      "alfombra","vinilico","marmol","otro",
    ])
    .optional()
    .or(z.literal("")),
  gas_type: z
    .enum(["caneria", "balon", "otros"])
    .optional()
    .or(z.literal("")),
  has_termopanel: z.boolean().optional(),
  hot_water_type: z
    .enum(["electrico", "gas", "solar", "otro"])
    .optional()
    .or(z.literal("")),
  heating_type: z
    .enum([
      "central","electrica","losa_radiante","gas","no_tiene","otro",
    ])
    .optional()
    .or(z.literal("")),
  kitchen_type: z
    .enum(["americana", "cerrada", "isla", "otro"])
    .optional()
    .or(z.literal("")),
  window_type: z
    .enum(["termopanel","aluminio","pvc","madera","otro"])
    .optional()
    .or(z.literal("")),

  // Exterior
  elevators_count: z.coerce.number().int().min(0).max(50).optional(),
  covered_parking_spaces: z.coerce.number().int().min(0).max(50).optional(),
  uncovered_parking_spaces: z.coerce.number().int().min(0).max(50).optional(),

  // Deudas y adquisición
  ibi_annual: z.coerce.number().min(0).optional(),
  acquisition_year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  acquisition_method: z
    .enum(["compra","herencia","donacion","permuta","remate","otro"])
    .optional()
    .or(z.literal("")),
  bank_debt: z.coerce.number().min(0).optional(),
  debt_institution: z.string().max(120).optional().or(z.literal("")),
  requires_guarantor: z.boolean().optional(),

  // Otros
  rooms_count: z.coerce.number().int().min(0).max(50).optional(),
  parking_sqm: z.coerce.number().int().min(0).max(100000).optional(),
  storage_count: z.coerce.number().int().min(0).max(50).optional(),
  apartment_subtype: z
    .enum(["tradicional","loft","duplex","triplex","penthouse","studio","otro"])
    .optional()
    .or(z.literal("")),
  max_occupants: z.coerce.number().int().min(0).max(100).optional(),

  features: z.array(z.string()).optional(),

  // Asignaciones
  owner_person_id: z.number().int().nullable().optional(),
  agent_user_id: z.number().int().nullable().optional(),
  client_person_id: z.number().int().nullable().optional(),

  // Media URLs
  video_url: z.string().url("URL inválida").optional().or(z.literal("")),
  tour_url: z.string().url("URL inválida").optional().or(z.literal("")),

  // Notas internas
  private_note: z.string().max(5000).optional().or(z.literal("")),
  inventory_notes: z.string().max(5000).optional().or(z.literal("")),
  reception_notes: z.string().max(5000).optional().or(z.literal("")),

  // Agendamiento de visitas
  booking_enabled: z.boolean().optional(),
  booking_provider: z.enum(["calcom", "google", "other"]).optional(),
  booking_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

type WizardFormInput = z.input<typeof wizardSchema>;
type WizardFormOutput = z.output<typeof wizardSchema>;

export function PropertyWizard({ property }: { property?: Property }) {
  const router = useRouter();
  const save = useSaveProperty(property?.id);
  const { data: lease } = usePropertyLease(property?.id);
  const [step, setStep] = useState<StepId>("basic");
  const [previewOpen, setPreviewOpen] = useState(false);
  const hasLease = !!lease;
  const hasClient = !!property?.client;
  const agencyCurrency = useAuthStore((s) => s.user?.agency?.currency) ?? "CLP";

  const form = useForm<WizardFormInput, unknown, WizardFormOutput>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      // Básica
      title: property?.title ?? "",
      description: property?.description ?? "",
      cover_image_url: property?.cover_image_url ?? "",
      type: (property?.type as WizardFormInput["type"]) ?? "apartamento",
      listing_type:
        (property?.listing_type as WizardFormInput["listing_type"]) ?? "alquiler",
      status: (property?.status as WizardFormInput["status"]) ?? "disponible",
      is_published: property?.is_published ?? false,
      is_exclusive: property?.is_exclusive ?? false,
      currency: property?.currency ?? agencyCurrency,
      price_rent: property?.price_rent ?? undefined,
      price_sale: property?.price_sale ?? undefined,
      commission_pct: property?.commission_pct ?? undefined,
      rol: property?.rol ?? "",
      captacion_date: property?.captacion_date ?? "",
      captacion_source:
        (property?.captacion_source as WizardFormInput["captacion_source"]) ?? "",

      // Ubicación
      address: property?.address ?? "",
      postal_code: property?.postal_code ?? "",
      city: property?.city ?? "",
      province: property?.province ?? "",
      country: property?.country ?? "CL",
      floor: property?.floor ?? "",
      door: property?.door ?? "",

      // Características
      bedrooms: property?.bedrooms ?? undefined,
      bathrooms: property?.bathrooms ?? undefined,
      area_sqm: property?.area_sqm ?? undefined,
      community_fee: property?.community_fee ?? undefined,
      parking_spaces: property?.parking_spaces ?? undefined,
      year_built: property?.year_built ?? undefined,
      orientation:
        (property?.orientation as WizardFormInput["orientation"]) ?? "",
      floors_count: property?.floors_count ?? undefined,
      units_per_floor: property?.units_per_floor ?? undefined,
      terrace_sqm: property?.terrace_sqm ?? undefined,
      built_sqm: property?.built_sqm ?? undefined,

      // Interior
      condition:
        (property?.condition as WizardFormInput["condition"]) ?? "",
      suites_count: property?.suites_count ?? undefined,
      service_rooms: property?.service_rooms ?? undefined,
      living_rooms: property?.living_rooms ?? undefined,
      service_bathrooms: property?.service_bathrooms ?? undefined,
      floor_type:
        (property?.floor_type as WizardFormInput["floor_type"]) ?? "",
      gas_type: (property?.gas_type as WizardFormInput["gas_type"]) ?? "",
      has_termopanel: property?.has_termopanel ?? undefined,
      hot_water_type:
        (property?.hot_water_type as WizardFormInput["hot_water_type"]) ?? "",
      heating_type:
        (property?.heating_type as WizardFormInput["heating_type"]) ?? "",
      kitchen_type:
        (property?.kitchen_type as WizardFormInput["kitchen_type"]) ?? "",
      window_type:
        (property?.window_type as WizardFormInput["window_type"]) ?? "",

      // Exterior
      elevators_count: property?.elevators_count ?? undefined,
      covered_parking_spaces: property?.covered_parking_spaces ?? undefined,
      uncovered_parking_spaces: property?.uncovered_parking_spaces ?? undefined,

      // Deudas y adquisición
      ibi_annual: property?.ibi_annual ?? undefined,
      acquisition_year: property?.acquisition_year ?? undefined,
      acquisition_method:
        (property?.acquisition_method as WizardFormInput["acquisition_method"]) ?? "",
      bank_debt: property?.bank_debt ?? undefined,
      debt_institution: property?.debt_institution ?? "",
      requires_guarantor: property?.requires_guarantor ?? undefined,

      // Otros
      rooms_count: property?.rooms_count ?? undefined,
      parking_sqm: property?.parking_sqm ?? undefined,
      storage_count: property?.storage_count ?? undefined,
      apartment_subtype:
        (property?.apartment_subtype as WizardFormInput["apartment_subtype"]) ?? "",
      max_occupants: property?.max_occupants ?? undefined,

      features: property?.features ?? [],

      // Asignaciones
      owner_person_id: property?.owner_person_id ?? null,
      agent_user_id: property?.agent_user_id ?? null,
      client_person_id: property?.client_person_id ?? null,

      // Media URLs
      video_url: property?.video_url ?? "",
      tour_url: property?.tour_url ?? "",

      // Notas
      private_note: property?.private_note ?? "",
      inventory_notes: property?.inventory_notes ?? "",
      reception_notes: property?.reception_notes ?? "",

      // Booking
      booking_enabled: property?.booking_enabled ?? false,
      booking_provider:
        (property?.booking_provider as WizardFormInput["booking_provider"]) ?? "calcom",
      booking_url: property?.booking_url ?? "",
    },
  });

  // Submit directo sin pasar por handleSubmit (que falla en silencio si zod
  // detecta cualquier error en otro step). Usamos getValues + toast.promise.
  const submitWith = (publish: boolean | null) => async () => {
    const data = form.getValues();
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === "" || v === undefined) continue;
      cleaned[k] = v;
    }
    if (publish !== null) cleaned.is_published = publish;

    const loadingTitle =
      publish === true
        ? "Publicando propiedad…"
        : publish === false
          ? "Guardando borrador…"
          : "Guardando cambios…";
    const successTitle =
      publish === true
        ? "Propiedad publicada"
        : publish === false
          ? "Borrador guardado"
          : "Cambios guardados";

    try {
      const saved = await toast.promise(save.mutateAsync(cleaned), {
        loading: { title: loadingTitle },
        success: { title: successTitle },
        error: (err: unknown) => ({
          title: "Error al guardar",
          description: err instanceof Error ? err.message : "Error desconocido",
        }),
      });
      // Resetea el form al snapshot guardado para que isDirty vuelva a false
      // y los botones Actualizar/Borrador se deshabiliten hasta que haya
      // nuevos cambios.
      form.reset(form.getValues(), { keepValues: true });
      if (!property) {
        router.push(`/propiedades/${saved.id}`);
      }
    } catch {
      // sileo.promise ya muestra el toast de error
    }
  };

  const handleSave = submitWith(null);
  const handleSaveDraft = submitWith(false);
  const handlePublish = submitWith(true);

  // ¿Hay cambios sin guardar? — controla si los botones Actualizar/Borrador
  // están habilitados (no tiene sentido "Actualizar" si no hay nada nuevo).
  const isDirty = form.formState.isDirty;

  // Conteos de media (compartidos por cache con DocumentDropZone / PhotoGallery,
  // así que subir un archivo invalida estos counts y los steps se marcan al toque).
  const { data: docsData } = useDocuments("properties", property?.id);
  const { data: photosData } = usePhotos(property?.id);
  const documentsCount = docsData?.length ?? 0;
  const photosCount = photosData?.length ?? 0;
  const floorsCount =
    docsData?.filter((d) => d.category === "planos").length ?? 0;

  // Una vez guardado, todos los steps quedan habilitados.
  // Si es nuevo, los media-steps se muestran pero piden guardar primero.
  const steps = STEPS.map((s) => ({
    ...s,
    enabled: true,
    completed: stepIsCompleted(s.id, property, {
      documentsCount,
      photosCount,
      floorsCount,
    }),
  }));

  const formAny = form as unknown as UseFormReturn<Record<string, unknown>>;

  return (
    <>
    <WizardShell
      title={property ? property.title : "Nueva propiedad"}
      subtitle={
        property
          ? `${property.code} · ${property.city ?? "Sin ciudad"}`
          : "Da de alta una unidad en tu cartera"
      }
      steps={steps}
      current={step}
      onChangeStep={setStep}
      onSave={handleSave}
      onCancel={() =>
        router.push(property ? `/propiedades/${property.id}` : "/propiedades")
      }
      saving={save.isPending}
      headerActions={
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <PropertyStatusSelect
              variant="pill"
              value={(field.value as string) || "disponible"}
              onChange={field.onChange}
              disabled={hasLease}
            />
          )}
        />
      }
    >
      {step === "basic" && (
        <StepBasic
          form={formAny}
          propertyId={property?.id}
          hasLease={hasLease}
          hasClient={hasClient}
        />
      )}
      {step === "location" && <StepLocation form={formAny} />}
      {step === "features" && <StepFeatures form={formAny} />}
      {step === "interior" && <StepInterior form={formAny} />}
      {step === "comodidades" && <StepComodidades form={formAny} />}
      {step === "exterior" && <StepExterior form={formAny} />}
      {step === "debts" && <StepDebts form={formAny} />}
      {step === "otros" && <StepOtros form={formAny} />}
      {step === "owner" && <StepOwner form={formAny} />}
      {step === "client" && <StepClient form={formAny} />}
      {step === "floors" && <StepMedia property={property} variant="floors" />}
      {step === "gallery" && <StepMedia property={property} variant="gallery" />}
      {step === "documents" && <StepMedia property={property} variant="documents" />}
      {step === "video" && <StepUrl form={formAny} variant="video" />}
      {step === "tour" && <StepUrl form={formAny} variant="tour" />}
      {step === "agent" && <StepAgent form={formAny} />}
      {step === "private_note" && <StepNotes form={formAny} variant="private" />}
      {step === "inventory" && <StepNotes form={formAny} variant="inventory" />}
      {step === "reception" && <StepNotes form={formAny} variant="reception" />}
      {step === "booking" && <StepBooking form={formAny} />}
      {step === "lease" && <StepLease property={property} />}
    </WizardShell>

    <WizardSmartBar
      form={formAny}
      steps={steps}
      current={step}
      onChangeStep={setStep}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      onPreview={() => setPreviewOpen(true)}
      saving={save.isPending}
      isPublished={!!property?.is_published}
      isDirty={isDirty}
    />

    <WizardPreview
      form={formAny}
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
    />
    </>
  );
}

interface MediaCounts {
  documentsCount: number;
  photosCount: number;
  floorsCount: number;
}

function stepIsCompleted(
  id: StepId,
  p?: Property,
  media: MediaCounts = { documentsCount: 0, photosCount: 0, floorsCount: 0 },
): boolean {
  if (!p) return false;
  switch (id) {
    case "gallery":
      return media.photosCount > 0 || !!p.cover_image_url;
    case "documents":
      return media.documentsCount > 0;
    case "floors":
      return media.floorsCount > 0;
    case "basic":
      return !!p.title;
    case "location":
      return !!p.address;
    case "features":
      return p.bedrooms !== undefined || (p.area_sqm ?? 0) > 0;
    case "interior":
      return !!p.condition || !!p.floor_type || !!p.heating_type;
    case "comodidades":
      return (p.features ?? []).length > 0;
    case "exterior":
      return (
        (p.elevators_count ?? 0) > 0 ||
        (p.covered_parking_spaces ?? 0) > 0 ||
        (p.uncovered_parking_spaces ?? 0) > 0
      );
    case "debts":
      return (
        !!p.acquisition_year ||
        !!p.acquisition_method ||
        !!p.bank_debt ||
        !!p.ibi_annual
      );
    case "otros":
      return (
        !!p.apartment_subtype ||
        !!p.rooms_count ||
        !!p.max_occupants ||
        !!p.storage_count
      );
    case "owner":
      return !!p.owner_person_id;
    case "client":
      return !!p.client_person_id;
    case "agent":
      return !!p.agent_user_id;
    case "video":
      return !!p.video_url;
    case "tour":
      return !!p.tour_url;
    case "private_note":
      return !!p.private_note;
    case "inventory":
      return !!p.inventory_notes;
    case "reception":
      return !!p.reception_notes;
    case "booking":
      return !!p.booking_enabled && !!p.booking_url;
    case "lease":
      // Solo se considera "completo" si hay contrato vigente.
      // (Si solo hay cliente, está en estado intermedio "reservada", no completo.)
      return p.status === "arrendada" && !!p.active_contract;
    default:
      return false;
  }
}
