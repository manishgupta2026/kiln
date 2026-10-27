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
        background: "var(--bg)",
        borderBottom: "1px solid var(--line)",
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <Link href={rootPath} className="logo" style={{ fontSize: "20px" }}>
          Digigrantha<span>.</span>
        </Link>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "2px 8px",
            borderRadius: "999px",
            background: isClient ? "var(--accent-soft)" : isDev ? "#e0e7ff" : "#fef3c7",
            color: isClient ? "var(--accent)" : isDev ? "#3730a3" : "#92400e",
            fontWeight: 600,
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
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink)", lineHeight: 1.2 }}>
            {user.name}
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10.5px",
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
            fontFamily: "var(--mono)",
            fontSize: "11.5px",
            background: "none",
            border: "1px solid var(--line)",
            padding: "5px 12px",
            borderRadius: "999px",
            color: "var(--muted)",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--ink)";
            e.currentTarget.style.borderColor = "var(--ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--muted)";
            e.currentTarget.style.borderColor = "var(--line)";
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
