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
      <header style={{ padding: "20px 32px", borderBottom: "2px solid var(--outline)", background: "var(--surface)" }}>
        <Link href="/" className="logo">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="logo-text">Digigrantha</span>
          <span className="logo-dot">.</span>
        </Link>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            padding: "40px 36px",
            border: "2px solid var(--outline)",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <div className="section-label" style={{ marginBottom: "12px", background: "var(--lime)", color: "#17201E" }}>
              Account Recovery
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "32px", fontWeight: 700, color: "var(--text)", lineHeight: 1.15 }}>
              Reset your password
            </h1>
            <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>
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
              <div style={{ marginBottom: "26px" }}>
                <label
                  htmlFor="recoveryEmail"
                  style={{
                    display: "block",
                    fontFamily: "var(--body)",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--text)",
                    marginBottom: "8px",
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
                    border: "2px solid var(--outline)",
                    background: "var(--bg)",
                    borderRadius: "10px",
                    fontFamily: "var(--body)",
                    fontSize: "15px",
                    color: "var(--text)",
                    padding: "12px 14px",
                    outline: "none",
                    boxShadow: "2px 2px 0 var(--outline)",
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

              <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "2px solid var(--outline)", textAlign: "center" }}>
                <Link href="/login" style={{ fontSize: "13.5px", color: "var(--muted)", textDecoration: "none" }}>
                  Remembered your password? <span style={{ color: "var(--green)", fontWeight: 700, textDecoration: "underline" }}>Sign in</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
