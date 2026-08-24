import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSessionFromCookies } from "@/lib/auth";
import { getAllProjects, createProject } from "@/lib/content-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuthenticated = await getAdminSessionFromCookies();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getAllProjects();
  return NextResponse.json({ success: true, data: projects });
}

export async function POST(req: Request) {
  const isAuthenticated = await getAdminSessionFromCookies();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.name || !body.category || !body.oneLiner) {
      return NextResponse.json(
        { success: false, error: "Name, category, and one-liner are required" },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const allProjects = await getAllProjects();
    const nextIdx = String(allProjects.length + 1).padStart(2, "0");

    const newProject = await createProject({
      slug,
      idx: body.idx || nextIdx,
      name: body.name,
      category: body.category,
      oneLiner: body.oneLiner,
      homepageOneLiner: body.homepageOneLiner || body.oneLiner,
      result: body.result || "Live in production",
      tags: Array.isArray(body.tags) ? body.tags : (body.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
      status: body.status === "in-progress" ? "in-progress" : undefined,
      mobilePreview: body.mobilePreview || body.oneLiner,
      preview: body.preview || {
        label: body.result || body.name,
        svg: `<svg viewBox="0 0 200 100"><rect x="20" y="20" width="160" height="60" rx="8" fill="#75801F" opacity="0.25"/><text x="100" y="55" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="#75801F">${body.name}</text></svg>`,
      },
      featured: body.featured ?? true,
    });

    revalidatePath("/", "layout");
    revalidatePath("/work");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: newProject }, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
