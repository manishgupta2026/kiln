import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import {
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
  invalidateTeamCache,
} from "@/lib/team-db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getTeamMemberById(id);
  if (!item) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: item });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.role !== undefined) updateData.role = body.role.trim();
    if (body.avatar !== undefined) updateData.avatar = body.avatar.trim();
    if (body.bio !== undefined) updateData.bio = body.bio.trim();
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder);

    const updated = await updateTeamMember(id, updateData);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Team member not found" },
        { status: 404 }
      );
    }

    invalidateTeamCache();
    revalidatePath("/about");
    revalidatePath("/admin/team");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update team member:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteTeamMember(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete team member" },
        { status: 400 }
      );
    }

    invalidateTeamCache();
    revalidatePath("/about");
    revalidatePath("/admin/team");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete team member:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to delete team member" },
      { status: 500 }
    );
  }
}
