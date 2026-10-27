import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClientDashboardView from "@/components/portal/ClientDashboardView";

export default async function ClientDashboardPage() {
  const session = await getSessionUser();
  if (!session) return null;

  // Fetch client's primary active project directly
  const project: any = await prisma.project.findFirst({
    where: session.role === "ADMIN" ? {} : { clientId: session.userId },
    include: {
      developers: {
        include: { developer: { select: { id: true, name: true, email: true } } },
      },
      updates: {
        orderBy: { createdAt: "desc" },
        take: 25,
      },
      milestones: {
        orderBy: { order: "asc" },
      },
      callRequests: {
        orderBy: { createdAt: "desc" },
      },
      tickets: {
        where: { status: { not: "RESOLVED" } },
        select: { id: true, subject: true, status: true },
      },
      brief: {
        select: { projectType: true, description: true, budget: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!project) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div className="section-label" style={{ marginBottom: "8px" }}>
          Welcome to Digigrantha
        </div>
        <h2 style={{ fontFamily: "var(--display)", fontSize: "28px", marginBottom: "12px" }}>
          No active projects yet
        </h2>
        <p style={{ color: "var(--muted)", maxWidth: "48ch", margin: "0 auto 24px", fontSize: "15px" }}>
          Once your submitted brief is reviewed and converted into an active build by our studio, your project status and timeline will appear here.
        </p>
        <Link href="/#brief" className="btn-primary">
          Submit a new brief →
        </Link>
      </div>
    );
  }

  return <ClientDashboardView project={project} />;
}
