"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/prisma";

interface PortalHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  projectTitle?: string;
}

export default function PortalHeader({ user, projectTitle }: PortalHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const isClient = user.role === "CLIENT";
  const isDev = user.role === "DEVELOPER";

  const rootPath = isClient ? "/dashboard" : isDev ? "/dev" : "/admin";

  return (
    <header
      style={{
        background: "var(--surface)",
        borderBottom: "2px solid var(--outline)",
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        boxShadow: "0 4px 0 rgba(23, 32, 30, 0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href={rootPath} style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          <div className="logo-lockup" style={{ gap: "9px" }}>
            <div className="logo-mark-wrap" style={{ width: "30px", height: "30px" }}>
              <img
                src="/digigrantha-mark.svg"
                alt="DigiGrantha"
                className="brand-mark-img"
                style={{ width: "30px", height: "30px" }}
              />
            </div>
            <div className="logo-text-group">
              <div className="logo-title" style={{ fontSize: "19px" }}>
                <span className="logo-name-digi">Digi</span>
                <span className="logo-name-grantha">Grantha</span>
                <span className="logo-dot">.</span>
              </div>
            </div>
          </div>
        </Link>

        <span
          style={{
            fontFamily: "var(--body)",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "2px 8px",
            borderRadius: "999px",
            background: isClient ? "var(--lime)" : isDev ? "var(--mint)" : "var(--yellow)",
            color: "#17201E",
            border: "1.5px solid var(--outline)",
            fontWeight: 800,
            boxShadow: "1.5px 1.5px 0 var(--outline)",
            whiteSpace: "nowrap",
          }}
        >
          {user.role} PORTAL
        </span>

        {projectTitle && (
          <span style={{ fontSize: "13px", color: "var(--muted)", display: "none" }} className="portal-head-proj">
            / {projectTitle}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginLeft: "auto" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>
            {user.name}
          </div>
          <div
            style={{
              fontFamily: "var(--body)",
              fontSize: "11px",
              color: "var(--muted)",
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={user.email}
          >
            {user.email}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            fontFamily: "var(--body)",
            fontSize: "12px",
            fontWeight: 600,
            background: "var(--surface)",
            border: "1.5px solid var(--outline)",
            padding: "6px 14px",
            borderRadius: "999px",
            color: "var(--muted)",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "2px 2px 0 var(--outline)",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#E5484D";
            e.currentTarget.style.borderColor = "#E5484D";
            e.currentTarget.style.background = "#FFE2E2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--muted)";
            e.currentTarget.style.borderColor = "var(--outline)";
            e.currentTarget.style.background = "var(--surface)";
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
