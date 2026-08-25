"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TicketStatus } from "@/lib/prisma";

interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: { body: string; createdAt: string; sender: { name: string; role: string } }[];
}

export default function ClientTicketsPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  // Create ticket modal
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjectAndTickets() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (data.success && data.projects.length > 0) {
          const pid = data.projects[0].id;
          setProjectId(pid);

          const tRes = await fetch(`/api/projects/${pid}/tickets`);
          const tData = await tRes.json();
          if (tData.success) {
            setTickets(tData.tickets);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProjectAndTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create ticket.");
      }

      setTickets((prev) => [data.ticket, ...prev]);
      setSubject("");
      setBody("");
      setShowModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: 400, color: "var(--ink)" }}>
            Project Tickets
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
            Raise issues, change requests, or feedback directly with your dev team.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ fontSize: "13px", padding: "10px 20px" }}
        >
          + Raise a Ticket
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((status) => (
          <button
            key={status}
            type="button"
            className={`chip ${filter === status ? "active" : ""}`}
            onClick={() => setFilter(status)}
            style={{ fontSize: "12px", padding: "6px 14px" }}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)" }}>
          Loading tickets…
        </div>
      ) : filteredTickets.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/tickets/${ticket.id}`}
              style={{
                background: "var(--card)",
                borderRadius: "14px",
                padding: "20px 24px",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "10.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background:
                        ticket.status === "OPEN"
                          ? "#fde8e4"
                          : ticket.status === "IN_PROGRESS"
                          ? "var(--accent-soft)"
                          : "#eae7dd",
                      color:
                        ticket.status === "OPEN"
                          ? "#c93b2b"
                          : ticket.status === "IN_PROGRESS"
                          ? "var(--accent)"
                          : "var(--muted)",
                      fontWeight: 600,
                    }}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                    Updated {new Date(ticket.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <h3 style={{ fontFamily: "var(--display)", fontSize: "18px", fontWeight: 400, color: "var(--ink)" }}>
                  {ticket.subject}
                </h3>
              </div>

              <div style={{ fontFamily: "var(--mono)", fontSize: "12.5px", color: "var(--accent)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{ticket.messages.length} replies</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "var(--card)",
            borderRadius: "16px",
            padding: "48px 24px",
            textAlign: "center",
            border: "1px solid var(--line)",
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>✓</div>
          <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "var(--ink)", marginBottom: "6px" }}>
            No tickets in this view
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Whenever you have a change request, question, or bug report, click &quot;Raise a Ticket&quot; above.
          </p>
        </div>
      )}

      {/* Modal to Create Ticket */}
      {showModal && (
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
              <h2 style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)" }}>Raise a New Ticket</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <div style={{ marginBottom: "16px" }}>
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
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Update copy on onboarding screen"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
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

              <div style={{ marginBottom: "20px" }}>
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
                  Details & Context
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain what needs to be adjusted, what you expected vs what you saw, or attach any context."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  style={{
                    width: "100%",
                    border: "1px solid var(--line)",
                    borderRadius: "10px",
                    background: "none",
                    fontFamily: "var(--body)",
                    fontSize: "14.5px",
                    color: "var(--ink)",
                    padding: "12px",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {error && (
                <div style={{ fontFamily: "var(--mono)", fontSize: "12.5px", color: "#c93b2b", marginBottom: "16px" }}>
                  ✕ {error}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Ticket →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
