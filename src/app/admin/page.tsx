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
  phone?: string | null;
  projectType: string;
  budget: string | null;
  description: string;
  status: "new" | "read" | "call_scheduled" | "call_completed" | "converted" | "archived";
  callScheduledAt?: string | null;
  callMeetingUrl?: string | null;
  callNotes?: string | null;
  createdAt: string;
  project?: { id: string; name: string; phase: string; status: string } | null;
}

interface ClientPortalProject {
  id: string;
  name: string;
  phase: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; email: string };
  developers: { developer: { id: string; name: string; email: string } }[];
  _count: { tickets: number; messages: number; updates: number };
}

interface DeveloperItem {
  id: string;
  name: string;
  email: string;
  hasPassword: boolean;
  activeProjects: { id: string; name: string; phase: string }[];
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"briefs" | "portalProjects" | "developers" | "trust" | "projects">("briefs");

  // Briefs State
  const [briefs, setBriefs] = useState<BriefItem[]>([]);
  const [loadingBriefs, setLoadingBriefs] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Portal Projects State
  const [portalProjects, setPortalProjects] = useState<ClientPortalProject[]>([]);
  const [loadingPortalProjects, setLoadingPortalProjects] = useState(true);

  // Developers State
  const [developers, setDevelopers] = useState<DeveloperItem[]>([]);
  const [loadingDevs, setLoadingDevs] = useState(true);
  const [showInviteDevModal, setShowInviteDevModal] = useState(false);
  const [devName, setDevName] = useState("");
  const [devEmail, setDevEmail] = useState("");
  const [invitingDev, setInvitingDev] = useState(false);
  const [devInviteResult, setDevInviteResult] = useState<string | null>(null);

  // Trust Section State
  const [trustConfig, setTrustConfig] = useState<TrustSectionConfig | null>(null);
  const [loadingTrust, setLoadingTrust] = useState(true);
  const [savingTrust, setSavingTrust] = useState(false);
  const [trustSuccessMsg, setTrustSuccessMsg] = useState<string | null>(null);

  // Showcase Projects State
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
        router.push("/login");
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

