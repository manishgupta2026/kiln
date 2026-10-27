import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const inputEmail = email ? (email as string).toLowerCase().trim() : null;
    let user = null;

    if (inputEmail) {
      user = await prisma.user.findUnique({
        where: { email: inputEmail },
      });
    } else {
      user = await prisma.user.findFirst({
        where: {
          role: "ADMIN",
          email: { in: ["admin@digigrantha.com", "admin@kiln.design"] },
        },
      });
      if (!user) {
        user = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      }
    }

    if (!user || user.role !== "ADMIN" || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, redirectUrl: "/admin" });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
