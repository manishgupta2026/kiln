"use client";

import { useEffect, useRef } from "react";

export default function CursorTrail() {
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const trail = trailRef.current;
    if (!trail) return;

    let tx = 0;
    let ty = 0;
    let mx = 0;
    let my = 0;
    let animationFrameId: number;
    let isRunning = true;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      trail.classList.add("show");
    };

    const loop = () => {
      if (!isRunning) return;
      tx += (mx - tx) * 0.18;
      ty += (my - ty) * 0.18;
      trail.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
      animationFrameId = requestAnimationFrame(loop);
    };

    // Use event delegation for hover triggers on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("a") ||
          target.closest("button") ||
          target.closest(".offer-row") ||
          target.closest(".work-row") ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest(".chip"))
      ) {
        trail.classList.add("hover");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const related = e.relatedTarget as HTMLElement | null;
      if (
        target &&
        (target.closest("a") ||
          target.closest("button") ||
          target.closest(".offer-row") ||
          target.closest(".work-row") ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest(".chip"))
      ) {
        if (
          !related ||
          (!related.closest("a") &&
            !related.closest("button") &&
            !related.closest(".offer-row") &&
            !related.closest(".work-row") &&
            !related.closest("input") &&
            !related.closest("textarea") &&
            !related.closest(".chip"))
        ) {
          trail.classList.remove("hover");
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    loop();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return <div id="trail" ref={trailRef} />;
}
