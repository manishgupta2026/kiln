"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CaseStudyRecord } from "@/lib/case-studies-db";

export default function AdminEditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const id = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    oneLiner: "",
    resultStat: "",
    briefDescription: "",
    tags: "",
    liveUrl: "",
    status: "live",
    featured: false,
    displayOrder: 0,
  });

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/case-studies/${id}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Case study not found");
        }
        const item: CaseStudyRecord = data.data;
        setFormData({
          name: item.name,
          category: item.category,
          oneLiner: item.oneLiner,
          resultStat: item.resultStat,
          briefDescription: item.briefDescription,
          tags: (item.tags || []).join(", "),
          liveUrl: item.liveUrl || "",
          status: item.status || "live",
          featured: item.featured,
          displayOrder: item.displayOrder ?? 0,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load case study");
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/case-studies/${id}`, {
        method: "PUT",
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
        throw new Error(data.error || "Failed to update case study");
      }

      setSuccessMsg("✓ Changes saved! Single source of truth updated on homepage and /work.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to update case study");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${formData.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/case-studies/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete case study");
      }
      router.push("/admin/case-studies");
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "60px 20px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)" }}>
        Loading case study details…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link
          href="/admin/case-studies"
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
          ← Back to Case Studies Roster
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: 400, color: "var(--ink)", margin: 0 }}>
              Edit: {formData.name || "Case Study"}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
              Edits made here are immediately reflected across the website and in the detail popup modal.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: "transparent",
              border: "1px solid #fca5a5",
              color: "#c93b2b",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "var(--mono)",
            }}
          >
            {deleting ? "Deleting…" : "Delete Case Study"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fde8e8", color: "#c93b2b", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px", fontFamily: "var(--mono)" }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: "#edf7ed", color: "#2e7d32", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px", fontFamily: "var(--mono)" }}>
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg)",
          border: "1px solid var(--line)",
          borderRadius: "14px",
          padding: "28px 24px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "6px" }}>
              Case Study Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", color: "var(--ink)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "6px" }}>
              Category *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Product, Trading & fintech"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", color: "var(--ink)" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "6px" }}>
            One-liner (Scannable summary for list rows) *
          </label>
          <input
            type="text"
            required
            value={formData.oneLiner}
            onChange={(e) => setFormData({ ...formData, oneLiner: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", color: "var(--ink)" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "6px" }}>
              Result Stat * (e.g. 60.5% win rate)
            </label>
            <input
              type="text"
              required
              value={formData.resultStat}
              onChange={(e) => setFormData({ ...formData, resultStat: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", color: "var(--ink)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "6px" }}>
              Live URL (Leave empty if none)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.liveUrl}
              onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", color: "var(--ink)" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "6px" }}>
            Brief Description (Narrative shown inside the detail popup modal) *
          </label>
          <textarea
            required
            rows={5}
            value={formData.briefDescription}
            onChange={(e) => setFormData({ ...formData, briefDescription: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", color: "var(--ink)", lineHeight: 1.5, resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "6px" }}>
            Tech Stack Tags (Comma separated)
          </label>
          <input
            type="text"
            placeholder="Python, XGBoost, GitHub Actions, SmartAPI"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", color: "var(--ink)" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "6px" }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", color: "var(--ink)" }}
            >
              <option value="live">Live</option>
              <option value="in-progress">In progress</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "6px" }}>
              Display Order
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", color: "var(--ink)" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", paddingBottom: "12px", fontSize: "13px" }}>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <span>Featured on Homepage</span>
            </label>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
          <Link
            href="/admin/case-studies"
            className="chip"
            style={{ textDecoration: "none" }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? "Saving Changes…" : "Save Case Study"}
          </button>
        </div>
      </form>
    </div>
  );
}
