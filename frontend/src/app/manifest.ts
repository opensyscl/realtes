import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Realtes · ERP + CRM inmobiliario",
    short_name: "Realtes",
    description:
      "SaaS inmobiliario para corredoras de propiedades en Chile. ERP, CRM, captación multicanal, cargos automáticos y reportes.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4ecdc",
    theme_color: "#1a1612",
    orientation: "portrait-primary",
    lang: "es-CL",
    dir: "ltr",
    scope: "/",
    categories: ["business", "productivity", "real-estate"],
    icons: [
      {
        src: "/logos/android-icon-36x36.png",
        sizes: "36x36",
        type: "image/png",
        density: "0.75",
      },
      {
        src: "/logos/android-icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
        density: "1.0",
      },
      {
        src: "/logos/android-icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        density: "1.5",
      },
      {
        src: "/logos/android-icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        density: "2.0",
      },
      {
        src: "/logos/android-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        density: "3.0",
      },
      {
        src: "/logos/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        density: "4.0",
        purpose: "any maskable",
      },
    ],
    shortcuts: [
      {
        name: "Funcionalidades",
        url: "/funcionalidades",
        description: "Todo lo que tu corredora necesita",
      },
      {
        name: "Planes y precios",
        url: "/planes",
        description: "Compara planes y elige el tuyo",
      },
    ],
  };
}
