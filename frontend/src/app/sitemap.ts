import type { MetadataRoute } from "next";

import { SERVICE_SLUGS } from "@/lib/services-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const services: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/funcionalidades/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/`,
          es: `${SITE_URL}/`,
        },
      },
    },
    {
      url: `${SITE_URL}/funcionalidades`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/planes`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/resenas`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...services,
  ];
}
