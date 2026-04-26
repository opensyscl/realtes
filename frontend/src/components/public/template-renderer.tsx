"use client";

import { useMemo } from "react";
import type {
  AgencyTemplate,
  PublicAgency,
  PublicProperty,
} from "@/lib/queries-public";
import { HeroFullbleed } from "./sections/hero-fullbleed";
import { HeroSidebar } from "./sections/hero-sidebar";
import { GalleryGrid } from "./sections/gallery-grid";
import { GallerySlider } from "./sections/gallery-slider";
import { FeaturesList } from "./sections/features-list";
import { AmenitiesGrid } from "./sections/amenities-grid";
import { TourSection } from "./sections/tour-section";
import { ContactCard } from "./sections/contact-card";
import { AgentCard } from "./sections/agent-card";
import { MortgageCalc } from "./sections/mortgage-calc";

export interface TemplateProps {
  property: PublicProperty;
  agency: PublicAgency;
  template: AgencyTemplate;
  onSubmitLead: (data: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }) => Promise<{ lead_code: string }>;
  isSubmitting?: boolean;
  submitError?: string;
}

/**
 * Aplica el `primary_color` de la agencia como CSS variable scoped al template público.
 * Componentes de sección leen `var(--brand)` para botones, badges, etc.
 */
export function TemplateRenderer(props: TemplateProps) {
  const { template, property, agency } = props;
  const cfg = template.config;

  const fontClass = useMemo(() => {
    if (template.font === "serif") return "font-serif";
    if (template.font === "display")
      return "[font-family:'Euclid_Circular_B',serif]";
    return "font-sans";
  }, [template.font]);

  const brandStyle = {
    "--brand": template.primary_color,
  } as React.CSSProperties;

  // Layout: full-bleed pone hero arriba a sangre y form abajo;
  // sidebar pone hero contenido y form a la derecha.
  if (cfg.hero_style === "fullbleed") {
    return (
      <div className={fontClass} style={brandStyle}>
        <HeroFullbleed property={property} agency={agency} />

        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Columna izquierda: contenido principal */}
            <div className="space-y-6 lg:col-span-2">
              {cfg.show_features && property.description && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold tracking-tight">
                    Sobre esta propiedad
                  </h2>
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground-muted">
                    {property.description}
                  </p>
                </section>
              )}

              {cfg.show_amenities_grid && (property.features?.length ?? 0) > 0 && (
                <AmenitiesGrid features={property.features ?? []} />
              )}

              {cfg.gallery_style === "grid" && (
                <GalleryGrid photos={property.photos ?? []} />
              )}
              {cfg.gallery_style === "slider" && (
                <GallerySlider photos={property.photos ?? []} />
              )}
              {cfg.gallery_style === "masonry" && (
                <GalleryGrid photos={property.photos ?? []} masonry />
              )}

              {cfg.show_features && (property.features?.length ?? 0) > 0 && (
                <FeaturesList features={property.features ?? []} />
              )}

              {cfg.show_tour && (property.tour_url || property.video_url) && (
                <TourSection
                  tourUrl={property.tour_url}
                  videoUrl={property.video_url}
                />
              )}

              {cfg.show_mortgage_calc && property.price_sale && (
                <MortgageCalc price={property.price_sale} />
              )}
            </div>

            {/* Columna derecha sticky: contacto y agente */}
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <ContactCard
                property={property}
                agency={agency}
                onSubmit={props.onSubmitLead}
                isSubmitting={props.isSubmitting}
                submitError={props.submitError}
              />
              {cfg.show_agent && <AgentCard agency={agency} />}
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // Layout sidebar (clásico)
  return (
    <div className={fontClass} style={brandStyle}>
      <div className="mx-auto max-w-6xl px-6 py-6">
        <HeroSidebar
          property={property}
          agency={agency}
          onSubmit={props.onSubmitLead}
          isSubmitting={props.isSubmitting}
          submitError={props.submitError}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {property.description && (
              <section>
                <h2 className="mb-3 text-lg font-semibold tracking-tight">
                  Sobre esta propiedad
                </h2>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground-muted">
                  {property.description}
                </p>
              </section>
            )}

            {cfg.gallery_style === "grid" && (
              <GalleryGrid photos={property.photos ?? []} />
            )}
            {cfg.gallery_style === "slider" && (
              <GallerySlider photos={property.photos ?? []} />
            )}

            {cfg.show_features && (property.features?.length ?? 0) > 0 && (
              <FeaturesList features={property.features ?? []} />
            )}

            {cfg.show_tour && (property.tour_url || property.video_url) && (
              <TourSection
                tourUrl={property.tour_url}
                videoUrl={property.video_url}
              />
            )}
          </div>

          <aside className="space-y-4">
            {cfg.show_agent && <AgentCard agency={agency} />}
            {cfg.show_mortgage_calc && property.price_sale && (
              <MortgageCalc price={property.price_sale} />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
