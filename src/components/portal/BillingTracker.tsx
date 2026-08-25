"use client";

import { useState } from "react";

interface BillingTrackerProps {
  projectId: string;
  isStaff: boolean;
  depositStatus?: string | null;
  depositAmount?: string | null;
  finalStatus?: string | null;
  finalAmount?: string | null;
  invoiceUrl?: string | null;
  onUpdated?: () => void;
}

export default function BillingTracker({
  projectId,
  isStaff,
  depositStatus = "PAID",
  depositAmount = "50%",
  finalStatus = "PENDING",
  finalAmount = "50%",
  invoiceUrl: initialInvoice,
  onUpdated,
}: BillingTrackerProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [depStatus, setDepStatus] = useState(depositStatus || "PAID");
  const [depAmt, setDepAmt] = useState(depositAmount || "50%");
  const [fnlStatus, setFnlStatus] = useState(finalStatus || "PENDING");
  const [fnlAmt, setFnlAmt] = useState(finalAmount || "50%");
  const [invUrl, setInvUrl] = useState(initialInvoice || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositStatus: depStatus,
          depositAmount: depAmt,
          finalStatus: fnlStatus,
          finalAmount: fnlAmt,
          invoiceUrl: invUrl.trim() || null,
        }),
      });

      if (res.ok) {
        setShowEdit(false);
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
          Billing &amp; Payment Milestones
        </div>
        {isStaff && (
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              background: "none",
              border: "1px solid var(--line)",
              padding: "4px 8px",
              borderRadius: "6px",
              color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            ✏️ Edit
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        {/* Deposit Card */}
        <div style={{ padding: "12px 14px", background: "rgba(23, 21, 15, 0.02)", borderRadius: "10px", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>Initial Deposit</span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "999px",
                background: depStatus === "PAID" ? "var(--accent-soft)" : "#fde8e4",
                color: depStatus === "PAID" ? "var(--accent)" : "#c93b2b",
                fontWeight: 600,
              }}
            >
              {depStatus}
            </span>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)" }}>
            {depAmt} Contract Value
          </div>
        </div>

        {/* Final Launch Card */}
        <div style={{ padding: "12px 14px", background: "rgba(23, 21, 15, 0.02)", borderRadius: "10px", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>Launch Milestone</span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "999px",
                background: fnlStatus === "PAID" ? "var(--accent-soft)" : "#fef3c7",
                color: fnlStatus === "PAID" ? "var(--accent)" : "#92400e",
                fontWeight: 600,
              }}
            >
              {fnlStatus}
            </span>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)" }}>
            {fnlAmt} Contract Value
          </div>
        </div>
      </div>

      {invUrl && (
        <div style={{ paddingTop: "10px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>Invoice / Payment Receipts:</span>
          <a
            href={invUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}
          >
            📄 View Invoices ↗
          </a>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
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
              maxWidth: "460px",
              width: "100%",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--line)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "var(--ink)" }}>
                Edit Billing Milestones
              </h3>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>
                      Deposit Amount
                    </label>
                    <input
                      type="text"
                      value={depAmt}
                      onChange={(e) => setDepAmt(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>
                      Deposit Status
                    </label>
                    <select
                      value={depStatus}
                      onChange={(e) => setDepStatus(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                    >
                      <option value="PAID">PAID</option>
                      <option value="UNPAID">UNPAID</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>
                      Final Amount
                    </label>
                    <input
                      type="text"
                      value={fnlAmt}
                      onChange={(e) => setFnlAmt(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>
                      Final Status
                    </label>
                    <select
                      value={fnlStatus}
                      onChange={(e) => setFnlStatus(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>
                    Invoice / Receipt URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://invoice.stripe.com/..."
                    value={invUrl}
                    onChange={(e) => setInvUrl(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  style={{ fontFamily: "var(--mono)", fontSize: "12px", background: "none", border: "1px solid var(--line)", padding: "8px 14px", borderRadius: "999px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ fontSize: "12.5px" }}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
