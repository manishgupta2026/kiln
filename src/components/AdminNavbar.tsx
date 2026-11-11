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
  icon: React.ReactNode;
  href: string;
  tabKey?: string;
  badge?: number | null;
  badgeAlert?: boolean;
  category: "operations" | "talent" | "content";
}

let _adminBadgeCache: {
  data: { newBriefs: number; newCareers: number; totalQuotes: number };
  timestamp: number;
} | null = null;
const BADGE_CACHE_TTL = 30000;

export function invalidateAdminBadgeCache() {
  _adminBadgeCache = null;
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
  }>(() => {
    const prev = _adminBadgeCache?.data || { newBriefs: 0, newCareers: 0, totalQuotes: 0 };
    if (badgeCounts) {
      return {
        newBriefs: badgeCounts.newBriefs !== undefined ? badgeCounts.newBriefs : prev.newBriefs,
        newCareers: badgeCounts.newCareers !== undefined ? badgeCounts.newCareers : prev.newCareers,
        totalQuotes: badgeCounts.totalQuotes !== undefined ? badgeCounts.totalQuotes : prev.totalQuotes,
      };
    }
    if (_adminBadgeCache && Date.now() - _adminBadgeCache.timestamp < BADGE_CACHE_TTL) {
      return _adminBadgeCache.data;
    }
    return prev;
  });

  // Fetch or refresh badge counts with intelligent caching & merging
  useEffect(() => {
    let isMounted = true;

    // Check what is missing if parent provided partial badgeCounts
    const hasCompleteProps =
      badgeCounts &&
      badgeCounts.newBriefs !== undefined &&
      badgeCounts.newCareers !== undefined &&
      badgeCounts.totalQuotes !== undefined;

    if (hasCompleteProps) {
      const counts = {
        newBriefs: badgeCounts.newBriefs || 0,
        newCareers: badgeCounts.newCareers || 0,
        totalQuotes: badgeCounts.totalQuotes || 0,
      };
      setInternalBadges(counts);
      _adminBadgeCache = { data: counts, timestamp: Date.now() };
      return;
    }

    if (badgeCounts) {
      // Partial props provided: update what we have immediately
      setInternalBadges((prev) => {
        const merged = {
          newBriefs: badgeCounts.newBriefs !== undefined ? badgeCounts.newBriefs : prev.newBriefs,
          newCareers: badgeCounts.newCareers !== undefined ? badgeCounts.newCareers : prev.newCareers,
          totalQuotes: badgeCounts.totalQuotes !== undefined ? badgeCounts.totalQuotes : prev.totalQuotes,
        };
        _adminBadgeCache = { data: merged, timestamp: Date.now() };
        return merged;
      });
    }

    // If cache is fresh and we didn't miss critical props, reuse it
    if (_adminBadgeCache && Date.now() - _adminBadgeCache.timestamp < BADGE_CACHE_TTL && !badgeCounts) {
      setInternalBadges(_adminBadgeCache.data);
      return;
    }

    const fetchCounters = async () => {
      try {
        const needsBriefs = !badgeCounts || badgeCounts.newBriefs === undefined;
        const needsCareers = !badgeCounts || badgeCounts.newCareers === undefined;
        const needsQuotes = !badgeCounts || badgeCounts.totalQuotes === undefined;

        const promises: Promise<any>[] = [];
        if (needsBriefs) promises.push(fetch("/api/admin/briefs"));
        if (needsCareers) promises.push(fetch("/api/admin/careers"));
        if (needsQuotes) promises.push(fetch("/api/admin/quotations"));

        const results = await Promise.allSettled(promises);
        let resIdx = 0;

        let newB = badgeCounts?.newBriefs ?? _adminBadgeCache?.data.newBriefs ?? 0;
        let newC = badgeCounts?.newCareers ?? _adminBadgeCache?.data.newCareers ?? 0;
        let totQ = badgeCounts?.totalQuotes ?? _adminBadgeCache?.data.totalQuotes ?? 0;

        if (needsBriefs) {
          const r = results[resIdx++];
          if (r && r.status === "fulfilled" && r.value.ok) {
            const bJson = await r.value.json();
            if (bJson.success && Array.isArray(bJson.data)) {
              newB = bJson.data.filter((b: any) => b.status === "new").length;
            }
          }
        }

        if (needsCareers) {
          const r = results[resIdx++];
          if (r && r.status === "fulfilled" && r.value.ok) {
            const cJson = await r.value.json();
            if (cJson.success && Array.isArray(cJson.data)) {
              newC = cJson.data.filter((c: any) => c.status === "new").length;
            }
          }
        }

        if (needsQuotes) {
          const r = results[resIdx++];
          if (r && r.status === "fulfilled" && r.value.ok) {
            const qJson = await r.value.json();
            if (qJson.success && Array.isArray(qJson.data)) {
              totQ = qJson.data.length;
            }
          }
        }

        const counts = {
          newBriefs: newB,
          newCareers: newC,
          totalQuotes: totQ,
        };
        _adminBadgeCache = { data: counts, timestamp: Date.now() };

        if (isMounted) {
          setInternalBadges(counts);
        }
      } catch {
        // Silently fail if unauthenticated or offline
      }
    };

    fetchCounters();

    const handleCustomRefresh = () => {
      _adminBadgeCache = null;
      fetchCounters();
    };
    window.addEventListener("digigrantha-refresh-badges", handleCustomRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener("digigrantha-refresh-badges", handleCustomRefresh);
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
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      ),
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
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
      href: "/admin?tab=portalProjects",
      tabKey: "portalProjects",
      category: "operations",
    },
    {
      id: "quotations",
      label: "Quotes & Estimator",
      shortLabel: "Quotes",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="16" y1="14" x2="16" y2="18" />
          <path d="M16 10h.01" />
          <path d="M12 10h.01" />
          <path d="M8 10h.01" />
        </svg>
      ),
      href: pathname === "/admin" ? "/admin?tab=quotations" : "/admin/quotations",
      tabKey: "quotations",
      badge: internalBadges.totalQuotes > 0 ? internalBadges.totalQuotes : null,
      badgeAlert: false,
      category: "operations",
    },
    {
      id: "invoices",
      label: "Invoices & Billing",
      shortLabel: "Invoices",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
          <line x1="8" y1="8" x2="16" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      href: "/admin/invoices",
      category: "operations",
    },
    {
      id: "careers",
      label: "Careers & Talent",
      shortLabel: "Careers",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
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
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      href: "/admin/team",
      tabKey: "team",
      category: "talent",
    },
    {
      id: "developers",
      label: "Dev Roster",
      shortLabel: "Devs",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      href: "/admin/developers",
      tabKey: "developers",
      category: "talent",
    },
    {
      id: "case-studies",
      label: "Case Studies",
      shortLabel: "Work CMS",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
      href: "/admin/case-studies",
      category: "content",
    },
    {
      id: "trust",
      label: "Site Content & Trust",
      shortLabel: "Trust CMS",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
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
    if (item.id === "invoices" && pathname.startsWith("/admin/invoices")) return true;
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
            <Link href="/admin" className="admin-nav-logo" title="Digigrantha Admin Studio" style={{ display: "inline-flex", alignItems: "center" }}>
              <img
                src="/digigrantha-logo.svg"
                alt="DigiGrantha"
                style={{ height: "28px", width: "auto", display: "block" }}
              />
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
              title="View Public Digigrantha Website (opens in new tab)"
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
              <div className="admin-drawer-logo" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img
                  src="/digigrantha-logo.svg"
                  alt="DigiGrantha"
                  style={{ height: "26px", width: "auto", display: "block" }}
                />
                <span>Studio</span>
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
