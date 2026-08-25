import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessProject } from "@/lib/auth";
import { UpdateTicketStatusSchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      project: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
  }

  const { allowed } = await canAccessProject(user, ticket.projectId);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
  }

  return NextResponse.json({ success: true, ticket });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
  });

  if (!ticket) {
    return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
  }

  const { allowed } = await canAccessProject(user, ticket.projectId);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = UpdateTicketStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      status: parsed.data.status,
      updatedAt: new Date(),
    },
    include: {
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  return NextResponse.json({ success: true, ticket: updated });
}
