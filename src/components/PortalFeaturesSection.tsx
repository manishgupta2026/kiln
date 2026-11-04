"use client";

import Link from "next/link";

const FEATURES = [
  {
    step: "01",
    tag: "LIVE STATUS",
    title: "4-Stage Progress Tracker",
    desc: "Follow your build in real time through Discover, Design, Build, and Ship & Iterate.",
    badgeColor: "#1B382E",
    badgeBg: "var(--mint)",
    preview: (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "6px",
          marginTop: "20px",
          padding: "12px 10px",
          background: "var(--bg)",
          borderRadius: "10px",
          border: "1.5px solid var(--outline)",
          minHeight: "82px",
          alignItems: "center",
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
              padding: "6px 2px",
              borderRadius: "6px",
              background: s.active ? "var(--mint)" : s.done ? "var(--surface)" : "transparent",
              border: s.active ? "1.5px solid var(--outline)" : s.done ? "1px solid var(--outline)" : "1px dashed var(--muted)",
              boxShadow: s.active ? "1.5px 1.5px 0 var(--outline)" : "none",
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: "9.5px", color: s.active ? "var(--text)" : "var(--muted)", fontWeight: 700 }}>
              {s.done ? "✓" : `0${i + 1}`}
            </div>
            <div style={{ fontSize: "11px", fontWeight: s.active ? 700 : 500, color: "var(--text)", marginTop: "2px" }}>
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
    badgeColor: "#3730A3",
    badgeBg: "#E0E7FF",
    preview: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "20px",
          padding: "12px 14px",
          background: "var(--bg)",
          borderRadius: "10px",
          border: "1.5px solid var(--outline)",
          fontSize: "12px",
          minHeight: "82px",
          justifyContent: "center",
        }}
      >
        <div style={{ alignSelf: "flex-start", background: "var(--surface)", border: "1.5px solid var(--outline)", padding: "5px 10px", borderRadius: "8px 8px 8px 2px", maxWidth: "90%", color: "var(--text)", boxShadow: "1px 1px 0 var(--outline)" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>Client: </span>
          Can we test the mobile checkout?
        </div>
        <div style={{ alignSelf: "flex-end", background: "var(--mint)", border: "1.5px solid var(--outline)", padding: "5px 10px", borderRadius: "8px 8px 2px 8px", maxWidth: "90%", color: "var(--text)", boxShadow: "1px 1px 0 var(--outline)" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text)", fontWeight: 800 }}>Lead Dev: </span>
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
    badgeColor: "#C2410C",
    badgeBg: "#FFEDD5",
    preview: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "20px",
          padding: "12px 14px",
          background: "var(--bg)",
          borderRadius: "10px",
          border: "1.5px solid var(--outline)",
          minHeight: "82px",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)", padding: "6px 10px", borderRadius: "6px", border: "1.5px solid var(--outline)", boxShadow: "1px 1px 0 var(--outline)" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>Design system sync</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9.5px", fontWeight: 700, background: "var(--mint)", color: "var(--text)", padding: "2px 8px", borderRadius: "999px", border: "1px solid var(--outline)" }}>
            IN PROGRESS
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)", padding: "6px 10px", borderRadius: "6px", border: "1.5px solid var(--outline)", boxShadow: "1px 1px 0 var(--outline)" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>Stripe integration</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9.5px", fontWeight: 700, background: "rgba(0,0,0,0.06)", color: "var(--muted)", padding: "2px 8px", borderRadius: "999px", border: "1px solid var(--outline)" }}>
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
    badgeColor: "#92400E",
    badgeBg: "#FEF3C7",
    preview: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "20px",
          padding: "12px 14px",
          background: "var(--bg)",
          borderRadius: "10px",
          border: "1.5px solid var(--outline)",
          minHeight: "82px",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <span style={{ fontSize: "14px" }}>📅</span>
          <span style={{ color: "var(--text)", fontWeight: 700 }}>Async by default</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", marginLeft: "auto", fontWeight: 600 }}>Zero wasted calls</span>
        </div>
        <div style={{ borderLeft: "3px solid var(--yellow)", paddingLeft: "10px", fontSize: "11.5px", color: "var(--muted)", lineHeight: 1.4, fontStyle: "italic" }}>
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
          <div className="section-label">The Unique Digigrantha Experience</div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            No status calls. No black boxes. A dedicated portal for your build.
          </h2>
          <p>
            Most agencies disappear for three weeks and hand you a Zoom link. Instead, every client gets a secure, real-time portal to follow their project from brief to launch.
          </p>
        </div>

        {/* 4 Feature Cards Grid: 2 per row on desktop */}
        <div className="portal-features-grid reveal">
          {FEATURES.map((feat) => (
            <div key={feat.step} className="portal-feature-card">
              <div style={{ marginBottom: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      background: feat.badgeBg,
                      color: feat.badgeColor,
                      fontWeight: 700,
                      border: "1.5px solid var(--outline)",
                      boxShadow: "1px 1px 0 var(--outline)",
                    }}
                  >
                    {feat.tag}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", fontWeight: 700 }}>
                    {feat.step}
                  </span>
                </div>

                <h3 style={{ fontFamily: "var(--display)", fontSize: "21px", fontWeight: 700, color: "var(--text)", marginBottom: "8px", letterSpacing: "-0.015em" }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.55 }}>
                  {feat.desc}
                </p>
              </div>

              {feat.preview}
            </div>
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div className="portal-cta-banner reveal">
          <div className="portal-cta-banner-text">
            <h3>Already building with us?</h3>
            <p>
              Sign in to your client dashboard to view live stage progress, tickets, and team chat.
            </p>
          </div>

          <div className="portal-cta-banner-actions">
            <Link href="/login" className="btn-primary">
              Client Portal Login →
            </Link>
            <Link href="/#brief" className="portal-cta-link-secondary">
              Start a project &darr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
