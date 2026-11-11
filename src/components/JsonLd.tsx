import React from "react";

interface OrganizationJsonLdProps {
  url?: string;
}

export function OrganizationJsonLd({ url = "https://digigrantha.com" }: OrganizationJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": `${url}/#organization`,
        name: "DigiGrantha",
        alternateName: ["DigiGrantha Studio", "Digigrantha"],
        url: url,
        logo: {
          "@type": "ImageObject",
          "@id": `${url}/#logo`,
          url: `${url}/digigrantha-logo-1200.png`,
          contentUrl: `${url}/digigrantha-logo-1200.png`,
          caption: "DigiGrantha — Where ideas become digital",
        },
        image: {
          "@id": `${url}/#logo`,
        },
        description:
          "DigiGrantha is an independent digital product and software engineering studio. We design, architect, and ship high-performance web applications, responsive websites, private client portals, and resilient digital platforms start to finish.",
        email: "team@digigrantha.com",
        sameAs: [
          "https://github.com/manishgupta2026/kiln",
        ],
        priceRange: "$$",
        currenciesAccepted: "USD, INR, EUR, GBP",
        paymentAccepted: "Credit Card, Wire Transfer, Bank Transfer",
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
              itemOffered: {
                "@type": "Service",
                name: "Websites that Explain Themselves",
                description:
                  "Editorial landing pages and marketing sites engineered with speed, clarity, and thoughtful typography that convert visitors immediately.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Full-Stack Web Applications & Products",
                description:
                  "Production web apps, SaaS dashboards, and workflow tools designed and engineered end-to-end with high agency and clean architectures.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Intelligent & Data-Heavy Platforms",
                description:
                  "From algorithmic trading engines to multi-role workforce intelligence platforms, logic-heavy products where zero downtime and data integrity are non-negotiable.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Private Client Portal Infrastructure",
                description:
                  "Bespoke transparent client portals featuring live phase tracking, integrated messaging, milestone sign-offs, and unified invoice management.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Post-Launch Monitoring & Look After",
                description:
                  "Dedicated DevOps, uptime monitoring, security patching, and ongoing performance optimization.",
              },
            },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url: url,
        name: "DigiGrantha",
        description:
          "Expressive digital product & web development studio. Where ideas become digital.",
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
    name: "Shipped Projects & Case Studies — DigiGrantha",
    description:
      "A curated archive of production digital products, enterprise portals, and web applications delivered by DigiGrantha.",
    numberOfItems: items.length,
    itemListElement: items.map((proj, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "CreativeWork",
        name: proj.name,
        description: proj.description,
        genre: proj.category,
        url: proj.url || `https://digigrantha.com/work#project-0${idx + 1}`,
        creator: {
          "@type": "Organization",
          name: "DigiGrantha",
        },
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
