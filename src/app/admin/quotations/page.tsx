"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProjectEstimator, { EstimationResult } from "@/components/ProjectEstimator";
import { ProjectQuotationRecord, QuotationLineItem } from "@/lib/quotations-db";
import AdminNavbar from "@/components/AdminNavbar";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft", bg: "#eae7dd", color: "var(--muted)" },
  { value: "SENT", label: "Sent", bg: "#e0e7ff", color: "#3730a3" },
  { value: "ACCEPTED", label: "Accepted", bg: "#dcfce7", color: "#166534" },
  { value: "DECLINED", label: "Declined", bg: "#fee2e2", color: "#991b1b" },
  { value: "EXPIRED", label: "Expired", bg: "#fef3c7", color: "#92400e" },
];

export default function AdminQuotationsPage() {
  const router = useRouter();

  // Top sub-tab: "estimator" or "quotations"
  const [activeSubTab, setActiveSubTab] = useState<"estimator" | "quotations">("estimator");

  // Quotations List state
  const [quotations, setQuotations] = useState<ProjectQuotationRecord[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Composer / Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "preview">("create");
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Form Fields
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [quotationNumber, setQuotationNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0); // 0 or 18% GST
  const [timeline, setTimeline] = useState("4 – 6 Weeks");
  const [paymentSchedule, setPaymentSchedule] = useState("40% Advance Deposit, 40% Staging Approval, 20% Production Handover");
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([
    {
      id: "item_1",
      title: "Core Platform Architecture & UI Implementation",
      description: "Next.js 15, TypeScript, Tailwind CSS, responsive components, and database schema.",
      hours: 80,
      amount: 150000,
    },
  ]);
  const [techStackInput, setTechStackInput] = useState("Next.js, TypeScript, PostgreSQL, Tailwind CSS, Figma");
  const [termsAndNotes, setTermsAndNotes] = useState(
    "1. Includes 30 days of post-deployment monitoring and bug fixing.\n2. Full intellectual property and source code ownership transfer upon final disbursement.\n3. Hosting and third-party API subscriptions (e.g. AWS, OpenAI, Razorpay) are billed directly to client accounts."
  );
  const [customEmailNote, setCustomEmailNote] = useState("");
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  const loadQuotations = async () => {
    try {
      setLoadingQuotes(true);
      const res = await fetch("/api/admin/quotations");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setQuotations(data.data);
      }
    } catch (err) {
      console.error("Failed to load quotations:", err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  // Compute subtotal, tax amount, total
  const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const taxAmount = Math.round(((subtotal - discount) * (taxRate / 100)));
  const totalAmount = Math.max(0, subtotal - discount + taxAmount);

  // Helper to add line item
  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `item_${Date.now()}`,
        title: "Additional Module",
        description: "",
        hours: 20,
        amount: currency === "INR" ? 35000 : 420,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  const handleUpdateLineItem = (id: string, field: keyof QuotationLineItem, val: any) => {
    setLineItems(
      lineItems.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Convert Estimate from ProjectEstimator into Quotation Form
  const handleConvertEstimate = (est: EstimationResult) => {
    const isRupee = est.currency === "INR";
    setCurrency(est.currency);
    setProjectTitle(`${est.archetype.name} — Full Build`);
    setOverview(
      `Bespoke engineering and design scope for ${est.archetype.name}.\n` +
      `Includes full design fidelity (${est.designTier.name}), core functional modules, and production deployment on modern cloud architecture.`
    );
    setTimeline(est.timelineWeeks);
    setPaymentSchedule("40% Advance Deposit upon contract signing, 40% upon Staging Feature-Complete, 20% on Final Production Handover.");
    setTechStackInput(est.archetype.defaultStack.join(", "));

    // Build structured line items from estimate
    const items: QuotationLineItem[] = [
      {
        id: "base_arch",
        title: `${est.archetype.name} — Core Architecture`,
        description: est.archetype.description,
        hours: est.archetype.baseHours,
        amount: isRupee ? est.archetype.baseInr : est.archetype.baseUsd,
      },
    ];

    if (est.designTier.inr > 0 || est.designTier.usd > 0) {
      items.push({
        id: "design_system",
        title: `Design System: ${est.designTier.name}`,
        description: est.designTier.description,
        hours: 20,
        amount: isRupee ? est.designTier.inr : est.designTier.usd,
      });
    }

    est.selectedFeatures.forEach((feat) => {
      items.push({
        id: `feat_${feat.id}`,
        title: feat.name,
        description: feat.description,
        hours: feat.hours,
        amount: isRupee ? feat.inr : feat.usd,
      });
    });

    if (est.maintenancePrice > 0) {
      items.push({
        id: "maintenance",
        title: est.maintenanceOption.name,
        description: est.maintenanceOption.description,
        amount: est.maintenancePrice,
      });
    }

    setLineItems(items);
    setDiscount(0);
    setTaxRate(0); // Optional GST
    setQuoteId(null);
    setPreviewToken(null);
    setModalMode("create");
    setShowModal(true);
  };

  // Save Quotation (Draft or Send)
  const handleSaveQuotation = async (sendImmediately: boolean = false) => {
    if (!clientName.trim() || !clientEmail.trim() || !projectTitle.trim()) {
      alert("Please fill in the client name, email address, and project title.");
      return;
    }

    const techArray = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      quotationNumber: quotationNumber || undefined,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim() || null,
      clientCompany: clientCompany.trim() || null,
      projectTitle: projectTitle.trim(),
      overview: overview.trim(),
      currency,
      subtotal,
      discount,
      taxRate,
      taxAmount,
      totalAmount,
      timeline,
      paymentSchedule,
      validUntil,
      lineItems,
      techStack: techArray,
      termsAndNotes,
      sendImmediately,
      emailCustomNote: customEmailNote,
    };

    if (sendImmediately) {
      setSendingEmail(true);
    } else {
      setSaving(true);
    }

    try {
      let res;
      if (quoteId) {
        // Update
        res = await fetch(`/api/admin/quotations/${quoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch("/api/admin/quotations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save quotation");
      }

      setSuccessMsg(
        sendImmediately
          ? `✓ Quotation [${json.data.quotationNumber}] sent directly to ${clientEmail}!`
          : `✓ Quotation [${json.data.quotationNumber}] saved as draft.`
      );
      setTimeout(() => setSuccessMsg(null), 5000);
      setShowModal(false);
      setActiveSubTab("quotations");
      await loadQuotations();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
      setSendingEmail(false);
    }
  };

  // Resend email to client
  const handleResendEmail = async (quote: ProjectQuotationRecord) => {
    if (!confirm(`Send / Resend quotation [${quote.quotationNumber}] to ${quote.clientEmail}?`)) {
      return;
    }

    setResendingId(quote.id);
    try {
      const res = await fetch(`/api/admin/quotations/${quote.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to send email");
      }
      setSuccessMsg(`✓ Quotation sent to ${quote.clientEmail}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadQuotations();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setResendingId(null);
    }
  };

  // Open edit modal
  const handleOpenEdit = (q: ProjectQuotationRecord) => {
    setQuoteId(q.id);
    setQuotationNumber(q.quotationNumber);
    setClientName(q.clientName);
    setClientEmail(q.clientEmail);
    setClientPhone(q.clientPhone || "");
    setClientCompany(q.clientCompany || "");
    setProjectTitle(q.projectTitle);
    setOverview(q.overview);
    setCurrency(q.currency);
    setDiscount(q.discount || 0);
    setTaxRate(q.taxRate || 0);
    setTimeline(q.timeline);
    setPaymentSchedule(q.paymentSchedule);
    setValidUntil(new Date(q.validUntil).toISOString().split("T")[0]);
    setLineItems(q.lineItems || []);
    setTechStackInput((q.techStack || []).join(", "));
    setTermsAndNotes(q.termsAndNotes || "");
    setPreviewToken(q.viewToken);
    setModalMode("edit");
    setShowModal(true);
  };

  // Delete quote
  const handleDeleteQuote = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to delete quotation ${number}?`)) return;
    try {
      const res = await fetch(`/api/admin/quotations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setSuccessMsg(`✓ Deleted quotation ${number}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadQuotations();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const filteredQuotes = quotations.filter((q) => {
    if (filterStatus !== "ALL" && q.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      const matchClient = q.clientName.toLowerCase().includes(s);
      const matchEmail = q.clientEmail.toLowerCase().includes(s);
      const matchTitle = q.projectTitle.toLowerCase().includes(s);
      const matchNum = q.quotationNumber.toLowerCase().includes(s);
      if (!matchClient && !matchEmail && !matchTitle && !matchNum) return false;
    }
    return true;
  });

  const formatCurrency = (val: number, cur: "INR" | "USD") => {
    if (cur === "INR") return `₹${val.toLocaleString("en-IN")}`;
    return `$${val.toLocaleString("en-US")}`;
  };

  return (
    <>
      <AdminNavbar
        currentTitle="Quotes & Estimator"
        currentSubtitle="Indian Market Scope Intelligence & Direct Mail Dispatch"
        badgeCounts={{ totalQuotes: quotations.length }}
      />

      <div className="admin-wrap">
        {/* Top Header */}
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
              Kiln <span>Quotations &amp; Estimator</span>
            </h1>
            <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              Indian Market Price Intelligence, Bespoke Scope Proposals &amp; Direct Mail Dispatch
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
              ← Studio Hub
            </Link>
          </div>
        </div>

      {/* Success Notification */}
      {successMsg && (
        <div style={{ padding: "10px 16px", background: "var(--accent-soft)", color: "var(--accent)", borderRadius: "8px", fontFamily: "var(--mono)", fontSize: "13px", marginBottom: "20px" }}>
          {successMsg}
        </div>
      )}

      {/* Sub-Tab Navigation Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "12px", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className={`chip ${activeSubTab === "estimator" ? "active" : ""}`}
            onClick={() => setActiveSubTab("estimator")}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>🧮 Project Price Estimator</span>
            <span style={{ fontSize: "10.5px", background: "var(--accent-soft)", color: "var(--accent)", padding: "1px 6px", borderRadius: "4px" }}>
              India Market Formula
            </span>
          </button>

          <button
            type="button"
            className={`chip ${activeSubTab === "quotations" ? "active" : ""}`}
            onClick={() => setActiveSubTab("quotations")}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>📜 Quotation Hub &amp; Mails</span>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
              ({quotations.length})
            </span>
          </button>
        </div>

        <button
          type="button"
          className="btn-primary"
          style={{ fontSize: "13px", padding: "10px 18px" }}
          onClick={() => {
            setQuoteId(null);
            setQuotationNumber("");
            setClientName("");
            setClientEmail("");
            setClientPhone("");
            setClientCompany("");
            setProjectTitle("");
            setOverview("");
            setCurrency("INR");
            setDiscount(0);
            setTaxRate(0);
            setTimeline("4 – 6 Weeks");
            setPaymentSchedule("40% Advance Deposit, 40% Staging Approval, 20% Production Handover");
            setLineItems([
              {
                id: "item_1",
                title: "Custom Software Architecture & Design",
                description: "Full-stack development, database schema, responsive UI.",
                hours: 60,
                amount: 120000,
              },
            ]);
            setPreviewToken(null);
            setModalMode("create");
            setShowModal(true);
          }}
        >
          + Draft New Quotation
        </button>
      </div>

      {/* ================= VIEW 1: PROJECT ESTIMATOR ================= */}
      {activeSubTab === "estimator" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", color: "var(--ink)", marginBottom: "4px" }}>
              Interactive Price &amp; Scope Estimator
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
              Calibrated to Indian software studio benchmarks (blended hourly rates ₹1,800 – ₹3,200/hr).
              Select project features, delivery speed, and design fidelity to calculate accurate estimates, then convert them directly into email quotations.
            </p>
          </div>

          <ProjectEstimator onConvertToQuotation={handleConvertEstimate} />
        </div>
      )}

      {/* ================= VIEW 2: QUOTATIONS HUB ================= */}
      {activeSubTab === "quotations" && (
        <div>
          {/* Filter Bar */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div style={{ flex: "1 1 260px" }}>
              <input
                type="text"
                placeholder="Search by quote #, client, email, or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                  fontSize: "13px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                className={`chip ${filterStatus === "ALL" ? "active" : ""}`}
                style={{ fontSize: "11.5px", padding: "4px 10px" }}
                onClick={() => setFilterStatus("ALL")}
              >
                All ({quotations.length})
              </button>
              {STATUS_OPTIONS.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  className={`chip ${filterStatus === st.value ? "active" : ""}`}
                  style={{ fontSize: "11.5px", padding: "4px 10px" }}
                  onClick={() => setFilterStatus(st.value)}
                >
                  {st.label} ({quotations.filter((q) => q.status === st.value).length})
                </button>
              ))}
            </div>
          </div>

          {/* Quotations Table */}
          {loadingQuotes ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading quotations...
            </div>
          ) : filteredQuotes.length === 0 ? (
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
                No quotations found.
              </p>
              <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
                Use the Price Estimator to generate your first quotation or click &quot;Draft New Quotation&quot;.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setActiveSubTab("estimator")}
              >
                Open Price Estimator →
              </button>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Quote #</th>
                    <th>Status</th>
                    <th>Client</th>
                    <th>Project</th>
                    <th>Timeline</th>
                    <th>Investment</th>
                    <th>Sent / Valid</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((q) => {
                    const st = STATUS_OPTIONS.find((s) => s.value === q.status) || STATUS_OPTIONS[0];
                    const validDateStr = new Date(q.validUntil).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    });

                    return (
                      <tr key={q.id}>
                        <td style={{ fontFamily: "var(--mono)", fontSize: "12px", fontWeight: "bold" }}>
                          {q.quotationNumber}
                        </td>
                        <td>
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: st.bg,
                              color: st.color,
                              fontWeight: 600,
                            }}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--ink)" }}>{q.clientName}</div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--muted)" }}>{q.clientEmail}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: "13.5px", fontWeight: 500 }}>{q.projectTitle}</div>
                          {q.clientCompany && <div style={{ fontSize: "12px", color: "var(--muted)" }}>{q.clientCompany}</div>}
                        </td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>
                          {q.timeline}
                        </td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: "14px", fontWeight: "bold", color: "var(--accent)" }}>
                          {formatCurrency(q.totalAmount, q.currency)}
                        </td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--muted)" }}>
                          {q.sentAt ? `Sent: ${new Date(q.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "Draft"}
                          <div>Valid: {validDateStr}</div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            {/* Resend Email Button */}
                            <button
                              type="button"
                              className="chip"
                              disabled={resendingId === q.id}
                              title="Send or resend quotation directly to client via email"
                              onClick={() => handleResendEmail(q)}
                              style={{ fontSize: "11px", padding: "4px 8px", color: "var(--ink)" }}
                            >
                              {resendingId === q.id ? "Sending..." : "✉ Send"}
                            </button>

                            {/* View / Copy Public URL */}
                            <Link
                              href={`/quote/${q.viewToken}`}
                              target="_blank"
                              className="chip"
                              title="Open public proposal view"
                              style={{ fontSize: "11px", padding: "4px 8px" }}
                            >
                              View ↗
                            </Link>

                            {/* Edit */}
                            <button
                              type="button"
                              className="chip"
                              onClick={() => handleOpenEdit(q)}
                              style={{ fontSize: "11px", padding: "4px 8px" }}
                            >
                              Edit
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteQuote(q.id, q.quotationNumber)}
                              style={{ border: "none", background: "none", color: "#c93b2b", cursor: "pointer", fontSize: "14px" }}
                              title="Delete quotation"
                            >
                              ✕
                            </button>
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

      {/* ================= MODAL: QUOTATION COMPOSER ================= */}
      {showModal && (
        <div
          className="case-study-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="case-study-modal" style={{ maxWidth: "860px", maxHeight: "90vh", overflowY: "auto" }}>
            <button
              type="button"
              className="case-study-close-btn"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", marginBottom: "4px" }}>
              {quoteId ? `Edit Quotation [${quotationNumber}]` : "Compose Client Quotation & Proposal"}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "24px" }}>
              Deliver bespoke scope, pricing, milestones, and deliverables directly to client inboxes.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveQuotation(false); }}>
              {/* Client Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13.5px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Client Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@company.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Client Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13.5px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Tech Solutions"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              {/* Project Title & Overview */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HealthBridge — Telehealth Web Portal & Mobile App"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", fontWeight: 600 }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Executive Scope &amp; Architecture Overview *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize the core technical deliverable, target users, and why Kiln's architecture was chosen."
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px", lineHeight: 1.5 }}
                />
              </div>

              {/* Line Items & Deliverables */}
              <div style={{ marginBottom: "24px", background: "var(--bg)", padding: "18px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "12px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 600 }}>
                    Scope Deliverables &amp; Pricing Breakdown
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="chip"
                    style={{ fontSize: "11.5px", padding: "4px 10px" }}
                  >
                    + Add Deliverable
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {lineItems.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        background: "var(--card)",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                        display: "grid",
                        gridTemplateColumns: "2fr 3fr 80px 120px 30px",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Deliverable Title"
                        value={item.title}
                        onChange={(e) => handleUpdateLineItem(item.id, "title", e.target.value)}
                        style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                      />
                      <input
                        type="text"
                        placeholder="Specifications / Description"
                        value={item.description}
                        onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                        style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "12.5px" }}
                      />
                      <input
                        type="number"
                        placeholder="Hrs"
                        value={item.hours || ""}
                        onChange={(e) => handleUpdateLineItem(item.id, "hours", parseInt(e.target.value, 10) || 0)}
                        style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "12.5px", textAlign: "center" }}
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount || ""}
                        onChange={(e) => handleUpdateLineItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                        style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px", fontWeight: 600, textAlign: "right" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(item.id)}
                        style={{ background: "none", border: "none", color: "#c93b2b", cursor: "pointer", fontSize: "15px" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Discounts */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--line)" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "3px" }}>
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "12.5px" }}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "3px" }}>
                      Partner Discount ({currency === "INR" ? "₹" : "$"})
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "12.5px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "3px" }}>
                      GST / Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      placeholder="0 or 18"
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "12.5px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "24px", marginTop: "12px", fontFamily: "var(--mono)", fontSize: "13px" }}>
                  <span>Subtotal: <strong>{formatCurrency(subtotal, currency)}</strong></span>
                  <span>Grand Total: <strong style={{ color: "var(--accent)", fontSize: "15px" }}>{formatCurrency(totalAmount, currency)}</strong></span>
                </div>
              </div>

              {/* Execution Terms */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Estimated Timeline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 – 7 Weeks"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Valid Until Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Payment Milestones Schedule *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 40% Advance, 40% Staging Approval, 20% Production Handover"
                  value={paymentSchedule}
                  onChange={(e) => setPaymentSchedule(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Recommended Stack (comma-separated)
                </label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Warranty, Terms &amp; Inclusions
                </label>
                <textarea
                  rows={3}
                  value={termsAndNotes}
                  onChange={(e) => setTermsAndNotes(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "12.5px", lineHeight: 1.45 }}
                />
              </div>

              {/* Optional Custom Email Note */}
              <div style={{ background: "var(--accent-soft)", padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(117, 128, 31, 0.25)", marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 600, marginBottom: "4px" }}>
                  Personalized Email Intro Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hi Ramesh, great speaking with you on our discovery call earlier today! Attached is the detailed architectural breakdown and quotation we discussed."
                  value={customEmailNote}
                  onChange={(e) => setCustomEmailNote(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                />
              </div>

              {/* Bottom Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  {previewToken && (
                    <Link
                      href={`/quote/${previewToken}`}
                      target="_blank"
                      className="chip"
                      style={{ fontSize: "12px", padding: "8px 14px" }}
                    >
                      View Live Customer Preview ↗
                    </Link>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || sendingEmail}
                    className="chip"
                    style={{ background: "#fff", fontWeight: 600 }}
                  >
                    {saving ? "Saving Draft..." : "Save Draft"}
                  </button>

                  <button
                    type="button"
                    disabled={saving || sendingEmail}
                    className="btn-primary"
                    onClick={() => handleSaveQuotation(true)}
                  >
                    {sendingEmail ? "Dispatching Email..." : "Send Quotation Email Directly ✉"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
