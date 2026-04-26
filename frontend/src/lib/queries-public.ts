"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type TemplatePreset = "modern_loft" | "minimal_pro" | "classic";

export interface TemplateConfig {
  hero_style: "fullbleed" | "sidebar";
  gallery_style: "grid" | "slider" | "masonry";
  show_features: boolean;
  show_amenities_grid: boolean;
  show_map: boolean;
  show_agent: boolean;
  show_mortgage_calc: boolean;
  show_similar: boolean;
  show_tour: boolean;
}

export interface AgencyTemplate {
  preset: TemplatePreset;
  primary_color: string;
  font: "sans" | "serif" | "display";
  config: TemplateConfig;
}

export interface PublicAgency {
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  logo_url: string | null;
  properties_count: number;
  template: AgencyTemplate;
}

export interface PublicProperty {
  id: number;
  code: string;
  title: string;
  type: string;
  status: string;
  listing_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  address: string;
  city: string;
  postal_code: string | null;
  price_rent: number | null;
  price_sale: number | null;
  community_fee: number | null;
  cover_image_url: string | null;
  tags: string[];
  description?: string;
  features?: string[];
  photos?: { id: number; url: string }[];
  tour_url?: string | null;
  booking_enabled?: boolean;
  booking_provider?: "calcom" | "google" | "other" | null;
  booking_url?: string | null;
  video_url?: string | null;
}

export interface PublicListResponse {
  data: PublicProperty[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PublicFilters {
  search?: string;
  type?: string;
  listing_type?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  bedrooms_min?: number;
  page?: number;
  per_page?: number;
}

function qs(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) usp.set(k, String(v));
  });
  return usp.toString();
}

export function usePublicAgency(slug: string) {
  return useQuery({
    queryKey: ["public", "agency", slug],
    queryFn: () => get<{ data: PublicAgency }>(`/api/public/${slug}`).then((r) => r.data),
  });
}

export function usePublicProperties(slug: string, filters: PublicFilters = {}) {
  return useQuery({
    queryKey: ["public", "properties", slug, filters],
    queryFn: () =>
      get<PublicListResponse>(
        `/api/public/${slug}/properties?${qs(filters as Record<string, unknown>)}`,
      ),
  });
}

export function usePublicProperty(slug: string, id: number | string | undefined) {
  return useQuery({
    queryKey: ["public", "property", slug, id],
    enabled: !!id,
    queryFn: () =>
      get<{ data: PublicProperty }>(`/api/public/${slug}/properties/${id}`).then(
        (r) => r.data,
      ),
  });
}

export function useSendPublicLead(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      phone?: string;
      message?: string;
      property_id?: number;
    }) => {
      const res = await fetch(`${API}/api/public/${slug}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<{ ok: boolean; lead_code: string }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["public"] }),
  });
}
