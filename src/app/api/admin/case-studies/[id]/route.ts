import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import {
  getCaseStudyById,
  updateCaseStudy,
  deleteCaseStudy,
  invalidateCaseStudiesCache,
} from "@/lib/case-studies-db";

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
  const item = await getCaseStudyById(id);
  if (!item) {
    return NextResponse.json({ error: "Case study not found" }, { status: 404 });
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
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.oneLiner !== undefined) updateData.oneLiner = body.oneLiner.trim();
    if (body.resultStat !== undefined) updateData.resultStat = body.resultStat.trim();
    if (body.briefDescription !== undefined) updateData.briefDescription = body.briefDescription.trim();
    if (body.status !== undefined) updateData.status = body.status === "in-progress" ? "in-progress" : "live";
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder);

    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === "string"
        ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];
    }

    if (body.liveUrl !== undefined) {
      updateData.liveUrl = body.liveUrl && body.liveUrl.trim() ? body.liveUrl.trim() : null;
    }

    const updated = await updateCaseStudy(id, updateData);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Case study not found" },
        { status: 404 }
      );
    }

    invalidateCaseStudiesCache();
    revalidatePath("/", "layout");
    revalidatePath("/work");
    revalidatePath("/");
    revalidatePath("/admin/case-studies");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update case study:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update case study" },
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
    const deleted = await deleteCaseStudy(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete case study" },
        { status: 400 }
      );
    }

    invalidateCaseStudiesCache();
    revalidatePath("/", "layout");
    revalidatePath("/work");
    revalidatePath("/");
    revalidatePath("/admin/case-studies");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete case study:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to delete case study" },
      { status: 500 }
    );
  }
}
