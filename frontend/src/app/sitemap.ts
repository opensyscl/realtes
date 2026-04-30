import type { MetadataRoute } from "next";

import { SERVICE_SLUGS } from "@/lib/services-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

const API_URL =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

export const revalidate = 3600;

interface PublicAgencyEntry {
  slug: string;
  updated_at?: string;
  properties_count?: number;
}

async function fetchPublicAgencies(): Promise<PublicAgencyEntry[]> {
  if (!API_URL) return [];
  try {
    const res = await fetch(`${API_URL}/api/public/_agencies`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: PublicAgencyEntry[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const services: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/funcionalidades/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const agencies = await fetchPublicAgencies();
  const agencyEntries: MetadataRoute.Sitemap = agencies.map((a) => ({
    url: `${SITE_URL}/p/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.6,
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
          "x-default": `${SITE_URL}/`,
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
    ...agencyEntries,
  ];
}
