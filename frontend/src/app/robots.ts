import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/funcionalidades",
          "/funcionalidades/",
          "/planes",
          "/resenas",
          "/p/",
        ],
        disallow: [
          "/api/",
          "/feeds/",
          "/dashboard",
          "/dashboard/",
          "/login",
          "/registro",
          "/forgot",
          "/reset",
          "/_next/",
          "/*?*plan=",
          "/*?*utm_",
          "/*?*ref=",
          "/*?*fbclid=",
          "/*?*gclid=",
        ],
      },
      // Bloquear scrapers SEO agresivos. Mantenemos abiertos los crawlers
      // legítimos (Googlebot, Bingbot, DuckDuckBot, GPTBot, PerplexityBot).
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "BLEXBot",
          "PetalBot",
          "DataForSeoBot",
          "SerpstatBot",
          "barkrowler",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
