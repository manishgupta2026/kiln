"use client";

import { useState } from "react";
import { FAQS } from "@/lib/faqs";
export { FAQS, type FaqItem } from "@/lib/faqs";

export default function FaqSection() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="faq" id="faq" aria-labelledby="faq-heading">
      <div className="wrap">
        <div className="section-label reveal" id="faq-heading">
          Frequently Answered Questions
        </div>
        <h2 className="section-title reveal" style={{ marginBottom: "28px" }}>
          Clear, honest answers about how we build.
        </h2>
        <div className="faq-list reveal" role="region" aria-label="Frequently Asked Questions">
          {FAQS.map((faq) => {
            const isOpen = !!openIds[faq.id];
            return (
              <div key={faq.id} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="faq-q"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span className="plus" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <div className="faq-a" style={{ display: isOpen ? "block" : "none" }}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
