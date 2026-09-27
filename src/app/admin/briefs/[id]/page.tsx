"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import AdminNavbar from "@/components/AdminNavbar";

interface BriefDetail {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  projectType: string;
  budget: string | null;
  description: string;
  status: string;
  callScheduledAt?: string | null;
  callMeetingUrl?: string | null;
  callNotes?: string | null;
  createdAt: string;
  project?: { id: string; name: string; phase: string; status: string } | null;
}

interface DeveloperOption {
  id: string;
  name: string;
  email: string;
}

export default function AdminBriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const briefId = resolvedParams.id;

  const [brief, setBrief] = useState<BriefDetail | null>(null);
  const [developers, setDevelopers] = useState<DeveloperOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Call Scheduling State
  const [callDateTime, setCallDateTime] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [notifyClient, setNotifyClient] = useState(true);
  const [savingCall, setSavingCall] = useState(false);
  const [callSuccessMsg, setCallSuccessMsg] = useState<string | null>(null);

  // Conversion Modal State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedDevIds, setSelectedDevIds] = useState<string[]>([]);
  const [converting, setConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<{ inviteUrl?: string; projectId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, dRes] = await Promise.all([
          fetch(`/api/admin/briefs/${briefId}`),
          fetch("/api/admin/developers"),
        ]);

        const bData = await bRes.json();
        const dData = await dRes.json();

        if (bData.success) {
          setBrief(bData.data);
          setProjectName(bData.data.name ? `${bData.data.name}'s Project` : "New Client Project");
          if (bData.data.callScheduledAt) {
            // Format for datetime-local: YYYY-MM-DDTHH:mm
            const d = new Date(bData.data.callScheduledAt);
            const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16);
            setCallDateTime(localIso);
          }
          if (bData.data.callMeetingUrl) {
            setMeetingUrl(bData.data.callMeetingUrl);
          }
          if (bData.data.callNotes) {
            setCallNotes(bData.data.callNotes);
          }
        }

        if (dData.success) {
          setDevelopers(dData.developers);
          if (dData.developers.length > 0) {
            setSelectedDevIds([dData.developers[0].id]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [briefId]);

  const handleScheduleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callDateTime) {
      alert("Please select a date and time for the call.");
      return;
    }

    setSavingCall(true);
    setCallSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/briefs/${briefId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callScheduledAt: new Date(callDateTime).toISOString(),
          callMeetingUrl: meetingUrl || null,
          callNotes: callNotes || null,
          status: "call_scheduled",
          notifyClient,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to schedule call.");
      }

      setBrief(data.data);
      setCallSuccessMsg("Discovery call scheduled and client notified!");
      setTimeout(() => setCallSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingCall(false);
    }
  };

  const handleMarkCallCompleted = async () => {
    try {
      const res = await fetch(`/api/admin/briefs/${briefId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "call_completed",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBrief(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDevSelection = (devId: string) => {
    setSelectedDevIds((prev) =>
      prev.includes(devId) ? prev.filter((id) => id !== devId) : [...prev, devId]
    );
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDevIds.length === 0) {
      setError("Please select at least one developer to assign.");
      return;
    }

    setConverting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/briefs/${briefId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          developerIds: selectedDevIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to convert brief.");
      }

      setConvertResult({
        inviteUrl: data.inviteUrl,
        projectId: data.project.id,
      });

      setBrief((prev) => (prev ? { ...prev, status: "converted", project: data.project } : prev));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)" }}>
        Loading brief details…
      </div>
    );
  }

  if (!brief) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center" }}>
        <h2>Brief not found</h2>
        <Link href="/admin" className="btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
          ← Back to Admin
        </Link>
      </div>
    );
  }

  const isConverted = brief.status === "converted" || !!brief.project;
  const cleanPhone = brief.phone ? brief.phone.replace(/[^0-9+]/g, "") : "";

  const formattedCallDate = brief.callScheduledAt
    ? new Date(brief.callScheduledAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <AdminNavbar
        currentTitle="Brief Review"
        currentSubtitle={brief.name ? `Client: ${brief.name} (${brief.projectType})` : undefined}
      />
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "40px 20px" }}>
      <Link
        href="/admin"
        style={{
          fontFamily: "var(--mono)",
          fontSize: "12px",
          color: "var(--muted)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "16px",
        }}
      >
        ← Back to Inbound Briefs
      </Link>

      <div
        style={{
          background: "var(--card)",
          borderRadius: "18px",
          padding: "32px",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow)",
          marginBottom: "24px",
        }}
      >
        {/* Header & Main Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10.5px",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  background:
                    brief.status === "converted"
                      ? "var(--accent-soft)"
                      : brief.status === "call_scheduled"
                      ? "#e0e7ff"
                      : brief.status === "call_completed"
                      ? "#fef3c7"
                      : "#fde8e4",
                  color:
                    brief.status === "converted"
                      ? "var(--accent)"
                      : brief.status === "call_scheduled"
                      ? "#3730a3"
                      : brief.status === "call_completed"
                      ? "#92400e"
                      : "#c93b2b",
                  fontWeight: 600,
                }}
              >
                {brief.status.replace("_", " ").toUpperCase()}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                Received {new Date(brief.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
            </div>

            <h1 style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: 400, color: "var(--ink)" }}>
              Brief from {brief.name}
            </h1>

            {/* Direct Contact Links */}
            <div style={{ display: "flex", gap: "14px", alignItems: "center", marginTop: "6px", flexWrap: "wrap" }}>
              <a href={`mailto:${brief.email}`} style={{ fontSize: "13.5px", color: "var(--accent)", textDecoration: "none" }}>
                ✉ {brief.email}
              </a>
              {brief.phone && (
                <>
                  <span style={{ color: "var(--line)" }}>•</span>
                  <a href={`tel:${cleanPhone}`} style={{ fontSize: "13.5px", color: "var(--ink)", textDecoration: "none" }}>
                    📞 {brief.phone}
                  </a>
                  <span style={{ color: "var(--line)" }}>•</span>
                  <a
                    href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "13px", color: "#16a34a", textDecoration: "none", fontWeight: 500 }}
                  >
                    💬 WhatsApp Chat &rarr;
                  </a>
                </>
              )}
            </div>
          </div>

          <div>
            {isConverted ? (
              <Link
                href={`/admin/projects/${brief.project?.id}`}
                className="btn-primary"
                style={{ fontSize: "13px" }}
              >
                View Active Project Workspace →
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowConvertModal(true)}
                className="btn-primary"
                style={{ fontSize: "13px" }}
              >
                ⚡ Convert to Client Project
              </button>
            )}
          </div>
        </div>

        {/* Project Scope Specs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px", padding: "16px", background: "rgba(23, 21, 15, 0.02)", borderRadius: "12px" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>
              Project Type
            </div>
            <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)", marginTop: "2px" }}>
              {brief.projectType}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>
              Estimated Budget
            </div>
            <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)", marginTop: "2px" }}>
              {brief.budget || "Not specified"}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>
            Client Description / Initial Scope
          </div>
          <div style={{ fontSize: "15px", color: "var(--ink)", lineHeight: 1.6, whiteSpace: "pre-wrap", background: "var(--bg)", padding: "18px", borderRadius: "12px", border: "1px solid var(--line)" }}>
            {brief.description}
          </div>
        </div>

        {/* STEP 1: DISCOVERY CALL & MEETING SCHEDULER */}
        <div
          style={{
            background: "rgba(23, 21, 15, 0.02)",
            border: "1px solid var(--line)",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)" }}>
                Step 1 · Pre-Conversion Alignment
              </div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "var(--ink)", marginTop: "2px" }}>
                📅 Schedule Discovery Call &amp; Meet
              </h3>
            </div>

            {brief.status === "call_scheduled" && (
              <button
                type="button"
                onClick={handleMarkCallCompleted}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "12px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: "1px solid var(--accent)",
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                ✓ Mark Call as Completed
              </button>
            )}
          </div>

          {formattedCallDate && (
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "14px 18px", borderRadius: "10px", marginBottom: "18px" }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)" }}>
                Scheduled for: {formattedCallDate}
              </div>
              {brief.callMeetingUrl && (
                <div style={{ fontSize: "13px", color: "var(--accent)", marginTop: "4px" }}>
                  Meeting Link:{" "}
                  <a href={brief.callMeetingUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                    {brief.callMeetingUrl}
                  </a>
                </div>
              )}
              {brief.callNotes && (
                <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "6px", borderTop: "1px solid var(--line)", paddingTop: "6px" }}>
                  <strong>Agenda / Notes:</strong> {brief.callNotes}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleScheduleCall}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                  Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={callDateTime}
                  onChange={(e) => setCallDateTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "#fff",
                    fontSize: "14px",
                    fontFamily: "var(--body)",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                  Meeting URL (Google Meet / Zoom / Phone)
                </label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/xyz or Phone Call"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "#fff",
                    fontSize: "14px",
                    fontFamily: "var(--body)",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                Pre-Call Agenda &amp; Discussion Points
              </label>
              <textarea
                placeholder="Key scope clarification, timeline expectations, tech stack alignment..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                  background: "#fff",
                  fontSize: "14px",
                  fontFamily: "var(--body)",
                  minHeight: "65px",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--ink)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={notifyClient}
                  onChange={(e) => setNotifyClient(e.target.checked)}
                  style={{ accentColor: "var(--accent)" }}
                />
                Send calendar invite &amp; confirmation email to {brief.email}
              </label>

              <button
                type="submit"
                disabled={savingCall}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "12.5px",
                  padding: "8px 18px",
                  borderRadius: "999px",
                  background: "var(--ink)",
                  color: "var(--bg)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {savingCall ? "Scheduling…" : formattedCallDate ? "Update Call Schedule" : "Confirm & Schedule Call →"}
              </button>
            </div>

            {callSuccessMsg && (
              <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent)", marginTop: "12px" }}>
                ✓ {callSuccessMsg}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Convert to Project Modal */}
      {showConvertModal && (
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
              borderRadius: "18px",
              padding: "32px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--line)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)" }}>
                  Convert Brief to Project
                </h2>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
                  Create client portal account &amp; assign engineering team.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            {convertResult ? (
              <div>
                <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
                  <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: "4px" }}>
                    ✓ Project Created Successfully!
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.4 }}>
                    Client account created and assigned developers notified.
                  </p>
                  {convertResult.inviteUrl && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(117, 128, 31, 0.3)" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>Client Setup Link:</span><br />
                      <a href={convertResult.inviteUrl} style={{ fontSize: "12px", color: "var(--accent)", wordBreak: "break-all" }}>
                        {convertResult.inviteUrl}
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Link
                    href={`/admin/projects/${convertResult.projectId}`}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Open Project Workspace →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConvert}>
                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--muted)",
                      marginBottom: "6px",
                    }}
                  >
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "1px solid var(--line)",
                      background: "none",
                      fontFamily: "var(--body)",
                      fontSize: "15px",
                      color: "var(--ink)",
                      padding: "8px 0",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--muted)",
                      marginBottom: "10px",
                    }}
                  >
                    Assign Developer(s)
                  </label>

                  {developers.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
                      {developers.map((dev) => (
                        <label
                          key={dev.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            background: selectedDevIds.includes(dev.id) ? "var(--accent-soft)" : "rgba(23, 21, 15, 0.02)",
                            border: selectedDevIds.includes(dev.id) ? "1px solid var(--accent)" : "1px solid var(--line)",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDevIds.includes(dev.id)}
                            onChange={() => toggleDevSelection(dev.id)}
                            style={{ accentColor: "var(--accent)" }}
                          />
                          <div>
                            <span style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--ink)" }}>{dev.name}</span>
                            <span style={{ fontSize: "11.5px", color: "var(--muted)", marginLeft: "8px" }}>({dev.email})</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                      No developer accounts registered yet. You can invite one under the Developer Management tab.
                    </p>
                  )}
                </div>

                {error && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "#c93b2b", marginBottom: "16px" }}>
                    ✕ {error}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowConvertModal(false)}
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "13px",
                      background: "none",
                      border: "1px solid var(--line)",
                      padding: "10px 18px",
                      borderRadius: "999px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={converting}>
                    {converting ? "Converting…" : "Create Project & Invite Client →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
