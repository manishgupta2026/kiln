"use client";

import { useState, useMemo } from "react";
import { CaseStudyRecord } from "@/lib/case-studies-db";
import CaseStudyModal from "@/components/CaseStudyModal";

interface WorkFilterListProps {
  initialCaseStudies?: CaseStudyRecord[];
  initialProjects?: any[];
  initialFilter?: string;
}

export default function WorkFilterList({
  initialCaseStudies,
  initialProjects,
  initialFilter = "all",
}: WorkFilterListProps) {
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudyRecord | null>(null);

  // Normalize data to CaseStudyRecord
  const caseStudies: CaseStudyRecord[] = useMemo(() => {
    if (initialCaseStudies && initialCaseStudies.length > 0) {
      return initialCaseStudies;
    }
    return (initialProjects || []).map((p, idx) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      oneLiner: p.oneLiner,
      resultStat: p.result,
      briefDescription: p.mobilePreview || p.oneLiner,
      tags: p.tags || [],
      liveUrl: null,
      status: p.status || "live",
      featured: p.featured ?? true,
      displayOrder: idx + 1,
    }));
  }, [initialCaseStudies, initialProjects]);

  // Dynamically derive distinct category options present in the CaseStudy list
  const distinctCategories = useMemo(() => {
    const cats = new Set<string>();
    caseStudies.forEach((cs) => {
      if (cs.category && cs.category.trim()) {
        cats.add(cs.category.trim());
      }
    });
    return Array.from(cats);
  }, [caseStudies]);

  const filteredCaseStudies = useMemo(() => {
    return caseStudies.filter((item) => {
      if (activeFilter === "all") return true;
      return item.category.trim().toLowerCase() === activeFilter.trim().toLowerCase();
    });
  }, [caseStudies, activeFilter]);

  return (
    <>
      <div className="filters reveal" role="tablist" aria-label="Filter case studies by category">
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === "all"}
          className={`chip ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          All
        </button>

        {distinctCategories.map((cat) => {
          const isActive = activeFilter.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`chip ${isActive ? "active" : ""}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <section className="work-list reveal" aria-label="Case studies archive">
        <div className="wrap">
          {filteredCaseStudies.map((study, idx) => {
            const indexStr = String(idx + 1).padStart(2, "0");
            const slug = study.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

            return (
              <div
                key={study.id}
                className="work-row"
                data-cat={study.category}
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
                  <div className="tags-row" aria-label="Tags" style={{ marginTop: "8px" }}>
                    {study.tags &&
                      study.tags.map((tag) => (
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
      </section>

      <CaseStudyModal
        caseStudy={selectedCaseStudy}
        onClose={() => setSelectedCaseStudy(null)}
      />
    </>
  );
}
