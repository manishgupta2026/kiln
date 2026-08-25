"use client";

import { useState } from "react";

interface PhaseApprovalGateProps {
  projectId: string;
  currentPhase: string;
  isClient: boolean;
  designApprovedAt?: string | null;
  buildApprovedAt?: string | null;
  onApprovalComplete?: () => void;
}

export default function PhaseApprovalGate({
  projectId,
  currentPhase,
  isClient,
  designApprovedAt: initialDesignApproved,
  buildApprovedAt: initialBuildApproved,
  onApprovalComplete,
}: PhaseApprovalGateProps) {
  const [designApprovedAt, setDesignApprovedAt] = useState<string | null>(initialDesignApproved || null);
  const [buildApprovedAt, setBuildApprovedAt] = useState<string | null>(initialBuildApproved || null);
  const [approving, setApproving] = useState(false);
  const [showConfirm, setShowConfirm] = useState<"DESIGN" | "BUILD" | null>(null);

  const handleApprove = async (phaseType: "DESIGN" | "BUILD") => {
    setApproving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phaseType }),
      });

      const data = await res.json();
      if (data.success) {
        if (phaseType === "DESIGN") {
          setDesignApprovedAt(new Date().toISOString());
        } else {
          setBuildApprovedAt(new Date().toISOString());
        }
        setShowConfirm(null);
        if (onApprovalComplete) onApprovalComplete();
      }
    } catch (err) {
      console.error("Failed to approve phase:", err);
    } finally {
      setApproving(false);
    }
  };

  // If in DESIGN stage and not yet approved
  const isDesignPending = currentPhase === "DESIGN" && !designApprovedAt;
  // If in BUILD stage and not yet approved
  const isBuildPending = currentPhase === "BUILD" && !buildApprovedAt;

  if (!isDesignPending && !isBuildPending && !designApprovedAt && !buildApprovedAt) {
    return null;
  }

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "14px",
        padding: "20px 24px",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent)", marginBottom: "4px" }}>
          Milestone Sign-off Gate
        </div>

        {isDesignPending && (
          <div>
            <h4 style={{ fontFamily: "var(--display)", fontSize: "18px", color: "var(--ink)", fontWeight: 400 }}>
              Design Phase Review Ready
            </h4>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
              Review the Figma prototype and wireframes. When satisfied, approve to start development.
            </p>
          </div>
        )}

        {isBuildPending && (
          <div>
            <h4 style={{ fontFamily: "var(--display)", fontSize: "18px", color: "var(--ink)", fontWeight: 400 }}>
              Staging Build Review Ready
            </h4>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
              Test your features on the staging URL. When ready for deployment, sign off to initiate production launch.
            </p>
          </div>
        )}

        {!isDesignPending && !isBuildPending && (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {designApprovedAt && (
              <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--accent)" }}>
                ✓ Design Sign-off on {new Date(designApprovedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            )}
            {buildApprovedAt && (
              <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "#166534" }}>
                ✓ Staging Sign-off on {new Date(buildApprovedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            )}
          </div>
        )}
      </div>

      {isClient && isDesignPending && (
        <div>
          <button
            type="button"
            onClick={() => setShowConfirm("DESIGN")}
            className="btn-primary"
            style={{ fontSize: "12.5px", padding: "8px 16px" }}
          >
            ✓ Approve Design &amp; Start Build →
          </button>
        </div>
      )}

      {isClient && isBuildPending && (
        <div>
          <button
            type="button"
            onClick={() => setShowConfirm("BUILD")}
            className="btn-primary"
            style={{ fontSize: "12.5px", padding: "8px 16px" }}
          >
            ✓ Approve Staging &amp; Launch Production →
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(23, 21, 15, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--card)",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--line)",
            }}
          >
            <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "var(--ink)", marginBottom: "8px" }}>
              Confirm {showConfirm === "DESIGN" ? "Design" : "Staging Build"} Sign-off
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.5, marginBottom: "20px" }}>
              This logs an official sign-off receipt in your project timeline and notifies the engineering team to advance to the next phase.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowConfirm(null)}
                style={{ fontFamily: "var(--mono)", fontSize: "12px", background: "none", border: "1px solid var(--line)", padding: "8px 14px", borderRadius: "999px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApprove(showConfirm)}
                disabled={approving}
                className="btn-primary"
                style={{ fontSize: "12.5px", padding: "8px 18px" }}
              >
                {approving ? "Signing off…" : "Confirm Approval Receipt →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
