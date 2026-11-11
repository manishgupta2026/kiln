"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CaseStudyRecord } from "@/lib/case-studies-db";
import { getPhotoMeta } from "@/lib/project-photos";

interface CaseStudyModalProps {
  caseStudy: CaseStudyRecord | null;
  onClose: () => void;
  onOpenPhotos?: (study: any, initialIndex?: number) => void;
}

export default function CaseStudyModal({ caseStudy, onClose, onOpenPhotos }: CaseStudyModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!caseStudy || !mounted) return null;

  const isCoppter =
    caseStudy.name.toLowerCase().includes("coppter") ||
    caseStudy.name.toLowerCase().includes("copter");

  return createPortal(
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
          {caseStudy.photos && caseStudy.photos.length > 0 && (
            <span className="case-study-photos-count-badge">
              📸 {caseStudy.photos.length} Interface Screens
            </span>
          )}
        </div>

        <h2 id="case-study-title" className="case-study-title">
          {caseStudy.name}
        </h2>

        {caseStudy.resultStat && (
          <div className="case-study-stat-banner">
            <span className="case-study-stat-val">{caseStudy.resultStat}</span>
            <span className="case-study-stat-label">Verified outcome</span>
          </div>
        )}

        <div className="case-study-desc">{caseStudy.briefDescription}</div>

        {/* Embedded Interactive Screenshot Filmstrip */}
        {caseStudy.photos && caseStudy.photos.length > 0 && (
          <div className="case-study-gallery-section">
            <div className="case-study-gallery-header">
              <div className="case-study-gallery-title-wrap">
                <span className="case-study-gallery-icon">📸</span>
                <h3 className="case-study-gallery-heading">Interface &amp; Product Screens</h3>
                <span className="case-study-gallery-count">{caseStudy.photos.length} screens</span>
              </div>
              {onOpenPhotos && (
                <button
                  type="button"
                  className="case-study-gallery-expand-all"
                  onClick={() => onOpenPhotos(caseStudy, 0)}
                  title="Expand to full-screen interactive lightbox"
                >
                  <span>Full-screen view ↗</span>
                </button>
              )}
            </div>

            <div className="case-study-gallery-filmstrip">
              {caseStudy.photos.map((photo, idx) => {
                const meta = getPhotoMeta(photo, idx, caseStudy.name);
                return (
                  <div
                    key={photo + idx}
                    className="case-study-gallery-card"
                    onClick={() => {
                      if (onOpenPhotos) {
                        onOpenPhotos(caseStudy, idx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (onOpenPhotos) onOpenPhotos(caseStudy, idx);
                      }
                    }}
                    aria-label={`View slide ${idx + 1}: ${meta.title}`}
                  >
                    <div className="case-study-gallery-img-box">
                      <img
                        src={photo}
                        alt={`${caseStudy.name} - ${meta.title}`}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="case-study-gallery-step-badge">{idx + 1}</span>
                      <div className="case-study-gallery-hover-cue">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                    </div>
                    <div className="case-study-gallery-info">
                      <span className="case-study-gallery-tag">{meta.tag}</span>
                      <h4 className="case-study-gallery-item-title">{meta.title}</h4>
                      <p className="case-study-gallery-item-desc">{meta.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

        {caseStudy.version1Url && caseStudy.version2Url ? (
          <div className="case-study-versions" style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1.5px solid var(--outline)" }}>
            <div style={{ fontFamily: "var(--body)", fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              Live Releases &amp; Evolution
            </div>
            <div className="case-study-actions" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <a
                href={caseStudy.version1Url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                title="Open 5e Serpraise Version 1 (Production)"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <span>View V1 ↗</span>
              </a>
              <a
                href={caseStudy.version2Url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                title="Open 5e Serpraise Version 2 (Latest Evolution)"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <span>View V2 ↗</span>
              </a>
            </div>
          </div>
        ) : !isCoppter && caseStudy.liveUrl ? (
          <div className="case-study-actions" style={{ marginTop: "24px" }}>
            <a
              href={caseStudy.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>Visit live site ↗</span>
            </a>
          </div>
        ) : caseStudy.photos && caseStudy.photos.length > 0 && onOpenPhotos ? (
          <div className="case-study-actions" style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onOpenPhotos(caseStudy, 0)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>View project photos ↗</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
