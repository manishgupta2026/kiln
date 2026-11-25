import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkFilterList from "@/components/WorkFilterList";
import CursorPreview from "@/components/CursorPreview";
import ScrollReveal from "@/components/ScrollReveal";
import { getCaseStudies } from "@/lib/case-studies-db";
import { WORK_PROJECTS } from "@/lib/work-projects";
import { STUDIO_FACTS } from "@/lib/studio-facts";

import { BreadcrumbJsonLd, PortfolioJsonLd } from "@/components/JsonLd";

export const revalidate = 60; // 1 minute revalidation so admin edits reflect quickly

export const metadata: Metadata = {
  title: "Shipped Web Apps & Software Portfolio",
  description:
    "Browse 6 production web apps, FinTech systems, multi-role enterprise portals, and client websites engineered in-house by DigiGrantha.",
  alternates: {
    canonical: "https://digigrantha.com/work",
  },
  openGraph: {
    title: "Shipped Web Apps & Software Portfolio | DigiGrantha",
    description:
      "Browse production web applications, enterprise portals, algorithmic trading systems, and client websites engineered by DigiGrantha.",
    url: "https://digigrantha.com/work",
  },
};

export default async function WorkPage() {
  const caseStudies = await getCaseStudies();
  const portfolioItems = WORK_PROJECTS.map((wp) => {
    const match = caseStudies.find((c) => c.name.toLowerCase() === wp.name.toLowerCase());
    return {
      name: wp.name,
      description: match?.oneLiner || wp.oneLiner,
      category: wp.category,
      url: wp.liveUrl,
    };
  });

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://digigrantha.com" },
          { name: "Work", item: "https://digigrantha.com/work" },
        ]}
      />
      <PortfolioJsonLd items={portfolioItems} />
      <ScrollReveal />
      <Header />

      <main>
        <section className="page-head">
          <div className="wrap">
            <div className="eyebrow reveal">Full archive · {WORK_PROJECTS.length} shipped products</div>
            <h1 className="reveal">
              Everything we&apos;ve shipped, and what we&apos;re building next.
            </h1>
            <p className="page-sub reveal">
              This archive grows every time a build ships. Filter by category below, learn{" "}
              <Link href="/about" style={{ textDecoration: "underline", fontWeight: 600 }}>
                how our small studio operates
              </Link>
              , or explore{" "}
              <Link href="/career" style={{ textDecoration: "underline", fontWeight: 600 }}>
                open engineering roles
              </Link>
              .
            </p>

            <h2 className="section-label reveal" style={{ marginBottom: "18px" }}>
              Case studies &amp; production builds
            </h2>

            <WorkFilterList initialCaseStudies={caseStudies} />
          </div>
        </section>

        <CursorPreview projects={caseStudies as any} />

        <section className="cta-strip">
          <div className="wrap reveal">
            <div className="cta-inner">
              <div className="cta-copy">
                <h2>Have an idea? Let&apos;s build it.</h2>
                <p className="cta-sub">
                  Send a short brief. We reply within {STUDIO_FACTS.replySla} with a concrete architecture plan.
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
