"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export interface AdminNavbarProps {
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  badgeCounts?: {
    newBriefs?: number;
    totalBriefs?: number;
    newCareers?: number;
    totalCareers?: number;
    totalQuotes?: number;
  };
  currentTitle?: string;
  currentSubtitle?: string;
}

interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  href: string;
  tabKey?: string;
  badge?: number | null;
  badgeAlert?: boolean;
  category: "operations" | "talent" | "content";
}

export default function AdminNavbar({
  activeTab,
  onTabChange,
  badgeCounts,
  currentTitle,
  currentSubtitle,
}: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalBadges, setInternalBadges] = useState<{
    newBriefs: number;
    newCareers: number;
    totalQuotes: number;
  }>({
    newBriefs: badgeCounts?.newBriefs || 0,
    newCareers: badgeCounts?.newCareers || 0,
    totalQuotes: badgeCounts?.totalQuotes || 0,
  });

  // If badge counts weren't provided by parent page, fetch them asynchronously
  useEffect(() => {
    if (badgeCounts) {
      setInternalBadges({
        newBriefs: badgeCounts.newBriefs || 0,
        newCareers: badgeCounts.newCareers || 0,
        totalQuotes: badgeCounts.totalQuotes || 0,
      });
      return;
    }

    let isMounted = true;
    const fetchCounters = async () => {
      try {
        const [briefsRes, careersRes, quotesRes] = await Promise.allSettled([
          fetch("/api/admin/briefs"),
          fetch("/api/admin/careers"),
          fetch("/api/admin/quotations"),
        ]);

        let newB = 0;
        let newC = 0;
        let totQ = 0;

        if (briefsRes.status === "fulfilled" && briefsRes.value.ok) {
          const bJson = await briefsRes.value.json();
          if (bJson.success && Array.isArray(bJson.data)) {
            newB = bJson.data.filter((b: any) => b.status === "new").length;
          }
        }

        if (careersRes.status === "fulfilled" && careersRes.value.ok) {
          const cJson = await careersRes.value.json();
          if (cJson.success && Array.isArray(cJson.data)) {
            newC = cJson.data.filter((c: any) => c.status === "new").length;
          }
        }

        if (quotesRes.status === "fulfilled" && quotesRes.value.ok) {
          const qJson = await quotesRes.value.json();
          if (qJson.success && Array.isArray(qJson.data)) {
            totQ = qJson.data.length;
          }
        }

        if (isMounted) {
          setInternalBadges({
            newBriefs: newB,
            newCareers: newC,
            totalQuotes: totQ,
          });
        }
      } catch {
        // Silently fail if unauthenticated or offline
      }
    };

    fetchCounters();
    return () => {
      isMounted = false;
    };
  }, [badgeCounts]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out of the admin panel?")) return;
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
  };

  const navItems: NavItem[] = [
    {
      id: "briefs",
      label: "Inbound Briefs",
      shortLabel: "Briefs",
      icon: "📥",
      href: "/admin?tab=briefs",
      tabKey: "briefs",
      badge: internalBadges.newBriefs > 0 ? internalBadges.newBriefs : null,
      badgeAlert: true,
      category: "operations",
    },
    {
      id: "portalProjects",
      label: "Client Builds",
      shortLabel: "Builds",
      icon: "🚀",
      href: "/admin?tab=portalProjects",
      tabKey: "portalProjects",
      category: "operations",
    },
    {
      id: "quotations",
      label: "Quotes & Estimator",
      shortLabel: "Quotes",
      icon: "🧮",
      href: pathname === "/admin" ? "/admin?tab=quotations" : "/admin/quotations",
      tabKey: "quotations",
      badge: internalBadges.totalQuotes > 0 ? internalBadges.totalQuotes : null,
      badgeAlert: false,
      category: "operations",
    },
    {
      id: "careers",
      label: "Careers & Talent",
      shortLabel: "Careers",
      icon: "💼",
      href: pathname === "/admin" ? "/admin?tab=careers" : "/admin/careers",
      tabKey: "careers",
      badge: internalBadges.newCareers > 0 ? internalBadges.newCareers : null,
      badgeAlert: true,
      category: "talent",
    },
    {
      id: "team",
      label: "Studio Team",
      shortLabel: "Team",
      icon: "👥",
      href: "/admin/team",
      tabKey: "team",
      category: "talent",
    },
    {
      id: "developers",
      label: "Dev Roster",
      shortLabel: "Devs",
      icon: "🛡️",
      href: "/admin/developers",
      tabKey: "developers",
      category: "talent",
    },
    {
      id: "case-studies",
      label: "Case Studies",
      shortLabel: "Work CMS",
      icon: "🎨",
      href: "/admin/case-studies",
      category: "content",
    },
    {
      id: "trust",
      label: "Site Content & Trust",
      shortLabel: "Content",
      icon: "🌐",
      href: "/admin?tab=trust",
      tabKey: "trust",
      category: "content",
    },
  ];

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    setMobileMenuOpen(false);

    // If currently on /admin and item has a tabKey, use tab switching instead of full navigation
    if (pathname === "/admin" && item.tabKey && onTabChange) {
      e.preventDefault();
      onTabChange(item.tabKey);
      // update URL cleanly without reload
      window.history.replaceState(null, "", `/admin?tab=${item.tabKey}`);
    }
  };

  const isItemActive = (item: NavItem) => {
    if (pathname === "/admin") {
      if (activeTab && item.tabKey) {
        return activeTab === item.tabKey;
      }
      return item.id === "briefs";
    }

    if (item.href === pathname) return true;
    if (item.id === "quotations" && pathname.startsWith("/admin/quotations")) return true;
    if (item.id === "careers" && pathname.startsWith("/admin/careers")) return true;
    if (item.id === "team" && pathname.startsWith("/admin/team")) return true;
    if (item.id === "case-studies" && pathname.startsWith("/admin/case-studies")) return true;
    if (item.id === "developers" && pathname.startsWith("/admin/developers")) return true;
    if (item.id === "briefs" && pathname.startsWith("/admin/briefs")) return true;

    return false;
  };

  const totalAlerts = internalBadges.newBriefs + internalBadges.newCareers;

  return (
    <>
      {/* ================= DESKTOP & TABLET TOP STICKY NAVBAR ================= */}
      <header className="admin-nav-bar">
        <div className="admin-nav-container">
          {/* Left Brand & Studio Pill */}
          <div className="admin-nav-brand-group">
            <Link href="/admin" className="admin-nav-logo" title="Kiln Admin Studio">
              Kiln<span className="admin-nav-logo-dot">.</span>
            </Link>

            <div className="admin-nav-status-badge">
              <span className="admin-nav-pulse-dot" />
              <span className="admin-nav-status-text">Admin</span>
            </div>

            {currentTitle && (
              <div className="admin-nav-breadcrumb-divider">
                <span className="admin-nav-breadcrumb-slash">/</span>
                <span className="admin-nav-current-page">{currentTitle}</span>
              </div>
            )}
          </div>

          {/* Center: Desktop Navigation Pills */}
          <nav className="admin-nav-desktop-links" aria-label="Admin Sections">
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className={`admin-nav-item ${active ? "active" : ""}`}
                >
                  <span className="admin-nav-item-icon">{item.icon}</span>
                  <span className="admin-nav-item-label">{item.shortLabel}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`admin-nav-badge ${
                        item.badgeAlert ? "admin-nav-badge-alert" : ""
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities */}
          <div className="admin-nav-utilities">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-nav-btn-link"
              title="View Public Kiln Website (opens in new tab)"
            >
              <span>Visit Site</span>
              <span className="admin-nav-ext-arrow">↗</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="admin-nav-btn-logout"
              title="Sign out of Admin Session"
            >
              Logout
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className={`admin-nav-mobile-toggle ${mobileMenuOpen ? "open" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle admin navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {totalAlerts > 0 && !mobileMenuOpen && (
                <span className="admin-nav-mobile-badge-dot" />
              )}
              <span className="admin-nav-hamburger-line line-1" />
              <span className="admin-nav-hamburger-line line-2" />
            </button>
          </div>
        </div>

        {/* Optional Page Subtitle Sub-Bar for high-context pages */}
        {currentSubtitle && (
          <div className="admin-nav-subbar">
            <div className="admin-nav-container">
              <span className="admin-nav-subbar-text">{currentSubtitle}</span>
            </div>
          </div>
        )}
      </header>

      {/* ================= MOBILE DRAWER / OVERLAY ================= */}
      <div
        className={`admin-mobile-drawer-overlay ${mobileMenuOpen ? "visible" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`admin-mobile-drawer-panel ${mobileMenuOpen ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Top Header */}
          <div className="admin-drawer-header">
            <div>
              <div className="admin-drawer-logo">
                Kiln<span>.</span> Studio
              </div>
              <div className="admin-drawer-status">
                <span className="admin-nav-pulse-dot" />
                <span>Connected &amp; Synchronized</span>
              </div>
            </div>

            <button
              type="button"
              className="admin-drawer-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close admin menu"
            >
              ✕
            </button>
          </div>

          {/* Quick Metrics Bar in Mobile Drawer */}
          <div className="admin-drawer-stats-row">
            <div className="admin-drawer-stat-pill">
              <span className="stat-label">New Briefs</span>
              <span className={`stat-val ${internalBadges.newBriefs > 0 ? "highlight-red" : ""}`}>
                {internalBadges.newBriefs}
              </span>
            </div>
            <div className="admin-drawer-stat-pill">
              <span className="stat-label">New Talent</span>
              <span className={`stat-val ${internalBadges.newCareers > 0 ? "highlight-accent" : ""}`}>
                {internalBadges.newCareers}
              </span>
            </div>
            <div className="admin-drawer-stat-pill">
              <span className="stat-label">Quotations</span>
              <span className="stat-val">{internalBadges.totalQuotes}</span>
            </div>
          </div>

          {/* Drawer Navigation Links Grouped */}
          <div className="admin-drawer-content">
            {/* Section 1: Operations */}
            <div className="admin-drawer-group">
              <div className="admin-drawer-group-title">Studio Operations</div>
              <div className="admin-drawer-links">
                {navItems
                  .filter((item) => item.category === "operations")
                  .map((item) => {
                    const active = isItemActive(item);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={(e) => handleNavClick(item, e)}
                        className={`admin-drawer-link ${active ? "active" : ""}`}
                      >
                        <div className="admin-drawer-link-left">
                          <span className="admin-drawer-link-icon">{item.icon}</span>
                          <span className="admin-drawer-link-text">{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={`admin-nav-badge ${
                              item.badgeAlert ? "admin-nav-badge-alert" : ""
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* Section 2: Talent */}
            <div className="admin-drawer-group">
              <div className="admin-drawer-group-title">Talent &amp; Team Roster</div>
              <div className="admin-drawer-links">
                {navItems
                  .filter((item) => item.category === "talent")
                  .map((item) => {
                    const active = isItemActive(item);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={(e) => handleNavClick(item, e)}
                        className={`admin-drawer-link ${active ? "active" : ""}`}
                      >
                        <div className="admin-drawer-link-left">
                          <span className="admin-drawer-link-icon">{item.icon}</span>
                          <span className="admin-drawer-link-text">{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={`admin-nav-badge ${
                              item.badgeAlert ? "admin-nav-badge-alert" : ""
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* Section 3: Content */}
            <div className="admin-drawer-group">
              <div className="admin-drawer-group-title">Content &amp; Public Showcase</div>
              <div className="admin-drawer-links">
                {navItems
                  .filter((item) => item.category === "content")
                  .map((item) => {
                    const active = isItemActive(item);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={(e) => handleNavClick(item, e)}
                        className={`admin-drawer-link ${active ? "active" : ""}`}
                      >
                        <div className="admin-drawer-link-left">
                          <span className="admin-drawer-link-icon">{item.icon}</span>
                          <span className="admin-drawer-link-text">{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="admin-drawer-footer">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-drawer-action-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>View Public Website</span>
              <span>↗</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="admin-drawer-logout-btn"
            >
              Sign Out of Admin Console
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM QUICK-BAR (< 768px) ================= */}
      <nav className="admin-mobile-bottom-bar" aria-label="Mobile Quick Nav">
        <Link
          href="/admin?tab=briefs"
          onClick={(e) =>
            handleNavClick(
              {
                id: "briefs",
                label: "Briefs",
                shortLabel: "Briefs",
                icon: "📥",
                href: "/admin?tab=briefs",
                tabKey: "briefs",
                category: "operations",
              },
              e
            )
          }
          className={`admin-mobile-bottom-tab ${
            pathname === "/admin" && (!activeTab || activeTab === "briefs") ? "active" : ""
          }`}
        >
          <div className="bottom-tab-icon-wrap">
            <span className="bottom-tab-icon">📥</span>
            {internalBadges.newBriefs > 0 && (
              <span className="bottom-tab-dot-badge">{internalBadges.newBriefs}</span>
            )}
          </div>
          <span className="bottom-tab-label">Briefs</span>
        </Link>

        <Link
          href="/admin?tab=portalProjects"
          onClick={(e) =>
            handleNavClick(
              {
                id: "portalProjects",
                label: "Builds",
                shortLabel: "Builds",
                icon: "🚀",
                href: "/admin?tab=portalProjects",
                tabKey: "portalProjects",
                category: "operations",
              },
              e
            )
          }
          className={`admin-mobile-bottom-tab ${
            pathname === "/admin" && activeTab === "portalProjects" ? "active" : ""
          }`}
        >
          <div className="bottom-tab-icon-wrap">
            <span className="bottom-tab-icon">🚀</span>
          </div>
          <span className="bottom-tab-label">Builds</span>
        </Link>

        <Link
          href={pathname === "/admin" ? "/admin?tab=quotations" : "/admin/quotations"}
          onClick={(e) =>
            handleNavClick(
              {
                id: "quotations",
                label: "Quotes",
                shortLabel: "Quotes",
                icon: "🧮",
                href: "/admin/quotations",
                tabKey: "quotations",
                category: "operations",
              },
              e
            )
          }
          className={`admin-mobile-bottom-tab ${
            (pathname === "/admin" && activeTab === "quotations") ||
            pathname.startsWith("/admin/quotations")
              ? "active"
              : ""
          }`}
        >
          <div className="bottom-tab-icon-wrap">
            <span className="bottom-tab-icon">🧮</span>
          </div>
          <span className="bottom-tab-label">Quotes</span>
        </Link>

        <Link
          href={pathname === "/admin" ? "/admin?tab=careers" : "/admin/careers"}
          onClick={(e) =>
            handleNavClick(
              {
                id: "careers",
                label: "Careers",
                shortLabel: "Careers",
                icon: "💼",
                href: "/admin/careers",
                tabKey: "careers",
                category: "talent",
              },
              e
            )
          }
          className={`admin-mobile-bottom-tab ${
            (pathname === "/admin" && activeTab === "careers") ||
            pathname.startsWith("/admin/careers")
              ? "active"
              : ""
          }`}
        >
          <div className="bottom-tab-icon-wrap">
            <span className="bottom-tab-icon">💼</span>
            {internalBadges.newCareers > 0 && (
              <span className="bottom-tab-dot-badge">{internalBadges.newCareers}</span>
            )}
          </div>
          <span className="bottom-tab-label">Careers</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`admin-mobile-bottom-tab ${mobileMenuOpen ? "active" : ""}`}
        >
          <div className="bottom-tab-icon-wrap">
            <span className="bottom-tab-icon">☰</span>
            {totalAlerts > 0 && <span className="bottom-tab-dot-badge">•</span>}
          </div>
          <span className="bottom-tab-label">More</span>
        </button>
      </nav>
    </>
  );
}
