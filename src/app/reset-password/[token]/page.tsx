"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password.");
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
              Password Reset
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "32px", fontWeight: 700, color: "var(--text)", lineHeight: 1.15 }}>
              Choose a new password
            </h1>
            <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>
              Enter and confirm your new account password.
            </p>
          </div>

          {success ? (
            <div
              style={{
                background: "var(--mint)",
                border: "2px solid var(--outline)",
                boxShadow: "var(--shadow-sm)",
                padding: "24px 20px",
                borderRadius: "14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
                Password Updated!
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--muted)", fontFamily: "var(--body)" }}>
                Signing you in and redirecting to workspace…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="resetNewPassword"
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
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  id="resetNewPassword"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div style={{ marginBottom: "26px" }}>
                <label
                  htmlFor="resetConfirmPassword"
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
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="resetConfirmPassword"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              {error && (
                <div
                  style={{
                    fontFamily: "var(--body)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#991B1B",
                    marginBottom: "20px",
                    background: "#FEE2E2",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "2px solid #991B1B",
                    boxShadow: "2px 2px 0 #991B1B",
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
                {loading ? "Updating password…" : "Save New Password →"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