  // Load Portal Projects
  const fetchPortalProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (json.success) {
        setPortalProjects(json.projects);
      }
    } catch (err) {
      console.error("Failed to load portal projects:", err);
    } finally {
      setLoadingPortalProjects(false);
    }
  };

  // Load Developers
  const fetchDevelopers = async () => {
    try {
      const res = await fetch("/api/admin/developers");
      const json = await res.json();
      if (json.success) {
        setDevelopers(json.developers);
      }
    } catch (err) {
      console.error("Failed to load developers:", err);
    } finally {
      setLoadingDevs(false);
    }
  };

  // Load Trust Config & Showcase Projects
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
    fetchPortalProjects();
    fetchDevelopers();
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

  const handleInviteDev = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvitingDev(true);
    try {
      const res = await fetch("/api/admin/developers/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: devName, email: devEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setDevInviteResult(data.inviteUrl);
        setDevName("");
        setDevEmail("");
        fetchDevelopers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInvitingDev(false);
    }
  };

  // Showcase Project Management
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

    const payload = { ...projectForm, tags };

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
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  };

  const totalBriefs = briefs.length;
  const newBriefs = briefs.filter((b) => b.status === "new").length;
  const readBriefs = briefs.filter((b) => b.status === "read").length;
  const convertedBriefs = briefs.filter((b) => b.status === "converted").length;

  return (
    <div className="admin-wrap">
      {/* Top Header */}
      <header className="admin-header">
        <div>
          <h1 className="admin-title">
            Kiln <span>Admin Studio</span>
          </h1>
          <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
            Client Portal Hub, Engineering Roster &amp; Live Site CMS
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
          onClick={() => setActiveTab("portalProjects")}
          className={`chip ${activeTab === "portalProjects" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>🚀 Active Client Builds</span>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            ({portalProjects.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("developers")}
          className={`chip ${activeTab === "developers" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>👥 Engineering Team</span>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            ({developers.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("trust")}
          className={`chip ${activeTab === "trust" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>🏢 Trust CMS</span>
          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: trustConfig?.enabled ? "var(--accent-soft)" : "#eae7dd", color: trustConfig?.enabled ? "var(--accent)" : "var(--muted)" }}>
            {trustConfig?.enabled ? "LIVE" : "OFF"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`chip ${activeTab === "projects" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>🎨 Showcase Portfolio</span>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            ({projectsList.length})
          </span>
        </button>
      </div>

      {/* ================= TAB 1: INBOUND BRIEFS ================= */}
      {activeTab === "briefs" && (
        <div>
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Total Submissions</div>
              <div className="admin-stat-val">{totalBriefs}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">New / Unreviewed</div>
              <div className="admin-stat-val" style={{ color: "#c93b2b" }}>
                {newBriefs}
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Converted to Builds</div>
              <div className="admin-stat-val" style={{ color: "var(--accent)" }}>
                {convertedBriefs}
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
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Budget</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {briefs.map((brief) => {
                    const isExpanded = expandedId === brief.id;
                    const formattedDate = new Date(brief.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={brief.id}>
                        <td>
                          <span
                            className={`admin-status-badge ${brief.status}`}
                            style={{
                              background:
                                brief.status === "converted"
                                  ? "var(--accent-soft)"
                                  : brief.status === "call_scheduled"
                                  ? "#e0e7ff"
                                  : brief.status === "call_completed"
                                  ? "#fef3c7"
                                  : brief.status === "new"
                                  ? "#fde8e4"
                                  : "#eae7dd",
                              color:
                                brief.status === "converted"
                                  ? "var(--accent)"
                                  : brief.status === "call_scheduled"
                                  ? "#3730a3"
                                  : brief.status === "call_completed"
                                  ? "#92400e"
                                  : brief.status === "new"
                                  ? "#c93b2b"
                                  : "var(--muted)",
                            }}
                          >
                            {brief.status.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", whiteSpace: "nowrap" }}>
                          {formattedDate}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                          {brief.name}
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <a
                              href={`mailto:${brief.email}?subject=Re:%20Kiln%20Project%20Brief`}
                              style={{ color: "var(--accent)", textDecoration: "underline", fontSize: "13px" }}
                            >
                              {brief.email}
                            </a>
                            {brief.phone && (
                              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                                📞 {brief.phone}
                              </div>
                            )}
                          </div>
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
                        <td style={{ maxWidth: "260px" }}>
                          <div
                            onClick={() => setExpandedId(isExpanded ? null : brief.id)}
                            style={{ cursor: "pointer", color: "var(--ink)", lineHeight: 1.5 }}
                          >
                            {isExpanded ? (
                              <div style={{ whiteSpace: "pre-wrap", background: "var(--bg)", padding: "10px", borderRadius: "6px", border: "1px solid var(--line)" }}>
                                {brief.description}
                              </div>
                            ) : (
                              <div>
                                {brief.description.length > 60
                                  ? `${brief.description.slice(0, 60)}...`
                                  : brief.description}
                                <span style={{ marginLeft: "4px", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)" }}>
                                  [expand]
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <Link
                              href={`/admin/briefs/${brief.id}`}
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "11px",
                                padding: "4px 10px",
                                border: brief.status === "converted" ? "1px solid var(--line)" : "1px solid var(--accent)",
                                background: brief.status === "converted" ? "none" : "var(--accent-soft)",
                                color: brief.status === "converted" ? "var(--ink)" : "var(--accent)",
                                borderRadius: "4px",
                                textDecoration: "none",
                                fontWeight: 500,
                              }}
                            >
                              {brief.status === "converted"
                                ? "View Project →"
                                : brief.status === "call_scheduled"
                                ? "📅 Call Booked"
                                : "Review & Meet →"}
                            </Link>

                            {brief.status === "new" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(brief.id, "read")}
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
                                Mark Read
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

      {/* ================= TAB 2: ACTIVE CLIENT BUILDS ================= */}
      {activeTab === "portalProjects" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", color: "var(--ink)" }}>
                Active Client Builds ({portalProjects.length})
              </h2>
              <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
                Live project portals accessed by clients and assigned engineering teams.
              </p>
            </div>
          </div>

          {loadingPortalProjects ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading active builds…
            </div>
          ) : portalProjects.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Current Phase</th>
                    <th>Status</th>
                    <th>Assigned Devs</th>
                    <th>Tickets</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portalProjects.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {p.name}
                      </td>
                      <td>
                        <div style={{ fontSize: "13px" }}>{p.client.name}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>{p.client.email}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "10.5px",
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            fontWeight: 600,
                          }}
                        >
                          {p.phase}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "11px" }}>
                          ● {p.status}
                        </span>
                      </td>
                      <td>
                        {p.developers.length > 0 ? (
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {p.developers.map((d) => (
                              <span key={d.developer.id} style={{ fontFamily: "var(--mono)", fontSize: "11px", background: "rgba(23, 21, 15, 0.04)", padding: "2px 6px", borderRadius: "4px" }}>
                                {d.developer.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#c93b2b", fontSize: "11px", fontFamily: "var(--mono)" }}>No devs assigned</span>
                        )}
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                        {p._count.tickets} tickets
                      </td>
                      <td>
                        <Link
                          href={`/admin/projects/${p.id}`}
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            padding: "4px 10px",
                            border: "1px solid var(--line)",
                            borderRadius: "4px",
                            textDecoration: "none",
                            color: "var(--ink)",
                          }}
                        >
                          Manage Build →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ background: "var(--card)", padding: "40px", textAlign: "center", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <p style={{ color: "var(--muted)" }}>No active client builds yet. Convert an inbound brief above to create one.</p>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: DEVELOPERS ROSTER ================= */}
      {activeTab === "developers" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", color: "var(--ink)" }}>
                Engineering Team ({developers.length})
              </h2>
              <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
                Developers assigned to client builds.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowInviteDevModal(true);
                setDevInviteResult(null);
              }}
              className="btn-primary"
              style={{ fontSize: "12px" }}
            >
              + Invite Developer
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Active Builds</th>
                </tr>
              </thead>
              <tbody>
                {developers.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600, color: "var(--ink)" }}>{d.name}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>{d.email}</td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "10.5px",
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: d.hasPassword ? "var(--accent-soft)" : "#fef3c7",
                          color: d.hasPassword ? "var(--accent)" : "#92400e",
                        }}
                      >
                        {d.hasPassword ? "Active" : "Invite Pending"}
                      </span>
                    </td>
                    <td>
                      {d.activeProjects.length > 0 ? (
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {d.activeProjects.map((p) => (
                            <Link
                              key={p.id}
                              href={`/admin/projects/${p.id}`}
                              style={{ fontFamily: "var(--mono)", fontSize: "11px", background: "rgba(23, 21, 15, 0.04)", padding: "2px 6px", borderRadius: "4px", textDecoration: "none", color: "var(--ink)" }}
                            >
                              {p.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: "11px" }}>None assigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Dev Invite Modal */}
          {showInviteDevModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
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
                    onClick={() => setShowInviteDevModal(false)}
                    style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--muted)" }}
                  >
                    ✕
                  </button>
                </div>

                {devInviteResult ? (
                  <div>
                    <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
                      <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: "4px" }}>
                        ✓ Developer Invited!
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.4 }}>
                        Single-use onboarding link generated:
                      </p>
                      <div style={{ marginTop: "8px" }}>
                        <a href={devInviteResult} style={{ fontSize: "12px", color: "var(--accent)", wordBreak: "break-all" }}>
                          {devInviteResult}
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowInviteDevModal(false)}
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInviteDev}>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Developer Name"
                        value={devName}
                        onChange={(e) => setDevName(e.target.value)}
                        style={{ width: "100%", border: "none", borderBottom: "1px solid var(--line)", background: "none", padding: "8px 0", outline: "none" }}
                      />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                      <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="dev@kiln.design"
                        value={devEmail}
                        onChange={(e) => setDevEmail(e.target.value)}
                        style={{ width: "100%", border: "none", borderBottom: "1px solid var(--line)", background: "none", padding: "8px 0", outline: "none" }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => setShowInviteDevModal(false)}
                        style={{ fontFamily: "var(--mono)", fontSize: "12px", padding: "8px 16px", border: "1px solid var(--line)", background: "none", borderRadius: "999px" }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary" disabled={invitingDev} style={{ fontSize: "12px" }}>
                        {invitingDev ? "Sending…" : "Send Invite →"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: TRUST / COMPANY SECTION ================= */}
      {activeTab === "trust" && (
        <div style={{ background: "var(--card)", padding: "32px", borderRadius: "16px", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          {loadingTrust || !trustConfig ? (
            <div style={{ padding: "30px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading trust section settings...
            </div>
          ) : (
            <form onSubmit={handleSaveTrust}>
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

      {/* ================= TAB 5: SHOWCASE PROJECTS CMS ================= */}
      {activeTab === "projects" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "26px", color: "var(--ink)" }}>
                Showcase Portfolio Archive
              </h2>
              <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "2px" }}>
                Manage public case studies shown on the homepage and `/work` page.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewProjectModal}
              className="btn-primary"
            >
              + Add Showcase Project
            </button>
          </div>

          {loadingProjects ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading showcase projects...
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
