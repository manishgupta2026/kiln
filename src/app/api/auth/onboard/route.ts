import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSessionToken, setSessionCookie } from "@/lib/auth";
import { validateAuthToken, consumeAuthToken } from "@/lib/tokens";
import { SetPasswordSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const tokenValidation = await validateAuthToken(token, "onboard");
    if (!tokenValidation.valid || !tokenValidation.user) {
      return NextResponse.json(
        { success: false, error: tokenValidation.error || "Invalid token" },
        { status: 400 }
      );
    }

    const user = tokenValidation.user;
    const passwordHash = await hashPassword(password);

    // Update user password and consume token
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await consumeAuthToken(token);

    // Auto-login the user
    const sessionToken = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    let redirectUrl = "/dashboard";
    if (user.role === "ADMIN") redirectUrl = "/admin";
    if (user.role === "DEVELOPER") redirectUrl = "/dev";

    const response = NextResponse.json({
      success: true,
      message: "Account setup complete.",
      redirectUrl,
    });

    setSessionCookie(response, sessionToken);
    return response;
  } catch (error: any) {
    console.error("Onboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete account setup. Please try again." },
      { status: 500 }
    );
  }
}
