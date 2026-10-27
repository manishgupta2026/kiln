"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminNavbar from "@/components/AdminNavbar";

interface Developer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  hasPassword: boolean;
  activeProjects: { id: string; name: string; phase: string; status: string }[];
}

export default function AdminDevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDevelopers = async () => {
    try {
      const res = await fetch("/api/admin/developers");
      const data = await res.json();
      if (data.success) {
        setDevelopers(data.developers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevelopers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setInviteResult(null);

    try {
      const res = await fetch("/api/admin/developers/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to invite developer.");
      }

      setInviteResult(data.inviteUrl);
      setName("");
      setEmail("");
      loadDevelopers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async (id: string, devName: string) => {
    if (!confirm(`Are you sure you want to revoke developer access for ${devName}?`)) return;

    try {
      await fetch(`/api/admin/developers/${id}`, { method: "DELETE" });
      loadDevelopers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <AdminNavbar
        currentTitle="Developers"
        currentSubtitle="Developer Engineering Accounts & Project Assignments"
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <Link
            href="/admin"
            style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}
          >
            ← Back to Admin Studio
          </Link>
          <h1 style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: 400, color: "var(--ink)" }}>
            Developer Engineering Accounts
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "2px" }}>
            Invite developers with secure onboarding links and manage project assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowModal(true);
            setInviteResult(null);
          }}
          className="btn-primary"
          style={{ fontSize: "13px" }}
        >
          + Invite Developer
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)" }}>
          Loading developer roster…
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Developer</th>
                <th>Account Status</th>
                <th>Assigned Projects</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {developers.map((dev) => (
                <tr key={dev.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--ink)" }}>{dev.name}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--muted)" }}>{dev.email}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "10.5px",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: dev.hasPassword ? "var(--accent-soft)" : "#fef3c7",
                        color: dev.hasPassword ? "var(--accent)" : "#92400e",
                      }}
                    >
                      {dev.hasPassword ? "Active" : "Invite Pending"}
                    </span>
                  </td>
                  <td>
                    {dev.activeProjects.length > 0 ? (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {dev.activeProjects.map((p) => (
                          <Link
                            key={p.id}
                            href={`/admin/projects/${p.id}`}
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: "rgba(23, 21, 15, 0.04)",
                              color: "var(--ink)",
                              textDecoration: "none",
                            }}
                          >
                            {p.name} ({p.phase})
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: "12px" }}>None assigned</span>
                    )}
                  </td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>
                    {new Date(dev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDelete(dev.id, dev.name)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#c93b2b",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Developer Modal */}
      {showModal && (
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
              width: "100%",
              maxWidth: "480px",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--line)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)" }}>
                Invite Developer
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            {inviteResult ? (
              <div>
                <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
                  <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: "4px" }}>
                    ✓ Invite Dispatched!
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.4 }}>
                    The developer can click this link to set their password and access assigned projects.
                  </p>
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(117, 128, 31, 0.3)" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>Setup Link:</span><br />
                    <a href={inviteResult} style={{ fontSize: "12px", color: "var(--accent)", wordBreak: "break-all" }}>
                      {inviteResult}
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleInvite}>
                <div style={{ marginBottom: "16px" }}>
                  <label
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
                    Developer Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "1px solid var(--line)",
                      background: "none",
                      fontFamily: "var(--body)",
                      fontSize: "15px",
                      color: "var(--ink)",
                      padding: "8px 0",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@digigrantha.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "1px solid var(--line)",
                      background: "none",
                      fontFamily: "var(--body)",
                      fontSize: "15px",
                      color: "var(--ink)",
                      padding: "8px 0",
                      outline: "none",
                    }}
                  />
                </div>

                {error && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "#c93b2b", marginBottom: "16px" }}>
                    ✕ {error}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "13px",
                      background: "none",
                      border: "1px solid var(--line)",
                      padding: "10px 18px",
                      borderRadius: "999px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={inviting}>
                    {inviting ? "Sending…" : "Send Invite →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
