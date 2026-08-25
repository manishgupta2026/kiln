import React from "react";
import { ProjectPhase } from "@/lib/prisma";

interface PhaseTrackerProps {
  currentPhase: ProjectPhase;
}

const PHASES: { key: ProjectPhase; label: string; desc: string; step: string }[] = [
  { key: "DISCOVER", label: "Discover", desc: "Scope, architecture & intake", step: "01" },
  { key: "DESIGN", label: "Design", desc: "UI/UX, prototypes & craft", step: "02" },
  { key: "BUILD", label: "Build", desc: "Full-stack development & testing", step: "03" },
  { key: "SHIP_AND_ITERATE", label: "Ship & Iterate", desc: "Live launch & continuous polish", step: "04" },
];

const PHASE_ORDER: Record<ProjectPhase, number> = {
  DISCOVER: 0,
  DESIGN: 1,
  BUILD: 2,
  SHIP_AND_ITERATE: 3,
};

export default function PhaseTracker({ currentPhase }: PhaseTrackerProps) {
  const currentIndex = PHASE_ORDER[currentPhase] ?? 0;

  return (
    <div style={{ background: "var(--card)", borderRadius: "16px", padding: "24px", border: "1px solid var(--line)", boxShadow: "var(--shadow)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
          Project Progress
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--muted)" }}>
          Phase {currentIndex + 1} of 4: <strong style={{ color: "var(--ink)" }}>{PHASES[currentIndex]?.label}</strong>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          position: "relative",
        }}
      >
        {PHASES.map((phase, idx) => {
          const isCurrent = idx === currentIndex;
          const isCompleted = idx < currentIndex;

          return (
            <div
              key={phase.key}
              style={{
                borderRadius: "12px",
                padding: "16px 14px",
                border: isCurrent
                  ? "1.5px solid var(--accent)"
                  : isCompleted
                  ? "1px solid var(--line)"
                  : "1px dashed var(--line)",
                background: isCurrent
                  ? "var(--accent-soft)"
                  : isCompleted
                  ? "rgba(23, 21, 15, 0.02)"
                  : "none",
                opacity: idx > currentIndex ? 0.65 : 1,
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: isCurrent ? "var(--accent)" : isCompleted ? "var(--ink)" : "var(--muted)",
                  }}
                >
                  {phase.step}
                </span>
                {isCompleted ? (
                  <span style={{ color: "var(--accent)", fontSize: "12px", fontWeight: "bold" }}>✓ Done</span>
                ) : isCurrent ? (
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      background: "var(--accent)",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Active
                  </span>
                ) : null}
              </div>
              <h4 style={{ fontFamily: "var(--display)", fontSize: "16px", fontWeight: isCurrent ? 600 : 400, color: "var(--ink)", marginBottom: "4px" }}>
                {phase.label}
              </h4>
              <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.4 }}>
                {phase.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
