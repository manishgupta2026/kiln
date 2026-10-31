"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      const targetUrl = redirectParam || data.redirectUrl || "/dashboard";
      router.push(targetUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Digigrantha Workspace
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "32px", fontWeight: 700, color: "var(--text)", lineHeight: 1.15 }}>
          Sign in to your portal
        </h1>
        <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>
          Client, developer, and studio accounts
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="loginEmail"
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
            Email
          </label>
          <input
            type="email"
            id="loginEmail"
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

        <div style={{ marginBottom: "26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <label
              htmlFor="loginPassword"
              style={{
                fontFamily: "var(--body)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text)",
              }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{
                fontFamily: "var(--body)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--green)",
                textDecoration: "underline",
              }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="loginPassword"
            required
            autoComplete="current-password"
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
          {loading ? "Signing in…" : "Sign In →"}
        </button>
      </form>

      <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "2px solid var(--outline)", textAlign: "center" }}>
        <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
          Need a project built?{" "}
          <Link href="/#brief" style={{ color: "var(--green)", textDecoration: "underline", fontWeight: 700 }}>
            Submit a brief
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Top Header */}
      <header style={{ padding: "20px 32px", borderBottom: "2px solid var(--outline)", background: "var(--surface)" }}>
        <Link href="/" className="logo">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="logo-text">Digigrantha</span>
          <span className="logo-dot">.</span>
        </Link>
      </header>

      {/* Main Login Box */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <Suspense fallback={<div style={{ color: "var(--muted)", fontFamily: "var(--body)" }}>Loading login portal…</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}

