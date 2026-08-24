import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth";
import { updateBriefStatus } from "@/lib/briefs-db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await getAdminSessionFromCookies();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["new", "read", "archived"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updatedBrief = await updateBriefStatus(id, status);
    if (!updatedBrief) {
      return NextResponse.json(
        { success: false, error: "Brief not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedBrief });
  } catch (error) {
    console.error("Error updating brief status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update brief" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await getAdminSessionFromCookies();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.brief.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brief:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete brief" },
      { status: 500 }
    );
  }
}
