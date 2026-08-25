import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessProject } from "@/lib/auth";
import { CreateProjectUpdateSchema } from "@/lib/validators";

export async function POST(
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
    return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = CreateProjectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }

  const update = await prisma.projectUpdate.create({
    data: {
      projectId: id,
      authorId: user.userId,
      note: parsed.data.note,
    },
  });

  await prisma.project.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ success: true, update });
}
