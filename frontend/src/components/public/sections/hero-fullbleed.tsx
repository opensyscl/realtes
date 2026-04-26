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

import { Icon } from "@/components/ui/icon";
import type { PublicAgency, PublicProperty } from "@/lib/queries-public";
import { formatCurrency } from "@/lib/utils";

export function HeroFullbleed({
  property: p,
  agency,
}: {
  property: PublicProperty;
  agency: PublicAgency;
}) {
  const isRent = !!p.price_rent;
  const cover = p.photos?.[0]?.url ?? p.cover_image_url;

  return (
    <section className="relative isolate w-full">
      {/* Imagen de fondo a sangre */}
      <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden bg-neutral-300">
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={cover}
            alt={p.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-foreground-muted">
            <Icon icon={PropertyNewIcon} size={96} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

        {/* Volver / agencia */}
        <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-white">
          <Link
            href={`/p/${agency.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-colors hover:bg-white/25"
          >
            <Icon icon={ArrowLeft01Icon} size={12} />
            Listado
          </Link>
          <span className="text-xs font-medium opacity-90">{agency.name}</span>
        </div>

        {/* Pill operación */}
        <div className="absolute left-6 top-20 z-10 sm:left-10 sm:top-24">
          <span
            className="inline-flex items-center rounded-full bg-[var(--brand)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg"
          >
            En {p.listing_type}
          </span>
        </div>

        {/* Contenido del hero */}
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-6xl px-6 pb-12 text-white">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider opacity-90">
            <span className="tabular-numbers">{p.code}</span>
            <span className="opacity-50">·</span>
            <span>{p.type}</span>
          </div>
          <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight drop-shadow-md sm:text-5xl">
            {p.title}
          </h1>
          <p className="mt-3 flex items-center gap-1.5 text-base opacity-95 drop-shadow">
            <Icon icon={LocationStar01Icon} size={15} />
            {p.address}, {p.city}
          </p>

          {/* Stats row + precio */}
          <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Stat icon={BedSingle01Icon} value={p.bedrooms} label="hab" />
              <span className="hidden h-6 w-px bg-white/30 sm:block" />
              <Stat icon={Bathtub01Icon} value={p.bathrooms} label="baños" />
              <span className="hidden h-6 w-px bg-white/30 sm:block" />
              <Stat
                icon={RulerIcon}
                value={p.area_sqm ?? "—"}
                label="m²"
              />
            </div>

            <div className="text-right">
              <div className="text-[11px] font-medium uppercase tracking-wider opacity-80">
                {isRent ? "Renta mensual" : "Precio venta"}
              </div>
              <div className="mt-1 text-3xl font-bold tabular-numbers drop-shadow-md sm:text-4xl">
                {p.price_rent
                  ? formatCurrency(p.price_rent)
                  : p.price_sale
                    ? formatCurrency(p.price_sale)
                    : "—"}
                {isRent && (
                  <span className="ml-1 text-base font-medium opacity-80">/mes</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
    <div className="inline-flex items-center gap-2">
      <Icon icon={icon} size={16} className="opacity-80" />
      <span className="font-semibold tabular-numbers">{value}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}
