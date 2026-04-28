import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { OrganizationSchema, WebSiteSchema } from "@/lib/schema";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";
const SITE_NAME = "Realtes";
const SITE_DESCRIPTION =
  "ERP + CRM inmobiliario para corredoras de propiedades en Chile. Captación multicanal (WhatsApp, Instagram, Messenger), CRM kanban, cargos automáticos, comisiones y reportes — sin más Excel. Empieza gratis 14 días.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · ERP + CRM inmobiliario para corredoras en Chile`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  generator: "Next.js",
  category: "Real Estate Software",
  classification: "Business / SaaS / Real Estate",
  referrer: "origin-when-cross-origin",
  keywords: [
    // Core
    "software inmobiliario",
    "ERP inmobiliario",
    "CRM inmobiliario",
    "software para corredoras de propiedades",
    "software corredora propiedades Chile",
    "sistema gestión inmobiliaria",
    "plataforma inmobiliaria SaaS",
    "Realtes",
    // Captación
    "WhatsApp Business inmobiliario",
    "Instagram leads inmobiliarios",
    "Messenger inmobiliario",
    "captación multicanal inmobiliaria",
    "bandeja unificada leads",
    // Operativa
    "comisiones inmobiliarias automáticas",
    "cargos arriendo automáticos",
    "split de comisión multi-agente",
    "pipeline kanban inmobiliario",
    "contratos arriendo automáticos",
    "reajuste UF arriendo",
    "morosidad arriendos",
    "aging cuentas por cobrar",
    // Marketing / portales
    "feeds Portal Inmobiliario",
    "feeds Toctoc",
    "escaparate público corredora",
    "tour 360 propiedades",
    "watermark fotos inmobiliarias",
    "QR propiedades",
    // Mercado / GEO
    "corredora de propiedades Santiago",
    "software inmobiliario Las Condes",
    "CRM corredora Vitacura",
    "gestión arriendos Chile",
    "venta propiedades UF Chile",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", rel: "shortcut icon" },
      {
        url: "/logos/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/logos/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/logos/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/logos/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/logos/apple-icon-57x57.png", sizes: "57x57" },
      { url: "/logos/apple-icon-60x60.png", sizes: "60x60" },
      { url: "/logos/apple-icon-72x72.png", sizes: "72x72" },
      { url: "/logos/apple-icon-76x76.png", sizes: "76x76" },
      { url: "/logos/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/logos/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/logos/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/logos/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/logos/apple-icon-180x180.png", sizes: "180x180" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/logos/apple-icon-precomposed.png",
      },
      {
        rel: "mask-icon",
        url: "/logos/realtes-iso.png",
        color: "#1a1612",
      },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: {
      "es-CL": "/",
      es: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    alternateLocale: ["es_ES"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} · ERP + CRM inmobiliario para corredoras en Chile`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Realtes — ERP + CRM inmobiliario para corredoras en Chile",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@realtescl",
    creator: "@realtescl",
    title: `${SITE_NAME} · ERP + CRM inmobiliario en Chile`,
    description:
      "Captación multicanal (WhatsApp / Instagram / Messenger), CRM, cargos automáticos y reportes para tu corredora. 14 días gratis.",
    images: ["/og"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  other: {
    "msapplication-TileColor": "#f4ecdc",
    "msapplication-TileImage": "/logos/ms-icon-144x144.png",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4ecdc" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1612" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL" className="h-full antialiased">
      <head>
        {/* Performance hints — ahorra ~150-300ms en primer paint */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://i.pravatar.cc" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://i.pravatar.cc" />

        {/* JSON-LD globales — Organization + WebSite con SearchAction */}
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
