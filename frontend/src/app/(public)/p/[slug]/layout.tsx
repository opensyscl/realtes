"use client";

import Link from "next/link";
import { use } from "react";
import { CallIcon, Mail01Icon, LocationStar01Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { usePublicAgency } from "@/lib/queries-public";

export default function PublicAgencyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: agency } = usePublicAgency(slug);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href={`/p/${slug}`} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-foreground text-sm font-semibold">
              {agency?.name?.charAt(0) ?? "•"}
            </span>
            <span className="font-semibold tracking-tight">
              {agency?.name ?? "..."}
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs text-foreground-muted">
            {agency?.phone && (
              <a
                href={`tel:${agency.phone}`}
                className="hidden items-center gap-1.5 hover:text-foreground tabular-numbers sm:inline-flex"
              >
                <Icon icon={CallIcon} size={13} />
                {agency.phone}
              </a>
            )}
            {agency?.email && (
              <a
                href={`mailto:${agency.email}`}
                className="hidden items-center gap-1.5 hover:text-foreground sm:inline-flex"
              >
                <Icon icon={Mail01Icon} size={13} />
                {agency.email}
              </a>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-16 border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-foreground-muted">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span>
              © {new Date().getFullYear()} {agency?.name ?? slug}. Todos los derechos
              reservados.
            </span>
            {agency?.address && (
              <span className="inline-flex items-center gap-1.5">
                <Icon icon={LocationStar01Icon} size={12} />
                {agency.address}, {agency.city}
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
