import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAllBriefs } from "@/lib/briefs-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const briefs = await getAllBriefs();
    return NextResponse.json({ success: true, data: briefs });
  } catch (error) {
    console.error("Error fetching briefs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch briefs" },
      { status: 500 }
    );
  }
}
