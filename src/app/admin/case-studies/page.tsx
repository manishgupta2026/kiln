"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CaseStudyRecord } from "@/lib/case-studies-db";

export default function AdminCaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New item form state
  const [formData, setFormData] = useState({
    name: "",
    category: "Product",
    oneLiner: "",
    resultStat: "",
    briefDescription: "",
    tags: "",
    liveUrl: "",
    status: "live",
    featured: true,
    displayOrder: 1,
  });

  const loadCaseStudies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/case-studies");
      const data = await res.json();
      if (data.success) {
        setCaseStudies(data.data);
        setFormData((prev) => ({
          ...prev,
          displayOrder: (data.data.length || 0) + 1,
        }));
      }
    } catch (err) {
      console.error("Failed to load case studies:", err);
      setError("Failed to load case studies from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseStudies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          oneLiner: formData.oneLiner,
          resultStat: formData.resultStat,
          briefDescription: formData.briefDescription,
          tags: formData.tags,
          liveUrl: formData.liveUrl || null,
          status: formData.status,
          featured: formData.featured,
          displayOrder: Number(formData.displayOrder),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create case study");
      }

      setShowAddModal(false);
      setFormData({
        name: "",
        category: "Product",
        oneLiner: "",
        resultStat: "",
        briefDescription: "",
        tags: "",
        liveUrl: "",
        status: "live",
        featured: true,
        displayOrder: caseStudies.length + 2,
      });
      await loadCaseStudies();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete case study "${name}"? This will immediately remove it from the public website.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/case-studies/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete case study");
      }
      await loadCaseStudies();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <Link
            href="/admin"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "12px",
              color: "var(--muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "8px",
            }}
          >
            ← Back to Admin Studio
          </Link>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "30px",
              fontWeight: 400,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Case Studies &amp; Showcase Portfolio
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
            Single source of truth for the homepage top-3 and the full <code>/work</code> archive.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddModal(true);
            setError(null);
          }}
          className="btn-primary"
          style={{ fontSize: "13px" }}
        >
          + Add New Case Study
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fde8e8",
            color: "#c93b2b",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13px",
            fontFamily: "var(--mono)",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "var(--muted)",
            fontFamily: "var(--mono)",
          }}
        >
          Loading case studies…
        </div>
      ) : caseStudies.length === 0 ? (
        <div
          style={{
            background: "var(--card)",
            padding: "48px 24px",
            textAlign: "center",
            borderRadius: "14px",
            border: "1px solid var(--line)",
          }}
        >
          <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
            No case studies found in database.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Create Your First Case Study
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>Order</th>
                <th>Case Study</th>
                <th>Category</th>
                <th>Result Stat</th>
                <th>Status</th>
                <th>Homepage</th>
                <th>Link</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {caseStudies.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                    #{item.displayOrder}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: "15px" }}>
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12.5px",
                        color: "var(--muted)",
                        maxWidth: "320px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.oneLiner}
                    >
                      {item.oneLiner}
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--mono)",
                              background: "var(--line)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              color: "var(--muted)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--mono)",
                        background: "var(--line)",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        color: "var(--ink)",
                      }}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>
                      {item.resultStat}
                    </span>
                  </td>
                  <td>
                    <span
                      className="status-pill"
                      style={{
                        fontSize: "10px",
                        padding: "3px 8px",
                        background: item.status === "in-progress" ? "#eae7dd" : "var(--accent-soft)",
                        color: item.status === "in-progress" ? "var(--muted)" : "var(--accent)",
                      }}
                    >
                      {item.status === "in-progress" ? "In progress" : "Live"}
                    </span>
                  </td>
                  <td>
                    {item.featured ? (
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--mono)",
                          color: "var(--accent)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        ★ Featured
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)" }}>
                        Archive only
                      </span>
                    )}
                  </td>
                  <td>
                    {item.liveUrl ? (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "11.5px", color: "var(--accent)", textDecoration: "none" }}
                      >
                        Visit ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <Link
                        href={`/admin/case-studies/${item.id}`}
                        className="chip"
                        style={{ fontSize: "11px", padding: "4px 10px", textDecoration: "none" }}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.name)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#c93b2b",
                          cursor: "pointer",
                          fontSize: "11px",
                          padding: "4px 8px",
                          fontFamily: "var(--mono)",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Case Study Modal */}
      {showAddModal && (
        <div
          className="case-study-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="case-study-modal" style={{ maxWidth: "620px" }}>
            <button
              type="button"
              className="case-study-close-btn"
              onClick={() => setShowAddModal(false)}
            >
              ✕
            </button>

            <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", marginBottom: "8px" }}>
              Add New Case Study
            </h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
              This will immediately become available in the public showcase and generate dynamic category chips.
            </p>

            <form onSubmit={handleCreate}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TradeSage"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Category (Free text) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Product"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  One-liner (for list rows) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Short line shown on row hover / scan"
                  value={formData.oneLiner}
                  onChange={(e) => setFormData({ ...formData, oneLiner: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Result Stat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 60.5% win rate, 1,000+ daily users"
                    value={formData.resultStat}
                    onChange={(e) => setFormData({ ...formData, resultStat: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Live URL (Nullable)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (leave empty if none)"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Brief Description (for popup modal) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed context and engineering receipts displayed when user taps this case study"
                  value={formData.briefDescription}
                  onChange={(e) => setFormData({ ...formData, briefDescription: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", resize: "vertical" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, TypeScript, Tailwind, Neon"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                  >
                    <option value="live">Live</option>
                    <option value="in-progress">In progress</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", paddingBottom: "10px", fontSize: "13px" }}>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span>Featured (Home)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="chip"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? "Saving…" : "Create Case Study"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
