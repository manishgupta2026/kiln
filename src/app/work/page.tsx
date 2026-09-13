import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkFilterList from "@/components/WorkFilterList";
import CursorPreview from "@/components/CursorPreview";
import ScrollReveal from "@/components/ScrollReveal";
import { getCaseStudies } from "@/lib/case-studies-db";

export const revalidate = 60; // 1 minute revalidation so admin edits reflect quickly

export const metadata: Metadata = {
  title: "Work — Kiln",
  description: "Full archive of products we've shipped and what's in the oven.",
};

export default async function WorkPage() {
  const caseStudies = await getCaseStudies();

  return (
    <>
      <ScrollReveal />
      <Header />

      <main>
        <section className="page-head">
          <div className="wrap">
            <div className="eyebrow reveal">Full archive</div>
            <h1 className="reveal">Everything we&apos;ve shipped — and what&apos;s in the oven.</h1>
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
              <h2>Building something that isn&apos;t on this list yet?</h2>
              <Link href="/#brief" className="btn-primary">
                Tell us about it →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer showNote={false} />
    </>
  );
}
