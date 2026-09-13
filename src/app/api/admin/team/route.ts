import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import {
  getTeamMembers,
  createTeamMember,
  invalidateTeamCache,
} from "@/lib/team-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getTeamMembers();
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.name || !body.role || !body.bio) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, role, and bio are required",
        },
        { status: 400 }
      );
    }

    const created = await createTeamMember({
      name: body.name.trim(),
      role: body.role.trim(),
      avatar: body.avatar && body.avatar.trim() ? body.avatar.trim() : body.name.charAt(0).toUpperCase(),
      bio: body.bio.trim(),
      displayOrder: Number(body.displayOrder) || 0,
    });

    invalidateTeamCache();
    revalidatePath("/about");
    revalidatePath("/admin/team");

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create team member:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to create team member" },
      { status: 500 }
    );
  }
}
