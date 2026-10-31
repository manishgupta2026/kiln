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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
          {projects.map((project: any) => (
            <div
              key={project.id}
              style={{
                background: "var(--surface)",
                borderRadius: "18px",
                padding: "26px",
                border: "2px solid var(--outline)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span
                    style={{
                      fontFamily: "var(--body)",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      background: "var(--lime)",
                      color: "#17201E",
                      border: "1.5px solid var(--outline)",
                      padding: "2px 10px",
                      borderRadius: "999px",
                      fontWeight: 700,
                    }}
                  >
                    {project.phase}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--body)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: project.status === "ACTIVE" ? "#0F5C52" : "var(--muted)",
                    }}
                  >
                    ● {project.status}
                  </span>
                </div>

                <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--text)", fontWeight: 600, marginBottom: "6px" }}>
                  {project.name}
                </h3>
                <div style={{ fontSize: "14px", color: "var(--muted)" }}>
                  Client: <strong style={{ color: "var(--text)", fontWeight: 600 }}>{project.client?.name}</strong> ({project.client?.email})
                </div>
              </div>

              {/* Stats & Link */}
              <div style={{ borderTop: "1.5px solid var(--outline)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--body)", fontSize: "12px", color: "var(--muted)" }}>
                  {project._count?.tickets > 0 ? (
                    <span style={{ color: "#E5484D", fontWeight: 700 }}>{project._count.tickets} open tickets</span>
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
            background: "var(--surface)",
            borderRadius: "18px",
            padding: "50px 20px",
            textAlign: "center",
            border: "2px solid var(--outline)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🛠️</div>
          <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--text)", fontWeight: 600 }}>
            No assigned projects right now
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "6px" }}>
            When the studio admin assigns you to a project build, it will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
