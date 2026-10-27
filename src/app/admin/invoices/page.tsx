"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import { ProjectInvoiceRecord, InvoiceLineItem, DEFAULT_BANK_DETAILS, BankDetails } from "@/types/invoice";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft", bg: "#eae7dd", color: "var(--muted)" },
  { value: "SENT", label: "Sent / Due", bg: "#e0e7ff", color: "#3730a3" },
  { value: "PAID", label: "Paid", bg: "#dcfce7", color: "#166534" },
  { value: "OVERDUE", label: "Overdue", bg: "#fee2e2", color: "#991b1b" },
  { value: "CANCELLED", label: "Cancelled", bg: "#f3f4f6", color: "#6b7280" },
];

export default function AdminInvoicesPage() {
  const router = useRouter();

  // Invoices list state
  const [invoices, setInvoices] = useState<ProjectInvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available quotations to import/convert
  const [availableQuotes, setAvailableQuotes] = useState<any[]>([]);

  // Composer / Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Send Email Modal State
  const [showSendModal, setShowSendModal] = useState(false);
  const [activeInvoiceForSend, setActiveInvoiceForSend] = useState<ProjectInvoiceRecord | null>(null);
  const [sendCustomNote, setSendCustomNote] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Form Fields
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientGstin, setClientGstin] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      id: "item_1",
      title: "Core Platform Development & Architecture",
      description: "Full-stack implementation, UI design tokens, API integration, and production staging.",
      quantity: 1,
      rate: 150000,
      amount: 150000,
    },
  ]);
  const [bankDetails, setBankDetails] = useState<BankDetails>(DEFAULT_BANK_DETAILS);
  const [paymentTerms, setPaymentTerms] = useState("Full payment due within 14 days of invoice date via NEFT/IMPS/UPI.");
  const [notes, setNotes] = useState("Thank you for partnering with Digigrantha. Please email remittance advice to team@digigrantha.com once transferred.");

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/invoices");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableQuotes = async () => {
    try {
      const res = await fetch("/api/admin/quotations");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAvailableQuotes(data.data);
      }
    } catch {}
  };

  useEffect(() => {
    loadInvoices();
    loadAvailableQuotes();
  }, []);

  // Compute subtotal, tax amount, total
  const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const taxAmount = Math.round((subtotal - discount) * (taxRate / 100));
  const totalAmount = Math.max(0, subtotal - discount + taxAmount);

  // Line items handlers
  const handleItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    setLineItems((prev) => {
      const next = [...prev];
      const updatedItem = { ...next[index], [field]: value };
      if (field === "quantity" || field === "rate") {
        const qty = Number(field === "quantity" ? value : updatedItem.quantity) || 1;
        const rate = Number(field === "rate" ? value : updatedItem.rate) || 0;
        updatedItem.amount = qty * rate;
      }
      next[index] = updatedItem;
      return next;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}`,
        title: "",
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Convert Quote to Invoice
  const handleImportQuote = (quoteId: string) => {
    const q = availableQuotes.find((item) => item.id === quoteId);
    if (!q) return;

    setClientName(q.clientName || "");
    setClientEmail(q.clientEmail || "");
    setClientPhone(q.clientPhone || "");
    setClientCompany(q.clientCompany || "");
    setProjectTitle(q.projectTitle || "");
    setOverview(q.overview || "");
    setCurrency(q.currency || "INR");
    setDiscount(q.discount || 0);
    setTaxRate(q.taxRate || 18);

    if (Array.isArray(q.lineItems) && q.lineItems.length > 0) {
      setLineItems(
        q.lineItems.map((item: any, i: number) => ({
          id: `item_${Date.now()}_${i}`,
          title: item.title,
          description: item.description || "",
          quantity: 1,
          rate: Number(item.amount) || 0,
          amount: Number(item.amount) || 0,
        }))
      );
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setInvoiceNumber("");
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setClientCompany("");
    setClientAddress("");
    setClientGstin("");
    setProjectTitle("");
    setOverview("");
    setCurrency("INR");
    setDiscount(0);
    setTaxRate(18);
    setIssueDate(new Date().toISOString().split("T")[0]);
    const due = new Date();
    due.setDate(due.getDate() + 14);
    setDueDate(due.toISOString().split("T")[0]);
    setLineItems([
      {
        id: "item_1",
        title: "Digital Product Architecture & Engineering",
        description: "Milestone deliverable as agreed in project brief.",
        quantity: 1,
        rate: 150000,
        amount: 150000,
      },
    ]);
    setBankDetails(DEFAULT_BANK_DETAILS);
    setShowModal(true);
  };

  const handleOpenEditModal = (inv: ProjectInvoiceRecord) => {
    setModalMode("edit");
    setEditingId(inv.id);
    setInvoiceNumber(inv.invoiceNumber);
    setClientName(inv.clientName);
    setClientEmail(inv.clientEmail);
    setClientPhone(inv.clientPhone || "");
    setClientCompany(inv.clientCompany || "");
    setClientAddress(inv.clientAddress || "");
    setClientGstin(inv.clientGstin || "");
    setProjectTitle(inv.projectTitle);
    setOverview(inv.overview || "");
    setCurrency(inv.currency);
    setDiscount(inv.discount);
    setTaxRate(inv.taxRate);
    setIssueDate(inv.issueDate.split("T")[0]);
    setDueDate(inv.dueDate.split("T")[0]);
    setLineItems(inv.lineItems && inv.lineItems.length > 0 ? inv.lineItems : []);
    setBankDetails(inv.bankDetails || DEFAULT_BANK_DETAILS);
    setPaymentTerms(inv.paymentTerms || "");
    setNotes(inv.notes || "");
    setShowModal(true);
  };

  const handleSaveInvoice = async (sendImmediately: boolean = false) => {
    if (!clientName.trim() || !clientEmail.trim() || !projectTitle.trim()) {
      alert("Please enter Client Name, Email, and Project Title.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const payload = {
        invoiceNumber: invoiceNumber.trim() || undefined,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim() || null,
        clientCompany: clientCompany.trim() || null,
        clientAddress: clientAddress.trim() || null,
        clientGstin: clientGstin.trim() || null,
        projectTitle: projectTitle.trim(),
        overview: overview.trim() || null,
        currency,
        subtotal,
        discount,
        taxRate,
        taxAmount,
        totalAmount,
        issueDate: new Date(issueDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        lineItems,
        paymentTerms,
        bankDetails,
        notes,
        sendImmediately,
      };

      let res;
      if (modalMode === "edit" && editingId) {
        res = await fetch(`/api/admin/invoices/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save invoice");
      }

      setSuccessMsg(
        sendImmediately
          ? `Invoice ${data.data.invoiceNumber} saved & sent to ${clientEmail}!`
          : `Invoice ${data.data.invoiceNumber} saved successfully.`
      );
      setShowModal(false);
      loadInvoices();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save invoice.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkStatus = async (id: string, newStatus: string) => {
    try {
      const payload: any = { status: newStatus };
      if (newStatus === "PAID") payload.paidAt = new Date().toISOString();

      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Invoice status updated to ${newStatus}.`);
        loadInvoices();
      }
    } catch {
      setErrorMsg("Failed to update status.");
    }
  };

  const handleDeleteInvoice = async (id: string, num: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${num}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Invoice ${num} deleted.`);
        loadInvoices();
      }
    } catch {
      setErrorMsg("Failed to delete invoice.");
    }
  };

  const handleSendInvoiceEmail = async () => {
    if (!activeInvoiceForSend) return;
    try {
      setSendingEmail(true);
      setErrorMsg(null);
      const res = await fetch(`/api/admin/invoices/${activeInvoiceForSend.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customNote: sendCustomNote }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send invoice email.");
      }
      setSuccessMsg(`Invoice ${activeInvoiceForSend.invoiceNumber} dispatched to ${activeInvoiceForSend.clientEmail}!`);
      setShowSendModal(false);
      loadInvoices();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch email.");
    } finally {
      setSendingEmail(false);
    }
  };

  // Metrics calculation
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.currency === "INR" ? inv.totalAmount : inv.totalAmount * 85), 0);
  const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((acc, inv) => acc + (inv.currency === "INR" ? inv.totalAmount : inv.totalAmount * 85), 0);
  const totalPending = invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED").reduce((acc, inv) => acc + (inv.currency === "INR" ? inv.totalAmount : inv.totalAmount * 85), 0);
  const overdueCount = invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED" && new Date(i.dueDate).getTime() < Date.now()).length;

  // Filtered List
  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus !== "ALL" && inv.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchClient = inv.clientName.toLowerCase().includes(q) || inv.clientEmail.toLowerCase().includes(q);
      const matchProj = inv.projectTitle.toLowerCase().includes(q);
      if (!matchNum && !matchClient && !matchProj) return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <AdminNavbar />

      <main style={{ flex: 1, padding: "32px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          
          {/* Header Action Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div>
              <h1 className="admin-title" style={{ margin: 0, fontSize: "28px" }}>
                Digigrantha <span>Invoices &amp; Billing</span>
              </h1>
              <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                Tax Invoices, Multi-page PDF Dispatch, Wire Remittance &amp; Real-time Payment Tracking
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="btn-primary"
                style={{
                  padding: "9px 18px",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <span>+</span> Create New Invoice
              </button>
            </div>
          </div>

          {/* Banner Notifications */}
          {successMsg && (
            <div style={{ background: "#dcfce7", color: "#166534", padding: "12px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "13.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>✓ {successMsg}</span>
              <button type="button" onClick={() => setSuccessMsg(null)} style={{ background: "none", border: "none", color: "#166534", cursor: "pointer", fontWeight: "bold" }}>✕</button>
            </div>
          )}

          {errorMsg && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "13.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>⚠ {errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg(null)} style={{ background: "none", border: "none", color: "#991b1b", cursor: "pointer", fontWeight: "bold" }}>✕</button>
            </div>
          )}

          {/* Metric KPI Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div style={{ background: "var(--card)", border: "1px solid var(--line)", padding: "18px 20px", borderRadius: "14px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                Total Invoiced (INR Equiv)
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--ink)" }}>
                ₹{totalInvoiced.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                {invoices.length} invoices generated
              </div>
            </div>

            <div style={{ background: "var(--card)", border: "1px solid var(--line)", padding: "18px 20px", borderRadius: "14px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "#166534", marginBottom: "6px" }}>
                Collected / Paid
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#166534" }}>
                ₹{totalPaid.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                {invoices.filter((i) => i.status === "PAID").length} settled payments
              </div>
            </div>

            <div style={{ background: "var(--card)", border: "1px solid var(--line)", padding: "18px 20px", borderRadius: "14px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "6px" }}>
                Outstanding / Due
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--accent)" }}>
                ₹{totalPending.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                Pending remittance
              </div>
            </div>

            <div style={{ background: "var(--card)", border: "1px solid var(--line)", padding: "18px 20px", borderRadius: "14px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: overdueCount > 0 ? "#991b1b" : "var(--muted)", marginBottom: "6px" }}>
                Overdue Invoices
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: overdueCount > 0 ? "#991b1b" : "var(--ink)" }}>
                {overdueCount}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                Past payment grace period
              </div>
            </div>
          </div>

          {/* Table Controls / Filters Bar */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {/* Status Pills */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["ALL", "DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  style={{
                    border: "none",
                    background: filterStatus === st ? "var(--ink)" : "var(--bg)",
                    color: filterStatus === st ? "var(--bg)" : "var(--muted)",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontFamily: "var(--mono)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ minWidth: "260px" }}>
              <input
                type="text"
                placeholder="Search by client, invoice #, or project…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                  fontSize: "13px",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Invoices List Table */}
          <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "14px", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "13px" }}>
                Loading invoices…
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div style={{ padding: "64px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🧾</div>
                <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", margin: "0 0 8px" }}>
                  No Invoices Found
                </h3>
                <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 20px" }}>
                  {searchQuery || filterStatus !== "ALL"
                    ? "Try clearing filters to see more results."
                    : "Generate your first professional tax invoice to send to clients."}
                </p>
                <button type="button" onClick={handleOpenCreateModal} className="btn-primary" style={{ padding: "8px 20px", fontSize: "13px" }}>
                  + Create First Invoice
                </button>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)" }}>
                      Invoice #
                    </th>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)" }}>
                      Client &amp; Project
                    </th>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)" }}>
                      Dates
                    </th>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", textAlign: "right" }}>
                      Amount Due
                    </th>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", textAlign: "center" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", textAlign: "right" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const stOpt = STATUS_OPTIONS.find((o) => o.value === inv.status) || STATUS_OPTIONS[0];
                    const isDuePast = inv.status !== "PAID" && new Date(inv.dueDate).getTime() < Date.now();

                    return (
                      <tr key={inv.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "14px 16px", fontFamily: "var(--mono)", fontSize: "12.5px" }}>
                          <Link
                            href={`/invoice/${inv.viewToken}`}
                            target="_blank"
                            style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
                            title="Open public printable view"
                          >
                            {inv.invoiceNumber} ↗
                          </Link>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 600, color: "var(--ink)" }}>{inv.clientName}</div>
                          {inv.clientCompany && (
                            <div style={{ fontSize: "12px", color: "var(--muted)" }}>{inv.clientCompany}</div>
                          )}
                          <div style={{ fontSize: "12.5px", color: "var(--ink)", marginTop: "3px" }}>
                            {inv.projectTitle}
                          </div>
                        </td>

                        <td style={{ padding: "14px 16px", fontSize: "12.5px" }}>
                          <div>Issued: <span style={{ color: "var(--muted)" }}>{new Date(inv.issueDate).toLocaleDateString()}</span></div>
                          <div style={{ color: isDuePast ? "#991b1b" : "var(--muted)", marginTop: "2px", fontWeight: isDuePast ? 600 : 400 }}>
                            Due: {new Date(inv.dueDate).toLocaleDateString()}
                          </div>
                        </td>

                        <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: "var(--mono)", fontWeight: "bold", fontSize: "14.5px", color: "var(--ink)" }}>
                          {inv.currency === "INR" ? `₹${inv.totalAmount.toLocaleString("en-IN")}` : `$${inv.totalAmount.toLocaleString("en-US")}`}
                        </td>

                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "10.5px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "3px 8px",
                              borderRadius: "999px",
                              background: stOpt.bg,
                              color: stOpt.color,
                            }}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", alignItems: "center" }}>
                            {/* Email Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveInvoiceForSend(inv);
                                setSendCustomNote("");
                                setShowSendModal(true);
                              }}
                              style={{
                                background: "none",
                                border: "1px solid var(--line)",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                cursor: "pointer",
                                color: "var(--ink)",
                              }}
                              title="Send or resend invoice email"
                            >
                              ✉ Send
                            </button>

                            {/* Mark Paid Button */}
                            {inv.status !== "PAID" && (
                              <button
                                type="button"
                                onClick={() => handleMarkStatus(inv.id, "PAID")}
                                style={{
                                  background: "#dcfce7",
                                  border: "none",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  color: "#166534",
                                }}
                                title="Mark as fully settled"
                              >
                                ✓ Paid
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(inv)}
                              style={{
                                background: "none",
                                border: "1px solid var(--line)",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                cursor: "pointer",
                                color: "var(--ink)",
                              }}
                            >
                              ✎
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                              style={{
                                background: "none",
                                border: "1px solid #fee2e2",
                                color: "#991b1b",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                cursor: "pointer",
                              }}
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
            )}
          </div>

        </div>
      </main>

      {/* ================= INVOICE COMPOSER MODAL ================= */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "var(--card)",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "860px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
              border: "1px solid var(--line)",
              padding: "32px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid var(--line)", paddingBottom: "16px" }}>
              <div>
                <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", margin: 0, color: "var(--ink)" }}>
                  {modalMode === "create" ? "Generate Tax Invoice" : `Edit Invoice ${invoiceNumber}`}
                </h2>
                <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                  Configured with multi-page print breakdown, GST calculation &amp; instant bank remittance
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            {/* Quick Import from Quotations Dropdown (only in create mode) */}
            {modalMode === "create" && availableQuotes.length > 0 && (
              <div style={{ background: "var(--bg)", border: "1px solid var(--line)", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ fontSize: "12.5px", color: "var(--ink)", fontWeight: 600 }}>
                  ⚡ Auto-fill from an existing quotation:
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleImportQuote(e.target.value);
                  }}
                  defaultValue=""
                  style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "12.5px" }}
                >
                  <option value="">Select a proposal…</option>
                  {availableQuotes.map((q) => (
                    <option key={q.id} value={q.id}>
                      [{q.quotationNumber}] {q.clientName} — {q.projectTitle}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Form Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Invoice Number (Auto-assigned if blank)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DG-INV-2026-1042"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Client Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya@company.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Client Company (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Orbit Logistics Pvt Ltd"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom ERP & Dashboard Architecture"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  GSTIN / Tax Registration ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  value={clientGstin}
                  onChange={(e) => setClientGstin(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Billing Address */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                Client Billing Address (Printed on Tax Invoice)
              </label>
              <textarea
                rows={2}
                placeholder="Suite 400, Tech Park, Outer Ring Road, Bengaluru, Karnataka, 560103"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
              />
            </div>

            {/* Line Items Table Builder */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "12px", padding: "18px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>
                  Invoice Line Items
                </div>
                <button
                  type="button"
                  onClick={addLineItem}
                  style={{
                    background: "var(--ink)",
                    color: "var(--bg)",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  + Add Deliverable
                </button>
              </div>

              {lineItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 90px 130px 130px 36px",
                    gap: "10px",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                    background: "var(--card)",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                  }}
                >
                  <div>
                    <input
                      type="text"
                      placeholder="Item Title (e.g. Sprint 1 Deliverables)"
                      value={item.title}
                      onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}
                    />
                    <input
                      type="text"
                      placeholder="Description details..."
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      style={{ width: "100%", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "12px", color: "var(--muted)" }}
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px", textAlign: "center" }}
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="Unit Rate"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px", textAlign: "right" }}
                    />
                  </div>

                  <div style={{ textAlign: "right", padding: "8px 6px", fontFamily: "var(--mono)", fontSize: "13px", fontWeight: "bold" }}>
                    {currency === "INR" ? `₹${(item.amount || 0).toLocaleString("en-IN")}` : `$${(item.amount || 0).toLocaleString("en-US")}`}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLineItem(idx)}
                    style={{ background: "none", border: "none", color: "#991b1b", cursor: "pointer", fontSize: "16px", padding: "6px 0" }}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Calculations Box */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
                <div style={{ width: "100%", maxWidth: "340px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "var(--muted)" }}>Subtotal:</span>
                    <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                      {currency === "INR" ? `₹${subtotal.toLocaleString("en-IN")}` : `$${subtotal.toLocaleString("en-US")}`}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ color: "var(--muted)" }}>Discount:</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      style={{ width: "100px", padding: "3px 8px", borderRadius: "4px", border: "1px solid var(--line)", textAlign: "right", fontSize: "12px" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ color: "var(--muted)" }}>GST / Tax (%):</span>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                      style={{ padding: "3px 8px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "12px" }}
                    >
                      <option value={0}>0% (Exempt / Export)</option>
                      <option value={18}>18% (Standard Indian GST)</option>
                      <option value={12}>12%</option>
                      <option value={5}>5%</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "bold", borderTop: "2px solid var(--line)", paddingTop: "8px", marginTop: "6px" }}>
                    <span>Total Balance:</span>
                    <span style={{ color: "var(--accent)", fontFamily: "var(--mono)" }}>
                      {currency === "INR" ? `₹${totalAmount.toLocaleString("en-IN")}` : `$${totalAmount.toLocaleString("en-US")}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details & Payment Notes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  Bank A/C Number
                </label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={bankDetails.upiId || ""}
                  onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--line)", paddingTop: "20px" }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "1px solid var(--line)", padding: "10px 18px", borderRadius: "999px", fontSize: "13px", cursor: "pointer" }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveInvoice(false)}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--ink)",
                  color: "var(--ink)",
                  padding: "10px 20px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {saving ? "Saving…" : "Save as Draft"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveInvoice(true)}
                className="btn-primary"
                style={{
                  padding: "10px 22px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                {saving ? "Processing…" : "Save & Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SEND EMAIL MODAL ================= */}
      {showSendModal && activeInvoiceForSend && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowSendModal(false)}
        >
          <div
            style={{
              background: "var(--card)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
              border: "1px solid var(--line)",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", margin: "0 0 8px", color: "var(--ink)" }}>
              Dispatch Invoice via Email
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "13.5px", margin: "0 0 18px", lineHeight: 1.5 }}>
              This will send an optimized tax invoice email with complete remittance details and a 2-page print-ready link to:
            </p>

            <div style={{ background: "var(--bg)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--line)", marginBottom: "16px", fontSize: "13px" }}>
              <div><strong>Recipient:</strong> {activeInvoiceForSend.clientName} ({activeInvoiceForSend.clientEmail})</div>
              <div style={{ marginTop: "4px" }}><strong>Invoice:</strong> {activeInvoiceForSend.invoiceNumber} — {activeInvoiceForSend.currency === "INR" ? `₹${activeInvoiceForSend.totalAmount.toLocaleString("en-IN")}` : `$${activeInvoiceForSend.totalAmount.toLocaleString("en-US")}`}</div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                Add Custom Note (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Hi team, here is the milestone invoice for this sprint…"
                value={sendCustomNote}
                onChange={(e) => setSendCustomNote(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: "13px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                style={{ background: "none", border: "1px solid var(--line)", padding: "8px 16px", borderRadius: "999px", fontSize: "13px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingEmail}
                onClick={handleSendInvoiceEmail}
                className="btn-primary"
                style={{ padding: "8px 20px", fontSize: "13px", cursor: "pointer" }}
              >
                {sendingEmail ? "Sending…" : "Dispatch Email Now →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
