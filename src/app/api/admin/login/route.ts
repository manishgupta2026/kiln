import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSessionToken, setSessionCookie } from "@/lib/auth";
import { rateLimitDistributed, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await rateLimitDistributed(`admin-login:${ip}`, {
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

    const { email, password } = await req.json();

    const inputEmail = email ? (email as string).toLowerCase().trim() : null;
    if (!inputEmail || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Exact database lookup for registered administrator
    const user = await prisma.user.findUnique({
      where: { email: inputEmail },
    });

    if (!user || user.role !== "ADMIN" || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "ADMIN",
    });

    const response = NextResponse.json({ success: true, redirectUrl: "/admin" });
    setSessionCookie(response, token);
    return response;
  } catch (err: any) {
    console.error("Admin login API error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to process administrator login." },
      { status: 500 }
    );
  }
}
