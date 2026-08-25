"use client";

import { useState } from "react";

interface ProjectQuickLinksProps {
  projectId: string;
  isStaff: boolean; // true if Developer or Admin
  stagingUrl?: string | null;
  productionUrl?: string | null;
  figmaUrl?: string | null;
  driveUrl?: string | null;
  onLinksUpdated?: () => void;
}

export default function ProjectQuickLinks({
  projectId,
  isStaff,
  stagingUrl: initialStaging,
  productionUrl: initialProd,
  figmaUrl: initialFigma,
  driveUrl: initialDrive,
  onLinksUpdated,
}: ProjectQuickLinksProps) {
  const [stagingUrl, setStagingUrl] = useState(initialStaging || "");
  const [productionUrl, setProductionUrl] = useState(initialProd || "");
  const [figmaUrl, setFigmaUrl] = useState(initialFigma || "");
  const [driveUrl, setDriveUrl] = useState(initialDrive || "");

  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stagingUrl: stagingUrl.trim() || null,
          productionUrl: productionUrl.trim() || null,
          figmaUrl: figmaUrl.trim() || null,
          driveUrl: driveUrl.trim() || null,
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        if (onLinksUpdated) onLinksUpdated();
      }
    } catch (err) {
      console.error("Failed to save quick links:", err);
    } finally {
      setSaving(false);
    }
  };

  const links = [
    { label: "Staging Preview", url: stagingUrl, icon: "🚀", color: "var(--accent)", bg: "var(--accent-soft)" },
    { label: "Figma Board", url: figmaUrl, icon: "🎨", color: "#3730a3", bg: "#e0e7ff" },
    { label: "Shared Assets", url: driveUrl, icon: "📁", color: "#92400e", bg: "#fef3c7" },
    { label: "Live Site", url: productionUrl, icon: "🌐", color: "#166534", bg: "#dcfce7" },
  ].filter((l) => l.url && l.url.trim().length > 0);

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "14px",
        padding: "16px 20px",
        border: "1px solid var(--line)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
          Quick Links:
        </span>

        {links.length > 0 ? (
          links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "999px",
                background: link.bg,
                color: link.color,
                fontFamily: "var(--mono)",
                fontSize: "11.5px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <span>{link.icon}</span>
              <span>{link.label} ↗</span>
            </a>
          ))
        ) : (
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            No links pinned yet{isStaff ? " — click edit to add staging or Figma links." : "."}
          </span>
        )}
      </div>

      {isStaff && (
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            background: "none",
            border: "1px solid var(--line)",
            padding: "5px 10px",
            borderRadius: "6px",
            color: "var(--muted)",
            cursor: "pointer",
          }}
        >
          ✏️ Edit Links
        </button>
      )}

      {/* Edit Links Modal */}
      {showEditModal && (
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
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--line)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "var(--ink)" }}>
                Project Quick Links
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>
                    🚀 Staging URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://staging.example.com"
                    value={stagingUrl}
                    onChange={(e) => setStagingUrl(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>
                    🎨 Figma Design Board
                  </label>
                  <input
                    type="url"
                    placeholder="https://figma.com/file/..."
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>
                    📁 Shared Drive / Assets Folder
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>
                    🌐 Live Production Site
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={productionUrl}
                    onChange={(e) => setProductionUrl(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ fontFamily: "var(--mono)", fontSize: "12px", background: "none", border: "1px solid var(--line)", padding: "8px 16px", borderRadius: "999px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ fontSize: "12.5px" }}>
                  {saving ? "Saving…" : "Save Quick Links"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
