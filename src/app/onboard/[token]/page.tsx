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
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <header className="px-6 py-5 border-b-2 border-[var(--ink)] bg-[var(--card)] flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-[var(--primary)] text-[var(--lime)] font-serif font-black flex items-center justify-center text-lg border-2 border-[var(--ink)] shadow-[2px_2px_0_#17201E] group-hover:-rotate-6 transition-transform">
            D
          </span>
          <span className="font-serif font-bold text-xl tracking-tight text-[var(--ink)]">
            DigiGrantha<span className="text-[var(--accent)]">.</span>
          </span>
        </Link>
        <span className="text-xs font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-[var(--ink)] bg-[var(--mint)] text-[var(--ink)]">
          Account Activation
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[var(--card)] rounded-2xl border-2 border-[var(--ink)] shadow-[6px_6px_0_#17201E] p-8 md:p-10">
          <div className="mb-6">
            <span className="inline-block text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-[var(--lime)] text-[var(--ink)] border border-[var(--ink)] mb-3">
              Welcome to the Studio
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--ink)]">
              Set up your password
            </h1>
            <p className="text-sm text-[var(--muted)] mt-2">
              Choose a secure password for your Digigrantha workspace account.
            </p>
          </div>

          {success ? (
            <div className="bg-[var(--mint)] border-2 border-[var(--ink)] p-6 rounded-xl text-center shadow-[3px_3px_0_#17201E]">
              <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-[var(--lime)] font-bold text-2xl flex items-center justify-center mx-auto mb-3 border-2 border-[var(--ink)]">
                ✓
              </div>
              <h3 className="font-serif text-xl font-bold text-[var(--ink)] mb-1">
                Account ready!
              </h3>
              <p className="text-xs font-mono text-[var(--muted)]">
                Redirecting to your workspace…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-2"
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--ink)] bg-[var(--bg)] font-sans text-base text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all shadow-[2px_2px_0_#17201E]"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-2"
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--ink)] bg-[var(--bg)] font-sans text-base text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all shadow-[2px_2px_0_#17201E]"
                />
              </div>

              {error && (
                <div className="font-mono text-xs text-red-700 bg-red-100 border-2 border-red-500 rounded-lg p-3 font-semibold">
                  ✕ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-mono text-sm font-bold uppercase tracking-wider bg-[var(--primary)] text-[var(--lime)] border-2 border-[var(--ink)] shadow-[4px_4px_0_#17201E] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#17201E] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50"
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
