import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import PortalHeader from "@/components/portal/PortalHeader";

export default async function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || (user.role !== "DEVELOPER" && user.role !== "ADMIN")) {
    redirect("/login?redirect=/dev");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <PortalHeader user={{ id: user.userId, name: user.name, email: user.email, role: user.role }} />

      <main style={{ flex: 1, padding: "32px 24px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
