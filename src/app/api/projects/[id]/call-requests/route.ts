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

  const requests = await prisma.callRequest.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    include: { requestedBy: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ success: true, requests });
}

export async function POST(
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

  const body = await request.json();
  const { preferredTimes, topic } = body;

  if (!preferredTimes || !topic) {
    return NextResponse.json({ success: false, error: "Preferred times and topic are required" }, { status: 400 });
  }

  const callRequest = await prisma.callRequest.create({
    data: {
      projectId: id,
      requestedById: user.userId,
      preferredTimes: preferredTimes.trim(),
      topic: topic.trim(),
      status: "PENDING",
    },
  });

  // Automatically log notification in timeline
  await prisma.projectUpdate.create({
    data: {
      projectId: id,
      authorId: user.userId,
      note: `📅 Sync Call Requested by ${user.name}: "${topic}". Availability: ${preferredTimes}`,
    },
  });

  return NextResponse.json({ success: true, callRequest });
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
  const { callRequestId, status, confirmedTime, meetingUrl } = body;

  if (!callRequestId) {
    return NextResponse.json({ success: false, error: "callRequestId is required" }, { status: 400 });
  }

  const updated = await prisma.callRequest.update({
    where: { id: callRequestId },
    data: {
      status: status || "CONFIRMED",
      confirmedTime: confirmedTime ? new Date(confirmedTime) : null,
      meetingUrl: meetingUrl || null,
    },
  });

  if (confirmedTime) {
    // Update project nextCallAt as well!
    await prisma.project.update({
      where: { id },
      data: { nextCallAt: new Date(confirmedTime) },
    });

    const formatted = new Date(confirmedTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    await prisma.projectUpdate.create({
      data: {
        projectId: id,
        authorId: user.userId,
        note: `📅 Live Sync Confirmed for ${formatted}. ${meetingUrl ? `Meeting Link: ${meetingUrl}` : ""}`,
      },
    });
  }

  return NextResponse.json({ success: true, callRequest: updated });
}
