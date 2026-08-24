"use client";

import { useState } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "What happens after I send the brief?",
    answer:
      "We read it ourselves — no sales team in between — and reply within a day with an honest yes, no, or a couple of clarifying questions.",
  },
  {
    id: "faq-2",
    question: "Why should I trust a young team?",
    answer:
      "Look at the work above — real, live products with real numbers, not mockups. Judge us on what we've shipped, not on how long we've existed.",
  },
  {
    id: "faq-3",
    question: "What do you actually build?",
    answer:
      "The whole product — design, frontend, backend, and the infrastructure that keeps it running after launch.",
  },
];

export default function FaqSection() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="faq">
      <div className="wrap">
        <div className="section-label reveal">Quick answers</div>
        <div className="faq-list reveal">
          {faqs.map((faq) => {
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
                  <span className="plus">+</span>
                </button>
                <div className="faq-a">
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
