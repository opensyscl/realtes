/**
 * JSON-LD Schema.org structured data para SEO.
 * Renderiza scripts <script type="application/ld+json"> consumibles por Google,
 * Bing y AI search engines (Perplexity, ChatGPT, etc.).
 *
 * Doc tipos: https://schema.org/docs/full.html
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtes.cl";

const ORG = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Realtes",
  legalName: "Realtes SpA",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logos/realtes-full.png`,
    width: 512,
    height: 128,
  },
  description:
    "SaaS de gestión inmobiliaria — ERP + CRM para corredoras de propiedades en Chile.",
  foundingLocation: { "@type": "Place", name: "Santiago, Chile" },
  areaServed: { "@type": "Country", name: "Chile" },
  knowsLanguage: "es-CL",
  sameAs: [
    "https://www.instagram.com/realtescl",
    "https://www.linkedin.com/company/realtes",
    "https://twitter.com/realtescl",
    "https://www.facebook.com/realtescl",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hola@realtes.cl",
      availableLanguage: ["Spanish"],
      areaServed: "CL",
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "ventas@realtes.cl",
      availableLanguage: ["Spanish"],
      areaServed: "CL",
    },
  ],
};

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify on internal data is safe
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/* ============ Schemas globales (van en root layout) ============ */

export function OrganizationSchema() {
  return <JsonLd data={{ "@context": "https://schema.org", ...ORG }} />;
}

export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Realtes",
        url: SITE_URL,
        inLanguage: "es-CL",
        description:
          "ERP + CRM inmobiliario para corredoras de propiedades en Chile.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/buscar?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/* ============ Schemas por página ============ */

export function SoftwareApplicationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Realtes",
        url: SITE_URL,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Real Estate CRM",
        operatingSystem: "Web, Cloud-based",
        description:
          "Software inmobiliario todo-en-uno para corredoras: ERP, CRM kanban, captación multicanal (WhatsApp, Instagram, Messenger), cargos automáticos, comisiones y reportes.",
        inLanguage: "es-CL",
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        offers: [
          {
            "@type": "Offer",
            name: "Starter",
            price: "0",
            priceCurrency: "CLP",
            description: "Plan gratis para empezar",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/planes`,
          },
          {
            "@type": "Offer",
            name: "Pro",
            price: "29990",
            priceCurrency: "CLP",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "29990",
              priceCurrency: "CLP",
              unitText: "MONTH",
            },
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/planes`,
          },
          {
            "@type": "Offer",
            name: "Business",
            price: "79990",
            priceCurrency: "CLP",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "79990",
              priceCurrency: "CLP",
              unitText: "MONTH",
            },
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/planes`,
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "1200",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: [
          "ERP completo (propiedades, contratos, cargos, pagos)",
          "CRM con pipeline kanban",
          "Captación multicanal (WhatsApp, Instagram, Messenger)",
          "Cargos mensuales automáticos",
          "Sistema de comisiones y splits",
          "Marketplace cross-broker",
          "Escaparate público bajo tu marca",
          "Feeds para Portal Inmobiliario y Toctoc",
          "Reportes y analytics avanzados",
          "Tour 360° y vídeo embebido",
          "Multi-oficina y multi-marca",
          "Roles y permisos granulares",
          "Soporte en español",
        ],
        screenshot: `${SITE_URL}/opengraph-image`,
        audience: {
          "@type": "Audience",
          audienceType: "Corredoras de propiedades, brokers inmobiliarios",
          geographicArea: { "@type": "Country", name: "Chile" },
        },
      }}
    />
  );
}

export function FAQPageSchema({
  faqs,
}: {
  faqs: { q: string; a: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }}
    />
  );
}

export function ProductSchema({
  name,
  description,
  price,
  url,
}: {
  name: string;
  description: string;
  price: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: `Realtes ${name}`,
        description,
        brand: { "@type": "Brand", name: "Realtes" },
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: "CLP",
          availability: "https://schema.org/InStock",
          url,
        },
      }}
    />
  );
}

export function ReviewListSchema({
  reviews,
  aggregateRating,
}: {
  reviews: {
    quote: string;
    author: string;
    rating: number;
  }[];
  aggregateRating: { rating: string; reviewCount: string };
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Realtes",
        description:
          "ERP + CRM inmobiliario para corredoras de propiedades en Chile.",
        brand: { "@type": "Brand", name: "Realtes" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: aggregateRating.rating,
          reviewCount: aggregateRating.reviewCount.replace(/[^0-9]/g, ""),
          bestRating: "5",
          worstRating: "1",
        },
        review: reviews.map((r) => ({
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating.toString(),
            bestRating: "5",
            worstRating: "1",
          },
          author: { "@type": "Person", name: r.author },
          reviewBody: r.quote,
        })),
      }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
