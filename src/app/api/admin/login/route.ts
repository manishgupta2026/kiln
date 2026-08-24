import { NextResponse } from "next/server";
import { createAdminSession, setAdminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    const expectedPassword = process.env.ADMIN_PASSWORD || "kiln_admin_secret_2026";

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid admin password" },
        { status: 401 }
      );
    }

    const token = await createAdminSession();
    await setAdminCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
