"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { TicketStatus } from "@/lib/prisma";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface TicketDetail {
  id: string;
  subject: string;
  status: TicketStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export default function ClientTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    const interval = setInterval(loadTicket, 10000); // Polling refresh
    return () => clearInterval(interval);
  }, [ticketId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !replyText.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${ticket.projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          body: replyText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send reply");
      }

      setReplyText("");
      loadTicket();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", fontFamily: "var(--mono)" }}>
        Loading ticket details…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <h2 style={{ fontFamily: "var(--display)", fontSize: "24px" }}>Ticket not found</h2>
        <Link href="/dashboard/tickets" className="btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
          ← Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "840px", margin: "0 auto" }}>
      <div>
        <Link
          href="/dashboard/tickets"
          style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}
        >
          ← Back to tickets
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10.5px",
                  textTransform: "uppercase",
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
                Opened {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "26px", color: "var(--ink)", fontWeight: 400 }}>
              {ticket.subject}
            </h1>
          </div>
        </div>
      </div>

      {/* Message Thread */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {ticket.messages.map((msg) => {
          const isDev = msg.sender.role === "DEVELOPER" || msg.sender.role === "ADMIN";
          return (
            <div
              key={msg.id}
              style={{
                background: isDev ? "var(--accent-soft)" : "var(--card)",
                borderRadius: "14px",
                padding: "20px",
                border: isDev ? "1px solid rgba(117, 128, 31, 0.3)" : "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong style={{ fontSize: "13.5px", color: "var(--ink)" }}>{msg.sender.name}</strong>
                  {isDev && (
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "9.5px",
                        textTransform: "uppercase",
                        background: "var(--accent)",
                        color: "#fff",
                        padding: "1px 6px",
                        borderRadius: "999px",
                      }}
                    >
                      Kiln Team
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} ·{" "}
                  {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--ink)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {msg.body}
              </p>
            </div>
          );
        })}
      </div>

      {/* Reply Input Form */}
      <form
        onSubmit={handleSendReply}
        style={{
          background: "var(--card)",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow)",
        }}
      >
        <label
          htmlFor="ticketReply"
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--muted)",
            marginBottom: "8px",
          }}
        >
          Reply to this ticket
        </label>
        <textarea
          id="ticketReply"
          rows={3}
          required
          placeholder="Type your response or follow-up note here…"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
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
            marginBottom: "12px",
          }}
        />

        {error && (
          <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "#c93b2b", marginBottom: "12px" }}>
            ✕ {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Sending reply…" : "Send Reply →"}
          </button>
        </div>
      </form>
    </div>
  );
}
