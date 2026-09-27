import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAllCareerApplications } from "@/lib/careers-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const applications = await getAllCareerApplications({ type, status });
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error("Error fetching career applications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch career applications" },
      { status: 500 }
    );
  }
}
