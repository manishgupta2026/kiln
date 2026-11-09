import { NextRequest, NextResponse } from "next/server";
import { prisma, sanitizeDatabaseError } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { syncCloudflareEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    syncCloudflareEnv();
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

    const formatted = (developers || []).map((d: any) => ({
      id: d.id,
      email: d.email,
      name: d.name,
      role: d.role,
      createdAt: d.createdAt,
      hasPassword: !!d.passwordHash,
      activeProjects: (d.projectAssignments || []).map((pa: any) => pa.project),
    }));

    return NextResponse.json({ success: true, developers: formatted });
  } catch (err: any) {
    console.error("[API Error] Failed to fetch developers:", err);
    return NextResponse.json(
      { success: false, error: sanitizeDatabaseError(err, "Failed to load developers.") },
      { status: 500 }
    );
  }
}
