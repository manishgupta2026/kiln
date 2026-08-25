"use client";

import { useState } from "react";

export interface MilestoneItem {
  id: string;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  order: number;
}

interface MilestoneChecklistProps {
  projectId: string;
  isStaff: boolean;
  initialMilestones: MilestoneItem[];
}

export default function MilestoneChecklist({
  projectId,
  isStaff,
  initialMilestones,
}: MilestoneChecklistProps) {
  const [milestones, setMilestones] = useState<MilestoneItem[]>(initialMilestones || []);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = async (milestone: MilestoneItem) => {
    if (!isStaff) return;
    const nextState = !milestone.isCompleted;

    // Optimistic UI update
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestone.id ? { ...m, isCompleted: nextState, completedAt: nextState ? new Date().toISOString() : null } : m
      )
    );

    try {
      await fetch(`/api/projects/${projectId}/milestones`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: milestone.id,
          isCompleted: nextState,
        }),
      });
    } catch (err) {
      console.error("Failed to update milestone:", err);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMilestones((prev) => [...prev, data.milestone]);
        setNewTitle("");
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Failed to add milestone:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isStaff) return;
    if (!confirm("Are you sure you want to remove this milestone?")) return;

    setMilestones((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/projects/${projectId}/milestones?milestoneId=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete milestone:", err);
    }
  };

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow)",
      }}
    >
      {/* Header with Progress Bar */}
      <div style={{ marginBottom: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
            Deliverables &amp; Progress
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--ink)", fontWeight: 600 }}>
            {completedCount}/{totalCount} Completed · {progressPercent}%
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div style={{ width: "100%", height: "8px", background: "var(--line)", borderRadius: "999px", overflow: "hidden" }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: progressPercent === 100 ? "#16a34a" : "var(--accent)",
              transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      </div>

      {/* Milestones List */}
      {milestones.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {milestones.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: "10px",
                background: m.isCompleted ? "var(--accent-soft)" : "rgba(23, 21, 15, 0.02)",
                border: m.isCompleted ? "1px solid rgba(117, 128, 31, 0.25)" : "1px solid var(--line)",
                transition: "all 0.15s ease",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  cursor: isStaff ? "pointer" : "default",
                  flex: 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={m.isCompleted}
                  disabled={!isStaff}
                  onChange={() => handleToggle(m)}
                  style={{
                    accentColor: "var(--accent)",
                    marginTop: "3px",
                    width: "16px",
                    height: "16px",
                    cursor: isStaff ? "pointer" : "default",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      color: m.isCompleted ? "var(--ink)" : "var(--ink)",
                      textDecoration: m.isCompleted ? "line-through" : "none",
                      opacity: m.isCompleted ? 0.75 : 1,
                      fontWeight: 500,
                    }}
                  >
                    {m.title}
                  </div>
                  {m.completedAt && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--accent)", marginTop: "2px" }}>
                      ✓ Shipped {new Date(m.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  )}
                </div>
              </label>

              {isStaff && (
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "12px",
                    color: "var(--muted)",
                    cursor: "pointer",
                    padding: "2px 6px",
                  }}
                  title="Remove deliverable"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: "13px", color: "var(--muted)", padding: "8px 0" }}>
          No specific deliverables defined yet.
        </p>
      )}

      {/* Staff Add Form */}
      {isStaff && (
        <div style={{ marginTop: "14px" }}>
          {showAddForm ? (
            <form onSubmit={handleAddMilestone} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                required
                placeholder="e.g. Design System & Wireframes Approval"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  flex: 1,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)",
                  background: "#fff",
                  fontSize: "13px",
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={adding}
                style={{ fontSize: "12px", padding: "6px 14px" }}
              >
                {adding ? "Adding…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  background: "none",
                  border: "1px solid var(--line)",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11.5px",
                color: "var(--accent)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              + Add deliverable
            </button>
          )}
        </div>
      )}
    </div>
  );
}
