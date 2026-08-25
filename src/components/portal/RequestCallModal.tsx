"use client";

import { useState } from "react";

interface RequestCallModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function RequestCallModal({
  projectId,
  isOpen,
  onClose,
  onSubmitted,
}: RequestCallModalProps) {
  const [preferredTimes, setPreferredTimes] = useState("");
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredTimes.trim() || !topic.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/call-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredTimes: preferredTimes.trim(),
          topic: topic.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          if (onSubmitted) onSubmitted();
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to request call:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
          maxWidth: "480px",
          width: "100%",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--line)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)" }}>
              Request a 15-Min Live Sync
            </h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
              We keep builds async by default, but we&apos;re always here when you need to talk.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>

        {success ? (
          <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)", padding: "18px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontWeight: 600, color: "var(--accent)", fontSize: "16px", marginBottom: "4px" }}>
              ✓ Sync Request Sent!
            </div>
            <p style={{ fontSize: "13px", color: "var(--ink)" }}>
              Your engineering lead will confirm with a Google Meet link shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                  Preferred Times (Give 2 options)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tomorrow 3 PM IST or Thursday 11 AM IST"
                  value={preferredTimes}
                  onChange={(e) => setPreferredTimes(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                  Discussion Topic / Agenda
                </label>
                <textarea
                  required
                  placeholder="e.g. Review updated mobile checkout wireframes before finalizing design."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", fontSize: "14px", minHeight: "75px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={onClose}
                style={{ fontFamily: "var(--mono)", fontSize: "12.5px", background: "none", border: "1px solid var(--line)", padding: "8px 16px", borderRadius: "999px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ fontSize: "12.5px" }}>
                {submitting ? "Sending…" : "Submit Call Request →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
