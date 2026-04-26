"use client";

import Link from "next/link";
import {
  ArrowLeft01Icon,
  BedSingle01Icon,
  Bathtub01Icon,
  RulerIcon,
  LocationStar01Icon,
  PropertyNewIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { PublicAgency, PublicProperty } from "@/lib/queries-public";
import { ContactCard } from "./contact-card";

export function HeroSidebar({
  property: p,
  agency,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  property: PublicProperty;
  agency: PublicAgency;
  onSubmit: (data: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }) => Promise<{ lead_code: string }>;
  isSubmitting?: boolean;
  submitError?: string;
}) {
  const cover = p.photos?.[0]?.url ?? p.cover_image_url;

  return (
    <div>
      <Link
        href={`/p/${agency.slug}`}
        className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
      >
        <Icon icon={ArrowLeft01Icon} size={13} /> Volver al listado
      </Link>

      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2 p-0">
          <div className="aspect-[16/10] w-full bg-neutral-300">
            {cover ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={cover} alt={p.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-foreground-muted">
                <Icon icon={PropertyNewIcon} size={64} />
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {p.type} · {p.listing_type}
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{p.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground-muted">
              <Icon icon={LocationStar01Icon} size={13} />
              {p.address}, {p.city}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border-subtle pt-4">
              <Stat icon={BedSingle01Icon} value={p.bedrooms} label="hab" />
              <Stat icon={Bathtub01Icon} value={p.bathrooms} label="baños" />
              <Stat icon={RulerIcon} value={p.area_sqm ?? "—"} label="m²" />
            </div>
          </div>
        </Card>

        <ContactCard
          property={p}
          agency={agency}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: Parameters<typeof Icon>[0]["icon"];
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle p-3 text-center">
      <Icon icon={icon} size={14} className="mx-auto text-foreground-muted" />
      <div className="mt-1 text-sm font-semibold tabular-numbers">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
