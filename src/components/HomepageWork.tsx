"use client";

import { useState } from "react";
import Link from "next/link";
import { CaseStudyRecord } from "@/lib/case-studies-db";
import CaseStudyModal from "@/components/CaseStudyModal";

interface HomepageWorkProps {
  initialCaseStudies?: CaseStudyRecord[];
  initialProjects?: any[];
}

export default function HomepageWork({
  initialCaseStudies,
  initialProjects,
}: HomepageWorkProps) {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudyRecord | null>(null);

  // Use initialCaseStudies if provided, or fallback to initialProjects
  const rawItems: (CaseStudyRecord | any)[] =
    initialCaseStudies ||
    (initialProjects || []).map((p, idx) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      oneLiner: p.homepageOneLiner || p.oneLiner,
      resultStat: p.result,
      briefDescription: p.mobilePreview || p.oneLiner,
      tags: p.tags,
      liveUrl: null,
      status: p.status || "live",
      featured: p.featured ?? true,
      displayOrder: idx + 1,
    }));

  const featuredCaseStudies = rawItems.filter((item) => item.featured);

  return (
    <section className="work" id="work" aria-labelledby="work-heading">
      <div className="wrap">
        <div className="section-label reveal" id="work-heading">
          What we&apos;ve shipped
        </div>
        <h2 className="section-title reveal">
          Real products. Real numbers. Tap any project to see the receipts.
        </h2>

        <div className="work-list reveal" role="feed" aria-label="Featured case studies">
          {featuredCaseStudies.map((study, idx) => {
            const indexStr = String(idx + 1).padStart(2, "0");
            const slug = study.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

            return (
              <div
                key={study.id}
                className="work-row"
                data-preview={slug}
                tabIndex={0}
                role="button"
                aria-haspopup="dialog"
                aria-label={`Case study ${study.name}: ${study.oneLiner}`}
                onClick={() => setSelectedCaseStudy(study)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedCaseStudy(study);
                  }
                }}
              >
                <div className="idx" aria-hidden="true">
                  {indexStr}
                </div>
                <div>
                  <div className="wname">
                    {study.name}
                    {study.status === "in-progress" && (
                      <span className="status-pill" style={{ marginLeft: "8px" }}>
                        In progress
                      </span>
                    )}
                  </div>
                  <div className="wline">{study.oneLiner}</div>
                  <div className="tags-row" style={{ marginTop: "8px" }}>
                    {study.tags &&
                      study.tags.map((tag: string) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="wresult">{study.resultStat}</div>
              </div>
            );
          })}
        </div>

        <div className="view-all reveal">
          <Link href="/work" aria-label="View all shipped projects archive">
            View all work →
          </Link>
        </div>
      </div>

      <CaseStudyModal
        caseStudy={selectedCaseStudy}
        onClose={() => setSelectedCaseStudy(null)}
      />
    </section>
  );
}
