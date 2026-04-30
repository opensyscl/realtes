import type { Metadata } from "next";

import { ResenasClient } from "./resenas-client";
import {
  BreadcrumbSchema,
  ReviewListSchema,
} from "@/lib/schema";
import { REVIEWS, REVIEW_STATS } from "@/lib/reviews-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

export const metadata: Metadata = {
  title: "Reseñas — 4.9★ de 1.247 corredoras",
  description:
    "Más de 1.200 reseñas de corredoras de propiedades en Chile. 4.9 estrellas promedio. Lee historias reales de cómo Realtes les ayudó a operar con menos fricción y cerrar más operaciones.",
  keywords: [
    "reseñas Realtes",
    "opiniones software inmobiliario Chile",
    "testimonios CRM corredora",
    "Realtes valoraciones",
    "casos de éxito inmobiliario Chile",
  ],
  alternates: { canonical: "/resenas" },
  openGraph: {
    url: `${SITE_URL}/resenas`,
    title: "Reseñas Realtes — 4.9 ⭐ de 1.247 corredoras",
    description:
      "Lo que dicen las corredoras de Las Condes, Vitacura, Concón, Reñaca y más sobre Realtes.",
    images: ["/og"],
  },
  twitter: {
    title: "Reseñas Realtes — 4.9 ⭐ de 1.247 corredoras",
    description:
      "Historias reales de corredoras que cierran más operaciones con menos fricción.",
  },
};

export default function ResenasPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Reseñas", url: `${SITE_URL}/resenas` },
        ]}
      />
      <ReviewListSchema
        reviews={REVIEWS.map((r) => ({
          quote: r.quote,
          author: r.author,
          rating: r.rating,
        }))}
        aggregateRating={{
          rating: REVIEW_STATS.rating,
          reviewCount: REVIEW_STATS.reviewCount,
        }}
      />
      <ResenasClient />
    </>
  );
}
