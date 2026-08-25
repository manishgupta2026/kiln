import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma, Role } from "@/lib/prisma";

export const SESSION_COOKIE = "kiln_session";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    "kiln-production-client-portal-jwt-secret-2026"
);

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

/**
 * Server-side helper to read and verify the active session in Route Handlers & Server Components
 */
export async function getSessionUser(request?: NextRequest): Promise<SessionUser | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(SESSION_COOKIE)?.value;
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE)?.value;
    } catch {
      // Ignore if outside request context
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Set session cookie on response
 */
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Strict IDOR Authorization Check:
 * - ADMIN: Access any project
 * - CLIENT: Access ONLY if project.clientId === user.userId
 * - DEVELOPER: Access ONLY if assigned in ProjectDeveloper
 */
export async function canAccessProject(
  user: SessionUser,
  projectId: string
): Promise<{ allowed: boolean; project?: any }> {
  if (user.role === "ADMIN") {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        developers: {
          include: {
            developer: { select: { id: true, name: true, email: true } },
          },
        },
        brief: true,
      },
    });
    return { allowed: !!project, project };
  }

  if (user.role === "CLIENT") {
    const project = await prisma.project.findFirst({
      where: { id: projectId, clientId: user.userId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        developers: {
          include: {
            developer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    return { allowed: !!project, project };
  }

  if (user.role === "DEVELOPER") {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        developers: { some: { developerId: user.userId } },
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        developers: {
          include: {
            developer: { select: { id: true, name: true, email: true } },
          },
        },
        brief: true,
      },
    });
    return { allowed: !!project, project };
  }

  return { allowed: false };
}
