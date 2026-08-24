"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const revealEls = document.querySelectorAll(".reveal");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            e.target.setAttribute("data-revealed", "true");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );

    revealEls.forEach((el) => {
      if (el.getAttribute("data-revealed") === "true") {
        el.classList.add("in");
      } else {
        io.observe(el);
      }
    });

    return () => {
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
