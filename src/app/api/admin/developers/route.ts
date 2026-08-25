import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const developers = await prisma.user.findMany({
    where: { role: "DEVELOPER" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      passwordHash: true,
      projectAssignments: {
        include: {
          project: { select: { id: true, name: true, phase: true, status: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = developers.map((d: any) => ({
    id: d.id,
    email: d.email,
    name: d.name,
    role: d.role,
    createdAt: d.createdAt,
    hasPassword: !!d.passwordHash,
    activeProjects: d.projectAssignments.map((pa: any) => pa.project),
  }));

  return NextResponse.json({ success: true, developers: formatted });
}
