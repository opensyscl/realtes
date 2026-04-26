"use client";

import { CallIcon, Mail01Icon, LocationStar01Icon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import type { PublicAgency } from "@/lib/queries-public";

export function AgentCard({ agency }: { agency: PublicAgency }) {
  return (
    <Card className="p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Listado por
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Avatar name={agency.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{agency.name}</div>
          <div className="truncate text-[11px] text-foreground-muted">
            Agencia inmobiliaria
          </div>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-xs">
        {agency.phone && (
          <li className="flex items-center gap-2 text-foreground-muted">
            <Icon icon={CallIcon} size={12} />
            <a href={`tel:${agency.phone}`} className="hover:text-foreground">
              {agency.phone}
            </a>
          </li>
        )}
        {agency.email && (
          <li className="flex items-center gap-2 text-foreground-muted">
            <Icon icon={Mail01Icon} size={12} />
            <a href={`mailto:${agency.email}`} className="hover:text-foreground">
              {agency.email}
            </a>
          </li>
        )}
        {agency.address && (
          <li className="flex items-center gap-2 text-foreground-muted">
            <Icon icon={LocationStar01Icon} size={12} />
            <span>{agency.address}, {agency.city}</span>
          </li>
        )}
      </ul>
    </Card>
  );
}
