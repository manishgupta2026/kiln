"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid password");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="admin-login-card">
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Link href="/" className="logo" style={{ fontSize: "28px" }}>
            Kiln<span>.</span>
          </Link>
          <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "8px", textTransform: "uppercase", letterSpacing: ".05em" }}>
            Admin Access
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="field" style={{ marginBottom: "20px" }}>
            <label htmlFor="adminPassword">Password</label>
            <input
              type="password"
              id="adminPassword"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          {error && (
            <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "#c93b2b", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Enter Dashboard →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link href="/" style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
