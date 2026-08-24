import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/content-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    console.error("Failed to get site content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
