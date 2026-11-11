"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/WhatsAppButton";

interface FloatingCtaProps {
  heroSelector?: string;
  targetHref?: string;
}

export default function FloatingCta({
  heroSelector = ".hero",
  targetHref = "/#brief",
}: FloatingCtaProps) {
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = document.querySelector(heroSelector);
    const floatStack = stackRef.current;
    if (!hero || !floatStack) return;

    const ctaIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          floatStack.classList.toggle("show", !e.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    ctaIo.observe(hero);

    return () => {
      ctaIo.disconnect();
    };
  }, [heroSelector]);

  const whatsappUrl =
    "https://wa.me/917765063536?text=Hi%20DigiGrantha%2C%20I%20would%20like%20to%20discuss%20a%20project";

  return (
    <div id="float-cta-stack" className="float-cta-stack" ref={stackRef}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="float-whatsapp-btn"
        aria-label="Chat on WhatsApp with DigiGrantha (+91 77650 63536)"
        title="Chat on WhatsApp: +91 77650 63536"
      >
        <WhatsAppIcon size={24} />
      </a>
      <Link href={targetHref} id="float-cta">
        Start a project ↗
      </Link>
    </div>
  );
}
