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
    title: "Websites that explain themselves",
    desc: "Landing pages and marketing sites that make sense at a glance, with no call needed to decode them.",
  },
  {
    idx: "02",
    title: "Products people come back to",
    desc: "Web apps, dashboards, and platforms, designed and engineered end to end, not handed off halfway.",
  },
  {
    idx: "03",
    title: "Intelligent platforms",
    desc: "From live trading systems to enterprise intelligence portals, we build data-heavy, logic-heavy products where reliability is non-negotiable.",
  },
  {
    idx: "04",
    title: "We stay after launch",
    desc: "Hosting, monitoring, and the fix when something breaks at 2am are part of the relationship, not an upsell.",
  },
  {
    idx: "05",
    title: "Progress you can see",
    desc: "No black boxes and no chasing for updates. A private portal gives you real-time phase tracking, direct access to your developers, and one-click sign-off at every milestone.",
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
          Why you should choose DigiGrantha
        </div>
        <h2 className="section-title reveal">
          Not a menu of &quot;services.&quot; Five things we&apos;re genuinely good at.
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
