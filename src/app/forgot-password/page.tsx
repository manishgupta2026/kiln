"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [debugUrl, setDebugUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setDebugUrl(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "If an account with that email exists, we've sent password reset instructions.");
      if (data.debugResetUrl) {
        setDebugUrl(data.debugResetUrl);
      }
    } catch {
      setMessage("If an account with that email exists, we've sent password reset instructions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <header style={{ padding: "24px 32px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/" className="logo">
          Digigrantha<span>.</span>
        </Link>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "var(--card)",
            borderRadius: "18px",
            boxShadow: "var(--shadow)",
            padding: "36px 32px",
            border: "1px solid var(--line)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <div className="section-label" style={{ marginBottom: "4px" }}>
              Account Recovery
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: 400, color: "var(--ink)" }}>
              Reset your password
            </h1>
            <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "6px" }}>
              Enter your email and we&apos;ll send a single-use secure reset link.
            </p>
          </div>

          {message ? (
            <div>
              <div
                style={{
                  background: "var(--accent-soft)",
                  border: "1px solid var(--accent)",
                  padding: "16px 18px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: "var(--ink)",
                  marginBottom: "20px",
                }}
              >
                {message}
              </div>

              {debugUrl && (
                <div style={{ margin: "16px 0", padding: "12px", background: "#f0f0eb", borderRadius: "8px", fontSize: "12px" }}>
                  <strong>Local Dev Reset Link:</strong><br />
                  <a href={debugUrl} style={{ color: "var(--accent)", wordBreak: "break-all" }}>{debugUrl}</a>
                </div>
              )}

              <Link
                href="/login"
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", display: "inline-flex" }}
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="recoveryEmail"
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
                  Account Email
                </label>
                <input
                  type="email"
                  id="recoveryEmail"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    border: "none",
                    borderBottom: "1px solid var(--line)",
                    background: "none",
                    fontFamily: "var(--body)",
                    fontSize: "15.5px",
                    color: "var(--ink)",
                    padding: "8px 0",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {loading ? "Sending link…" : "Send Reset Link →"}
              </button>

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Link href="/login" style={{ fontSize: "13px", color: "var(--muted)", textDecoration: "none" }}>
                  Remembered your password? <span style={{ color: "var(--ink)", fontWeight: 500 }}>Sign in</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
