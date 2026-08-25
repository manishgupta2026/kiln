import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let projects;

  if (user.role === "ADMIN") {
    projects = await prisma.project.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        developers: {
          include: { developer: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tickets: true, messages: true, updates: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  } else if (user.role === "DEVELOPER") {
    projects = await prisma.project.findMany({
      where: {
        developers: { some: { developerId: user.userId } },
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        developers: {
          include: { developer: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tickets: true, messages: true, updates: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  } else {
    // CLIENT
    projects = await prisma.project.findMany({
      where: { clientId: user.userId },
      include: {
        developers: {
          include: { developer: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tickets: true, messages: true, updates: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  return NextResponse.json({ success: true, projects });
}
