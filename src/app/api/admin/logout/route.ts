import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out" });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
