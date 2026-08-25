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
    const tokenValidation = await validateAuthToken(token, "reset");
    if (!tokenValidation.valid || !tokenValidation.user) {
      return NextResponse.json(
        { success: false, error: tokenValidation.error || "Invalid or expired token." },
        { status: 400 }
      );
    }

    const user = tokenValidation.user;
    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await consumeAuthToken(token);

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
      message: "Password reset successful.",
      redirectUrl,
    });

    setSessionCookie(response, sessionToken);
    return response;
  } catch (error: any) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password." },
      { status: 500 }
    );
  }
}
