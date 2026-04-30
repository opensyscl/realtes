import type { Metadata } from "next";

import { FuncionalidadesClient } from "./funcionalidades-client";
import { BreadcrumbSchema } from "@/lib/schema";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

export const metadata: Metadata = {
  title: "Funcionalidades — ERP + CRM para tu corredora",
  description:
    "Todo lo que tu corredora de propiedades necesita en un solo lugar: ficha de propiedades con tour 360, pipeline kanban, captación por WhatsApp/Instagram/Messenger, cargos y comisiones automáticos, reportes en tiempo real y publicación a Portal Inmobiliario y Toctoc.",
  keywords: [
    "funcionalidades software inmobiliario",
    "ERP corredora propiedades",
    "CRM kanban inmobiliario",
    "captación leads WhatsApp inmobiliario",
    "cargos arriendo automáticos Chile",
    "splits comisión inmobiliaria",
    "tour 360 propiedades",
    "feeds Portal Inmobiliario Toctoc",
  ],
  alternates: { canonical: "/funcionalidades" },
  openGraph: {
    url: `${SITE_URL}/funcionalidades`,
    title:
      "Funcionalidades Realtes — todo lo que tu corredora necesita",
    description:
      "ERP, CRM, captación multicanal, cargos automáticos, comisiones y reportes — sin pestañas extras.",
    images: ["/og"],
  },
  twitter: {
    title: "Funcionalidades Realtes — un sistema, todo dentro",
    description:
      "Cartera, CRM, WhatsApp/Instagram/Messenger, cargos automáticos y reportes para tu corredora.",
  },
};

export default function FuncionalidadesPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: SITE_URL },
          {
            name: "Funcionalidades",
            url: `${SITE_URL}/funcionalidades`,
          },
        ]}
      />
      <FuncionalidadesClient />
    </>
  );
}
