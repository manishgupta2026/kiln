"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TeamMemberRecord } from "@/lib/team-db";

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    avatar: "",
    bio: "",
    displayOrder: 1,
  });

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (data.success) {
        setTeam(data.data);
      }
    } catch (err) {
      console.error("Failed to load team members:", err);
      setError("Failed to load team roster from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      role: "Developer",
      avatar: "",
      bio: "",
      displayOrder: (team.length || 0) + 1,
    });
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (member: TeamMemberRecord) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      avatar: member.avatar,
      bio: member.bio,
      displayOrder: member.displayOrder,
    });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const url = editingMember
        ? `/api/admin/team/${editingMember.id}`
        : "/api/admin/team";
      const method = editingMember ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          avatar: formData.avatar || formData.name.charAt(0).toUpperCase(),
          bio: formData.bio,
          displayOrder: Number(formData.displayOrder),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save team member");
      }

      setShowModal(false);
      setSuccessMsg(
        editingMember
          ? `✓ Updated ${formData.name}. Changes are live on /about.`
          : `✓ Added ${formData.name}. Changes are live on /about.`
      );
      setTimeout(() => setSuccessMsg(null), 5000);
      await loadTeam();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${name} from the public team roster?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete team member");
      }
      setSuccessMsg(`✓ Removed ${name} from team roster.`);
      setTimeout(() => setSuccessMsg(null), 5000);
      await loadTeam();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
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
            Studio Team Members CMS
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
            Add, remove, and edit team profiles displayed in the &quot;Who&apos;s building this&quot; section on <code>/about</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-primary"
          style={{ fontSize: "13px" }}
        >
          + Add Team Member
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            background: "#edf7ed",
            color: "#2e7d32",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13px",
            fontFamily: "var(--mono)",
          }}
        >
          {successMsg}
        </div>
      )}

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
          Loading team roster…
        </div>
      ) : team.length === 0 ? (
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
            No team members currently listed.
          </p>
          <button type="button" onClick={handleOpenCreate} className="btn-primary">
            Add Your First Team Member
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>Order</th>
                <th style={{ width: "60px" }}>Avatar</th>
                <th>Name</th>
                <th>Role</th>
                <th>Bio</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.id}>
                  <td style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                    #{member.displayOrder}
                  </td>
                  <td>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--display)",
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                    >
                      {member.avatar}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: "15px" }}>
                      {member.name}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--mono)",
                        background: "var(--line)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        color: "var(--ink)",
                      }}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "var(--muted)",
                        maxWidth: "380px",
                        lineHeight: 1.4,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {member.bio}
                    </p>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(member)}
                        className="chip"
                        style={{ fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(member.id, member.name)}
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="case-study-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="case-study-modal" style={{ maxWidth: "560px" }}>
            <button
              type="button"
              className="case-study-close-btn"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", marginBottom: "6px" }}>
              {editingMember ? `Edit ${editingMember.name}` : "Add New Team Member"}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
              Profile will appear on the <code>/about</code> page under &quot;Who&apos;s building this&quot;.
            </p>

            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deepak Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Avatar Initial
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="Auto"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value.toUpperCase() })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", textAlign: "center" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Project Manager, Developer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                  />
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
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Short Bio / Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe their background, focus areas, and role at Kiln..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", resize: "vertical", lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="chip"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? "Saving…" : editingMember ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
