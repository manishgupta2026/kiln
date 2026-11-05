"use client";

import { useEffect, useRef } from "react";
import { Project } from "@/data/projects";

interface CursorPreviewProps {
  projects?: Project[];
}

export default function CursorPreview({ projects = [] }: CursorPreviewProps) {
  const cpRef = useRef<HTMLDivElement>(null);
  const cpVisualRef = useRef<HTMLDivElement>(null);
  const cpLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const cp = cpRef.current;
    const cpVisual = cpVisualRef.current;
    const cpLabel = cpLabelRef.current;
    if (!cp || !cpVisual || !cpLabel) return;

    const previewMap = new Map(
      projects.map((p) => [p.slug, p.preview])
    );

    const handleMouseEnter = (row: HTMLElement) => {
      const slug = row.dataset.preview;
      if (!slug) return;
      const preview = previewMap.get(slug);
      if (!preview) return;

      cpVisual.innerHTML = preview.svg;
      cpLabel.textContent = preview.label;
      cp.classList.add("show");
    };

    let rafId: number | null = null;
    let targetX = 0;
    let targetY = 0;

    const updatePosition = () => {
      cp.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      rafId = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (rafId === null) {
        rafId = requestAnimationFrame(updatePosition);
      }
    };

    const handleMouseLeave = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      cp.classList.remove("show");
    };

    const rows = document.querySelectorAll<HTMLElement>(".work-row[data-preview]");
    const cleanups: (() => void)[] = [];

    rows.forEach((row) => {
      const enterHandler = () => handleMouseEnter(row);
      const moveHandler = (e: MouseEvent) => handleMouseMove(e);
      const leaveHandler = () => handleMouseLeave();

      row.addEventListener("mouseenter", enterHandler);
      row.addEventListener("mousemove", moveHandler);
      row.addEventListener("mouseleave", leaveHandler);

      cleanups.push(() => {
        row.removeEventListener("mouseenter", enterHandler);
        row.removeEventListener("mousemove", moveHandler);
        row.removeEventListener("mouseleave", leaveHandler);
      });
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  }, [projects]);

  return (
    <div className="cursor-preview" id="cursorPreview" ref={cpRef}>
      <div className="cp-visual" id="cpVisual" ref={cpVisualRef} />
      <div className="cp-label" id="cpLabel" ref={cpLabelRef} />
    </div>
  );
}
