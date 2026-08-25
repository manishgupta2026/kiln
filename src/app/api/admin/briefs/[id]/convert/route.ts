import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { createAuthToken } from "@/lib/tokens";
import { sendOnboardingEmail } from "@/lib/email";
import { ConvertBriefSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { id: briefId } = await params;
    const brief = await prisma.brief.findUnique({
      where: { id: briefId },
      include: { project: true },
    });

    if (!brief) {
      return NextResponse.json({ success: false, error: "Brief not found." }, { status: 404 });
    }

    if (brief.project) {
      return NextResponse.json(
        { success: false, error: "This brief has already been converted to a project." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = ConvertBriefSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { projectName, developerIds } = parsed.data;

    // 1. Find or create CLIENT user
    let clientUser = await prisma.user.findUnique({
      where: { email: brief.email.toLowerCase() },
    });

    let isNewUser = false;
    if (!clientUser) {
      isNewUser = true;
      clientUser = await prisma.user.create({
        data: {
          email: brief.email.toLowerCase(),
          name: brief.name,
          role: "CLIENT",
        },
      });
    }

    // 2. Create the Project
    const project = await prisma.project.create({
      data: {
        name: projectName,
        briefId: brief.id,
        clientId: clientUser.id,
        phase: "DISCOVER",
        status: "ACTIVE",
        developers: {
          create: developerIds.map((devId) => ({
            developerId: devId,
          })),
        },
        updates: {
          create: {
            authorId: user.userId,
            note: `Project officially converted from brief. Kickoff and discovery phase initiated.`,
          },
        },
      },
      include: {
        client: true,
        developers: { include: { developer: true } },
      },
    });

    // 3. Mark brief as converted
    await prisma.brief.update({
      where: { id: brief.id },
      data: { status: "converted" },
    });

    // 4. If client has no password yet (new client or first conversion), generate onboarding link & email
    let inviteUrl: string | undefined;
    if (!clientUser.passwordHash || isNewUser) {
      const authToken = await createAuthToken(clientUser.id, "onboard", 72);
      const origin = request.headers.get("origin") || request.nextUrl.origin || "http://localhost:3000";
      inviteUrl = `${origin}/onboard/${authToken.token}`;

      await sendOnboardingEmail(clientUser.email, clientUser.name, inviteUrl, "CLIENT");
    }

    return NextResponse.json({
      success: true,
      project,
      inviteUrl,
      message: `Project "${projectName}" created successfully.`,
    });
  } catch (error: any) {
    console.error("Convert brief API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to convert brief." },
      { status: 500 }
    );
  }
}
