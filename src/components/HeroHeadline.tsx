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
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROTATING_ITEMS.length);
        setIsTransitioning(false);
      }, 260);
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  return (
    <h1 className="hero-headline">
      We build{" "}
      <span className="hero-rotator-wrap">
        <em
          className={`hero-rotator-word ${
            isTransitioning ? "out" : "in"
          }`}
        >
          {ROTATING_ITEMS[index]}
        </em>
      </span>{" "}
      for Ambitious Brands.
    </h1>
  );
}
