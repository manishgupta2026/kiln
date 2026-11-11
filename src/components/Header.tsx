"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/WhatsAppButton";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock scroll and hide floating CTA when mobile menu is open
  useEffect(() => {
    const floatCta = document.getElementById("float-cta");
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      if (floatCta) floatCta.style.display = "none";
    } else {
      document.body.style.overflow = "";
      if (floatCta) floatCta.style.display = "";
    }
    return () => {
      document.body.style.overflow = "";
      if (floatCta) floatCta.style.display = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="nav">
      <div className="nav-inner">
        {/* Brand Logo: Official Bookmark Badge on Left, DigiGrantha & Tagline in Front */}
        <Link href="/" className="logo-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo-lockup">
            <div className="logo-mark-wrap">
              <img
                src="/digigrantha-mark.svg"
                alt="DigiGrantha"
                className="brand-mark-img brand-mark-light"
                width={44}
                height={44}
              />
              <img
                src="/digigrantha-mark-on-dark.svg"
                alt="DigiGrantha"
                className="brand-mark-img brand-mark-dark"
                width={44}
                height={44}
              />
            </div>
            <div className="logo-text-group">
              <div className="logo-title">
                <span className="logo-name-digi">Digi</span>
                <span className="logo-name-grantha">Grantha</span>
                <span className="logo-dot">.</span>
              </div>
              <span className="logo-tagline">Where ideas become digital</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="nav-links">
          <Link
            href="/work"
            className={pathname === "/work" ? "active" : ""}
          >
            Work
          </Link>
          <Link
            href="/#offerings"
          >
            Offerings
          </Link>
          <Link
            href="/about"
            className={pathname === "/about" ? "active" : ""}
          >
            About
          </Link>
          <Link
            href="/career"
            className={pathname === "/career" || pathname === "/careers" ? "active" : ""}
          >
            Careers
          </Link>
          <Link
            href="/login"
            className="nav-portal-link"
          >
            Portal
          </Link>
        </nav>

        {/* Desktop Actions & Mobile Menu Toggle */}
        <div className="nav-actions">
          <Link href="/#brief" className="nav-cta">
            Start a project →
          </Link>

          <button
            type="button"
            className={`nav-menu-btn ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-nav-content">
          <nav className="mobile-nav-links">
            <Link
              href="/"
              className={pathname === "/" ? "active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-idx">01</span>
              <span>Home</span>
            </Link>
            <Link
              href="/work"
              className={pathname === "/work" ? "active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-idx">02</span>
              <span>Work Archive</span>
            </Link>
            <Link
              href="/#offerings"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-idx">03</span>
              <span>Offerings</span>
            </Link>
            <Link
              href="/about"
              className={pathname === "/about" ? "active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-idx">04</span>
              <span>About DigiGrantha</span>
            </Link>
            <Link
              href="/career"
              className={pathname === "/career" || pathname === "/careers" ? "active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-idx">05</span>
              <span>Careers</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-portal-link"
            >
              <span className="mobile-idx">06</span>
              <span>Client Portal</span>
            </Link>
          </nav>

          <div className="mobile-nav-footer">
            <Link
              href="/#brief"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Start a project →
            </Link>
            <a
              href="https://wa.me/917765063536?text=Hi%20DigiGrantha%2C%20I%20would%20like%20to%20discuss%20a%20project"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-whatsapp-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <WhatsAppIcon size={18} />
              <span>WhatsApp (+91 77650 63536)</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

