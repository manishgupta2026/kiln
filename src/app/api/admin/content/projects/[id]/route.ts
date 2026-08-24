import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSessionFromCookies } from "@/lib/auth";
import { updateProject, deleteProject } from "@/lib/content-db";

export const dynamic = "force-dynamic";

export async function PUT(
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

    if (body.tags && typeof body.tags === "string") {
      body.tags = body.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    const updated = await updateProject(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/work");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
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
    const deleted = await deleteProject(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/work");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
