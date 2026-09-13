"use client";

import { useEffect, useRef } from "react";
import { CaseStudyRecord } from "@/lib/case-studies-db";

interface CaseStudyModalProps {
  caseStudy: CaseStudyRecord | null;
  onClose: () => void;
}

export default function CaseStudyModal({ caseStudy, onClose }: CaseStudyModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!caseStudy) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [caseStudy, onClose]);

  if (!caseStudy) return null;

  return (
    <div
      className="case-study-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
    >
      <div className="case-study-modal" ref={modalRef}>
        <button
          type="button"
          className="case-study-close-btn"
          onClick={onClose}
          aria-label="Close case study details"
        >
          ✕
        </button>

        <div className="case-study-meta-row">
          <span className="case-study-category">{caseStudy.category}</span>
          {caseStudy.status === "in-progress" && (
            <span className="status-pill">In progress</span>
          )}
        </div>

        <h2 id="case-study-title" className="case-study-title">
          {caseStudy.name}
        </h2>

        <div className="case-study-stat-banner">
          <span className="case-study-stat-val">{caseStudy.resultStat}</span>
          <span className="case-study-stat-label">Verified outcome</span>
        </div>

        <div className="case-study-desc">{caseStudy.briefDescription}</div>

        {caseStudy.tags && caseStudy.tags.length > 0 && (
          <div className="case-study-tags-section">
            <div className="case-study-tags-label">Technologies &amp; Architecture</div>
            <div className="case-study-tags">
              {caseStudy.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {caseStudy.liveUrl ? (
          <div className="case-study-actions">
            <a
              href={caseStudy.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>Visit site</span>
              <span>→</span>
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
