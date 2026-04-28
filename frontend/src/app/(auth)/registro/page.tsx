import type { Metadata } from "next";

import { RegistroClient } from "./registro-client";

export const metadata: Metadata = {
  title: "Crea tu corredora en 2 minutos",
  description:
    "Empieza gratis con Realtes. Configuramos pipeline, dashboard y escaparate público en menos de un minuto. Sin tarjeta de crédito.",
  alternates: { canonical: "/registro" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function RegistroPage() {
  return <RegistroClient />;
}
