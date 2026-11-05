"use client";

import { useEffect, useState, useCallback } from "react";

interface FullScreenPhotoViewerProps {
  isOpen: boolean;
  projectName: string;
  photos: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function FullScreenPhotoViewer({
  isOpen,
  projectName,
  photos,
  initialIndex = 0,
  onClose,
}: FullScreenPhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !photos || photos.length === 0) return null;

  return (
    <div
      className="photo-lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${projectName} photo gallery`}
    >
      {/* Top Bar with Project Name, Counter & Close Button */}
      <div className="photo-lightbox-topbar" onClick={(e) => e.stopPropagation()}>
        <div className="photo-lightbox-title">
          <span className="photo-lightbox-badge">{projectName}</span>
          <span className="photo-lightbox-counter">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>
        <button
          type="button"
          className="photo-lightbox-close"
          onClick={onClose}
          aria-label="Close photo gallery"
          title="Close (or click anywhere outside image)"
        >
          ✕
        </button>
      </div>

      {/* Main Full-Screen Display Area */}
      <div className="photo-lightbox-content">
        {/* Previous Button (if multiple photos) */}
        {photos.length > 1 && (
          <button
            type="button"
            className="photo-lightbox-nav prev"
            onClick={handlePrev}
            aria-label="Previous photo"
            title="Previous (Left Arrow)"
          >
            ‹
          </button>
        )}

        {/* The active full screen image - clicking ON the image stops propagation, outside closes */}
        <div
          className="photo-lightbox-img-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            key={photos[currentIndex]}
            src={photos[currentIndex]}
            alt={`${projectName} screenshot ${currentIndex + 1}`}
            className="photo-lightbox-img"
          />
        </div>

        {/* Next Button (if multiple photos) */}
        {photos.length > 1 && (
          <button
            type="button"
            className="photo-lightbox-nav next"
            onClick={handleNext}
            aria-label="Next photo"
            title="Next (Right Arrow)"
          >
            ›
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip - shows all photos in the project */}
      {photos.length > 1 && (
        <div
          className="photo-lightbox-thumbs-bar"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="photo-lightbox-thumbs-scroll">
            {photos.map((photo, idx) => (
              <button
                key={photo + idx}
                type="button"
                className={`photo-lightbox-thumb ${idx === currentIndex ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`View photo ${idx + 1}`}
              >
                <img
                  src={photo}
                  alt={`${projectName} thumbnail ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
