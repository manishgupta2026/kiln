import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearAdminCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
