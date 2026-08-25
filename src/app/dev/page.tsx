import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DevDashboardPage() {
  const session = await getSessionUser();
  if (!session) return null;

  const projects = await prisma.project.findMany({
    where:
      session.role === "ADMIN"
        ? {}
        : {
            developers: { some: { developerId: session.userId } },
          },
    include: {
      client: { select: { id: true, name: true, email: true } },
      developers: {
        include: { developer: { select: { id: true, name: true, email: true } } },
      },
      _count: {
        select: {
          tickets: { where: { status: { not: "RESOLVED" } } },
          messages: true,
          updates: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <div className="section-label" style={{ marginBottom: "4px" }}>
          Developer Workspace
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "32px", fontWeight: 400, color: "var(--ink)" }}>
          Your Assigned Projects
        </h1>
        <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
          Update project phases, post progress notes, manage tickets, and communicate directly with clients.
        </p>
      </div>

      {projects && projects.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {projects.map((project: any) => (
            <div
              key={project.id}
              style={{
                background: "var(--card)",
                borderRadius: "16px",
                padding: "24px",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "18px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "10.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      fontWeight: 600,
                    }}
                  >
                    {project.phase}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "10.5px",
                      color: project.status === "ACTIVE" ? "var(--ink)" : "var(--muted)",
                    }}
                  >
                    ● {project.status}
                  </span>
                </div>

                <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)", fontWeight: 400, marginBottom: "4px" }}>
                  {project.name}
                </h3>
                <div style={{ fontSize: "13.5px", color: "var(--muted)" }}>
                  Client: <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{project.client?.name}</strong> ({project.client?.email})
                </div>
              </div>

              {/* Stats & Link */}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--muted)" }}>
                  {project._count?.tickets > 0 ? (
                    <span style={{ color: "#c93b2b", fontWeight: 600 }}>{project._count.tickets} open tickets</span>
                  ) : (
                    "0 open tickets"
                  )}
                </div>

                <Link href={`/dev/projects/${project.id}`} className="btn-primary" style={{ fontSize: "12px", padding: "8px 16px" }}>
                  Open Workspace →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "var(--card)",
            borderRadius: "16px",
            padding: "50px 20px",
            textAlign: "center",
            border: "1px solid var(--line)",
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🛠️</div>
          <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "var(--ink)" }}>
            No assigned projects right now
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "4px" }}>
            When the studio admin assigns you to a project build, it will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
