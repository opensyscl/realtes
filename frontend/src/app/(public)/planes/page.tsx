import type { Metadata } from "next";

import { PlanesClient } from "./planes-client";
import { ProductSchema, BreadcrumbSchema } from "@/lib/schema";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

export const metadata: Metadata = {
  title: "Planes y precios — gratis, Pro $29.990, Business $79.990",
  description:
    "Precios simples y sin sorpresas para corredoras de propiedades en Chile. Plan Starter gratis, Pro desde $29.990 CLP/mes, Business $79.990 CLP/mes. 14 días gratis sin tarjeta de crédito. Cancela cuando quieras.",
  keywords: [
    "precio software inmobiliario Chile",
    "plan CRM corredora propiedades",
    "Realtes precios CLP",
    "ERP inmobiliario costo mensual",
    "software corredora gratis trial",
  ],
  alternates: { canonical: "/planes" },
  openGraph: {
    url: `${SITE_URL}/planes`,
    title: "Planes Realtes — desde gratis hasta sin límites",
    description:
      "Compara Starter (gratis), Pro ($29.990/mes) y Business ($79.990/mes). Sin permanencia. 14 días gratis.",
    images: ["/og"],
  },
  twitter: {
    title: "Planes Realtes — gratis · Pro $29.990 · Business $79.990",
    description:
      "Precios simples para corredoras en Chile. 14 días gratis sin tarjeta.",
  },
};

export default function PlanesPage() {
  return (
    <>
      <ProductSchema
        name="Pro"
        description="Plan Pro de Realtes para corredoras en crecimiento. ERP, CRM, captación multicanal, cargos automáticos, comisiones y reportes. Usuarios ilimitados."
        price="29990"
        url={`${SITE_URL}/planes`}
      />
      <ProductSchema
        name="Business"
        description="Plan Business sin límites para corredoras consolidadas. Multi-oficina, multi-marca, integraciones a medida, onboarding dedicado y SLA."
        price="79990"
        url={`${SITE_URL}/planes`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Planes y precios", url: `${SITE_URL}/planes` },
        ]}
      />
      <PlanesClient />
    </>
  );
}
