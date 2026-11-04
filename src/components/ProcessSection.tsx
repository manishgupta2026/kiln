"use client";

import Link from "next/link";

interface ProcessPhase {
  num: string;
  phaseLabel: string;
  icon: string;
  title: string;
  desc: string;
  gate: string;
}

const PHASES: ProcessPhase[] = [
  {
    num: "01",
    phaseLabel: "Phase 01",
    icon: "🔍",
    title: "Discover",
    desc: "We start with your idea, your users, and your constraints. You get a clear scope and a plan before anything is built.",
    gate: "Scope & architecture plan",
  },
  {
    num: "02",
    phaseLabel: "Phase 02",
    icon: "✏️",
    title: "Design",
    desc: "Screens and flows you can react to early, not a big reveal at the end. Nothing moves forward until you approve it.",
    gate: "Interactive flow approval",
  },
  {
    num: "03",
    phaseLabel: "Phase 03",
    icon: "⚡",
    title: "Build",
    desc: "Engineering in visible phases. Track progress in your private portal and talk directly to the developers doing the work.",
    gate: "Milestone code delivery",
  },
  {
    num: "04",
    phaseLabel: "Phase 04",
    icon: "🚀",
    title: "Launch & Look After",
    desc: "We deploy, monitor, and stay on call. Launch day is the start of the relationship, not the end of it.",
    gate: "Live production & monitoring",
  },
];

export default function ProcessSection() {
  return (
    <section className="process-section" id="process" aria-labelledby="process-heading">
      <div className="wrap">
        {/* Section Header */}
        <div className="reveal">
          <div className="section-label" id="process-heading">
            Process : How We work
          </div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            Four phases. You see every one of them.
          </h2>
        </div>

        {/* 4 Phases Cards Grid */}
        <div className="process-grid reveal">
          {PHASES.map((p) => (
            <div key={p.num} className="process-card">
              <div>
                <div className="process-card-header">
                  <span className="process-phase-badge">{p.phaseLabel}</span>
                  <span className="process-icon" aria-hidden="true">{p.icon}</span>
                </div>
                <h3 className="process-card-title">{p.num}. {p.title}</h3>
                <p className="process-card-desc">{p.desc}</p>
              </div>

              <div className="process-card-footer">
                <span style={{ color: "var(--accent)" }}>✓</span>
                <span>{p.gate}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Sign-off Callout */}
        <div className="process-signoff-bar reveal">
          <div className="process-signoff-content">
            <span className="process-signoff-badge">✦ Sign-off Gates</span>
            <div className="process-signoff-text">
              <strong>Every phase ends with a one-click sign-off.</strong>
              <span>You stay in control without sitting in status meetings.</span>
            </div>
          </div>

          <Link href="/#brief" className="btn-primary" style={{ fontSize: "13px", padding: "10px 20px" }}>
            Start with Phase 01 ↓
          </Link>
        </div>
      </div>
    </section>
  );
}
