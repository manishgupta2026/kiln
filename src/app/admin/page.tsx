"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Project, ProjectCategory } from "@/data/projects";
import { TrustSectionConfig, TrustSlot } from "@/lib/content-db";

interface BriefItem {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string | null;
  description: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"briefs" | "trust" | "projects">("briefs");

  // Briefs State
  const [briefs, setBriefs] = useState<BriefItem[]>([]);
  const [loadingBriefs, setLoadingBriefs] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Trust Section State
  const [trustConfig, setTrustConfig] = useState<TrustSectionConfig | null>(null);
  const [loadingTrust, setLoadingTrust] = useState(true);
  const [savingTrust, setSavingTrust] = useState(false);
  const [trustSuccessMsg, setTrustSuccessMsg] = useState<string | null>(null);

  // Projects State
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    name: "",
    category: "product",
    oneLiner: "",
    homepageOneLiner: "",
    result: "",
    tags: [],
    status: undefined,
    featured: true,
    mobilePreview: "",
  });
  const [tagsInput, setTagsInput] = useState("");

  const [, startTransition] = useTransition();
  const router = useRouter();

  // Load Briefs
  const fetchBriefs = async () => {
    try {
      const res = await fetch("/api/admin/briefs");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      if (json.success) {
        setBriefs(json.data);
      }
    } catch (err) {
      console.error("Failed to load briefs:", err);
    } finally {
      setLoadingBriefs(false);
    }
  };

  // Load Trust Config & Projects
  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      const json = await res.json();
      if (json.success) {
        setTrustConfig(json.data.trust);
        setProjectsList(json.data.projects);
      }
    } catch (err) {
      console.error("Failed to load site content:", err);
    } finally {
      setLoadingTrust(false);
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchBriefs();
    fetchContent();
  }, []);

  const handleStatusChange = async (id: string, newStatus: "new" | "read" | "archived") => {
    setBriefs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );

    try {
      await fetch(`/api/admin/briefs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchBriefs();
    }
  };

  // Instant Auto-Save for Visibility Toggle
  const handleToggleTrustVisibility = async (enabled: boolean) => {
    if (!trustConfig) return;
    const updated = { ...trustConfig, enabled };
    setTrustConfig(updated);
    setTrustSuccessMsg(
      enabled
        ? "✓ Auto-saved: Section is now ENABLED and visible on homepage."
        : "✓ Auto-saved: Section is now DISABLED and removed from homepage."
    );

    try {
      const res = await fetch("/api/admin/content/trust", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setTrustConfig(data.data);
      }
    } catch (err) {
      console.error("Failed to toggle trust visibility:", err);
    }
  };

  // Save Trust Config (text and slots)
  const handleSaveTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trustConfig) return;
    setSavingTrust(true);
    setTrustSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/content/trust", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trustConfig),
      });
      const data = await res.json();
      if (data.success) {
        setTrustConfig(data.data);
        setTrustSuccessMsg("✓ All Trust section settings saved successfully! Live on website.");
        setTimeout(() => setTrustSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error("Failed to save trust config:", err);
    } finally {
      setSavingTrust(false);
    }
  };

  // Add/Remove Trust Slots
  const handleAddSlot = () => {
    if (!trustConfig) return;
    const newSlot: TrustSlot = {
      id: `slot_${Date.now()}`,
      label: "New Company",
      isHighlighted: false,
    };
    setTrustConfig({
      ...trustConfig,
      slots: [...trustConfig.slots, newSlot],
    });
  };

  const handleRemoveSlot = (id: string) => {
    if (!trustConfig) return;
    setTrustConfig({
      ...trustConfig,
      slots: trustConfig.slots.filter((s) => s.id !== id),
    });
  };

  const handleSlotLabelChange = (id: string, label: string) => {
    if (!trustConfig) return;
    setTrustConfig({
      ...trustConfig,
      slots: trustConfig.slots.map((s) => (s.id === id ? { ...s, label } : s)),
    });
  };

  const handleSlotHighlightToggle = (id: string) => {
    if (!trustConfig) return;
    setTrustConfig({
      ...trustConfig,
      slots: trustConfig.slots.map((s) =>
        s.id === id ? { ...s, isHighlighted: !s.isHighlighted } : s
      ),
    });
  };

  // Project Management
  const openNewProjectModal = () => {
    setProjectForm({
      name: "",
      category: "product",
      oneLiner: "",
      homepageOneLiner: "",
      result: "",
      tags: [],
      status: undefined,
      featured: true,
      mobilePreview: "",
    });
    setTagsInput("");
    setIsCreatingProject(true);
    setEditingProject(null);
  };

  const openEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setProjectForm({ ...project });
    setTagsInput(project.tags.join(", "));
    setIsCreatingProject(false);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...projectForm,
      tags,
    };

    try {
      if (isCreatingProject) {
        const res = await fetch("/api/admin/content/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProjectsList((prev) => [...prev, data.data]);
          setIsCreatingProject(false);
        }
      } else if (editingProject) {
        const res = await fetch(`/api/admin/content/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProjectsList((prev) =>
            prev.map((p) => (p.id === editingProject.id ? data.data : p))
          );
          setEditingProject(null);
        }
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/content/projects/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProjectsList((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    const newFeatured = !project.featured;
    setProjectsList((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, featured: newFeatured } : p))
    );

    try {
      await fetch(`/api/admin/content/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newFeatured }),
      });
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    startTransition(() => {
      router.push("/admin/login");
      router.refresh();
    });
  };

  const totalBriefs = briefs.length;
  const newBriefs = briefs.filter((b) => b.status === "new").length;
  const readBriefs = briefs.filter((b) => b.status === "read").length;

  return (
    <div className="admin-wrap">
      {/* Top Header */}
      <header className="admin-header">
        <div>
          <h1 className="admin-title">
            Kiln <span>Admin Studio</span>
          </h1>
          <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
            Inbound inquiries &amp; Live Site Content Management
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "12px",
              color: "var(--muted)",
              padding: "8px 14px",
              border: "1px solid var(--line)",
              borderRadius: "4px",
            }}
          >
            Visit Website ↗
          </Link>
          <button
            onClick={handleLogout}
            style={{
              fontFamily: "var(--mono)",
              fontSize: "12px",
              background: "none",
              border: "1px solid var(--line)",
              padding: "8px 14px",
              borderRadius: "4px",
              cursor: "pointer",
              color: "var(--ink)",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px", borderBottom: "1px solid var(--line)", paddingBottom: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setActiveTab("briefs")}
          className={`chip ${activeTab === "briefs" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>📥 Inbound Briefs</span>
          {newBriefs > 0 && (
            <span style={{ background: "#c93b2b", color: "#fff", padding: "1px 7px", borderRadius: "999px", fontSize: "10px" }}>
              {newBriefs}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("trust")}
          className={`chip ${activeTab === "trust" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>🏢 Company / Trust Section</span>
          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: trustConfig?.enabled ? "var(--accent-soft)" : "#eae7dd", color: trustConfig?.enabled ? "var(--accent)" : "var(--muted)" }}>
            {trustConfig?.enabled ? "LIVE (ON)" : "HIDDEN (OFF)"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`chip ${activeTab === "projects" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>🚀 Projects Manager</span>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            ({projectsList.length})
          </span>
        </button>
      </div>

      {/* ================= TAB 1: BRIEFS ================= */}
      {activeTab === "briefs" && (
        <div>
          {/* Stats Summary */}
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Total Submissions</div>
              <div className="admin-stat-val">{totalBriefs}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">New / Unread</div>
              <div className="admin-stat-val" style={{ color: "#c93b2b" }}>
                {newBriefs}
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Read / In Review</div>
              <div className="admin-stat-val" style={{ color: "var(--accent)" }}>
                {readBriefs}
              </div>
            </div>
          </div>

          {loadingBriefs ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading briefs...
            </div>
          ) : briefs.length === 0 ? (
            <div
              style={{
                background: "var(--card)",
                padding: "48px 24px",
                textAlign: "center",
                borderRadius: "14px",
                border: "1px solid var(--line)",
              }}
            >
              <p style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)" }}>
                No briefs submitted yet.
              </p>
              <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "6px" }}>
                Submissions through the homepage brief form will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Budget</th>
                    <th>Description Preview</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {briefs.map((brief) => {
                    const isExpanded = expandedId === brief.id;
                    const formattedDate = new Date(brief.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={brief.id}>
                        <td>
                          <span className={`admin-status-badge ${brief.status}`}>
                            {brief.status}
                          </span>
                        </td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", whiteSpace: "nowrap" }}>
                          {formattedDate}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                          {brief.name}
                        </td>
                        <td>
                          <a
                            href={`mailto:${brief.email}?subject=Re:%20Kiln%20Project%20Brief`}
                            style={{ color: "var(--accent)", textDecoration: "underline" }}
                          >
                            {brief.email}
                          </a>
                        </td>
                        <td>
                          <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                            {brief.projectType}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                            {brief.budget || "—"}
                          </span>
                        </td>
                        <td style={{ maxWidth: "340px" }}>
                          <div
                            onClick={() => setExpandedId(isExpanded ? null : brief.id)}
                            style={{
                              cursor: "pointer",
                              color: "var(--ink)",
                              lineHeight: 1.5,
                            }}
                          >
                            {isExpanded ? (
                              <div style={{ whiteSpace: "pre-wrap", background: "var(--bg)", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                                {brief.description}
                                <div style={{ marginTop: "8px", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--accent)" }}>
                                  (Click to collapse)
                                </div>
                              </div>
                            ) : (
                              <div title="Click to view full description">
                                {brief.description.length > 80
                                  ? `${brief.description.slice(0, 80)}...`
                                  : brief.description}
                                <span style={{ marginLeft: "6px", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                                  [more]
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {brief.status !== "read" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(brief.id, "read")}
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: "11px",
                                  padding: "4px 8px",
                                  border: "1px solid var(--accent)",
                                  background: "var(--accent-soft)",
                                  color: "var(--accent)",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                              >
                                Mark Read
                              </button>
                            )}
                            {brief.status !== "new" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(brief.id, "new")}
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: "11px",
                                  padding: "4px 8px",
                                  border: "1px solid var(--line)",
                                  background: "none",
                                  color: "var(--muted)",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                              >
                                Mark New
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: TRUST / COMPANY SECTION ================= */}
      {activeTab === "trust" && (
        <div style={{ background: "var(--card)", padding: "32px", borderRadius: "16px", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          {loadingTrust || !trustConfig ? (
            <div style={{ padding: "30px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading trust section settings...
            </div>
          ) : (
            <form onSubmit={handleSaveTrust}>
              {/* Master ON/OFF Toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "24px", borderBottom: "1px solid var(--line)", marginBottom: "28px" }}>
                <div>
                  <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", color: "var(--ink)" }}>
                    &quot;Who we&apos;ve worked with&quot; Section Visibility
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
                    Toggle this OFF to completely remove the trust &amp; company logo section from the homepage.
                  </p>
                </div>

                <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", gap: "12px", background: trustConfig.enabled ? "var(--accent-soft)" : "#eae7dd", padding: "10px 18px", borderRadius: "999px", border: `1px solid ${trustConfig.enabled ? "var(--accent)" : "var(--line)"}` }}>
                  <input
                    type="checkbox"
                    checked={trustConfig.enabled}
                    onChange={(e) => handleToggleTrustVisibility(e.target.checked)}
                    style={{ width: "20px", height: "20px", accentColor: "var(--accent)", cursor: "pointer" }}
                  />
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: "13px", color: trustConfig.enabled ? "var(--accent)" : "var(--muted)" }}>
                    {trustConfig.enabled ? "VISIBLE ON HOMEPAGE" : "DISABLED (HIDDEN)"}
                  </span>
                </label>
              </div>

              {/* Text Fields */}
              <div style={{ display: "grid", gap: "20px", marginBottom: "32px" }}>
                <div className="field">
                  <label>Section Eyebrow Label</label>
                  <input
                    type="text"
                    value={trustConfig.eyebrow}
                    onChange={(e) =>
                      setTrustConfig({ ...trustConfig, eyebrow: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>Main Headline</label>
                  <input
                    type="text"
                    value={trustConfig.heading}
                    onChange={(e) =>
                      setTrustConfig({ ...trustConfig, heading: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>Description Paragraph</label>
                  <textarea
                    rows={3}
                    value={trustConfig.description}
                    onChange={(e) =>
                      setTrustConfig({ ...trustConfig, description: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Slots / Companies Management */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--display)", fontSize: "20px" }}>
                      Company &amp; Client Slots ({trustConfig.slots.length})
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                      Add client names, partners, or placeholder slots. Use line breaks for multiple lines.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "12px",
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent)",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    + Add Slot
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                  {trustConfig.slots.map((slot, index) => (
                    <div
                      key={slot.id}
                      style={{
                        background: slot.isHighlighted ? "var(--accent-soft)" : "var(--bg)",
                        border: `1.5px ${slot.isHighlighted ? "solid var(--accent)" : "dashed var(--line)"}`,
                        borderRadius: "12px",
                        padding: "16px",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                          Slot #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(slot.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#c93b2b",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          ✕ Delete
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={slot.label}
                        onChange={(e) => handleSlotLabelChange(slot.id, e.target.value)}
                        placeholder="Company name or '—'"
                        style={{
                          width: "100%",
                          fontSize: "13px",
                          fontFamily: "var(--mono)",
                          textAlign: "center",
                          padding: "8px",
                          border: "1px solid var(--line)",
                          borderRadius: "6px",
                          background: "var(--card)",
                        }}
                      />

                      <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={!!slot.isHighlighted}
                          onChange={() => handleSlotHighlightToggle(slot.id)}
                          style={{ accentColor: "var(--accent)" }}
                        />
                        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--ink)" }}>
                          Accent Highlight Border
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {trustSuccessMsg && (
                <div style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--accent)", marginBottom: "16px", background: "var(--accent-soft)", padding: "10px 14px", borderRadius: "6px" }}>
                  ✓ {trustSuccessMsg}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={savingTrust}
              >
                {savingTrust ? "Saving Changes..." : "Save Trust Section Changes →"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ================= TAB 3: PROJECTS MANAGER ================= */}
      {activeTab === "projects" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "26px", color: "var(--ink)" }}>
                Projects Archive
              </h2>
              <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "2px" }}>
                Manage all portfolio projects shown on the homepage and `/work` archive page.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewProjectModal}
              className="btn-primary"
            >
              + Add New Project
            </button>
          </div>

          {loadingProjects ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading projects...
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Idx</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Metric / Result</th>
                    <th>Tags</th>
                    <th>Homepage</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projectsList.map((project) => (
                    <tr key={project.id}>
                      <td style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>
                        {project.idx}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {project.name}
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "11.5px", textTransform: "uppercase", color: "var(--accent)" }}>
                          {project.category}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: "12.5px", color: "var(--accent)" }}>
                        {project.result}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "220px" }}>
                          {project.tags.map((t) => (
                            <span key={t} className="tag" style={{ fontSize: "10px", padding: "2px 6px" }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(project)}
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            border: `1px solid ${project.featured ? "var(--accent)" : "var(--line)"}`,
                            background: project.featured ? "var(--accent-soft)" : "none",
                            color: project.featured ? "var(--accent)" : "var(--muted)",
                            cursor: "pointer",
                          }}
                        >
                          {project.featured ? "★ Featured" : "☆ Archive Only"}
                        </button>
                      </td>
                      <td>
                        {project.status === "in-progress" ? (
                          <span className="status-pill">In Progress</span>
                        ) : (
                          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                            Shipped
                          </span>
                        )}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => openEditProjectModal(project)}
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "11px",
                              padding: "4px 8px",
                              border: "1px solid var(--line)",
                              borderRadius: "4px",
                              background: "none",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project.id, project.name)}
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "11px",
                              padding: "4px 8px",
                              border: "1px solid #c93b2b",
                              borderRadius: "4px",
                              background: "none",
                              color: "#c93b2b",
                              cursor: "pointer",
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

          {/* Project Form Modal */}
          {(isCreatingProject || editingProject) && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(23, 21, 15, 0.6)",
                zIndex: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  background: "var(--card)",
                  width: "100%",
                  maxWidth: "600px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  padding: "32px",
                  borderRadius: "18px",
                  boxShadow: "var(--shadow)",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "var(--display)", fontSize: "24px" }}>
                    {isCreatingProject ? "Add New Project" : `Edit ${editingProject?.name}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingProject(false);
                      setEditingProject(null);
                    }}
                    style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveProject} style={{ display: "grid", gap: "16px" }}>
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="field">
                      <label>Project Name</label>
                      <input
                        type="text"
                        value={projectForm.name || ""}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, name: e.target.value })
                        }
                        placeholder="e.g. TradeSage"
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Category</label>
                      <select
                        value={projectForm.category || "product"}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            category: e.target.value as ProjectCategory,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px 0",
                          border: "none",
                          borderBottom: "1px solid var(--line)",
                          background: "none",
                          fontFamily: "var(--body)",
                          fontSize: "15px",
                        }}
                      >
                        <option value="product">Product</option>
                        <option value="trading">Trading &amp; fintech</option>
                        <option value="insurtech">Insurtech</option>
                        <option value="in-progress">In progress</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="field">
                      <label>Result / Metric Pill</label>
                      <input
                        type="text"
                        value={projectForm.result || ""}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, result: e.target.value })
                        }
                        placeholder="e.g. 60.5% win rate, Top 60 nationally"
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Tags (Comma separated)</label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Next.js, Python, Supabase"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Full Archive One-Liner</label>
                    <textarea
                      rows={2}
                      value={projectForm.oneLiner || ""}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, oneLiner: e.target.value })
                      }
                      placeholder="An algorithmic trading system for the Indian equity market..."
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Homepage Punchy One-Liner (Optional)</label>
                    <input
                      type="text"
                      value={projectForm.homepageOneLiner || ""}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, homepageOneLiner: e.target.value })
                      }
                      placeholder="Taught a model to trade the Indian market..."
                    />
                  </div>

                  <div className="field">
                    <label>Mobile Tap Preview Note</label>
                    <input
                      type="text"
                      value={projectForm.mobilePreview || ""}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, mobilePreview: e.target.value })
                      }
                      placeholder="1,000+ daily active users · Next.js + Supabase"
                    />
                  </div>

                  <div style={{ display: "flex", gap: "20px", margin: "6px 0" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!projectForm.featured}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, featured: e.target.checked })
                        }
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                        Feature on Homepage (Top 3)
                      </span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={projectForm.status === "in-progress"}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            status: e.target.checked ? "in-progress" : undefined,
                          })
                        }
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                        &quot;In Progress&quot; Badge
                      </span>
                    </label>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingProject(false);
                        setEditingProject(null);
                      }}
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "12px",
                        padding: "10px 18px",
                        border: "1px solid var(--line)",
                        background: "none",
                        borderRadius: "999px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {isCreatingProject ? "Create Project →" : "Save Project Changes →"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
