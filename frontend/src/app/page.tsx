import type { Metadata } from "next";

import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingTrustbar } from "@/components/landing/landing-trustbar";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingChannels } from "@/components/landing/landing-channels";
import { LandingDemo } from "@/components/landing/landing-demo";
import { LandingBenefits } from "@/components/landing/landing-benefits";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  SoftwareApplicationSchema,
  FAQPageSchema,
  BreadcrumbSchema,
} from "@/lib/schema";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

export const metadata: Metadata = {
  title:
    "Realtes · ERP + CRM inmobiliario para corredoras en Chile",
  description:
    "Software inmobiliario todo-en-uno para corredoras de propiedades en Chile. Captación multicanal (WhatsApp, Instagram, Messenger), CRM kanban, cargos y comisiones automáticos, reportes en tiempo real. Empieza gratis 14 días, sin tarjeta.",
  alternates: { canonical: "/" },
  openGraph: {
    url: SITE_URL,
    title:
      "Realtes · El sistema operativo de tu corredora inmobiliaria",
    description:
      "Captación multicanal, CRM kanban, cargos automáticos y reportes para tu corredora. 14 días gratis.",
    images: ["/og"],
  },
};

const HOME_FAQS = [
  {
    q: "¿Realtes tiene prueba gratis?",
    a: "Sí. 14 días de prueba completos en el plan Pro, sin pedirte tarjeta de crédito. Si te convence eliges plan; si no, no pasa nada.",
  },
  {
    q: "¿Necesito tarjeta de crédito para empezar?",
    a: "No. Te das de alta con un email, configuramos tu corredora y empiezas a operar. La tarjeta solo entra cuando decides quedarte.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Por supuesto. Sin permanencia, sin costes de cancelación. Mantienes acceso hasta el final del ciclo facturado y puedes exportar tus datos.",
  },
  {
    q: "¿Cuántos usuarios puedo añadir a mi equipo?",
    a: "El plan Pro incluye usuarios ilimitados con permisos por rol — agentes, oficinas, administración — para que cada quien vea solo lo suyo.",
  },
  {
    q: "¿Funciona en móvil y tablet?",
    a: "Sí. Realtes es 100% web responsive: funciona desde cualquier navegador moderno en computador, tablet o móvil. Sin instalar nada.",
  },
  {
    q: "¿Migran los datos desde mi sistema actual?",
    a: "Sí. En el plan Pro y Business hacemos la migración inicial: propiedades, contactos, contratos en curso. En 48-72h estás operando con todo dentro.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD específicos de la landing */}
      <SoftwareApplicationSchema />
      <FAQPageSchema faqs={HOME_FAQS} />
      <BreadcrumbSchema
        items={[{ name: "Inicio", url: SITE_URL }]}
      />

      <main className="min-h-screen">
        <LandingNavbar />
        <LandingHero />
        <LandingTrustbar />
        <LandingFeatures />
        <LandingChannels />
        <LandingDemo />
        <LandingBenefits />
        <LandingTestimonials />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
        <LandingFooter />
      </main>
    </>
  );
}
