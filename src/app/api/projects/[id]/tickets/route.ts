import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessProject } from "@/lib/auth";
import { CreateTicketSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

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
    return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
  }

  const tickets = await prisma.ticket.findMany({
    where: { projectId: id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ success: true, tickets });
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
    return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
  }

  const rl = rateLimit(`ticket:${user.userId}`, 5, 60);
  if (!rl.success) {
    return NextResponse.json({ success: false, error: "Too many ticket requests. Please wait." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = CreateTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { subject, body: messageBody } = parsed.data;

  const ticket = await prisma.ticket.create({
    data: {
      projectId: id,
      createdById: user.userId,
      subject,
      status: "OPEN",
      messages: {
        create: {
          projectId: id,
          senderId: user.userId,
          body: messageBody,
        },
      },
    },
    include: {
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  await prisma.project.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ success: true, ticket });
}
