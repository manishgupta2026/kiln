import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { createAuthToken } from "@/lib/tokens";
import { sendOnboardingEmail } from "@/lib/email";
import { InviteDeveloperSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = InviteDeveloperSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, name } = parsed.data;

    let devUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (devUser) {
      if (devUser.role !== "DEVELOPER") {
        await prisma.user.update({
          where: { id: devUser.id },
          data: { role: "DEVELOPER" },
        });
      }
    } else {
      devUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          role: "DEVELOPER",
        },
      });
    }

    const authToken = await createAuthToken(devUser.id, "onboard", 72);
    const origin = request.headers.get("origin") || request.nextUrl.origin || "http://localhost:3000";
    const inviteUrl = `${origin}/onboard/${authToken.token}`;

    await sendOnboardingEmail(devUser.email, devUser.name, inviteUrl, "DEVELOPER");

    return NextResponse.json({
      success: true,
      developer: { id: devUser.id, email: devUser.email, name: devUser.name },
      inviteUrl,
      message: `Invitation sent to ${devUser.email}`,
    });
  } catch (error: any) {
    console.error("Invite developer API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to invite developer." },
      { status: 500 }
    );
  }
}
