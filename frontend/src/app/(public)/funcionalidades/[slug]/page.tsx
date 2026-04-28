import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServiceDetail } from "./service-detail";
import { SERVICES, SERVICE_SLUGS, getService } from "@/lib/services-data";
import { BreadcrumbSchema, FAQPageSchema } from "@/lib/schema";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    return { title: "Servicio no encontrado" };
  }

  const url = `${SITE_URL}/funcionalidades/${slug}`;

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    keywords: service.metaKeywords,
    alternates: { canonical: `/funcionalidades/${slug}` },
    openGraph: {
      url,
      title: service.metaTitle,
      description: service.metaDescription,
      images: ["/og"],
    },
    twitter: {
      title: service.metaTitle,
      description: service.metaDescription,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Funcionalidades", url: `${SITE_URL}/funcionalidades` },
          {
            name: service.eyebrow,
            url: `${SITE_URL}/funcionalidades/${slug}`,
          },
        ]}
      />
      <FAQPageSchema faqs={service.faqs} />
      <ServiceDetail service={service} otherSlugs={SERVICE_SLUGS.filter((s) => s !== slug)} allServices={SERVICES} />
    </>
  );
}
