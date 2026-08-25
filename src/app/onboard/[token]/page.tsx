"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OnboardPageProps {
  params: Promise<{ token: string }>;
}

export default function OnboardPage({ params }: OnboardPageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to set up account.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(data.redirectUrl || "/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <header style={{ padding: "24px 32px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/" className="logo">
          Kiln<span>.</span>
        </Link>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "var(--card)",
            borderRadius: "18px",
            boxShadow: "var(--shadow)",
            padding: "36px 32px",
            border: "1px solid var(--line)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <div className="section-label" style={{ marginBottom: "4px" }}>
              Welcome to Kiln
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: 400, color: "var(--ink)" }}>
              Set up your password
            </h1>
            <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "6px" }}>
              Choose a secure password for your workspace account.
            </p>
          </div>

          {success ? (
            <div
              style={{
                background: "var(--accent-soft)",
                border: "1px solid var(--accent)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>✓</div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", marginBottom: "6px" }}>
                Account ready!
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--ink)", fontFamily: "var(--mono)" }}>
                Redirecting to your workspace…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="newPassword"
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
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  id="newPassword"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="confirmPassword"
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
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              {error && (
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "12.5px",
                    color: "#c93b2b",
                    marginBottom: "18px",
                    background: "#fde8e4",
                    padding: "10px 12px",
                    borderRadius: "8px",
                  }}
                >
                  ✕ {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {loading ? "Activating account…" : "Complete Setup & Enter →"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
