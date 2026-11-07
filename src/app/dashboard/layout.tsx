import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import PortalHeader from "@/components/portal/PortalHeader";
import DashboardNav from "@/components/portal/DashboardNav";

export const metadata: Metadata = {
  title: "Client Portal — DigiGrantha",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <PortalHeader user={{ id: user.userId, name: user.name, email: user.email, role: user.role }} />
      <DashboardNav />

      <main style={{ flex: 1, padding: "28px 20px 60px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
