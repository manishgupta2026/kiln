import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSessionToken, setSessionCookie } from "@/lib/auth";
import { rateLimitDistributed, getClientIp } from "@/lib/rate-limit";
import { LoginSchema } from "@/lib/validators";
import { syncCloudflareEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    syncCloudflareEnv();
    const ip = getClientIp(request);
    
    // Strict IP-based login rate limit: max 5 attempts per minute with fail-closed policy
    const rl = await rateLimitDistributed(`login:${ip}`, {
      limit: 5,
      windowSeconds: 60,
      policy: "fail-closed",
      endpointType: "auth",
    });
    if (!rl.success) {
      if (rl.backendError) {
        return NextResponse.json(
          { success: false, error: "Authentication service temporarily unavailable. Please retry in a few moments." },
          { status: 503, headers: { "Retry-After": "30" } }
        );
      }
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
    const normalizedEmail = email.toLowerCase().trim();

    // Exact database lookup only — no prefix matching or fallback users
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (dbErr: any) {
      console.error("[Auth Error] User database lookup failed:", dbErr?.message || String(dbErr));
      return NextResponse.json(
        {
          success: false,
          error: "Authentication service temporarily unavailable.",
        },
        { status: 500 }
      );
    }

    // Require exact database account with existing password hash
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Cryptographic password verification using bcrypt
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Sign session token with strict claims (issuer, audience, 7d expiry)
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
    // Log complete error details server-side without leaking internals to the client
    console.error("Login route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process login request.",
      },
      { status: 500 }
    );
  }
}
