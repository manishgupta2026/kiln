"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const thumbsScrollRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, photos.length - 1)));
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex, photos.length]);

  // Keep active thumbnail in view
  useEffect(() => {
    if (!isOpen || !thumbsScrollRef.current) return;
    const container = thumbsScrollRef.current;
    const activeThumb = container.children[currentIndex] as HTMLElement | undefined;
    if (activeThumb) {
      const containerLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const thumbLeft = activeThumb.offsetLeft;
      const thumbWidth = activeThumb.clientWidth;

      if (thumbLeft < containerLeft || thumbLeft + thumbWidth > containerLeft + containerWidth) {
        container.scrollTo({
          left: thumbLeft - containerWidth / 2 + thumbWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex, isOpen]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  const toggleZoom = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsZoomed((prev) => !prev);
  }, []);

  const toggleFullscreen = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "z" || e.key === "Z") {
        toggleZoom();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext, isZoomed, toggleZoom]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    touchStartXRef.current = null;
  };

  if (!isOpen || !mounted || !photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return createPortal(
    <div
      className="photo-lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${projectName} showcase`}
    >
      {/* Top Header Bar */}
      <div className="photo-lightbox-topbar" onClick={(e) => e.stopPropagation()}>
        <div className="photo-lightbox-left-meta">
          <span className="photo-lightbox-badge">{projectName}</span>
          <span className="photo-lightbox-counter" aria-live="polite">
            {currentIndex + 1} of {photos.length}
          </span>
        </div>

        {/* Action Controls Group */}
        <div className="photo-lightbox-actions">
          {/* Zoom Toggle */}
          <button
            type="button"
            className={`photo-lightbox-tool-btn ${isZoomed ? "active" : ""}`}
            onClick={toggleZoom}
            aria-label={isZoomed ? "Reset zoom (Fit to screen)" : "Zoom in (100% natural resolution)"}
            title={isZoomed ? "Fit to screen (Z)" : "Zoom 100% (Z)"}
          >
            {isZoomed ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            )}
            <span className="tool-label">{isZoomed ? "Fit" : "Zoom"}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="photo-lightbox-tool-btn hide-mobile"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            title="Toggle full screen"
          >
            {isFullscreen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
          </button>

          {/* Keyboard Hint Chip */}
          <div className="photo-lightbox-hint-chip hide-mobile" title="Keyboard Shortcuts">
            <span>← →</span>
            <span className="hint-sep">•</span>
            <span>ESC</span>
          </div>

          {/* Close Button */}
          <button
            type="button"
            className="photo-lightbox-close"
            onClick={onClose}
            aria-label="Close photo gallery"
            title="Close (ESC)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Stage Display Area */}
      <div
        className="photo-lightbox-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            type="button"
            className="photo-lightbox-nav prev"
            onClick={handlePrev}
            aria-label="Previous photo (Left Arrow)"
            title="Previous (Left Arrow)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Active Screenshot Wrap */}
        <div
          className={`photo-lightbox-img-wrap ${isZoomed ? "zoomed" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom();
          }}
          title={isZoomed ? "Click to fit screen" : "Click to zoom into 100% natural resolution"}
        >
          <img
            key={currentPhoto}
            src={currentPhoto}
            alt={`${projectName} screen ${currentIndex + 1}`}
            className="photo-lightbox-img"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            type="button"
            className="photo-lightbox-nav next"
            onClick={handleNext}
            aria-label="Next photo (Right Arrow)"
            title="Next (Right Arrow)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {photos.length > 1 && (
        <div
          className="photo-lightbox-thumbs-bar"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="photo-lightbox-thumbs-scroll" ref={thumbsScrollRef}>
            {photos.map((photo, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={photo + idx}
                  type="button"
                  className={`photo-lightbox-thumb ${isActive ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(false);
                    setCurrentIndex(idx);
                  }}
                  aria-label={`View screen ${idx + 1}`}
                  title={`Screen ${idx + 1}`}
                >
                  <img
                    src={photo}
                    alt={`${projectName} thumb ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="thumb-idx-badge">{idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
