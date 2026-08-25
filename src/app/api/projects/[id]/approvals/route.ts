import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessProject } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
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
    return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
  }

  const body = await request.json();
  const { phaseType } = body; // "DESIGN" | "BUILD"

  if (phaseType !== "DESIGN" && phaseType !== "BUILD") {
    return NextResponse.json({ success: false, error: "Invalid phaseType" }, { status: 400 });
  }

  const now = new Date();

  let updateData: any = {};
  let updateNote = "";

  if (phaseType === "DESIGN") {
    updateData = {
      designApprovedAt: now,
      phase: "BUILD", // Automatically advance to Build on design sign-off!
    };
    updateNote = `Client ${user.name} approved the Design phase. Project stage advanced to BUILD.`;
  } else if (phaseType === "BUILD") {
    updateData = {
      buildApprovedAt: now,
      phase: "SHIP_AND_ITERATE", // Automatically advance to Ship on build sign-off!
    };
    updateNote = `Client ${user.name} approved the Staging Build for production launch. Project stage advanced to SHIP & ITERATE.`;
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: updateData,
  });

  // Log written sign-off receipt in timeline
  await prisma.projectUpdate.create({
    data: {
      projectId: id,
      authorId: user.userId,
      note: `📋 Formal Sign-off Receipt: ${updateNote}`,
    },
  });

  return NextResponse.json({ success: true, project: updatedProject });
}
