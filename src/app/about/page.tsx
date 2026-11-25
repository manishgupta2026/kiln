import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import FaqSection from "@/components/FaqSection";
import { getTeamMembers } from "@/lib/team-db";
import { STUDIO_FACTS } from "@/lib/studio-facts";
import { FAQS } from "@/lib/faqs";

import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "In-House Engineering & Design Studio",
  description:
    "Meet the builders behind DigiGrantha. We design and engineer custom web apps, SaaS tools, and private client portals in-house with zero outsourcing.",
  alternates: {
    canonical: "https://digigrantha.com/about",
  },
  openGraph: {
    title: "In-House Engineering & Design Studio | DigiGrantha",
    description:
      "Meet the engineers behind DigiGrantha: a small, high-agency software studio building custom web apps and enterprise portals end-to-end.",
    url: "https://digigrantha.com/about",
  },
};

const MILESTONES = [
  "Shipped 5e Serpraise: corporate training and organizational development platform built across two generational releases (V1 & V2).",
  "Built Manraah: a mental wellness platform with dedicated experiences for students, professionals, and administrators.",
  "Shipped NutriFlex: an adaptive fitness platform delivering dynamic workout progressions and structured health routines.",
  "Shipped Coppter: 4 role-based portals for an enterprise workforce intelligence platform, from zero to live deployment.",
  "Shipped CourseHunt: a course aggregator now used by 1,000+ students every day.",
  `Built TradeSage: an algorithmic trading system live on real capital with a ${STUDIO_FACTS.metrics.tradesage.summary}.`,
  "Expanded DigiGrantha into an in-house studio, bringing engineering, product design, and private client portals under one roof.",
];

export default async function AboutPage() {
  const team = await getTeamMembers();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://digigrantha.com" },
          { name: "About", item: "https://digigrantha.com/about" },
        ]}
      />
      <FaqJsonLd items={FAQS} />
      <ScrollReveal />
      <Header />

      <main>
        <section className="page-head">
          <div className="wrap">
            <div className="eyebrow reveal">About</div>
            <h1 className="reveal">A small team, on purpose.</h1>
            <p className="page-sub reveal">
              DigiGrantha isn&apos;t a big studio pretending to be boutique. It&apos;s a small one that
              stayed small on purpose so the same engineers design, build, and deploy your product
              instead of passing it through five layers of management. See{" "}
              <Link href="/work" style={{ textDecoration: "underline", fontWeight: 600 }}>
                our shipped work
              </Link>{" "}
              or check{" "}
              <Link href="/career" style={{ textDecoration: "underline", fontWeight: 600 }}>
                open roles
              </Link>
              .
            </p>
          </div>
        </section>

        {/* MISSION, VISION & GOAL */}
        <section className="mvg-section">
          <div className="wrap">
            <div className="section-label reveal">Our Blueprint</div>
            <h2 className="section-title reveal" style={{ marginBottom: 0 }}>
              Mission, Vision &amp; Goal
            </h2>
            <div className="mvg-grid reveal">
              <div className="mvg-card mission">
                <div className="mvg-card-header">
                  <span className="mvg-badge">Mission</span>
                  <span className="mvg-icon" aria-hidden="true">🎯</span>
                </div>
                <h3>Crafting products that last</h3>
                <p>
                  Turn ambitious ideas into fast, maintainable web software in Next.js, TypeScript,
                  and PostgreSQL. We ship custom websites, SaaS apps, and algorithmic platforms with
                  direct accountability and zero agency fluff.
                </p>
                <div className="mvg-tag">Design + Engineering + Trust</div>
              </div>

              <div className="mvg-card vision">
                <div className="mvg-card-header">
                  <span className="mvg-badge">Vision</span>
                  <span className="mvg-icon" aria-hidden="true">🔭</span>
                </div>
                <h3>Where ideas become digital</h3>
                <p>
                  To be the studio founders and product leaders choose when large agencies move too
                  slowly and solo freelancers lack full-stack continuity. A compact engineering team
                  ships cleaner software faster.
                </p>
                <div className="mvg-tag">The Independent Studio Standard</div>
              </div>

              <div className="mvg-card goal">
                <div className="mvg-card-header">
                  <span className="mvg-badge">Goal</span>
                  <span className="mvg-icon" aria-hidden="true">⚡</span>
                </div>
                <h3>Zero black boxes. Real impact.</h3>
                <p>
                  Replace endless status meetings with a live private client portal. Track every
                  milestone, message the engineers writing your code directly, and rely on ongoing
                  post-launch monitoring under real production traffic.
                </p>
                <div className="mvg-tag">Built · Shipped · Supported</div>
              </div>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="founder">
          <div className="wrap">
            <div className="section-label reveal">Team behind DigiGrantha</div>
            <h2 className="section-title reveal" style={{ marginBottom: "24px" }}>
              Meet the builders behind DigiGrantha
            </h2>
            <div className="team-grid reveal">
              {team.map((member) => (
                <div key={member.id || member.name} className="founder-card">
                  <div className="founder-avatar" style={{ overflow: "hidden" }}>
                    {member.avatar && (member.avatar.startsWith("http") || member.avatar.startsWith("/")) ? (
                      <img
                        src={member.avatar}
                        alt={`${member.name}, ${member.role} at DigiGrantha`}
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      member.avatar || member.name?.charAt(0)?.toUpperCase() || "M"
                    )}
                  </div>
                  <div>
                    <h3>{member.name}</h3>
                    <div className="founder-role">{member.role}</div>
                    <p>{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "24px", fontSize: "15px", color: "var(--muted)" }} className="reveal">
              Interested in building production systems with us?{" "}
              <Link href="/career" style={{ color: "var(--text)", fontWeight: 700, textDecoration: "underline" }}>
                Apply to join the studio →
              </Link>
            </p>
          </div>
        </section>

        {/* WHY */}
        <section className="why">
          <div className="wrap why-inner">
            <div className="why-badge reveal">
              <svg className="why-badge-star" width="16" height="16" viewBox="0 0 24 24" fill="#17201E" aria-hidden="true">
                <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
              </svg>
              <span className="why-badge-divider" aria-hidden="true" />
              <span className="why-badge-text">WHY SMALL, REALLY</span>
            </div>
            <div className="why-content reveal">
              <h2 className="section-title" style={{ marginBottom: "16px", fontSize: "clamp(24px, 3vw, 32px)" }}>
                Why work directly with a small studio?
              </h2>
              <p>
                Most of what makes an early-stage product feel sharp gets lost the moment a project
                passes through too many hands. Decisions about form validation, edge error states,
                and latency belong with the people writing the code.
              </p>
              <p>
                Staying small means the engineer who architected your product is the same person
                monitoring production uptime. Explore{" "}
                <Link href="/work" style={{ color: "var(--text)", fontWeight: 700, textDecoration: "underline" }}>
                  all shipped case studies
                </Link>{" "}
                to see this model in practice.
              </p>
            </div>
          </div>
        </section>

        {/* MILESTONES */}
        <section className="milestones">
          <div className="wrap">
            <div className="section-label reveal">So far</div>
            <h2 className="section-title reveal" style={{ marginBottom: "24px" }}>
              Verified milestones &amp; shipped outcomes
            </h2>
            <div className="milestone-list reveal">
              {MILESTONES.map((item, idx) => (
                <div key={idx} className="milestone">
                  <div className="dot" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection />

        {/* CTA STRIP */}
        <section className="cta-strip">
          <div className="wrap reveal">
            <div className="cta-inner">
              <h2>Think we&apos;d be a good fit?</h2>
              <Link href="/#brief" className="btn-primary">
                Tell us what you&apos;re building →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
