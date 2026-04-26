"use client";

import Link from "next/link";
import {
  Mail01Icon,
  CallIcon,
  WhatsappIcon,
  ArrowRight01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";

import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { usePropertyLeads, type Lead } from "@/lib/queries";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<string, "info" | "positive" | "negative" | "neutral"> = {
  open: "info",
  won: "positive",
  lost: "negative",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Abierto",
  won: "Ganado",
  lost: "Perdido",
};

export function PropertyMessagesDrawer({
  propertyId,
  trigger,
}: {
  propertyId: number;
  /** Botón externo que abre el drawer (debe estar dentro de Drawer). */
  trigger: React.ReactNode;
}) {
  const { data: leads = [], isLoading } = usePropertyLeads(propertyId);
  const total = leads.length;
  const openCount = leads.filter((l) => l.status === "open").length;

  return (
    <Drawer position="right">
      <DrawerTrigger render={trigger as React.ReactElement} />
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Consultas de la propiedad</DrawerTitle>
          <DrawerDescription>
            {isLoading
              ? "Cargando…"
              : total === 0
                ? "Aún no hay mensajes ni consultas para esta propiedad."
                : `${total} ${total === 1 ? "consulta" : "consultas"} en total · ${openCount} abierta${openCount === 1 ? "" : "s"}`}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-24 animate-pulse bg-surface-muted/40" />
            ))
          ) : leads.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
                <Icon icon={Mail01Icon} size={20} />
              </div>
              <h3 className="mt-3 text-base font-semibold">Sin consultas</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Cuando alguien te contacte por esta propiedad desde el escaparate público o WhatsApp, aparecerá acá.
              </p>
            </Card>
          ) : (
            leads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
          )}
        </div>

        <DrawerFooter>
          <DrawerClose render={<Button variant="outline">Cerrar</Button>} />
          {leads.length > 0 && (
            <Link href="/leads" className="ml-auto">
              <Button>
                Ir al pipeline
                <Icon icon={ArrowRight01Icon} size={13} />
              </Button>
            </Link>
          )}
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const tone = STATUS_TONE[lead.status] ?? "neutral";
  const label = STATUS_LABEL[lead.status] ?? lead.status;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-info-soft text-info">
          <Icon icon={UserCircleIcon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-[14px] font-semibold">
              {lead.contact_name || lead.title || "Consulta sin nombre"}
            </h4>
            <Badge variant={tone}>{label}</Badge>
            {lead.source && (
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] capitalize text-foreground-muted">
                {lead.source}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-foreground-muted">
            {lead.contact_email && (
              <a
                href={`mailto:${lead.contact_email}`}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Icon icon={Mail01Icon} size={11} />
                {lead.contact_email}
              </a>
            )}
            {lead.contact_phone && (
              <a
                href={`tel:${lead.contact_phone}`}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Icon icon={CallIcon} size={11} />
                {lead.contact_phone}
              </a>
            )}
            {lead.contact_phone && (
              <a
                href={`https://wa.me/${lead.contact_phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1 text-positive hover:opacity-80",
                )}
              >
                <Icon icon={WhatsappIcon} size={11} />
                WhatsApp
              </a>
            )}
          </div>

          {lead.notes && (
            <p className="mt-2 line-clamp-2 text-[12px] text-foreground-muted">
              {lead.notes}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[10px] tabular-numbers text-foreground-muted">
              {new Date(lead.created_at).toLocaleString("es-ES", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <Link
              href={`/leads/${lead.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              Ver detalle
              <Icon icon={ArrowRight01Icon} size={10} />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
