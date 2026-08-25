import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessProject } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { allowed } = await canAccessProject(user, id);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
  }

  const milestones = await prisma.projectMilestone.findMany({
    where: { projectId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ success: true, milestones });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== "ADMIN" && user.role !== "DEVELOPER")) {
    return NextResponse.json({ success: false, error: "Dev or Admin role required" }, { status: 403 });
  }

  const { id } = await params;
  const { allowed } = await canAccessProject(user, id);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description } = body;

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
  }

  // Count existing milestones to set order
  const count = await prisma.projectMilestone.count({ where: { projectId: id } });

  const milestone = await prisma.projectMilestone.create({
    data: {
      projectId: id,
      title: title.trim(),
      description: description ? description.trim() : null,
      order: count,
    },
  });

  return NextResponse.json({ success: true, milestone });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== "ADMIN" && user.role !== "DEVELOPER")) {
    return NextResponse.json({ success: false, error: "Dev or Admin role required" }, { status: 403 });
  }

  const { id } = await params;
  const { allowed } = await canAccessProject(user, id);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
  }

  const body = await request.json();
  const { milestoneId, isCompleted, title, description } = body;

  if (!milestoneId) {
    return NextResponse.json({ success: false, error: "milestoneId is required" }, { status: 400 });
  }

  const updated = await prisma.projectMilestone.update({
    where: { id: milestoneId },
    data: {
      ...(isCompleted !== undefined && {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
    },
  });

  // If completed, optionally record a timeline update note
  if (isCompleted) {
    await prisma.projectUpdate.create({
      data: {
        projectId: id,
        authorId: user.userId,
        note: `✓ Milestone deliverable completed: "${updated.title}"`,
      },
    });
  }

  return NextResponse.json({ success: true, milestone: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== "ADMIN" && user.role !== "DEVELOPER")) {
    return NextResponse.json({ success: false, error: "Dev or Admin role required" }, { status: 403 });
  }

  const { id } = await params;
  const { allowed } = await canAccessProject(user, id);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
  }

  const url = new URL(request.url);
  const milestoneId = url.searchParams.get("milestoneId");

  if (!milestoneId) {
    return NextResponse.json({ success: false, error: "milestoneId query param is required" }, { status: 400 });
  }

  await prisma.projectMilestone.delete({
    where: { id: milestoneId },
  });

  return NextResponse.json({ success: true });
}
