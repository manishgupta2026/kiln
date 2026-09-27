"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ProjectQuotationRecord } from "@/lib/quotations-db";

export default function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [quote, setQuote] = useState<ProjectQuotationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuote() {
      try {
        setLoading(true);
        const res = await fetch(`/api/quotations/${token}`);
        const data = await res.json();
        if (data.success) {
          setQuote(data.data);
        } else {
          setError(data.error || "Quotation not found or link has expired.");
        }
      } catch (err: any) {
        setError("Failed to load quotation.");
      } finally {
        setLoading(false);
      }
    }
    loadQuote();
  }, [token]);

  const handleAccept = async () => {
    if (!confirm("Are you ready to accept this project proposal and proceed to build?")) {
      return;
    }
    setAccepting(true);
    try {
      const res = await fetch(`/api/quotations/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACCEPT" }),
      });
      const data = await res.json();
      if (data.success) {
        setQuote(data.data);
        setActionMessage("✓ Proposal accepted! Our team has been notified and will email you with your client portal access and invoice.");
      } else {
        alert(data.error || "Failed to update status.");
      }
    } catch (err: any) {
      alert("Error accepting proposal: " + err.message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
        Loading project quotation...
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "32px", marginBottom: "12px" }}>Quotation Unavailable</h1>
        <p style={{ color: "var(--muted)", maxWidth: "460px", marginBottom: "24px" }}>
          {error || "This quotation could not be loaded. Please check the URL or contact Kiln Studio."}
        </p>
        <Link href="/" className="btn-primary">
          Back to Kiln Homepage →
        </Link>
      </div>
    );
  }

  const formatAmt = (num: number) => {
    if (quote.currency === "INR") {
      return `₹${num.toLocaleString("en-IN")}`;
    }
    return `$${num.toLocaleString("en-US")}`;
  };

  const isAccepted = quote.status === "ACCEPTED";
  const validUntilFormatted = new Date(quote.validUntil).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ background: "#FAF8F5", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto", background: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: "20px", padding: "48px 44px", boxShadow: "0 20px 50px -20px rgba(23, 21, 15, 0.12)" }}>
        
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #17150F", paddingBottom: "24px", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Link href="/" style={{ fontFamily: "Georgia, serif", fontSize: "34px", fontWeight: "bold", color: "#17150F", textDecoration: "none" }}>
              Kiln<span style={{ color: "#75801F" }}>.</span>
            </Link>
            <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#726C5C", marginTop: "4px" }}>
              Bespoke Design &amp; Software Studio
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#726C5C", letterSpacing: "0.06em" }}>
              Formal Quotation
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: "bold", color: "#17150F", marginTop: "2px" }}>
              {quote.quotationNumber}
            </div>
            <div style={{ marginTop: "6px" }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  background: isAccepted ? "#dcfce7" : quote.status === "SENT" ? "#e0e7ff" : "#eae7dd",
                  color: isAccepted ? "#166534" : quote.status === "SENT" ? "#3730a3" : "#726C5C",
                }}
              >
                {quote.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action message */}
        {actionMessage && (
          <div style={{ background: "#dcfce7", color: "#166534", padding: "14px 18px", borderRadius: "10px", fontFamily: "monospace", fontSize: "13px", marginBottom: "24px" }}>
            {actionMessage}
          </div>
        )}

        {/* Client & Project Header Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", background: "#FAF8F5", padding: "20px 24px", borderRadius: "14px", border: "1px solid #E8E4DC", marginBottom: "32px" }}>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#726C5C" }}>Prepared For:</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#17150F", marginTop: "3px" }}>{quote.clientName}</div>
            {quote.clientCompany && <div style={{ fontSize: "13.5px", color: "#726C5C" }}>{quote.clientCompany}</div>}
            <div style={{ fontSize: "13px", color: "#75801F", marginTop: "2px" }}>{quote.clientEmail}</div>
            {quote.clientPhone && <div style={{ fontSize: "12.5px", color: "#726C5C" }}>{quote.clientPhone}</div>}
          </div>

          <div>
            <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#726C5C" }}>Project &amp; Timeline:</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#17150F", marginTop: "3px" }}>{quote.projectTitle}</div>
            <div style={{ fontSize: "13.5px", color: "#726C5C", marginTop: "2px" }}>Timeline: <strong>{quote.timeline}</strong></div>
            <div style={{ fontSize: "12.5px", color: "#726C5C", marginTop: "2px" }}>Valid Until: <strong>{validUntilFormatted}</strong></div>
          </div>
        </div>

        {/* Scope Overview */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 500, marginBottom: "8px", color: "#17150F" }}>
            Executive Scope &amp; Architecture
          </h2>
          <p style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#4A463B", whiteSpace: "pre-line" }}>
            {quote.overview}
          </p>
        </div>

        {/* Line Items Table */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 500, marginBottom: "14px", color: "#17150F" }}>
            Scope Deliverables &amp; Milestones
          </h2>

          <div style={{ border: "1px solid #E8E4DC", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "#FAF8F5", borderBottom: "1.5px solid #17150F" }}>
                <tr>
                  <th style={{ padding: "12px 16px", fontSize: "11.5px", fontFamily: "monospace", textTransform: "uppercase", color: "#726C5C" }}>Deliverable &amp; Specifications</th>
                  <th style={{ padding: "12px 16px", fontSize: "11.5px", fontFamily: "monospace", textTransform: "uppercase", color: "#726C5C", textAlign: "center", width: "110px" }}>Estimated Effort</th>
                  <th style={{ padding: "12px 16px", fontSize: "11.5px", fontFamily: "monospace", textTransform: "uppercase", color: "#726C5C", textAlign: "right", width: "130px" }}>Investment</th>
                </tr>
              </thead>
              <tbody>
                {quote.lineItems.map((item, idx) => (
                  <tr key={item.id || idx} style={{ borderBottom: "1px solid #E8E4DC" }}>
                    <td style={{ padding: "16px 16px", verticalAlign: "top" }}>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#17150F" }}>
                        {idx + 1}. {item.title}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: "13.5px", color: "#726C5C", marginTop: "4px", lineHeight: "1.5" }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 16px", verticalAlign: "top", textAlign: "center", fontFamily: "monospace", fontSize: "13px", color: "#726C5C" }}>
                      {item.hours ? `${item.hours} hrs` : "Included"}
                    </td>
                    <td style={{ padding: "16px 16px", verticalAlign: "top", textAlign: "right", fontSize: "15px", fontWeight: 600, color: "#17150F" }}>
                      {formatAmt(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div style={{ padding: "20px 24px", background: "#FAF8F5", borderTop: "1px solid #E8E4DC" }}>
              <div style={{ maxWidth: "340px", marginLeft: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#726C5C", marginBottom: "8px" }}>
                  <span>Subtotal:</span>
                  <span>{formatAmt(quote.subtotal)}</span>
                </div>
                {quote.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#75801F", marginBottom: "8px" }}>
                    <span>Studio Partner Discount:</span>
                    <span>- {formatAmt(quote.discount)}</span>
                  </div>
                )}
                {quote.taxRate > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#726C5C", marginBottom: "8px" }}>
                    <span>GST / Tax ({quote.taxRate}%):</span>
                    <span>+ {formatAmt(quote.taxAmount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "bold", color: "#17150F", borderTop: "2px solid #17150F", paddingTop: "12px", marginTop: "8px" }}>
                  <span>Total Investment:</span>
                  <span style={{ color: "#75801F" }}>{formatAmt(quote.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms & Tech Stack */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <div style={{ background: "#FAF8F5", padding: "18px 22px", borderRadius: "12px", border: "1px solid #E8E4DC" }}>
            <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#726C5C", marginBottom: "6px" }}>
              Payment Milestones
            </div>
            <div style={{ fontSize: "14.5px", fontWeight: 500, color: "#17150F" }}>
              {quote.paymentSchedule}
            </div>
          </div>

          <div style={{ background: "#FAF8F5", padding: "18px 22px", borderRadius: "12px", border: "1px solid #E8E4DC" }}>
            <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#726C5C", marginBottom: "6px" }}>
              Engineered With
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
              {(quote.techStack || []).map((tech, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11.5px",
                    background: "#EEF0DD",
                    color: "#75801F",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontWeight: 500,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Terms & Inclusions */}
        {quote.termsAndNotes && (
          <div style={{ background: "#FAF8F5", padding: "18px 22px", borderRadius: "12px", border: "1px solid #E8E4DC", marginBottom: "36px" }}>
            <div style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", color: "#726C5C", marginBottom: "8px" }}>
              Terms, Warranty &amp; Inclusions
            </div>
            <div style={{ fontSize: "13.5px", lineHeight: "1.6", color: "#4A463B", whiteSpace: "pre-line" }}>
              {quote.termsAndNotes}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", borderTop: "2px solid #17150F", paddingTop: "28px" }}>
          <div>
            <div style={{ fontSize: "13px", color: "#726C5C" }}>Questions regarding this estimate?</div>
            <a href={`mailto:team@kiln.design?subject=Question on ${quote.quotationNumber}`} style={{ fontSize: "14px", color: "#17150F", fontWeight: 600, textDecoration: "underline" }}>
              Reply via Email →
            </a>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                fontFamily: "monospace",
                fontSize: "13px",
                background: "none",
                border: "1px solid #17150F",
                color: "#17150F",
                padding: "12px 20px",
                borderRadius: "999px",
                cursor: "pointer",
              }}
            >
              Print / Save PDF 🖨
            </button>

            {!isAccepted && (
              <button
                type="button"
                onClick={handleAccept}
                disabled={accepting}
                style={{
                  fontFamily: "monospace",
                  fontSize: "13.5px",
                  background: "#17150F",
                  color: "#FAF8F5",
                  padding: "12px 28px",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {accepting ? "Processing..." : "Accept Proposal & Proceed →"}
              </button>
            )}

            {isAccepted && (
              <div style={{ background: "#dcfce7", color: "#166534", fontFamily: "monospace", fontSize: "13px", padding: "10px 18px", borderRadius: "999px", fontWeight: 600 }}>
                ✓ Accepted
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
