"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface StatItem {
  id: string;
  target: number;
  suffix: string;
  label: string;
}

const STATS_DATA: StatItem[] = [
  { id: "projects", target: 50, suffix: "+", label: "Projects delivered" },
  { id: "satisfaction", target: 98, suffix: "%", label: "Client satisfaction" },
  { id: "experience", target: 2, suffix: "+", label: "Years of experience" },
  { id: "passion", target: 100, suffix: "%", label: "Passion for your growth" },
];

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function StatsStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const [completed, setCompleted] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  const runCountAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const duration = 1800; // 1.8 seconds for smooth cinematic feel
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const overallProgress = Math.min(elapsed / duration, 1);

      const nextCounts = STATS_DATA.map((stat, idx) => {
        // Stagger each column's count-up start by 80ms
        const colDelay = idx * 80;
        const colElapsed = Math.max(0, elapsed - colDelay);
        const colDuration = Math.max(duration - colDelay, 800);
        const colProgress = Math.min(colElapsed / colDuration, 1);
        const eased = easeOutExpo(colProgress);

        return Math.round(eased * stat.target);
      });

      setCounts(nextCounts);

      if (overallProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCounts(STATS_DATA.map((s) => s.target));
        setCompleted(true);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Respect reduced motion settings
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setInView(true);
      setCounts(STATS_DATA.map((s) => s.target));
      setCompleted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setInView(true);
          runCountAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [runCountAnimation]);

  const handleReplay = () => {
    setCompleted(false);
    runCountAnimation();
  };

  return (
    <div
      ref={containerRef}
      className={`stats-strip ${inView ? "is-visible" : "is-hidden"} ${
        completed ? "is-completed" : ""
      }`}
      onClick={handleReplay}
      role="region"
      aria-label="Key Milestones & Impact"
      title="Click to replay animation"
    >
      {STATS_DATA.map((stat, idx) => (
        <div
          key={stat.id}
          className="stat-col animated-stat-col"
          style={{
            animationDelay: `${idx * 130}ms`,
            transitionDelay: `${idx * 110}ms`,
          }}
        >
          <div className="stat-val animated-stat-val">
            <span className="stat-num-ticker">
              {inView ? counts[idx] : stat.target}
            </span>
            <span className="stat-suffix">{stat.suffix}</span>
          </div>
          <div className="stat-lbl animated-stat-lbl">
            <span className="stat-lbl-text">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
