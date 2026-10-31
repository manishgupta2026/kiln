"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Read theme on mount
  useEffect(() => {
    try {
      const mode = document.documentElement.getAttribute("data-theme");
      setIsDark(mode === "dark");
    } catch {}
  }, []);

  const toggleTheme = () => {
    try {
      const nextMode = isDark ? "light" : "dark";
      setIsDark(!isDark);
      document.documentElement.setAttribute("data-theme", nextMode);
      if (nextMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("dg-mode", nextMode);
    } catch {}
  };

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
        {/* Brand Logo with Neem Signature Tilted Badge */}
        <Link href="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="logo-text">Digigrantha</span>
          <span className="logo-dot">.</span>
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
            href="/#faq"
          >
            FAQ
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
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

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
              <span>About Digigrantha</span>
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
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-idx">06</span>
              <span>FAQ</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-portal-link"
            >
              <span className="mobile-idx">07</span>
              <span>Client Portal</span>
            </Link>
          </nav>

          <div className="mobile-nav-footer">
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
              <button
                type="button"
                className="theme-toggle-btn mobile-theme-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {isDark ? "☀️ Light mode" : "🌙 Dark mode"}
              </button>
            </div>
            <Link
              href="/#brief"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Start a project →
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

