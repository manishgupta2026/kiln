"use client";

import { useState } from "react";

interface Offering {
  idx: string;
  title: string;
  desc: string;
}

const offerings: Offering[] = [
  {
    idx: "01",
    title: "Marketing sites that don't need a caption",
    desc: "Landing pages and marketing sites built to be understood at a glance — not explained on a call afterward.",
  },
  {
    idx: "02",
    title: "Products people open twice",
    desc: "Full web apps, dashboards, and platforms — designed and engineered end to end, not handed off halfway.",
  },
  {
    idx: "03",
    title: "The unglamorous stuff",
    desc: "Hosting, monitoring, the fix at 2am when something breaks. Included in the relationship, not upsold later.",
  },
  {
    idx: "04",
    title: "A partner, not a vendor",
    desc: "Ongoing work for teams who'll need us again next quarter — not just a one-time handoff.",
  },
];

export default function OfferingsSection() {
  const [openIndices, setOpenIndices] = useState<Record<string, boolean>>({});

  const toggleIndex = (idx: string) => {
    setOpenIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <section className="offerings" id="offerings" aria-labelledby="offerings-heading">
      <div className="wrap">
        <div className="section-label reveal" id="offerings-heading">
          What we actually build
        </div>
        <h2 className="section-title reveal">
          Not a menu of &quot;services.&quot; Four things we&apos;re genuinely good at.
        </h2>

        <div className="offer-list reveal" role="list">
          {offerings.map((item) => {
            const isOpen = !!openIndices[item.idx];
            return (
              <div
                key={item.idx}
                className={`offer-row ${isOpen ? "open" : ""}`}
                tabIndex={0}
                role="listitem"
                aria-expanded={isOpen}
                aria-label={`${item.idx}: ${item.title}`}
                onClick={() => toggleIndex(item.idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleIndex(item.idx);
                  }
                }}
              >
                <div className="idx" aria-hidden="true">{item.idx}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
