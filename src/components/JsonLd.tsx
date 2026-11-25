import React from "react";
import { STUDIO_FACTS } from "@/lib/studio-facts";

interface OrganizationJsonLdProps {
  url?: string;
}

export function OrganizationJsonLd({ url = STUDIO_FACTS.siteUrl }: OrganizationJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": `${url}/#organization`,
        name: STUDIO_FACTS.brandName,
        alternateName: ["DigiGrantha Studio", "Digigrantha"],
        url: url,
        logo: {
          "@type": "ImageObject",
          "@id": `${url}/#logo`,
          url: `${url}/digigrantha-logo-1200.png`,
          contentUrl: `${url}/digigrantha-logo-1200.png`,
          caption: `${STUDIO_FACTS.brandName}: ${STUDIO_FACTS.tagline}`,
        },
        image: {
          "@id": `${url}/#logo`,
        },
        description:
          "DigiGrantha is an independent digital product and software engineering studio. We design, architect, and ship custom web applications, responsive websites, private client portals, and data-heavy platforms start to finish.",
        email: STUDIO_FACTS.contactEmail,
        sameAs: [
          "https://github.com/manishgupta2026/kiln",
        ],
        priceRange: "₹25,000 - ₹10,00,000+",
        currenciesAccepted: "INR, USD, EUR, GBP",
        paymentAccepted: "Bank Transfer, Wire Transfer, UPI, Credit Card",
        knowsAbout: [
          "Custom Web Application Development",
          "Next.js 15 & React 19 Engineering",
          "Full-Stack TypeScript Architecture",
          "UI/UX Product Design & Design Systems",
          "PostgreSQL & Neon Database Optimization",
          "Cloudflare Workers & Edge Deployment",
          "Private Client Portal Infrastructure",
          "Algorithmic Data Platforms & Dashboards",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Engineering & Product Design Services",
          itemListElement: [
            {
              "@type": "Offer",
              priceCurrency: "INR",
              priceSpecification: {
                "@type": "PriceSpecification",
                priceCurrency: "INR",
                minPrice: 25000,
                maxPrice: 50000,
              },
              itemOffered: {
                "@type": "Service",
                name: "Websites that Explain Themselves",
                description:
                  "Editorial landing pages and marketing sites engineered with fast load times, clear structure, and conversion-focused copy.",
              },
            },
            {
              "@type": "Offer",
              priceCurrency: "INR",
              priceSpecification: {
                "@type": "PriceSpecification",
                priceCurrency: "INR",
                minPrice: 50000,
                maxPrice: 200000,
              },
              itemOffered: {
                "@type": "Service",
                name: "Full-Stack Web Applications & Products",
                description:
                  "Production web apps, SaaS dashboards, and workflow tools designed and engineered end-to-end in TypeScript and PostgreSQL.",
              },
            },
            {
              "@type": "Offer",
              priceCurrency: "INR",
              priceSpecification: {
                "@type": "PriceSpecification",
                priceCurrency: "INR",
                minPrice: 200000,
              },
              itemOffered: {
                "@type": "Service",
                name: "Intelligent & Data-Heavy Platforms",
                description:
                  "Algorithmic analytics engines and multi-role enterprise portals where uptime and data integrity are non-negotiable.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Private Client Portal Infrastructure",
                description:
                  "Dedicated client portals featuring 4-stage live progress tracking, async developer chat, milestone sign-offs, and unified invoice management.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Post-Launch Monitoring & Maintenance",
                description:
                  "Dedicated DevOps, edge uptime monitoring, security patching, and ongoing performance optimization.",
              },
            },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url: url,
        name: STUDIO_FACTS.brandName,
        description:
          "Digital product and web development studio. Where ideas become digital.",
        publisher: {
          "@id": `${url}/#organization`,
        },
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  item: string;
}

export function BreadcrumbJsonLd({ items = [] }: { items?: BreadcrumbItem[] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: crumb.name,
      item: crumb.item,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ items = [] }: { items?: FaqItem[] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface PortfolioItem {
  name: string;
  description: string;
  url?: string | null;
  category?: string;
  image?: string;
}

export function PortfolioJsonLd({ items = [] }: { items?: PortfolioItem[] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Shipped Projects & Case Studies | DigiGrantha",
    description:
      "Archive of production digital products, multi-role enterprise portals, and web applications delivered by DigiGrantha.",
    numberOfItems: items.length,
    itemListElement: items.map((proj, idx) => {
      const paddedIdx = String(idx + 1).padStart(2, "0");
      return {
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "CreativeWork",
          name: proj.name,
          description: proj.description,
          genre: proj.category,
          url: proj.url || `${STUDIO_FACTS.siteUrl}/work#project-${paddedIdx}`,
          creator: {
            "@type": "Organization",
            name: STUDIO_FACTS.brandName,
          },
        },
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
