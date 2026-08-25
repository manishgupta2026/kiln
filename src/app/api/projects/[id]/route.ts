import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessProject } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { allowed, project } = await canAccessProject(user, id);

  if (!allowed || !project) {
    return NextResponse.json({ success: false, error: "Project not found or access denied." }, { status: 404 });
  }

  // Include full details, latest updates, tickets, milestones, call requests
  const fullProject = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      developers: {
        include: { developer: { select: { id: true, name: true, email: true } } },
      },
      updates: {
        orderBy: { createdAt: "desc" },
      },
      milestones: {
        orderBy: { order: "asc" },
      },
      callRequests: {
        orderBy: { createdAt: "desc" },
        include: { requestedBy: { select: { id: true, name: true, email: true } } },
      },
      tickets: {
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: { sender: { select: { id: true, name: true, role: true } } },
          },
        },
      },
      brief: true,
    },
  });

  return NextResponse.json({ success: true, project: fullProject });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== "ADMIN" && user.role !== "DEVELOPER")) {
    return NextResponse.json({ success: false, error: "Unauthorized. Dev or Admin role required." }, { status: 403 });
  }

  const { id } = await params;
  const { allowed } = await canAccessProject(user, id);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Access denied to this project." }, { status: 403 });
  }

  const body = await request.json();
  const {
    name,
    phase,
    status,
    nextCallAt,
    developerIds,
    stagingUrl,
    productionUrl,
    figmaUrl,
    driveUrl,
    depositStatus,
    depositAmount,
    finalStatus,
    finalAmount,
    invoiceUrl,
  } = body;

  // Handle assigned developers update if provided (Admin only)
  if (developerIds && user.role === "ADMIN") {
    await prisma.projectDeveloper.deleteMany({
      where: { projectId: id },
    });
    await prisma.projectDeveloper.createMany({
      data: developerIds.map((devId: string) => ({
        projectId: id,
        developerId: devId,
      })),
    });
  }

  // If phase is changing, automatically add a timeline update
  const current = await prisma.project.findUnique({ where: { id } });
  if (phase && current && current.phase !== phase) {
    const phaseNames: Record<string, string> = {
      DISCOVER: "Discover",
      DESIGN: "Design",
      BUILD: "Build",
      SHIP_AND_ITERATE: "Ship & Iterate",
    };
    await prisma.projectUpdate.create({
      data: {
        projectId: id,
        authorId: user.userId,
        note: `Project stage advanced to ${phaseNames[phase] || phase}.`,
      },
    });
  }

  let formattedNextCallAt: Date | null | undefined = undefined;
  if (nextCallAt !== undefined) {
    formattedNextCallAt = nextCallAt && nextCallAt.trim() !== "" ? new Date(nextCallAt) : null;
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(phase !== undefined && { phase }),
      ...(status !== undefined && { status }),
      ...(formattedNextCallAt !== undefined && { nextCallAt: formattedNextCallAt }),
      ...(stagingUrl !== undefined && { stagingUrl }),
      ...(productionUrl !== undefined && { productionUrl }),
      ...(figmaUrl !== undefined && { figmaUrl }),
      ...(driveUrl !== undefined && { driveUrl }),
      ...(depositStatus !== undefined && { depositStatus }),
      ...(depositAmount !== undefined && { depositAmount }),
      ...(finalStatus !== undefined && { finalStatus }),
      ...(finalAmount !== undefined && { finalAmount }),
      ...(invoiceUrl !== undefined && { invoiceUrl }),
    },
    include: {
      client: true,
      developers: { include: { developer: true } },
      updates: { orderBy: { createdAt: "desc" } },
      milestones: { orderBy: { order: "asc" } },
      callRequests: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json({ success: true, project: updated });
}
