import type { Metadata } from "next";

import { PlanesClient } from "./planes-client";
import { ProductSchema, BreadcrumbSchema } from "@/lib/schema";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

export const metadata: Metadata = {
  title: "Planes y precios — desde $19.990/mes",
  description:
    "Precios simples por número de propiedades para corredoras en Chile. Lite desde $19.990/mes (25 props), Pro $39.990/mes (100 props), Business $89.990/mes (400 props). 14 días gratis sin tarjeta. Cancela cuando quieras.",
  keywords: [
    "precio software inmobiliario Chile",
    "plan CRM corredora propiedades",
    "Realtes precios CLP",
    "ERP inmobiliario costo mensual",
    "software corredora trial gratis",
  ],
  alternates: { canonical: "/planes" },
  openGraph: {
    url: `${SITE_URL}/planes`,
    title: "Planes Realtes — Lite $19.990 · Pro $39.990 · Business $89.990",
    description:
      "Precios por número de propiedades. Empezás en Lite con 25 props. 14 días gratis sin tarjeta.",
    images: ["/og"],
  },
  twitter: {
    title: "Planes Realtes — Lite $19.990 · Pro $39.990 · Business $89.990",
    description:
      "Precios por número de propiedades. 14 días gratis sin tarjeta.",
  },
};

export default function PlanesPage() {
  return (
    <>
      <ProductSchema
        name="Lite"
        description="Plan Lite de Realtes para corredores independientes. Hasta 25 propiedades, 2 usuarios. ERP, CRM y escaparate público incluidos."
        price="19990"
        url={`${SITE_URL}/planes`}
      />
      <ProductSchema
        name="Pro"
        description="Plan Pro para corredoras en crecimiento. Hasta 100 propiedades, 8 usuarios. ERP, CRM, comisiones, marketplace y reajuste IPC automático."
        price="39990"
        url={`${SITE_URL}/planes`}
      />
      <ProductSchema
        name="Business"
        description="Plan Business para corredoras consolidadas. Hasta 400 propiedades, 25 usuarios. Feeds Portal Inmobiliario, soporte prioritario y subdominio personalizado."
        price="89990"
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
