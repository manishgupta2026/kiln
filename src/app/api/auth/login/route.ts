import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSessionToken, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { LoginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const rl = rateLimit(`login:${ip}`, 10, 60);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: `Too many login attempts. Please try again in ${rl.reset}s.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectUrl,
    });

    setSessionCookie(response, sessionToken);
    return response;
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
