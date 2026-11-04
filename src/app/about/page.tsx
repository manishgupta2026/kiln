import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import FaqSection from "@/components/FaqSection";
import { getTeamMembers } from "@/lib/team-db";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About — Digigrantha",
  description: "A small team, on purpose. Design and development, in-house, start to finish.",
};

const MILESTONES = [
  "Shipped 5e Serpraise — corporate training and organizational development platform built across two major generational releases (V1 & V2).",
  "Built Manraah — a mental wellness platform with dedicated experiences for students, professionals, and administrators.",
  "Shipped NutriFlex — an AI-powered fitness assistant delivering dynamic workout progressions and personalized weekly health tasks.",
  "Shipped Coppter — 4 role-based portals for an enterprise workforce intelligence platform, from zero to live deployment.",
  "Shipped CourseHunt — a course aggregator now used by 1,000+ students every day.",
  "Built TradeSage — an algorithmic trading system live on real capital, currently running at a 60.5% win rate.",
  "Expanded DigiGrantha into an in-house studio — bringing engineering, product design, and private client portals under one roof to ship products end-to-end.",
];

export default async function AboutPage() {
  const team = await getTeamMembers();

  return (
    <>
      <ScrollReveal />
      <Header />

      <main>
        <section className="page-head">
          <div className="wrap">
            <div className="eyebrow reveal">About</div>
            <h1 className="reveal">A small team, on purpose.</h1>
            <p className="page-sub reveal">
              Digigrantha isn&apos;t a big studio pretending to be boutique. It&apos;s a small one that
              stayed small on purpose — because that&apos;s what lets us actually build the whole
              thing, ourselves, instead of managing a project through five layers of people.
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
                  <span className="mvg-icon">🎯</span>
                </div>
                <h3>Crafting products that endure</h3>
                <p>
                  To transform ambitious ideas into thoughtful, robustly engineered digital experiences —
                  from sleek websites and web applications to intelligent, data-heavy platforms — with absolute
                  craftsmanship, rapid execution, and complete transparency.
                </p>
                <div className="mvg-tag">Design + Engineering + Trust</div>
              </div>

              <div className="mvg-card vision">
                <div className="mvg-card-header">
                  <span className="mvg-badge">Vision</span>
                  <span className="mvg-icon">🔭</span>
                </div>
                <h3>Where ideas become digital</h3>
                <p>
                  To be the gold standard digital product studio where ambitious founders and enterprise leaders turn
                  when standard agencies are too slow and freelance networks are too fragile. Proving that an elite,
                  compact team consistently builds superior software.
                </p>
                <div className="mvg-tag">The Independent Studio Standard</div>
              </div>

              <div className="mvg-card goal">
                <div className="mvg-card-header">
                  <span className="mvg-badge">Goal</span>
                  <span className="mvg-icon">⚡</span>
                </div>
                <h3>Zero black boxes. Real impact.</h3>
                <p>
                  To eliminate status meetings and handoff friction by giving every client real-time portal
                  visibility, direct access to the developers writing code, and post-launch reliability that
                  stands firm under real-world traffic and real capital.
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
            <div className="team-grid reveal">
              {team.map((member) => (
                <div key={member.id || member.name} className="founder-card">
                  <div className="founder-avatar" style={{ overflow: "hidden" }}>
                    {member.avatar && (member.avatar.startsWith("http") || member.avatar.startsWith("/")) ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
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
              <p>
                Most of what makes an early-stage product feel considered — the small decisions
                about how a screen should behave, what a form should ask for and when, what happens
                when something breaks at an inconvenient hour — gets lost the moment a project passes
                through too many hands.
              </p>
              <p>
                Staying small means the person who designed your product is the same person who&apos;s
                going to get paged if it goes down. That&apos;s not a limitation we&apos;re working
                around. It&apos;s the actual reason the work is good.
              </p>
            </div>
          </div>
        </section>

        {/* MILESTONES */}
        <section className="milestones">
          <div className="wrap">
            <div className="section-label reveal">So far</div>
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

      <Footer showNote={false} />
    </>
  );
}
