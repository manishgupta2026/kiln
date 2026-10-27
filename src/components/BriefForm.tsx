"use client";

import { useState, useEffect } from "react";

const TYPE_CHIPS = [
  { label: "Website", value: "Website" },
  { label: "Product or app", value: "Product / App" },
  { label: "UI / UX Design", value: "UI / UX Design" },
  { label: "Design System", value: "Design System" },
  { label: "Both (Design + Dev)", value: "Both" },
  { label: "Not sure yet", value: "Not sure yet" },
];

const BUDGET_CHIPS = [
  { label: "Under ₹50k", value: "Under ₹50k" },
  { label: "₹50k – ₹2L", value: "₹50k – ₹2L" },
  { label: "₹2L+", value: "₹2L+" },
  { label: "Let's talk", value: "Let's talk" },
];

export default function BriefForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [projectType, setProjectType] = useState<string>("Website");
  const [budget, setBudget] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const customEvent = e as CustomEvent<{
        description?: string;
        projectType?: string;
      }>;
      if (customEvent.detail) {
        if (customEvent.detail.description) {
          setDescription(customEvent.detail.description);
        }
        if (customEvent.detail.projectType) {
          setProjectType(customEvent.detail.projectType);
        }
      }
    };

    window.addEventListener("digigrantha-prefill-brief", handlePrefill);
    return () => {
      window.removeEventListener("digigrantha-prefill-brief", handlePrefill);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          projectType: projectType || "Not sure yet",
          budget: budget || null,
          description: description || "No additional description provided.",
          website: honeypot, // Honeypot anti-spam
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit brief. Please try again.");
      }

      setIsSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setDescription("");
      setBudget(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="brief-form reveal" id="briefForm" onSubmit={handleSubmit}>
      {/* Honeypot field for spam prevention */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="form_website">Website</label>
        <input
          type="text"
          id="form_website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="fName">Name</label>
          <input
            type="text"
            id="fName"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="fEmail">Email</label>
          <input
            type="email"
            id="fEmail"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: "18px" }}>
        <div className="field field-full">
          <label htmlFor="fPhone">Phone / WhatsApp (for discovery call &amp; meet)</label>
          <input
            type="tel"
            id="fPhone"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="field field-full" style={{ marginBottom: "26px" }}>
        <label>What are you building?</label>
        <div className="chip-row" id="briefTypeChips">
          {TYPE_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`chip ${projectType === chip.value ? "active" : ""}`}
              data-val={chip.value}
              onClick={() => setProjectType(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field field-full" style={{ marginBottom: "26px" }}>
        <label>Budget</label>
        <div className="chip-row" id="briefBudgetChips">
          {BUDGET_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`chip ${budget === chip.value ? "active" : ""}`}
              data-val={chip.value}
              onClick={() => setBudget((prev) => (prev === chip.value ? null : chip.value))}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field field-full" style={{ marginBottom: "8px" }}>
        <label htmlFor="fDesc">Explain it like we&apos;ve never heard of it</label>
        <textarea
          id="fDesc"
          placeholder="What it does, who it's for, why now."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="brief-submit">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send the brief →"}
        </button>
        <div className={`form-success ${isSuccess ? "show" : ""}`} id="formSuccess">
          Got it — we read every one of these ourselves. Expect a reply within a day to schedule our discovery call.
        </div>
        {errorMessage && (
          <div className="form-error show" id="formError">
            {errorMessage}
          </div>
        )}
      </div>
    </form>
  );
}
