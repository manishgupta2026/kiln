import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkFilterList from "@/components/WorkFilterList";
import CursorPreview from "@/components/CursorPreview";
import ScrollReveal from "@/components/ScrollReveal";
import { getCaseStudies } from "@/lib/case-studies-db";

import { BreadcrumbJsonLd, PortfolioJsonLd } from "@/components/JsonLd";

export const revalidate = 60; // 1 minute revalidation so admin edits reflect quickly

export const metadata: Metadata = {
  title: "Work & Case Studies — Digital Product & Web Portfolio",
  description:
    "Explore shipped digital products, enterprise portals, algorithmic platforms, and web applications engineered by DigiGrantha. Real products with verified outcomes.",
  alternates: {
    canonical: "https://digigrantha.com/work",
  },
  openGraph: {
    title: "Work & Case Studies — DigiGrantha Portfolio",
    description:
      "Explore shipped digital products, enterprise portals, algorithmic platforms, and web applications engineered by DigiGrantha.",
    url: "https://digigrantha.com/work",
  },
};

export default async function WorkPage() {
  const caseStudies = await getCaseStudies();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://digigrantha.com" },
          { name: "Work", item: "https://digigrantha.com/work" },
        ]}
      />
      <PortfolioJsonLd
        items={caseStudies.map((s) => ({
          name: s.name,
          description: s.oneLiner,
          category: s.category,
          url: s.liveUrl,
        }))}
      />
      <ScrollReveal />
      <Header />

      <main>
        <section className="page-head">
          <div className="wrap">
            <div className="eyebrow reveal">Full archive</div>
            <h1 className="reveal">
              Everything we&apos;ve shipped — and what&apos;s in the oven which we are proud of.
            </h1>
            <p className="page-sub reveal">
              This list grows every time we finish something. Filter by kind, or just scroll —
              there&apos;s nothing here we&apos;re not proud of.
            </p>

            <WorkFilterList initialCaseStudies={caseStudies} />
          </div>
        </section>

        <CursorPreview projects={caseStudies as any} />

        <section className="cta-strip">
          <div className="wrap reveal">
            <div className="cta-inner">
              <div className="cta-copy">
                <h2>Have an idea lets make it Real.</h2>
                <p className="cta-sub">
                  Send us a 30s brief, we would reply within 1–2 business days.
                </p>
              </div>
              <Link href="/#brief" className="btn-primary">
                Tell us about it →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
