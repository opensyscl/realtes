"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CallIcon,
  Mail01Icon,
  CalendarSetting01Icon,
  PropertyNewIcon,
} from "@hugeicons/core-free-icons";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn, formatCurrency } from "@/lib/utils";
import type { Lead } from "@/lib/queries";

const SOURCE_LABEL: Record<string, string> = {
  web: "Web",
  idealista: "Idealista",
  referral: "Referido",
  instagram: "Instagram",
  llamada: "Llamada",
  walk_in: "Visita oficina",
  otros: "Otros",
};

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  isOverlay?: boolean;
}

export function LeadCard({ lead, onSelect, isOverlay }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id, data: { type: "lead", lead } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const days = lead.last_activity_at
    ? Math.floor(
        (Date.now() - new Date(lead.last_activity_at).getTime()) / 86400000,
      )
    : null;

  const isStale = days !== null && days >= 5;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging) {
          e.preventDefault();
          onSelect(lead);
        }
      }}
      className={cn(
        "group cursor-grab rounded-2xl border bg-surface p-3 text-sm transition-shadow active:cursor-grabbing",
        isOverlay
          ? "rotate-2 border-foreground/30 shadow-lg"
          : "border-border hover:border-foreground/30 hover:shadow-card",
        isDragging && !isOverlay && "opacity-30",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground tabular-numbers">
          {lead.code}
        </span>
        {isStale && (
          <span className="text-[10px] font-medium text-negative">{days}d sin actividad</span>
        )}
      </div>

      <div className="mb-2 line-clamp-2 font-semibold leading-tight">{lead.title}</div>

      {lead.contact_name && (
        <div className="mb-3 truncate text-xs text-foreground-muted">{lead.contact_name}</div>
      )}

      <div className="mb-3 flex flex-wrap gap-1">
        <Badge variant="outline" className="text-[10px]">
          {SOURCE_LABEL[lead.source] ?? lead.source}
        </Badge>
        {lead.requirements?.bedrooms_min && (
          <Badge variant="neutral" className="text-[10px]">
            {lead.requirements.bedrooms_min}+ hab
          </Badge>
        )}
        {lead.requirements?.zones?.[0] && (
          <Badge variant="neutral" className="text-[10px]">
            {lead.requirements.zones[0]}
            {lead.requirements.zones.length > 1 && ` +${lead.requirements.zones.length - 1}`}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle pt-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            valor estimado
          </div>
          <div className="font-semibold tabular-numbers">
            {formatCurrency(lead.value)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lead.contact_phone && (
            <span className="text-muted-foreground" title={lead.contact_phone}>
              <Icon icon={CallIcon} size={13} />
            </span>
          )}
          {lead.contact_email && (
            <span className="text-muted-foreground" title={lead.contact_email}>
              <Icon icon={Mail01Icon} size={13} />
            </span>
          )}
          {lead.expected_close_date && (
            <span className="text-muted-foreground" title="Cierre esperado">
              <Icon icon={CalendarSetting01Icon} size={13} />
            </span>
          )}
          {lead.property && (
            <span className="text-muted-foreground" title={lead.property.title}>
              <Icon icon={PropertyNewIcon} size={13} />
            </span>
          )}
          {lead.assigned_to && (
            <Avatar name={lead.assigned_to.name} size="xs" />
          )}
        </div>
      </div>
    </div>
  );
}
