"use client";

import {
  Image01Icon,
  DocumentAttachmentIcon,
  FloorPlanIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { PhotoGallery } from "@/components/properties/photo-gallery";
import { DocumentDropZone } from "@/components/documents/document-dropzone";
import type { Property } from "@/lib/queries";

interface MediaVariant {
  title: string;
  subtitle: string;
  icon: IconSvgElement;
  needsSaveMessage: string;
}

const VARIANTS: Record<"gallery" | "documents" | "floors", MediaVariant> = {
  gallery: {
    title: "Galería de imágenes",
    subtitle: "Sube las fotos que verá el cliente en el escaparate público.",
    icon: Image01Icon,
    needsSaveMessage:
      "Guarda primero la información básica para poder subir fotos.",
  },
  documents: {
    title: "Documentos",
    subtitle: "Cédula de habitabilidad, certificado energético, planos, etc.",
    icon: DocumentAttachmentIcon,
    needsSaveMessage:
      "Guarda primero la información básica para poder adjuntar documentos.",
  },
  floors: {
    title: "Plantas",
    subtitle: "Planos de planta de la propiedad (PDF o imagen).",
    icon: FloorPlanIcon,
    needsSaveMessage:
      "Guarda primero la información básica para poder subir planos.",
  },
};

export function StepMedia({
  property,
  variant,
}: {
  property?: Property;
  variant: "gallery" | "documents" | "floors";
}) {
  const v = VARIANTS[variant];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={v.icon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{v.title}</h2>
          <p className="text-xs text-foreground-muted">{v.subtitle}</p>
        </div>
      </div>

      {!property ? (
        <Card className="flex items-start gap-3 border-info/20 bg-info-soft/40 p-5">
          <Icon
            icon={InformationCircleIcon}
            size={18}
            className="mt-0.5 shrink-0 text-info"
          />
          <div className="min-w-0 flex-1 text-sm text-info">
            <strong>Guarda primero la propiedad.</strong>
            <p className="mt-1 text-foreground-muted">{v.needsSaveMessage}</p>
          </div>
        </Card>
      ) : variant === "gallery" ? (
        <PhotoGallery propertyId={property.id} coverUrl={property.cover_image_url} />
      ) : variant === "documents" ? (
        <DocumentDropZone owner="properties" ownerId={property.id} />
      ) : (
        <Card className="border-2 border-dashed border-border-subtle p-10 text-center">
          <Icon
            icon={FloorPlanIcon}
            size={32}
            className="mx-auto text-foreground-muted"
          />
          <p className="mt-3 text-sm font-medium">Próximamente</p>
          <p className="mt-1 text-xs text-foreground-muted">
            Subida específica de planos de planta. Por ahora puedes adjuntarlos
            como documento en el step "Documentos" con categoría "planos".
          </p>
        </Card>
      )}
    </div>
  );
}
