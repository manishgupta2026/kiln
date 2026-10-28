"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import { ProjectInvoiceRecord, InvoiceLineItem, DEFAULT_BANK_DETAILS, BankDetails } from "@/types/invoice";
import { DIGITAL_SIGNATURE_SRC } from "@/lib/signature-data";

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
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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
    d.setDate(d.getDate() + 2);
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
  const [paymentTerms, setPaymentTerms] = useState("Full payment due within 2 days of invoice date via NEFT/IMPS/UPI.");
  const [notes, setNotes] = useState("Thank you for partnering with DigiGrantha.");

  // Autosave State
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | null>(null);
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [hasUnsavedLocalDraft, setHasUnsavedLocalDraft] = useState(false);

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
    try {
      const saved = localStorage.getItem("digigrantha_invoice_draft_v1");
      if (saved) {
        setHasUnsavedLocalDraft(true);
      }
    } catch {}
  }, []);

  // Compute subtotal, tax amount, total
  const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const taxAmount = Math.round((subtotal - discount) * (taxRate / 100));
  const totalAmount = Math.max(0, subtotal - discount + taxAmount);

  // Autosave Effect: debounced localStorage sync + background DB update in edit mode
  useEffect(() => {
    if (!showModal) return;

    const hasAnyContent =
      clientName.trim() ||
      projectTitle.trim() ||
      clientEmail.trim() ||
      clientCompany.trim() ||
      lineItems.some((li) => li.title.trim() || (Number(li.rate) || 0) > 0);

    if (!hasAnyContent) return;

    setAutoSaveStatus("saving");

    const timer = setTimeout(async () => {
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      // 1. Always save in-progress state to localStorage
      try {
        const draftObj = {
          invoiceNumber,
          clientName,
          clientEmail,
          clientPhone,
          clientCompany,
          clientAddress,
          clientGstin,
          projectTitle,
          overview,
          currency,
          discount,
          taxRate,
          issueDate,
          dueDate,
          lineItems,
          bankDetails,
          paymentTerms,
          notes,
          lastSavedAt: nowStr,
        };
        localStorage.setItem("digigrantha_invoice_draft_v1", JSON.stringify(draftObj));
        setHasUnsavedLocalDraft(true);
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }

      // 2. If editing an existing invoice in the database, sync to DB as well
      if (modalMode === "edit" && editingId) {
        try {
          await fetch(`/api/admin/invoices/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
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
            }),
          });
        } catch (dbErr) {
          console.warn("Background db autosave failed:", dbErr);
        }
      }

      setAutoSaveStatus("saved");
      setAutoSavedAt(nowStr);
    }, 700);

    return () => clearTimeout(timer);
  }, [
    showModal,
    modalMode,
    editingId,
    invoiceNumber,
    clientName,
    clientEmail,
    clientPhone,
    clientCompany,
    clientAddress,
    clientGstin,
    projectTitle,
    overview,
    currency,
    discount,
    taxRate,
    issueDate,
    dueDate,
    lineItems,
    bankDetails,
    paymentTerms,
    notes,
    subtotal,
    taxAmount,
    totalAmount,
  ]);

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

  const handleClearDraft = () => {
    try {
      localStorage.removeItem("digigrantha_invoice_draft_v1");
    } catch {}
    setHasRestoredDraft(false);
    setHasUnsavedLocalDraft(false);
    setAutoSaveStatus(null);
    setAutoSavedAt(null);
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
    due.setDate(due.getDate() + 2);
    setDueDate(due.toISOString().split("T")[0]);
    setLineItems([
      {
        id: `item_${Date.now()}`,
        title: "",
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
    setBankDetails(DEFAULT_BANK_DETAILS);
    setPaymentTerms("Full payment due within 2 days of invoice date via NEFT/IMPS/UPI.");
    setNotes("Thank you for partnering with DigiGrantha.");
  };

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem("digigrantha_invoice_draft_v1");
      if (saved) {
        const draft = JSON.parse(saved);
        setInvoiceNumber(draft.invoiceNumber || "");
        setClientName(draft.clientName || "");
        setClientEmail(draft.clientEmail || "");
        setClientPhone(draft.clientPhone || "");
        setClientCompany(draft.clientCompany || "");
        setClientAddress(draft.clientAddress || "");
        setClientGstin(draft.clientGstin || "");
        setProjectTitle(draft.projectTitle || "");
        setOverview(draft.overview || "");
        setCurrency(draft.currency || "INR");
        setDiscount(draft.discount || 0);
        setTaxRate(draft.taxRate !== undefined ? draft.taxRate : 18);
        setIssueDate(draft.issueDate || new Date().toISOString().split("T")[0]);
        setDueDate(draft.dueDate || (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split("T")[0]; })());
        if (draft.lineItems && draft.lineItems.length > 0) {
          setLineItems(draft.lineItems);
        }
        if (draft.bankDetails) setBankDetails(draft.bankDetails);
        if (draft.paymentTerms) setPaymentTerms(draft.paymentTerms);
        if (draft.notes) setNotes(draft.notes);
        setHasRestoredDraft(true);
        setAutoSavedAt(draft.lastSavedAt || null);
        setAutoSaveStatus("saved");
      }
    } catch (e) {
      console.warn("Failed to restore draft:", e);
    }
  };

  const handleOpenCreateModal = () => {
    // ALWAYS start with a clean, blank invoice form
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
    due.setDate(due.getDate() + 2);
    setDueDate(due.toISOString().split("T")[0]);
    setLineItems([
      {
        id: `item_${Date.now()}`,
        title: "",
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
    setBankDetails(DEFAULT_BANK_DETAILS);
    setPaymentTerms("Full payment due within 2 days of invoice date via NEFT/IMPS/UPI.");
    setNotes("Thank you for partnering with DigiGrantha.");
    setHasRestoredDraft(false);
    setAutoSaveStatus(null);
    setAutoSavedAt(null);

    // Detect if there's a previously saved draft for optional restoration
    try {
      const saved = localStorage.getItem("digigrantha_invoice_draft_v1");
      setHasUnsavedLocalDraft(!!saved);
    } catch {}

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
      try {
        localStorage.removeItem("digigrantha_invoice_draft_v1");
      } catch {}
      setHasRestoredDraft(false);
      setHasUnsavedLocalDraft(false);
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

  const handlePrintPdf = () => {
    const originalTitle = document.title;
    const fileName = invoiceNumber || `DG-INV-${new Date().toISOString().slice(0, 10)}`;
    document.title = fileName;
    const restore = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
    setTimeout(restore, 2000);
  };

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
                DigiGrantha <span>Invoices &amp; Billing</span>
              </h1>
              <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                Tax Invoices, Multi-page PDF Dispatch, Wire Remittance &amp; Real-time Payment Tracking
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {hasUnsavedLocalDraft && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenCreateModal();
                    setTimeout(handleRestoreDraft, 50);
                  }}
                  style={{
                    background: "none",
                    border: "1px dashed var(--line)",
                    color: "var(--ink)",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontFamily: "var(--mono)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  title="Resume editing previously unsaved draft"
                >
                  <span>📝</span> Resume Draft
                </button>
              )}
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

          {/* Draft In-Progress Banner */}
          {hasUnsavedLocalDraft && !showModal && (
            <div style={{ background: "#fef9c3", border: "1px solid #fde047", padding: "12px 18px", borderRadius: "10px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#854d0e" }}>
                <span>📝</span>
                <span>You have an autosaved invoice draft in progress.</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  style={{ background: "#854d0e", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                >
                  Resume Draft ↗
                </button>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  style={{ background: "none", border: "1px solid #ca8a04", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", color: "#854d0e" }}
                >
                  Discard
                </button>
              </div>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid var(--line)", paddingBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", margin: 0, color: "var(--ink)" }}>
                    {modalMode === "create" ? "Generate Tax Invoice" : `Edit Invoice ${invoiceNumber}`}
                  </h2>
                  {autoSaveStatus === "saving" && (
                    <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "#b45309", background: "#fef3c7", padding: "2px 8px", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }}></span>
                      Autosaving draft...
                    </span>
                  )}
                  {autoSaveStatus === "saved" && autoSavedAt && (
                    <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }}></span>
                      Autosaved ({autoSavedAt})
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                  Progress is autosaved so you can complete invoice details anytime
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--muted)", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>

            {/* Restored Draft Alert Banner */}
            {hasRestoredDraft && modalMode === "create" && (
              <div style={{ background: "#fef9c3", border: "1px solid #fde047", padding: "10px 14px", borderRadius: "8px", marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#854d0e" }}>
                <span>💾 Restored draft from earlier.</span>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  style={{ background: "none", border: "1px solid #ca8a04", padding: "3px 10px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", color: "#854d0e", fontWeight: 600 }}
                >
                  Clear &amp; Start Blank
                </button>
              </div>
            )}

            {/* Optional Banner to Restore Draft if one exists */}
            {!hasRestoredDraft && hasUnsavedLocalDraft && modalMode === "create" && (
              <div style={{ background: "var(--bg)", border: "1px dashed var(--line)", padding: "10px 14px", borderRadius: "8px", marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--muted)", flexWrap: "wrap", gap: "8px" }}>
                <span>💡 You have an unsaved draft from a previous session.</span>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={handleRestoreDraft}
                    style={{ background: "var(--ink)", color: "var(--bg)", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                  >
                    Restore Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    style={{ background: "none", border: "1px solid var(--line)", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", color: "var(--muted)" }}
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

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
                      value={item.rate === 0 ? "" : item.rate}
                      onChange={(e) => handleItemChange(idx, "rate", e.target.value === "" ? 0 : Number(e.target.value) || 0)}
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

            {/* Bank Remittance Details */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "12px", padding: "18px 20px", marginBottom: "24px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.06em", fontWeight: 700, marginBottom: "14px" }}>
                Bank Details
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, ICICI Bank"
                    value={bankDetails.bankName || ""}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Receiver Name (Account Holder) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DigiGrantha"
                    value={bankDetails.accountName || ""}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Bank A/C Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50200084920193"
                    value={bankDetails.accountNumber || ""}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0000240"
                    value={bankDetails.ifscCode || ""}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    Branch Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Koramangala, Bengaluru"
                    value={bankDetails.branchName || ""}
                    onChange={(e) => setBankDetails({ ...bankDetails, branchName: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                    UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. digigrantha@upi"
                    value={bankDetails.upiId || ""}
                    onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "13px" }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (!clientName.trim() || !projectTitle.trim()) {
                      alert("Please enter at least Client Name and Project Title to preview.");
                      return;
                    }
                    setShowPreviewModal(true);
                  }}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--accent)",
                    color: "var(--accent)",
                    padding: "10px 20px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>👁️</span> Preview Invoice Before Sending
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
        </div>
      )}

      {/* ================= LIVE INVOICE PREVIEW MODAL ================= */}
      {showPreviewModal && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              html, body {
                background: #ffffff !important;
                color: #17150F !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                height: auto !important;
                width: 100% !important;
              }
              /* Hide all page UI, modal backdrop, dialog containers, navbar, buttons */
              body * {
                visibility: hidden !important;
              }
              /* Display strictly the printable invoice sheet and its children */
              #printable-invoice-sheet,
              #printable-invoice-sheet * {
                visibility: visible !important;
              }
              #printable-invoice-sheet {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 12px 16px !important;
                border: none !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                background: #ffffff !important;
              }
              .no-print,
              .no-print * {
                display: none !important;
                visibility: hidden !important;
              }
              .keep-together,
              tr {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          ` }} />

          <div
            className="no-print-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              padding: "20px",
            }}
            onClick={() => setShowPreviewModal(false)}
          >
            <div
              style={{
                background: "#FAF8F5",
                borderRadius: "20px",
                width: "100%",
                maxWidth: "920px",
                maxHeight: "92vh",
                overflowY: "auto",
                boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
                border: "1px solid #E8E4DC",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Toolbar (Hidden when printing) */}
              <div
                className="no-print"
                style={{
                  padding: "14px 24px",
                  background: "#17150F",
                  color: "#FAF8F5",
                  borderRadius: "20px 20px 0 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px" }}>👁️</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.04em" }}>
                    INVOICE PREVIEW &amp; PROOFING
                  </span>
                  <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: "999px" }}>
                    {invoiceNumber || "AUTO-GENERATED NUMBER"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={handlePrintPdf}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "7px 14px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span>🖨️</span> Print / Save PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    style={{
                      background: "#FFFFFF",
                      color: "#17150F",
                      border: "none",
                      padding: "7px 14px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    ← Back to Edit
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet Container */}
              <div style={{ padding: "24px 30px", flex: 1, background: "#FAF8F5" }}>
                <div
                  id="printable-invoice-sheet"
                  className="printable-invoice-sheet"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E8E4DC",
                    borderRadius: "14px",
                    padding: "32px 34px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #17150F", paddingBottom: "14px", marginBottom: "18px" }}>
                    <div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "bold", color: "#17150F", letterSpacing: "-0.02em" }}>
                        DigiGrantha<span style={{ color: "#75801F" }}>.</span>
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: "10.5px", color: "#726C5C", marginTop: "3px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Official Tax Invoice &amp; Remittance Memo
                      </div>
                    </div>

                    <div style={{ textAlign: "right", fontFamily: "monospace" }}>
                      <div style={{ fontSize: "10px", color: "#726C5C", textTransform: "uppercase" }}>Invoice Number</div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#17150F", marginTop: "1px" }}>
                        {invoiceNumber || "DG-INV-2026-XXXX"}
                      </div>
                    </div>
                  </div>

                  {/* Billed To & Project Meta */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", marginBottom: "18px" }}>
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: "10.5px", textTransform: "uppercase", color: "#75801F", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "4px" }}>
                        Billed To (Client)
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#17150F" }}>{clientName || "Client Name"}</div>
                      {clientCompany && <div style={{ fontSize: "13px", color: "#4A463B", marginTop: "1px" }}>{clientCompany}</div>}
                      <div style={{ fontSize: "12.5px", color: "#726C5C", marginTop: "1px" }}>{clientEmail || "client@company.com"}</div>
                      {clientPhone && <div style={{ fontSize: "12px", color: "#726C5C" }}>Phone: {clientPhone}</div>}
                      {clientAddress && (
                        <div style={{ fontSize: "11.5px", color: "#726C5C", marginTop: "3px", whiteSpace: "pre-line", lineHeight: 1.35 }}>
                          {clientAddress}
                        </div>
                      )}
                      {clientGstin && (
                        <div style={{ fontSize: "11.5px", fontFamily: "monospace", color: "#17150F", marginTop: "3px" }}>
                          GSTIN: <strong>{clientGstin}</strong>
                        </div>
                      )}
                    </div>

                    <div style={{ background: "#FAF8F5", border: "1px solid #E8E4DC", borderRadius: "8px", padding: "12px 14px" }}>
                      <div style={{ fontSize: "12px", marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#726C5C" }}>Project:</span>
                        <strong style={{ color: "#17150F", textAlign: "right" }}>{projectTitle || "Project Deliverable"}</strong>
                      </div>
                      <div style={{ fontSize: "12px", marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#726C5C" }}>Issue Date:</span>
                        <strong style={{ color: "#17150F" }}>{issueDate}</strong>
                      </div>
                      <div style={{ fontSize: "12px", marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#726C5C" }}>Due Date:</span>
                        <strong style={{ color: "#c93b2b" }}>{dueDate}</strong>
                      </div>
                      <div style={{ fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#726C5C" }}>Currency:</span>
                        <strong style={{ color: "#17150F" }}>{currency}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1.5px solid #17150F" }}>
                        <th style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: "10.5px", textTransform: "uppercase", color: "#726C5C", textAlign: "left", width: "5%" }}>#</th>
                        <th style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: "10.5px", textTransform: "uppercase", color: "#726C5C", textAlign: "left" }}>Deliverable / Service</th>
                        <th style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: "10.5px", textTransform: "uppercase", color: "#726C5C", textAlign: "center", width: "10%" }}>Qty</th>
                        <th style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: "10.5px", textTransform: "uppercase", color: "#726C5C", textAlign: "right", width: "15%" }}>Rate</th>
                        <th style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: "10.5px", textTransform: "uppercase", color: "#726C5C", textAlign: "right", width: "18%" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: "1px solid #E8E4DC", pageBreakInside: "avoid", breakInside: "avoid" }}>
                          <td style={{ padding: "8px 8px", fontFamily: "monospace", fontSize: "11px", color: "#726C5C" }}>{idx + 1}</td>
                          <td style={{ padding: "8px 8px" }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#17150F" }}>{item.title || "Untitled deliverable"}</div>
                            {item.description && <div style={{ fontSize: "11px", color: "#726C5C", marginTop: "2px" }}>{item.description}</div>}
                          </td>
                          <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "monospace", fontSize: "12px" }}>{item.quantity || 1}</td>
                          <td style={{ padding: "8px 8px", textAlign: "right", fontFamily: "monospace", fontSize: "12px" }}>
                            {currency === "INR" ? `₹${(item.rate || 0).toLocaleString("en-IN")}` : `$${(item.rate || 0).toLocaleString("en-US")}`}
                          </td>
                          <td style={{ padding: "8px 8px", textAlign: "right", fontFamily: "monospace", fontSize: "12.5px", fontWeight: 600 }}>
                            {currency === "INR" ? `₹${(item.amount || 0).toLocaleString("en-IN")}` : `$${(item.amount || 0).toLocaleString("en-US")}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Summary */}
                  <div className="keep-together" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                    <div style={{ width: "100%", maxWidth: "300px", background: "#FAF8F5", border: "1px solid #E8E4DC", borderRadius: "8px", padding: "10px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#726C5C", marginBottom: "4px" }}>
                        <span>Subtotal:</span>
                        <span style={{ fontFamily: "monospace" }}>{currency === "INR" ? `₹${subtotal.toLocaleString("en-IN")}` : `$${subtotal.toLocaleString("en-US")}`}</span>
                      </div>
                      {discount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#75801F", marginBottom: "4px" }}>
                          <span>Discount:</span>
                          <span style={{ fontFamily: "monospace" }}>- {currency === "INR" ? `₹${discount.toLocaleString("en-IN")}` : `$${discount.toLocaleString("en-US")}`}</span>
                        </div>
                      )}
                      {taxRate > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#726C5C", marginBottom: "4px" }}>
                          <span>GST / Tax ({taxRate}%):</span>
                          <span style={{ fontFamily: "monospace" }}>+ {currency === "INR" ? `₹${taxAmount.toLocaleString("en-IN")}` : `$${taxAmount.toLocaleString("en-US")}`}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 700, borderTop: "2px solid #17150F", paddingTop: "6px", marginTop: "4px" }}>
                        <span>Total Balance:</span>
                        <span style={{ color: "#75801F", fontFamily: "monospace" }}>
                          {currency === "INR" ? `₹${totalAmount.toLocaleString("en-IN")}` : `$${totalAmount.toLocaleString("en-US")}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bank Wire Details */}
                  <div className="keep-together" style={{ background: "#FAF8F5", border: "1px solid #E8E4DC", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "10px", textTransform: "uppercase", color: "#75801F", letterSpacing: "0.06em", fontWeight: 700, marginBottom: "8px" }}>
                      Bank Details
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px", fontSize: "12px", color: "#4A463B" }}>
                      <div><span style={{ color: "#726C5C" }}>Bank Name:</span> <strong>{bankDetails.bankName || "ICICI Bank"}</strong></div>
                      <div><span style={{ color: "#726C5C" }}>Receiver Name:</span> <strong>{bankDetails.accountName || "Digigrantha"}</strong></div>
                      <div><span style={{ color: "#726C5C" }}>A/C Number:</span> <strong style={{ fontFamily: "monospace" }}>{bankDetails.accountNumber || "—"}</strong></div>
                      <div><span style={{ color: "#726C5C" }}>IFSC Code:</span> <strong style={{ fontFamily: "monospace" }}>{bankDetails.ifscCode || "—"}</strong></div>
                      {bankDetails.branchName && (
                        <div><span style={{ color: "#726C5C" }}>Branch Name:</span> <strong>{bankDetails.branchName}</strong></div>
                      )}
                      {bankDetails.upiId && (
                        <div><span style={{ color: "#726C5C" }}>UPI ID (VPA):</span> <strong style={{ fontFamily: "monospace", color: "#75801F" }}>{bankDetails.upiId}</strong></div>
                      )}
                    </div>
                  </div>

                  {/* Terms, Notes & Authorized Digital Signature */}
                  <div className="keep-together" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #E8E4DC", paddingTop: "10px", marginTop: "8px", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ fontSize: "11px", color: "#726C5C", lineHeight: 1.4, maxWidth: "440px" }}>
                      {paymentTerms && <div><strong>Terms:</strong> {paymentTerms}</div>}
                      {notes && <div style={{ marginTop: "2px" }}><strong>Notes:</strong> {notes}</div>}
                    </div>
                    <div style={{ textAlign: "right", minWidth: "160px" }}>
                      <div style={{ height: "42px", display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                        <img
                          src={DIGITAL_SIGNATURE_SRC}
                          alt="Authorized Signature"
                          style={{ maxHeight: "40px", maxWidth: "150px", objectFit: "contain", mixBlendMode: "multiply" }}
                        />
                      </div>
                      <div style={{ borderTop: "1px solid #17150F", width: "140px", marginLeft: "auto", margin: "4px 0 3px auto" }} />
                      <div style={{ fontFamily: "var(--mono)", fontSize: "9.5px", color: "#726C5C", textTransform: "uppercase" }}>
                        Authorized Signature
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions inside Preview Modal */}
              <div
                className="no-print"
                style={{
                  padding: "16px 24px",
                  background: "#FFFFFF",
                  borderTop: "1px solid #E8E4DC",
                  borderRadius: "0 0 20px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  style={{
                    background: "none",
                    border: "1px solid #E8E4DC",
                    padding: "9px 18px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    cursor: "pointer",
                    color: "#17150F",
                  }}
                >
                  ← Back to Edit Invoice
                </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    handleSaveInvoice(false);
                    setShowPreviewModal(false);
                  }}
                  style={{
                    background: "none",
                    border: "1px solid #17150F",
                    padding: "9px 20px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#17150F",
                  }}
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    handleSaveInvoice(true);
                    setShowPreviewModal(false);
                  }}
                  className="btn-primary"
                  style={{
                    padding: "9px 22px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {saving ? "Sending…" : "🚀 Confirm & Send Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
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
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--line)" }}>
                <Link
                  href={`/invoice/${activeInvoiceForSend.viewToken}`}
                  target="_blank"
                  style={{
                    fontSize: "12px",
                    fontFamily: "var(--mono)",
                    color: "var(--accent)",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: 600,
                  }}
                >
                  <span>👁️</span> Preview full client invoice in new tab ↗
                </Link>
              </div>
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
