"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ProjectPhase, ProjectStatus, TicketStatus } from "@/lib/prisma";
import ProjectQuickLinks from "@/components/portal/ProjectQuickLinks";
import MilestoneChecklist from "@/components/portal/MilestoneChecklist";
import BillingTracker from "@/components/portal/BillingTracker";

interface ProjectDetail {
  id: string;
  name: string;
  phase: ProjectPhase;
  status: ProjectStatus;
  nextCallAt: string | null;
  stagingUrl?: string | null;
  productionUrl?: string | null;
  figmaUrl?: string | null;
  driveUrl?: string | null;
  designApprovedAt?: string | null;
  buildApprovedAt?: string | null;
  depositStatus?: string | null;
  depositAmount?: string | null;
  finalStatus?: string | null;
  finalAmount?: string | null;
  invoiceUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; email: string };
  developers: { developer: { id: string; name: string; email: string } }[];
  brief: { projectType: string; budget: string | null; description: string } | null;
  updates: { id: string; note: string; createdAt: string }[];
  milestones: any[];
  callRequests: any[];
  tickets: {
    id: string;
    subject: string;
    status: TicketStatus;
    updatedAt: string;
    messages: { body: string; createdAt: string; sender: { name: string; role: string } }[];
  }[];
}

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

export default function DevProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "tickets" | "chat">("overview");

  // Project updates state
  const [updateNote, setUpdateNote] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);

  // Next call state
  const [nextCallInput, setNextCallInput] = useState("");
  const [savingCall, setSavingCall] = useState(false);

  // Confirming client call request state
  const [confirmingCallId, setConfirmingCallId] = useState<string | null>(null);
  const [confirmCallTime, setConfirmCallTime] = useState("");
  const [confirmMeetingUrl, setConfirmMeetingUrl] = useState("");
  const [confirmingCall, setConfirmingCall] = useState(false);

  // Tickets state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReply, setTicketReply] = useState("");
  const [sendingTicketReply, setSendingTicketReply] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        if (data.project.nextCallAt) {
          const dt = new Date(data.project.nextCallAt);
          setNextCallInput(dt.toISOString().slice(0, 16));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/messages`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    async function init() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.authenticated) {
        setCurrentUserId(meData.user.id);
      }
      await loadProject();
      await loadChat();
    }
    init();
  }, [projectId]);

  const handlePhaseChange = async (newPhase: ProjectPhase) => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: newPhase }),
      });
      const data = await res.json();
      if (data.success) {
        loadProject();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadProject();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNextCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCall(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextCallAt: nextCallInput ? new Date(nextCallInput).toISOString() : null }),
      });
      const data = await res.json();
      if (data.success) {
        loadProject();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCall(false);
    }
  };

  const handleConfirmCallRequest = async (callRequestId: string) => {
    if (!confirmCallTime) {
      alert("Please specify the confirmed date & time.");
      return;
    }
    setConfirmingCall(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/call-requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callRequestId,
          status: "CONFIRMED",
          confirmedTime: new Date(confirmCallTime).toISOString(),
          meetingUrl: confirmMeetingUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmingCallId(null);
        setConfirmCallTime("");
        setConfirmMeetingUrl("");
        loadProject();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmingCall(false);
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateNote.trim()) return;
    setPostingUpdate(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: updateNote.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setUpdateNote("");
        loadProject();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostingUpdate(false);
    }
  };

  const handleTicketStatusChange = async (ticketId: string, status: TicketStatus) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        loadProject();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent, ticketId: string) => {
    e.preventDefault();
    if (!ticketReply.trim()) return;
    setSendingTicketReply(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: ticketReply.trim(), ticketId }),
      });
      const data = await res.json();
      if (data.success) {
        setTicketReply("");
        loadProject();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingTicketReply(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setSendingChat(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: chatInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setChatInput("");
        loadChat();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingChat(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)" }}>
        Loading project workspace…
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <h2>Project not found</h2>
        <Link href="/dev" className="btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
          ← Back to projects
        </Link>
      </div>
    );
  }

  const activeTicket = project.tickets.find((t) => t.id === selectedTicketId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Breadcrumb & Title */}
      <div>
        <Link
          href="/dev"
          style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}
        >
          ← Back to all projects
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10.5px",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  fontWeight: 600,
                }}
              >
                {project.phase}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                Client: {project.client.name} ({project.client.email})
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "30px", fontWeight: 400, color: "var(--ink)" }}>
              {project.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--line)", paddingBottom: "12px" }}>
        <button
          type="button"
          className={`chip ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview &amp; Controls
        </button>
        <button
          type="button"
          className={`chip ${activeTab === "tickets" ? "active" : ""}`}
          onClick={() => setActiveTab("tickets")}
        >
          Tickets ({project.tickets.filter((t) => t.status !== "RESOLVED").length})
        </button>
        <button
          type="button"
          className={`chip ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          Client Chat
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Quick Links Bar */}
          <ProjectQuickLinks
            projectId={project.id}
            isStaff={true}
            stagingUrl={project.stagingUrl}
            productionUrl={project.productionUrl}
            figmaUrl={project.figmaUrl}
            driveUrl={project.driveUrl}
            onLinksUpdated={loadProject}
          />

          {/* Pending Call Requests Alert */}
          {project.callRequests && project.callRequests.filter((cr: any) => cr.status === "PENDING").length > 0 && (
            <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", padding: "18px 24px", borderRadius: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#92400e", marginBottom: "6px" }}>
                <span>📅</span>
                <span>Client Requested a Live Sync Call</span>
              </div>
              {project.callRequests.filter((cr: any) => cr.status === "PENDING").map((cr: any) => (
                <div key={cr.id} style={{ marginTop: "10px", padding: "12px", background: "#fff", borderRadius: "8px", border: "1px solid #fde68a" }}>
                  <div style={{ fontSize: "13.5px", color: "var(--ink)" }}>
                    <strong>Topic:</strong> {cr.topic}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)", marginTop: "2px" }}>
                    <strong>Preferred Times:</strong> {cr.preferredTimes}
                  </div>

                  {confirmingCallId === cr.id ? (
                    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <input
                          type="datetime-local"
                          required
                          value={confirmCallTime}
                          onChange={(e) => setConfirmCallTime(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "12.5px" }}
                        />
                        <input
                          type="text"
                          placeholder="Google Meet / Zoom URL"
                          value={confirmMeetingUrl}
                          onChange={(e) => setConfirmMeetingUrl(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "12.5px" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setConfirmingCallId(null)}
                          style={{ fontFamily: "var(--mono)", fontSize: "11px", background: "none", border: "1px solid var(--line)", padding: "4px 10px", borderRadius: "6px" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmCallRequest(cr.id)}
                          disabled={confirmingCall}
                          className="btn-primary"
                          style={{ fontSize: "11.5px", padding: "6px 14px" }}
                        >
                          {confirmingCall ? "Confirming…" : "Confirm & Send Calendar Notice"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingCallId(cr.id)}
                      className="btn-primary"
                      style={{ fontSize: "11.5px", padding: "6px 14px", marginTop: "10px" }}
                    >
                      Confirm Call Slot &amp; Add Meet Link →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {/* Left Column: Stage, Status, Deliverables, Billing */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Phase Selector */}
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
                  Update Project Stage
                </div>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
                  Advancing the stage will automatically notify the client on their progress tracker.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {(["DISCOVER", "DESIGN", "BUILD", "SHIP_AND_ITERATE"] as ProjectPhase[]).map((ph) => (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => handlePhaseChange(ph)}
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "11.5px",
                        padding: "10px",
                        borderRadius: "8px",
                        border: project.phase === ph ? "1.5px solid var(--accent)" : "1px solid var(--line)",
                        background: project.phase === ph ? "var(--accent-soft)" : "none",
                        color: project.phase === ph ? "var(--accent)" : "var(--ink)",
                        cursor: "pointer",
                        fontWeight: project.phase === ph ? 600 : 400,
                      }}
                    >
                      {ph === "SHIP_AND_ITERATE" ? "Ship & Iterate" : ph.charAt(0) + ph.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deliverables Checklist */}
              <MilestoneChecklist
                projectId={project.id}
                isStaff={true}
                initialMilestones={project.milestones || []}
              />

              {/* Billing Tracker */}
              <BillingTracker
                projectId={project.id}
                isStaff={true}
                depositStatus={project.depositStatus}
                depositAmount={project.depositAmount}
                finalStatus={project.finalStatus}
                finalAmount={project.finalAmount}
                invoiceUrl={project.invoiceUrl}
                onUpdated={loadProject}
              />

              {/* Status & Next Call */}
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
                  Status &amp; Call Schedule
                </div>

                {/* Status Pills */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                  {(["ACTIVE", "PAUSED", "COMPLETED"] as ProjectStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`chip ${project.status === st ? "active" : ""}`}
                      style={{ fontSize: "11px", padding: "6px 12px" }}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Next Call Form */}
                <form onSubmit={handleSaveNextCall}>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>
                    Next Live Call (Optional)
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="datetime-local"
                      value={nextCallInput}
                      onChange={(e) => setNextCallInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                        fontFamily: "var(--mono)",
                        fontSize: "12px",
                        background: "none",
                        color: "var(--ink)",
                      }}
                    />
                    <button type="submit" className="btn-primary" disabled={savingCall} style={{ fontSize: "12px", padding: "8px 14px" }}>
                      Save
                    </button>
                  </div>
                </form>
              </div>

              {/* Brief Context */}
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
                  <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginBottom: "10px" }}>
                    Original Client Brief
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "6px" }}>
                    Type: <strong style={{ color: "var(--ink)" }}>{project.brief.projectType}</strong> · Budget: <strong style={{ color: "var(--ink)" }}>{project.brief.budget || "Not specified"}</strong>
                  </div>
                  <p style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: 1.5, background: "rgba(23, 21, 15, 0.02)", padding: "12px", borderRadius: "8px" }}>
                    {project.brief.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Post Progress Notes & Timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Post Note Form */}
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
                  Post Progress Note to Client
                </div>
                <form onSubmit={handlePostUpdate}>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Completed initial checkout flow prototype. Testing mobile responsiveness today."
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    style={{
                      width: "100%",
                      border: "1px solid var(--line)",
                      borderRadius: "10px",
                      background: "none",
                      fontFamily: "var(--body)",
                      fontSize: "14px",
                      color: "var(--ink)",
                      padding: "12px",
                      outline: "none",
                      resize: "vertical",
                      marginBottom: "12px",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" className="btn-primary" disabled={postingUpdate} style={{ fontSize: "12.5px" }}>
                      {postingUpdate ? "Posting…" : "Post to Client Timeline →"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Timeline Notes List */}
              <div
                style={{
                  background: "var(--card)",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid var(--line)",
                  boxShadow: "var(--shadow)",
                }}
              >
                <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginBottom: "16px" }}>
                  Timeline Receipts ({project.updates.length})
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "500px", overflowY: "auto" }}>
                  {project.updates.map((update, index) => (
                    <div
                      key={update.id}
                      style={{
                        position: "relative",
                        paddingLeft: "20px",
                        borderLeft: "2px solid var(--line)",
                        paddingBottom: index === project.updates.length - 1 ? 0 : "12px",
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
                        {new Date(update.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </div>
                      <p style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {update.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tickets */}
      {activeTab === "tickets" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Tickets List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)" }}>
              Ticket Queue ({project.tickets.length})
            </div>

            {project.tickets.length === 0 ? (
              <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>No tickets created for this project.</p>
            ) : (
              project.tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  style={{
                    background: selectedTicketId === t.id ? "var(--accent-soft)" : "var(--card)",
                    borderRadius: "12px",
                    padding: "16px",
                    border: selectedTicketId === t.id ? "1px solid var(--accent)" : "1px solid var(--line)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: t.status === "OPEN" ? "#fde8e4" : t.status === "IN_PROGRESS" ? "#fef3c7" : "var(--accent-soft)",
                        color: t.status === "OPEN" ? "#c93b2b" : t.status === "IN_PROGRESS" ? "#92400e" : "var(--accent)",
                        fontWeight: 600,
                      }}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>
                      {new Date(t.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>{t.subject}</h4>
                </div>
              ))
            )}
          </div>

          {/* Active Ticket Detail */}
          <div>
            {activeTicket ? (
              <div style={{ background: "var(--card)", borderRadius: "16px", padding: "24px", border: "1px solid var(--line)", boxShadow: "var(--shadow)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "var(--ink)" }}>
                      {activeTicket.subject}
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {(["OPEN", "IN_PROGRESS", "RESOLVED"] as TicketStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleTicketStatusChange(activeTicket.id, st)}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "10.5px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: activeTicket.status === st ? "1px solid var(--accent)" : "1px solid var(--line)",
                          background: activeTicket.status === st ? "var(--accent-soft)" : "none",
                          color: activeTicket.status === st ? "var(--accent)" : "var(--muted)",
                          cursor: "pointer",
                        }}
                      >
                        {st.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages in Ticket */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", maxHeight: "350px", overflowY: "auto" }}>
                  {activeTicket.messages.map((msg, i) => (
                    <div key={i} style={{ padding: "12px", background: "rgba(23, 21, 15, 0.02)", borderRadius: "10px", border: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--ink)" }}>{msg.sender.name} ({msg.sender.role})</span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)" }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {msg.body}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={(e) => handleSendTicketReply(e, activeTicket.id)}>
                  <textarea
                    rows={3}
                    placeholder="Reply to client..."
                    value={ticketReply}
                    onChange={(e) => setTicketReply(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", fontSize: "13.5px", marginBottom: "10px" }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" className="btn-primary" disabled={sendingTicketReply} style={{ fontSize: "12px" }}>
                      {sendingTicketReply ? "Sending…" : "Send Reply →"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)", border: "1px dashed var(--line)", borderRadius: "14px" }}>
                Select a ticket on the left to view details and reply.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Chat */}
      {activeTab === "chat" && (
        <div style={{ background: "var(--card)", borderRadius: "16px", border: "1px solid var(--line)", boxShadow: "var(--shadow)", padding: "24px", display: "flex", flexDirection: "column", minHeight: "500px" }}>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {chatMessages.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px 0", fontSize: "13.5px" }}>
                No chat messages yet. Start a direct async thread with your client.
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.sender.id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                      background: isMe ? "var(--accent-soft)" : "rgba(23, 21, 15, 0.03)",
                      border: isMe ? "1px solid rgba(117, 128, 31, 0.3)" : "1px solid var(--line)",
                      borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      padding: "10px 14px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: isMe ? "var(--accent)" : "var(--ink)" }}>
                        {msg.sender.name}
                      </span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "9.5px", color: "var(--muted)" }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {msg.body}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendChat} style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Type message to client..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ flex: 1, padding: "10px 14px", borderRadius: "999px", border: "1px solid var(--line)", fontSize: "14px" }}
            />
            <button type="submit" className="btn-primary" disabled={sendingChat} style={{ fontSize: "13px", padding: "10px 20px" }}>
              {sendingChat ? "Sending…" : "Send →"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
