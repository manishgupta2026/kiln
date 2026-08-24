import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSessionFromCookies } from "@/lib/auth";
import { updateTrustConfig, getSiteContent } from "@/lib/content-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuthenticated = await getAdminSessionFromCookies();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  return NextResponse.json({ success: true, data: content.trust });
}

export async function PATCH(req: Request) {
  const isAuthenticated = await getAdminSessionFromCookies();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await updateTrustConfig(body);

    // Invalidate homepage cache immediately
    revalidatePath("/", "layout");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update trust config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update trust configuration" },
      { status: 500 }
    );
  }
}
