"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ProjectInvoiceRecord } from "@/types/invoice";
import { DIGITAL_SIGNATURE_SRC } from "@/lib/signature-data";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function PublicInvoicePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [invoice, setInvoice] = useState<ProjectInvoiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        const res = await fetch(`/api/invoices/${token}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Invoice not found or expired link.");
          return;
        }
        setInvoice(data.data);
      } catch {
        setError("Network error loading invoice. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [token]);

  const handleCopyUpi = () => {
    if (invoice?.bankDetails?.upiId) {
      navigator.clipboard.writeText(invoice.bankDetails.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleCopyBank = () => {
    if (invoice?.bankDetails) {
      const b = invoice.bankDetails;
      const text = `Beneficiary: ${b.accountName}\nBank: ${b.bankName}\nA/C: ${b.accountNumber}\nIFSC: ${b.ifscCode}${b.branchName ? `\nBranch: ${b.branchName}` : ""}`;
      navigator.clipboard.writeText(text);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2500);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF8F5", fontFamily: "monospace" }}>
        <div style={{ fontSize: "14px", color: "#726C5C" }}>Loading official invoice…</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center", background: "#FAF8F5" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", marginBottom: "12px", color: "#17150F" }}>
          Invoice Unavailable
        </h1>
        <p style={{ color: "#726C5C", maxWidth: "460px", marginBottom: "24px", fontSize: "14.5px" }}>
          {error || "This invoice link could not be loaded. Please contact Digigrantha."}
        </p>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none", background: "#17150F", color: "#FAF8F5", padding: "12px 24px", borderRadius: "999px" }}>
          Back to Digigrantha Homepage →
        </Link>
      </div>
    );
  }

  const formatAmt = (num: number) => {
    if (invoice.currency === "INR") {
      return `₹${Number(num).toLocaleString("en-IN")}`;
    }
    return `$${Number(num).toLocaleString("en-US")}`;
  };

  const isPaid = invoice.status === "PAID";
  const isOverdue = invoice.status === "OVERDUE" || (!isPaid && new Date(invoice.dueDate).getTime() < Date.now());

  const formattedIssue = new Date(invoice.issueDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedDue = new Date(invoice.dueDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const bank = invoice.bankDetails;

  const handlePrintPdf = () => {
    const originalTitle = document.title;
    const fileName = invoice.invoiceNumber || `DG-INV-${invoice.id.slice(-6).toUpperCase()}`;
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
    <>
      {/* Print Stylesheet for razor-sharp multi-page 1-page & 2-page print rendering */}
      <style jsx global>{`
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
          /* Hide all page UI, navigation, buttons, top bars */
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
      `}</style>

      <div style={{ background: "#FAF8F5", minHeight: "100vh", padding: "32px 16px" }}>
        
        {/* Top Floating Control Bar (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            maxWidth: "840px",
            margin: "0 auto 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            padding: "12px 18px",
            background: "#FFFFFF",
            border: "1px solid #E8E4DC",
            borderRadius: "14px",
            boxShadow: "0 4px 20px -8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href="/"
              style={{
                fontFamily: "monospace",
                fontSize: "12.5px",
                color: "#726C5C",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ← DigiGrantha Public Site
            </Link>
            <span style={{ color: "#E8E4DC" }}>|</span>
            <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#17150F", fontWeight: 600 }}>
              {invoice.invoiceNumber}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handlePrintPdf}
              style={{
                background: "#17150F",
                color: "#FAF8F5",
                border: "none",
                padding: "8px 18px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>🖨️</span> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Main Printable Invoice Card */}
        <div
          id="printable-invoice-sheet"
          className="invoice-card"
          style={{
            maxWidth: "840px",
            margin: "0 auto",
            background: "#FFFFFF",
            border: "1px solid #E8E4DC",
            borderRadius: "18px",
            padding: "48px 44px",
            boxShadow: "0 20px 48px -20px rgba(23, 21, 15, 0.12)",
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid #17150F",
              paddingBottom: "24px",
              marginBottom: "32px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <Link
                href="/"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "34px",
                  fontWeight: "bold",
                  color: "#17150F",
                  textDecoration: "none",
                  letterSpacing: "-0.02em",
                }}
              >
                DigiGrantha<span style={{ color: "#75801F" }}>.</span>
              </Link>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#726C5C", marginTop: "4px" }}>
                Bespoke Design &amp; Software Studio · digigrantha.com
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: isPaid ? "#dcfce7" : isOverdue ? "#fee2e2" : "#fef3c7",
                    color: isPaid ? "#166534" : isOverdue ? "#991b1b" : "#92400e",
                  }}
                >
                  {isPaid ? "PAID" : isOverdue ? "OVERDUE" : "PAYMENT INFO"}
                </span>
              </div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", color: "#17150F" }}>
                TAX INVOICE
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#726C5C", marginTop: "2px" }}>
                {invoice.invoiceNumber}
              </div>
            </div>
          </div>

          {/* Meta Information: Billed By & Billed To */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "28px",
              paddingBottom: "28px",
              marginBottom: "28px",
              borderBottom: "1px solid #E8E4DC",
            }}
          >
            {/* Left: Billed To */}
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#75801F", letterSpacing: "0.06em", marginBottom: "8px" }}>
                Invoice Billed To
              </div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "#17150F" }}>
                {invoice.clientName}
              </div>
              {invoice.clientCompany && (
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#4A463B", marginTop: "2px" }}>
                  {invoice.clientCompany}
                </div>
              )}
              {invoice.clientAddress && (
                <div style={{ fontSize: "13px", color: "#726C5C", marginTop: "4px", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                  {invoice.clientAddress}
                </div>
              )}
              {invoice.clientGstin && (
                <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#17150F", marginTop: "6px" }}>
                  <strong>GSTIN / Tax ID:</strong> {invoice.clientGstin}
                </div>
              )}
              <div style={{ fontSize: "13px", color: "#726C5C", marginTop: "6px" }}>
                ✉ {invoice.clientEmail}
                {invoice.clientPhone && ` · 📞 ${invoice.clientPhone}`}
              </div>
            </div>

            {/* Right: Dates & Project Overview */}
            <div style={{ background: "#FAF8F5", padding: "18px 20px", borderRadius: "12px", border: "1px solid #E8E4DC" }}>
              <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#75801F", letterSpacing: "0.06em", marginBottom: "8px" }}>
                Payment Schedule &amp; Project
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", marginBottom: "6px" }}>
                <span style={{ color: "#726C5C" }}>Issue Date:</span>
                <strong style={{ color: "#17150F" }}>{formattedIssue}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", marginBottom: "6px" }}>
                <span style={{ color: "#726C5C" }}>Due Date:</span>
                <strong style={{ color: isOverdue ? "#991b1b" : "#17150F" }}>{formattedDue}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", marginBottom: "6px" }}>
                <span style={{ color: "#726C5C" }}>Project Deliverable:</span>
                <strong style={{ color: "#17150F", textAlign: "right" }}>{invoice.projectTitle}</strong>
              </div>
              {invoice.overview && (
                <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px dashed #E8E4DC", fontSize: "12px", color: "#726C5C", lineHeight: 1.45 }}>
                  {invoice.overview}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: "32px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #17150F" }}>
                  <th style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "11.5px", textTransform: "uppercase", color: "#726C5C", width: "8%" }}>
                    #
                  </th>
                  <th style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "11.5px", textTransform: "uppercase", color: "#726C5C", width: "52%" }}>
                    Description
                  </th>
                  <th style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "11.5px", textTransform: "uppercase", color: "#726C5C", textAlign: "center", width: "10%" }}>
                    Qty
                  </th>
                  <th style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "11.5px", textTransform: "uppercase", color: "#726C5C", textAlign: "right", width: "15%" }}>
                    Rate
                  </th>
                  <th style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "11.5px", textTransform: "uppercase", color: "#726C5C", textAlign: "right", width: "15%" }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr key={item.id || index} style={{ borderBottom: "1px solid #E8E4DC" }}>
                    <td style={{ padding: "14px 12px", fontFamily: "monospace", fontSize: "12.5px", color: "#726C5C", verticalAlign: "top" }}>
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td style={{ padding: "14px 12px", verticalAlign: "top" }}>
                      <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#17150F" }}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: "12.5px", color: "#726C5C", marginTop: "3px", lineHeight: 1.5 }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 12px", fontFamily: "monospace", fontSize: "13.5px", color: "#4A463B", textAlign: "center", verticalAlign: "top" }}>
                      {item.quantity || 1}
                    </td>
                    <td style={{ padding: "14px 12px", fontFamily: "monospace", fontSize: "13.5px", color: "#4A463B", textAlign: "right", verticalAlign: "top" }}>
                      {formatAmt(item.rate)}
                    </td>
                    <td style={{ padding: "14px 12px", fontFamily: "monospace", fontSize: "14px", fontWeight: 600, color: "#17150F", textAlign: "right", verticalAlign: "top" }}>
                      {formatAmt(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations & Summary Section */}
            <div
              className="keep-together"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "18px",
              }}
            >
              <div style={{ width: "100%", maxWidth: "340px", background: "#FAF8F5", padding: "16px 20px", borderRadius: "12px", border: "1px solid #E8E4DC" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", color: "#726C5C", marginBottom: "8px" }}>
                  <span>Subtotal:</span>
                  <span style={{ fontFamily: "monospace" }}>{formatAmt(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", color: "#75801F", marginBottom: "8px" }}>
                    <span>Discount:</span>
                    <span style={{ fontFamily: "monospace" }}>- {formatAmt(invoice.discount)}</span>
                  </div>
                )}
                {invoice.taxRate > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", color: "#726C5C", marginBottom: "8px" }}>
                    <span>GST / Tax ({invoice.taxRate}%):</span>
                    <span style={{ fontFamily: "monospace" }}>+ {formatAmt(invoice.taxAmount)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "19px",
                    fontWeight: "bold",
                    color: "#17150F",
                    paddingTop: "12px",
                    borderTop: "2px solid #17150F",
                    marginTop: "8px",
                  }}
                >
                  <span>Total Due:</span>
                  <span style={{ color: "#75801F", fontFamily: "monospace" }}>{formatAmt(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Wire Details & Remittance (Kept together on page break) */}
          <div
            className="keep-together"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
              padding: "24px",
              background: "#FAF8F5",
              border: "1px solid #E8E4DC",
              borderRadius: "14px",
              marginBottom: "28px",
            }}
          >
            {/* Wire Details */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#75801F", letterSpacing: "0.06em", fontWeight: 700 }}>
                  Bank Details
                </div>
                <button
                  type="button"
                  className="no-print"
                  onClick={handleCopyBank}
                  style={{
                    background: "none",
                    border: "1px solid #E8E4DC",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    padding: "3px 8px",
                    cursor: "pointer",
                    color: copiedBank ? "#166534" : "#726C5C",
                  }}
                >
                  {copiedBank ? "✓ Copied Details" : "Copy Bank Details"}
                </button>
              </div>

              <div style={{ fontSize: "13px", color: "#4A463B", lineHeight: 1.6 }}>
                <div><span style={{ color: "#726C5C" }}>Receiver / Beneficiary:</span> <strong>{bank?.accountName || "DigiGrantha"}</strong></div>
                <div><span style={{ color: "#726C5C" }}>Bank Name:</span> <strong>{bank?.bankName || "HDFC Bank"}</strong></div>
                <div><span style={{ color: "#726C5C" }}>A/C Number:</span> <strong style={{ fontFamily: "monospace" }}>{bank?.accountNumber || "—"}</strong></div>
                <div><span style={{ color: "#726C5C" }}>IFSC Code:</span> <strong style={{ fontFamily: "monospace" }}>{bank?.ifscCode || "—"}</strong></div>
                {bank?.branchName && (
                  <div><span style={{ color: "#726C5C" }}>Branch:</span> <strong>{bank.branchName}</strong></div>
                )}
                {bank?.swiftCode && (
                  <div><span style={{ color: "#726C5C" }}>SWIFT (USD):</span> <strong style={{ fontFamily: "monospace" }}>{bank.swiftCode}</strong></div>
                )}
              </div>
            </div>

            {/* UPI & Instant Payment */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#75801F", letterSpacing: "0.06em", fontWeight: 700 }}>
                  Instant UPI &amp; Digital Transfer
                </div>
                {bank?.upiId && (
                  <button
                    type="button"
                    className="no-print"
                    onClick={handleCopyUpi}
                    style={{
                      background: "none",
                      border: "1px solid #E8E4DC",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      padding: "3px 8px",
                      cursor: "pointer",
                      color: copiedUpi ? "#166534" : "#726C5C",
                    }}
                  >
                    {copiedUpi ? "✓ Copied UPI" : "Copy UPI ID"}
                  </button>
                )}
              </div>

              {bank?.upiId ? (
                <div style={{ background: "#FFFFFF", padding: "12px 14px", borderRadius: "8px", border: "1px solid #E8E4DC", marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#726C5C", fontFamily: "monospace" }}>VPA / UPI ID</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#17150F", fontFamily: "monospace", marginTop: "2px" }}>
                    {bank.upiId}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: "13px", color: "#726C5C" }}>Direct bank transfer accepted via NEFT / RTGS / IMPS.</div>
              )}

              {invoice.paymentTerms && (
                <div style={{ fontSize: "12px", color: "#726C5C", lineHeight: 1.5 }}>
                  <strong>Payment Terms:</strong> {invoice.paymentTerms}
                </div>
              )}
            </div>
          </div>

          {/* Notes & Authorized Studio Sign-off */}
          <div
            className="keep-together"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: "1px solid #E8E4DC",
              paddingTop: "24px",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ maxWidth: "480px" }}>
              <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#726C5C", marginBottom: "4px" }}>
                Notes
              </div>
              <div style={{ fontSize: "12.5px", color: "#726C5C", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                {invoice.notes || "Thank you for partnering with DigiGrantha."}
              </div>
            </div>

            <div style={{ textAlign: "right", minWidth: "180px" }}>
              <div style={{ height: "48px", display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                <img
                  src={DIGITAL_SIGNATURE_SRC}
                  alt="Authorized Signature"
                  style={{ maxHeight: "46px", maxWidth: "160px", objectFit: "contain", mixBlendMode: "multiply" }}
                />
              </div>
              <div style={{ borderTop: "1px solid #17150F", width: "160px", marginLeft: "auto", margin: "4px 0 4px auto" }} />
              <div style={{ fontFamily: "monospace", fontSize: "10.5px", color: "#726C5C", textTransform: "uppercase" }}>
                Authorized Signature
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
