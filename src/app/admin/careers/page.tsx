"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CareerApplicationRecord } from "@/lib/careers-db";
import AdminNavbar from "@/components/AdminNavbar";

const STATUS_OPTIONS = [
  { value: "new", label: "New", bg: "#fde8e4", color: "#c93b2b" },
  { value: "reviewing", label: "Reviewing", bg: "#e0e7ff", color: "#3730a3" },
  { value: "shortlisted", label: "Shortlisted", bg: "var(--accent-soft)", color: "var(--accent)" },
  { value: "interviewed", label: "Interviewed", bg: "#fef3c7", color: "#92400e" },
  { value: "hired", label: "Hired", bg: "#dcfce7", color: "#166534" },
  { value: "rejected", label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
  { value: "archived", label: "Archived", bg: "#eae7dd", color: "var(--muted)" },
];

export default function AdminCareersPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<CareerApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<"ALL" | "JOB" | "INTERNSHIP" | "FREELANCING">("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/careers");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setApplications(data.data);
      } else {
        setError(data.error || "Failed to load career applications");
      }
    } catch (err: any) {
      console.error("Failed to load applications:", err);
      setError("Failed to fetch applications from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingStatusId(id);
    try {
      const res = await fetch(`/api/admin/careers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus as any } : app))
      );
      setSuccessMsg(`Status updated to "${newStatus}".`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    const note = editingNotes[id];
    setSavingNoteId(id);
    try {
      const res = await fetch(`/api/admin/careers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: note }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save note");
      }
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, adminNotes: note } : app))
      );
      setSuccessMsg("Internal note saved.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`Error saving note: ${err.message}`);
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the application for "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/careers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete application");
      }
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setSuccessMsg(`Application for "${name}" deleted.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`Error deleting application: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Filtering logic
  const filtered = applications.filter((app) => {
    if (filterType !== "ALL" && app.type !== filterType) return false;
    if (filterStatus !== "ALL" && app.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.name.toLowerCase().includes(q);
      const matchEmail = app.email.toLowerCase().includes(q);
      const matchRole = app.role.toLowerCase().includes(q);
      const matchSkills = (app.skills || []).some((s) => s.toLowerCase().includes(q));
      const matchLocation = (app.location || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole && !matchSkills && !matchLocation) {
        return false;
      }
    }
    return true;
  });

  const totalCount = applications.length;
  const newCount = applications.filter((a) => a.status === "new").length;
  const jobCount = applications.filter((a) => a.type === "JOB").length;
  const internCount = applications.filter((a) => a.type === "INTERNSHIP").length;
  const freelanceCount = applications.filter((a) => a.type === "FREELANCING").length;

  return (
    <>
      <AdminNavbar
        currentTitle="Careers & Talent"
        currentSubtitle="Review Inbound Job, Internship & Freelance Submissions"
        badgeCounts={{ newCareers: newCount, totalCareers: totalCount }}
      />

      <div className="admin-wrap">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1 className="admin-title" style={{ margin: 0 }}>
              Digigrantha <span>Careers &amp; Talent</span>
            </h1>
            <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              Review Inbound Job, Internship, and Freelance Submissions
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Link
              href="/admin"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11.5px",
                color: "var(--ink)",
                padding: "6px 12px",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                background: "var(--card)",
                textDecoration: "none",
              }}
            >
              ← Studio Dashboard
            </Link>
            <Link
              href="/career"
              target="_blank"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11.5px",
                color: "var(--muted)",
                padding: "6px 12px",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                background: "var(--card)",
                textDecoration: "none",
              }}
            >
              View Live Form ↗
            </Link>
          </div>
        </div>

      {/* Success / Error Banners */}
      {successMsg && (
        <div style={{ padding: "10px 16px", background: "var(--accent-soft)", color: "var(--accent)", borderRadius: "8px", fontFamily: "var(--mono)", fontSize: "13px", marginBottom: "20px" }}>
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div style={{ padding: "10px 16px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", fontFamily: "var(--mono)", fontSize: "13px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Stats Summary */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Applications</div>
          <div className="admin-stat-val">{totalCount}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">New / Unreviewed</div>
          <div className="admin-stat-val" style={{ color: "#c93b2b" }}>
            {newCount}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Full-time Jobs</div>
          <div className="admin-stat-val" style={{ color: "var(--ink)" }}>
            {jobCount}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Internships</div>
          <div className="admin-stat-val" style={{ color: "var(--accent)" }}>
            {internCount}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Freelancers</div>
          <div className="admin-stat-val" style={{ color: "var(--muted)" }}>
            {freelanceCount}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search */}
          <div style={{ flex: "1 1 280px", minWidth: "260px" }}>
            <input
              type="text"
              placeholder="Search by name, email, role, skills, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid var(--line)",
                background: "var(--bg)",
                fontSize: "13.5px",
              }}
            />
          </div>

          {/* Type Filter Chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className={`chip ${filterType === "ALL" ? "active" : ""}`}
              onClick={() => setFilterType("ALL")}
            >
              All Types ({totalCount})
            </button>
            <button
              type="button"
              className={`chip ${filterType === "JOB" ? "active" : ""}`}
              onClick={() => setFilterType("JOB")}
            >
              💼 Jobs ({jobCount})
            </button>
            <button
              type="button"
              className={`chip ${filterType === "INTERNSHIP" ? "active" : ""}`}
              onClick={() => setFilterType("INTERNSHIP")}
            >
              🎓 Internships ({internCount})
            </button>
            <button
              type="button"
              className={`chip ${filterType === "FREELANCING" ? "active" : ""}`}
              onClick={() => setFilterType("FREELANCING")}
            >
              ⚡ Freelancers ({freelanceCount})
            </button>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginRight: "6px" }}>
            Filter Status:
          </span>
          <button
            type="button"
            className={`chip ${filterStatus === "ALL" ? "active" : ""}`}
            style={{ fontSize: "11px", padding: "4px 10px" }}
            onClick={() => setFilterStatus("ALL")}
          >
            All
          </button>
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st.value}
              type="button"
              className={`chip ${filterStatus === st.value ? "active" : ""}`}
              style={{ fontSize: "11px", padding: "4px 10px" }}
              onClick={() => setFilterStatus(st.value)}
            >
              {st.label} ({applications.filter((a) => a.status === st.value).length})
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
          Loading applications...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: "var(--card)",
            padding: "48px 24px",
            textAlign: "center",
            borderRadius: "14px",
            border: "1px solid var(--line)",
          }}
        >
          <p style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)", marginBottom: "8px" }}>
            No applications found.
          </p>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            {applications.length === 0
              ? "No one has submitted a job, internship, or freelance form yet."
              : "Try adjusting your search query or filter chips."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((app) => {
            const isExpanded = expandedId === app.id;
            const currentStatus = STATUS_OPTIONS.find((s) => s.value === app.status) || STATUS_OPTIONS[0];
            const dateStr = new Date(app.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={app.id}
                style={{
                  background: "var(--card)",
                  border: isExpanded ? "1px solid var(--accent)" : "1px solid var(--line)",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  transition: "all .2s ease",
                  boxShadow: isExpanded ? "var(--shadow-sm)" : "none",
                }}
              >
                {/* Top Summary Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    {/* Type Badge Icon */}
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background:
                          app.type === "JOB"
                            ? "#e0e7ff"
                            : app.type === "INTERNSHIP"
                            ? "var(--accent-soft)"
                            : "#fef3c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        flexShrink: 0,
                      }}
                    >
                      {app.type === "JOB" ? "💼" : app.type === "INTERNSHIP" ? "🎓" : "⚡"}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 500, color: "var(--ink)", margin: 0 }}>
                          {app.name}
                        </h3>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: ".04em",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background:
                              app.type === "JOB"
                                ? "#e0e7ff"
                                : app.type === "INTERNSHIP"
                                ? "var(--accent-soft)"
                                : "#fef3c7",
                            color:
                              app.type === "JOB"
                                ? "#3730a3"
                                : app.type === "INTERNSHIP"
                                ? "var(--accent)"
                                : "#92400e",
                            fontWeight: 600,
                          }}
                        >
                          {app.type === "JOB" ? "Job" : app.type === "INTERNSHIP" ? "Internship" : "Freelance"}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>
                          — {app.role}
                        </span>
                      </div>

                      {/* Contact & Meta Line */}
                      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "6px", fontSize: "12.5px", color: "var(--muted)", fontFamily: "var(--mono)" }}>
                        <a href={`mailto:${app.email}`} style={{ color: "var(--accent)", textDecoration: "underline" }}>
                          ✉ {app.email}
                        </a>
                        {app.phone && (
                          <a href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>
                            📞 {app.phone}
                          </a>
                        )}
                        {app.location && <span>📍 {app.location}</span>}
                        <span>🕒 {dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown & Expand Toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <select
                      value={app.status}
                      disabled={updatingStatusId === app.id}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--line)",
                        background: currentStatus.bg,
                        color: currentStatus.color,
                        fontFamily: "var(--mono)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                      className="chip"
                      style={{ fontSize: "11px", padding: "6px 12px" }}
                    >
                      {isExpanded ? "Collapse ▲" : "View Details ▼"}
                    </button>
                  </div>
                </div>

                {/* Quick Info & External Links Strip */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12.5px" }}>
                    {app.experience && (
                      <div>
                        <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "11px" }}>Exp: </span>
                        <strong>{app.experience}</strong>
                      </div>
                    )}
                    {app.rateOrSalary && (
                      <div>
                        <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "11px" }}>Comp: </span>
                        <strong>{app.rateOrSalary}</strong>
                      </div>
                    )}
                    {app.availability && (
                      <div>
                        <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "11px" }}>Availability: </span>
                        <strong>{app.availability}</strong>
                      </div>
                    )}
                  </div>

                  {/* Direct Profile Links */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    {app.resumeUrl && (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{
                          fontSize: "11.5px",
                          padding: "6px 14px",
                          background: "var(--accent)",
                          color: "#fff",
                        }}
                      >
                        📄 Open Resume ↗
                      </a>
                    )}
                    {app.portfolioUrl && (
                      <a
                        href={app.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="chip"
                        style={{ fontSize: "11px", padding: "5px 10px" }}
                      >
                        Portfolio ↗
                      </a>
                    )}
                    {app.githubUrl && (
                      <a
                        href={app.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="chip"
                        style={{ fontSize: "11px", padding: "5px 10px" }}
                      >
                        GitHub ↗
                      </a>
                    )}
                    {app.linkedinUrl && (
                      <a
                        href={app.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="chip"
                        style={{ fontSize: "11px", padding: "5px 10px" }}
                      >
                        LinkedIn ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* EXPANDED FULL DETAILS */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: "18px",
                      paddingTop: "18px",
                      borderTop: "1px dashed var(--line)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                    }}
                  >
                    {/* Skills Badges */}
                    {app.skills && app.skills.length > 0 && (
                      <div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                          Skills &amp; Technologies
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {app.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "11px",
                                background: "var(--accent-soft)",
                                color: "var(--accent)",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontWeight: 500,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dynamic Extra Metadata (College, Notice, Current Company, etc.) */}
                    {app.metadata && Object.keys(app.metadata).length > 0 && (
                      <div
                        style={{
                          background: "var(--bg)",
                          padding: "14px 18px",
                          borderRadius: "10px",
                          border: "1px solid var(--line)",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "12px",
                        }}
                      >
                        {app.metadata.collegeName && (
                          <div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>University / College</div>
                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.collegeName}</div>
                          </div>
                        )}
                        {app.metadata.degreeMajor && (
                          <div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Degree &amp; Major</div>
                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.degreeMajor}</div>
                          </div>
                        )}
                        {app.metadata.currentCompany && (
                          <div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Current Employer</div>
                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.currentCompany}</div>
                          </div>
                        )}
                        {app.metadata.currentCtc && (
                          <div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Current CTC</div>
                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.currentCtc}</div>
                          </div>
                        )}
                        {app.metadata.expectedCtc && (
                          <div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Expected CTC</div>
                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.expectedCtc}</div>
                          </div>
                        )}
                        {app.metadata.noticePeriod && (
                          <div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Notice Period</div>
                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.noticePeriod}</div>
                          </div>
                        )}
                        {app.metadata.hourlyRate && (
                          <div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Freelance Rate</div>
                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.hourlyRate}</div>
                          </div>
                        )}
                        {app.metadata.timezoneOverlap && (
                          <div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Timezone &amp; Working Hours</div>
                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.timezoneOverlap}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cover Note / Answers */}
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                        Application Pitch &amp; Detailed Responses
                      </div>
                      <div
                        style={{
                          background: "var(--bg)",
                          padding: "14px 18px",
                          borderRadius: "10px",
                          border: "1px solid var(--line)",
                          fontSize: "13.5px",
                          lineHeight: 1.6,
                          color: "var(--ink)",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {app.coverNote}
                      </div>
                    </div>

                    {/* Internal Admin Notes */}
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                        Internal Evaluation Notes
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <textarea
                          rows={2}
                          placeholder="Add internal feedback, interview impressions, or next steps..."
                          value={editingNotes[app.id] !== undefined ? editingNotes[app.id] : app.adminNotes || ""}
                          onChange={(e) =>
                            setEditingNotes({ ...editingNotes, [app.id]: e.target.value })
                          }
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid var(--line)",
                            background: "var(--card)",
                            fontSize: "13px",
                          }}
                        />
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={savingNoteId === app.id}
                          onClick={() => handleSaveNotes(app.id)}
                          style={{ fontSize: "12px", padding: "10px 16px" }}
                        >
                          {savingNoteId === app.id ? "Saving..." : "Save Note"}
                        </button>
                      </div>
                    </div>

                    {/* Danger zone: delete */}
                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px", borderTop: "1px solid var(--line)" }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(app.id, app.name)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#c93b2b",
                          fontSize: "12px",
                          fontFamily: "var(--mono)",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        🗑 Permanently Delete Application
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}
