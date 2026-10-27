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
          Digigrantha Workspace
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: 400, color: "var(--ink)" }}>
          Sign in to your portal
        </h1>
        <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "6px" }}>
          Client, developer, and studio accounts
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "18px" }}>
          <label
            htmlFor="loginEmail"
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
            <label
              htmlFor="loginPassword"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--muted)",
              }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                color: "var(--accent)",
                textDecoration: "none",
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
          {loading ? "Signing in…" : "Sign In →"}
        </button>
      </form>

      <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--line)", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>
          Need a project built?{" "}
          <Link href="/#brief" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
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
      <header style={{ padding: "24px 32px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/" className="logo">
          Digigrantha<span>.</span>
        </Link>
      </header>

      {/* Main Login Box */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
        <Suspense fallback={<div style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}>Loading login portal…</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
