"use client";

import { useState, useEffect } from "react";

const ROTATING_ITEMS = [
  "Websites",
  "Web Apps",
  "Online Stores",
  "Brands",
];

export default function HeroHeadline() {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let transitionTimer: NodeJS.Timeout | null = null;
    const intervalTimer = setInterval(() => {
      setIsTransitioning(true);
      transitionTimer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROTATING_ITEMS.length);
        setIsTransitioning(false);
      }, 260);
    }, 2400);

    return () => {
      clearInterval(intervalTimer);
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, []);

  return (
    <h1 className="hero-headline">
      <span>
        We build{" "}
        <span className="hero-rotator-wrap">
          <em
            className={`hero-rotator-word ${
              isTransitioning ? "out" : "in"
            }`}
          >
            {ROTATING_ITEMS[index]}
          </em>
        </span>
      </span>
      <span className="hero-headline-sub">for Ambitious Brands.</span>
    </h1>
  );
}
