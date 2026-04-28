import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/funcionalidades", "/planes", "/p/"],
        disallow: [
          "/api/",
          "/dashboard",
          "/dashboard/*",
          "/(app)/*",
          "/registro",
          "/login",
          "/forgot",
          "/_next/",
          "/*?*plan=", // evita query params que generan dup content
        ],
      },
      // Bloqueamos crawlers de IA agresivos / scrapers
      // (mantener Google, Bing, DuckDuckGo, AI search legítimos como Perplexity/OpenAI)
      {
        userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
