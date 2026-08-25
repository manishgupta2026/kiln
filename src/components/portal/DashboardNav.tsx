"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
  const pathname = usePathname();

  const isOverview = pathname === "/dashboard";
  const isTickets = pathname.startsWith("/dashboard/tickets");
  const isChat = pathname.startsWith("/dashboard/chat");

  const navItems = [
    { label: "Overview & Progress", href: "/dashboard", active: isOverview },
    { label: "Tickets", href: "/dashboard/tickets", active: isTickets },
    { label: "Direct Team Chat", href: "/dashboard/chat", active: isChat },
  ];

  return (
    <nav
      aria-label="Client Portal Navigation"
      style={{
        background: "var(--bg)",
        borderBottom: "1px solid var(--line)",
        padding: "0 20px",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          gap: "28px",
          alignItems: "center",
        }}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "14px 4px",
              fontSize: "13px",
              fontFamily: "var(--mono)",
              color: item.active ? "var(--ink)" : "var(--muted)",
              textDecoration: "none",
              borderBottom: item.active ? "2px solid var(--accent)" : "2px solid transparent",
              fontWeight: item.active ? 600 : 400,
              whiteSpace: "nowrap",
              transition: "color 0.15s ease, border-color 0.15s ease",
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
