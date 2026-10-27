import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { getTeamMembers } from "@/lib/team-db";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About — Digigrantha",
  description: "A small team, on purpose. Design and development, in-house, start to finish.",
};

const MILESTONES = [
  "Shipped CourseHunt — a course aggregator now used by 1,000+ students every day.",
  "Built TradeSage — an algorithmic trading system live on real capital, currently running at a 60.5% win rate.",
  "Shipped Coppter — 4 role-based portals for a construction management platform, from zero to live deployment.",
  "Expanded Digigrantha into an in-house studio — bringing engineering, project management, and private client portals under one roof to ship products end-to-end.",
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

        {/* TEAM */}
        <section className="founder">
          <div className="wrap">
            <div className="section-label reveal">Who&apos;s building this</div>
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
            <div className="section-label reveal">Why small, really</div>
            <div className="reveal">
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
