"use client";

import Link from "next/link";

const FEATURES = [
  {
    step: "01",
    tag: "LIVE STATUS",
    title: "4-Stage Progress Tracker",
    desc: "Follow your build in real time through Discover, Design, Build, and Ship & Iterate.",
    badgeColor: "var(--accent)",
    badgeBg: "var(--accent-soft)",
    preview: (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "4px",
          marginTop: "14px",
          padding: "10px 8px",
          background: "rgba(23, 21, 15, 0.02)",
          borderRadius: "8px",
          border: "1px solid var(--line)",
        }}
      >
        {[
          { label: "Discover", active: false, done: true },
          { label: "Design", active: false, done: true },
          { label: "Build", active: true, done: false },
          { label: "Ship", active: false, done: false },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "4px 2px",
              borderRadius: "5px",
              background: s.active ? "var(--accent-soft)" : s.done ? "#fff" : "transparent",
              border: s.active ? "1px solid var(--accent)" : s.done ? "1px solid var(--line)" : "1px dashed var(--line)",
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: s.active ? "var(--accent)" : "var(--muted)", fontWeight: s.active ? 600 : 400 }}>
              {s.done ? "✓" : `0${i + 1}`}
            </div>
            <div style={{ fontSize: "10.5px", fontWeight: s.active ? 600 : 400, color: s.active ? "var(--accent)" : "var(--ink)", marginTop: "2px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    step: "02",
    tag: "DIRECT ACCESS",
    title: "Async Dev Team Chat",
    desc: "Chat directly with the engineers writing your code without waiting for scheduled calls.",
    badgeColor: "#3730a3",
    badgeBg: "#e0e7ff",
    preview: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginTop: "14px",
          padding: "10px",
          background: "rgba(23, 21, 15, 0.02)",
          borderRadius: "8px",
          border: "1px solid var(--line)",
          fontSize: "11.5px",
        }}
      >
        <div style={{ alignSelf: "flex-start", background: "#fff", border: "1px solid var(--line)", padding: "5px 8px", borderRadius: "6px 6px 6px 2px", maxWidth: "90%" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9.5px", color: "var(--muted)" }}>Client: </span>
          Can we test the mobile checkout?
        </div>
        <div style={{ alignSelf: "flex-end", background: "var(--accent-soft)", border: "1px solid rgba(117, 128, 31, 0.3)", padding: "5px 8px", borderRadius: "6px 6px 2px 6px", maxWidth: "90%" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9.5px", color: "var(--accent)" }}>Lead Dev: </span>
          Live on staging right now!
        </div>
      </div>
    ),
  },
  {
    step: "03",
    tag: "STRUCTURED FEEDBACK",
    title: "Async Ticket Queue",
    desc: "Raise bug reports, copy changes, or scope tweaks into tracked threads with live status.",
    badgeColor: "#c93b2b",
    badgeBg: "#fde8e4",
    preview: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginTop: "14px",
          padding: "10px",
          background: "rgba(23, 21, 15, 0.02)",
          borderRadius: "8px",
          border: "1px solid var(--line)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--line)" }}>
          <span style={{ fontSize: "11.5px", fontWeight: 500, color: "var(--ink)" }}>Design system sync</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9px", background: "var(--accent-soft)", color: "var(--accent)", padding: "2px 6px", borderRadius: "999px" }}>
            IN PROGRESS
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--line)" }}>
          <span style={{ fontSize: "11.5px", fontWeight: 500, color: "var(--ink)" }}>Stripe integration</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9px", background: "#eae7dd", color: "var(--muted)", padding: "2px 6px", borderRadius: "999px" }}>
            RESOLVED
          </span>
        </div>
      </div>
    ),
  },
  {
    step: "04",
    tag: "TRANSPARENCY",
    title: "Milestone Log & Calls",
    desc: "Read developer progress notes as code ships. Schedule live syncs only when needed.",
    badgeColor: "#92400e",
    badgeBg: "#fef3c7",
    preview: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginTop: "14px",
          padding: "10px",
          background: "rgba(23, 21, 15, 0.02)",
          borderRadius: "8px",
          border: "1px solid var(--line)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px" }}>
          <span style={{ fontSize: "13px" }}>📅</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Async by default</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9.5px", color: "var(--muted)", marginLeft: "auto" }}>Zero wasted calls</span>
        </div>
        <div style={{ borderLeft: "2px solid var(--accent)", paddingLeft: "8px", fontSize: "11px", color: "var(--muted)", lineHeight: 1.4 }}>
          &quot;Deployed caching — response times reduced by 74%.&quot;
        </div>
      </div>
    ),
  },
];

export default function PortalFeaturesSection() {
  return (
    <section className="portal-features-section" id="portal-experience">
      <div className="wrap">
        {/* Header */}
        <div className="portal-features-head reveal">
          <div className="section-label">The Digigrantha Experience</div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            No status calls. No black boxes. A dedicated portal for your build.
          </h2>
          <p>
            Most agencies disappear for three weeks and hand you a Zoom link. Instead, every client gets a secure, real-time portal to follow their project from brief to launch.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="portal-features-grid reveal">
          {FEATURES.map((feat) => (
            <div key={feat.step} className="portal-feature-card">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "9.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: feat.badgeBg,
                      color: feat.badgeColor,
                      fontWeight: 600,
                    }}
                  >
                    {feat.tag}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                    {feat.step}
                  </span>
                </div>

                <h3 style={{ fontFamily: "var(--display)", fontSize: "19px", fontWeight: 400, color: "var(--ink)", marginBottom: "6px" }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>

              {feat.preview}
            </div>
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div className="portal-cta-banner reveal">
          <div>
            <div style={{ fontFamily: "var(--display)", fontSize: "19px", color: "var(--ink)", fontWeight: 400 }}>
              Already building with us?
            </div>
            <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
              Sign in to your client dashboard to view live stage progress, tickets, and team chat.
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/login" className="btn-primary" style={{ fontSize: "12.5px", padding: "9px 18px" }}>
              Client Portal Login →
            </Link>
            <Link
              href="/#brief"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "12px",
                color: "var(--ink)",
                textDecoration: "none",
                padding: "8px 12px",
              }}
            >
              Start a project &darr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
