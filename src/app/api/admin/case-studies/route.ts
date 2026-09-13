import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import {
  getCaseStudies,
  createCaseStudy,
  invalidateCaseStudiesCache,
} from "@/lib/case-studies-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getCaseStudies();
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.name || !body.category || !body.oneLiner || !body.resultStat) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, category, one-liner, and result stat are required",
        },
        { status: 400 }
      );
    }

    const tags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string"
      ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    const created = await createCaseStudy({
      name: body.name.trim(),
      category: body.category.trim(),
      oneLiner: body.oneLiner.trim(),
      resultStat: body.resultStat.trim(),
      briefDescription: (body.briefDescription || body.oneLiner).trim(),
      tags,
      liveUrl: body.liveUrl && body.liveUrl.trim() ? body.liveUrl.trim() : null,
      status: body.status === "in-progress" ? "in-progress" : "live",
      featured: Boolean(body.featured),
      displayOrder: Number(body.displayOrder) || 0,
    });

    invalidateCaseStudiesCache();
    revalidatePath("/", "layout");
    revalidatePath("/work");
    revalidatePath("/");
    revalidatePath("/admin/case-studies");

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create case study:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to create case study" },
      { status: 500 }
    );
  }
}
