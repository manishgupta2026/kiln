"use client";

import { useState } from "react";
import Link from "next/link";
import PhaseTracker from "@/components/portal/PhaseTracker";
import ProjectQuickLinks from "@/components/portal/ProjectQuickLinks";
import MilestoneChecklist from "@/components/portal/MilestoneChecklist";
import PhaseApprovalGate from "@/components/portal/PhaseApprovalGate";
import BillingTracker from "@/components/portal/BillingTracker";
import RequestCallModal from "@/components/portal/RequestCallModal";

interface ClientDashboardViewProps {
  project: any;
}

export default function ClientDashboardView({ project: initialProject }: ClientDashboardViewProps) {
  const [project, setProject] = useState<any>(initialProject);
  const [showCallModal, setShowCallModal] = useState(false);

  const refreshProject = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const nextCallDate = project.nextCallAt
    ? new Date(project.nextCallAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Project Header Banner */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "18px",
          padding: "28px 32px",
          border: "2px solid var(--outline)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                fontFamily: "var(--body)",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                background: "var(--lime)",
                color: "#17201E",
                padding: "3px 10px",
                borderRadius: "999px",
                fontWeight: 700,
                border: "1.5px solid var(--outline)",
              }}
            >
              {project.status} BUILD
            </span>
            <span style={{ fontFamily: "var(--body)", fontSize: "12px", color: "var(--muted)" }}>
              Started {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", fontWeight: 700, color: "var(--text)" }}>
            {project.name}
          </h1>
        </div>

        {/* Quick Action Navigation */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setShowCallModal(true)}
            style={{
              fontFamily: "var(--body)",
              fontSize: "13px",
              fontWeight: 600,
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1.5px solid var(--outline)",
              color: "var(--text)",
              background: "var(--surface)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "2px 2px 0 var(--outline)",
              transition: "transform 0.12s ease, box-shadow 0.12s ease",
            }}
          >
            <span>📅</span> Request 15-Min Sync
          </button>
          <Link
            href="/dashboard/chat"
            className="btn-primary"
            style={{ fontSize: "13px", padding: "10px 18px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span>💬</span> Direct Dev Chat
          </Link>
          <Link
            href="/dashboard/tickets"
            style={{
              fontFamily: "var(--body)",
              fontSize: "13px",
              fontWeight: 600,
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1.5px solid var(--outline)",
              color: "var(--text)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--surface)",
              boxShadow: "2px 2px 0 var(--outline)",
            }}
          >
            <span>🎟</span> Tickets ({project.tickets?.length || 0})
          </Link>
        </div>
      </div>

      {/* FEATURE 1: Quick Links Bar */}
      <ProjectQuickLinks
        projectId={project.id}
        isStaff={false}
        stagingUrl={project.stagingUrl}
        productionUrl={project.productionUrl}
        figmaUrl={project.figmaUrl}
        driveUrl={project.driveUrl}
        onLinksUpdated={refreshProject}
      />

      {/* FEATURE 3: Phase Approval Gate */}
      <PhaseApprovalGate
        projectId={project.id}
        currentPhase={project.phase}
        isClient={true}
        designApprovedAt={project.designApprovedAt}
        buildApprovedAt={project.buildApprovedAt}
        onApprovalComplete={refreshProject}
      />

      {/* Synchronous Call Sync Card */}
      <div
        style={{
          background: nextCallDate ? "var(--mint)" : "var(--surface)",
          borderRadius: "16px",
          padding: "18px 24px",
          border: "2px solid var(--outline)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px" }}>📅</span>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
              {nextCallDate ? `Next Live Sync: ${nextCallDate}` : "Weekly Sync: Asynchronous by default"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--muted)" }}>
              {nextCallDate
                ? "Your engineering team will join the call at the scheduled time."
                : "No live call needed this week unless requested via ticket or the sync button."}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCallModal(true)}
          style={{
            fontFamily: "var(--body)",
            fontSize: "12px",
            color: "var(--text)",
            background: "var(--yellow)",
            border: "1.5px solid var(--outline)",
            borderRadius: "999px",
            padding: "6px 12px",
            boxShadow: "1.5px 1.5px 0 var(--outline)",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Request live call →
        </button>
      </div>

      {/* 4-Stage Phase Tracker */}
      <PhaseTracker currentPhase={project.phase} />

      {/* Grid: Deliverables, Scope, Billing, and Progress Log */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Left Column: Milestones & Team */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* FEATURE 2: Milestone Deliverables Checklist */}
          <MilestoneChecklist
            projectId={project.id}
            isStaff={false}
            initialMilestones={project.milestones || []}
          />

          {/* FEATURE 5: Billing & Milestone Payment Tracker */}
          <BillingTracker
            projectId={project.id}
            isStaff={false}
            depositStatus={project.depositStatus}
            depositAmount={project.depositAmount}
            finalStatus={project.finalStatus}
            finalAmount={project.finalAmount}
            invoiceUrl={project.invoiceUrl}
            onUpdated={refreshProject}
          />

          {/* Assigned Team */}
          <div
            style={{
              background: "var(--card)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginBottom: "12px" }}>
              Assigned Engineering Team
            </div>
            {project.developers && project.developers.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {project.developers.map((pd: any) => (
                  <div
                    key={pd.developer.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      background: "rgba(23, 21, 15, 0.02)",
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--display)",
                        fontSize: "16px",
                      }}
                    >
                      {pd.developer.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--ink)" }}>
                        {pd.developer.name}
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                        {pd.developer.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>Developer assignment in progress.</p>
            )}
          </div>
        </div>

        {/* Right Column: Scope & Live Updates Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Project Scope Context */}
          {project.brief && (
            <div
              style={{
                background: "var(--card)",
                borderRadius: "16px",
                padding: "24px",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow)",
              }}
            >
              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginBottom: "8px" }}>
                Intake &amp; Scope
              </div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "var(--ink)", marginBottom: "6px" }}>
                {project.brief.projectType}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.5, marginBottom: "16px" }}>
                {project.brief.description}
              </p>
              {project.brief.budget && (
                <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--ink)", background: "rgba(23, 21, 15, 0.03)", padding: "8px 12px", borderRadius: "8px", display: "inline-block" }}>
                  Budget Tier: <strong>{project.brief.budget}</strong>
                </div>
              )}
            </div>
          )}

          {/* Live Updates Timeline */}
          <div
            style={{
              background: "var(--card)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
                Progress Timeline &amp; Notes
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                {project.updates?.length || 0} updates logged
              </span>
            </div>

            {project.updates && project.updates.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {project.updates.map((update: any, index: number) => (
                  <div
                    key={update.id}
                    style={{
                      position: "relative",
                      paddingLeft: "24px",
                      borderLeft: "2px solid var(--line)",
                      paddingBottom: index === project.updates.length - 1 ? "0" : "12px",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "-5px",
                        top: "2px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: index === 0 ? "var(--accent)" : "#B4AE9C",
                      }}
                    />
                    <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                      {new Date(update.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--ink)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {update.note}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "13.5px", color: "var(--muted)", padding: "20px 0" }}>
                No updates logged yet. Your developer will post progress notes here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FEATURE 4: Client Self-Serve Call Request Modal */}
      <RequestCallModal
        projectId={project.id}
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        onSubmitted={refreshProject}
      />
    </div>
  );
}
