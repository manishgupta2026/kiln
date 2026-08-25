import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessProject } from "@/lib/auth";
import { CreateMessageSchema } from "@/lib/validators";
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

  const searchParams = request.nextUrl.searchParams;
  const ticketId = searchParams.get("ticketId");

  const messages = await prisma.message.findMany({
    where: {
      projectId: id,
      ticketId: ticketId ? ticketId : null,
    },
    include: {
      sender: {
        select: { id: true, name: true, role: true, email: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ success: true, messages });
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

  const rl = rateLimit(`msg:${user.userId}`, 20, 60);
  if (!rl.success) {
    return NextResponse.json({ success: false, error: "Too many messages sent. Please slow down." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = CreateMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { body: messageText, ticketId } = parsed.data;

  const message = await prisma.message.create({
    data: {
      projectId: id,
      ticketId: ticketId || null,
      senderId: user.userId,
      body: messageText,
    },
    include: {
      sender: {
        select: { id: true, name: true, role: true, email: true },
      },
    },
  });

  // If this was a ticket message, bump the ticket's updatedAt
  if (ticketId) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });
  }

  await prisma.project.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ success: true, message });
}
