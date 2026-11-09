import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuthToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimitDistributed, getClientIp } from "@/lib/rate-limit";
import { ForgotPasswordSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimitDistributed(`forgot:${ip}`, {
      limit: 5,
      windowSeconds: 60,
      policy: "fail-closed",
      endpointType: "auth",
    });
    if (!rl.success) {
      if (rl.backendError) {
        return NextResponse.json(
          { success: false, error: "Password reset service temporarily unavailable. Please retry in a few moments." },
          { status: 503, headers: { "Retry-After": "30" } }
        );
      }
      return NextResponse.json(
        { success: false, error: `Too many reset requests. Please wait before trying again.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always respond with success to prevent user enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent password reset instructions.",
      });
    }

    const authToken = await createAuthToken(user.id, "reset", 48);

    const origin = request.headers.get("origin") || request.nextUrl.origin || "http://localhost:3000";
    const resetUrl = `${origin}/reset-password/${authToken.token}`;

    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent password reset instructions.",
      // Include debug token for development environment
      ...(process.env.NODE_ENV !== "production" && { debugResetUrl: resetUrl }),
    });
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process password reset." },
      { status: 500 }
    );
  }
}
