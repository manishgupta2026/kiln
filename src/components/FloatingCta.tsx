"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

interface FloatingCtaProps {
  heroSelector?: string;
  targetHref?: string;
}

export default function FloatingCta({
  heroSelector = ".hero",
  targetHref = "/#brief",
}: FloatingCtaProps) {
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const hero = document.querySelector(heroSelector);
    const floatCta = ctaRef.current;
    if (!hero || !floatCta) return;

    const ctaIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          floatCta.classList.toggle("show", !e.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    ctaIo.observe(hero);

    return () => {
      ctaIo.disconnect();
    };
  }, [heroSelector]);

  return (
    <Link href={targetHref} id="float-cta" ref={ctaRef}>
      Start a project ↗
    </Link>
  );
}
