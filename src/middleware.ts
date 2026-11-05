import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

import { getEnv } from "@/lib/env";

const SESSION_COOKIE = "digigrantha_session";

let _cachedMiddlewareSecret: Uint8Array | null = null;
let _cachedMiddlewareSecretRaw: string | null = null;

function getJwtSecret(): Uint8Array {
  const secret =
    getEnv("NEXTAUTH_SECRET") ||
    getEnv("ADMIN_JWT_SECRET") ||
    "digigrantha-production-client-portal-jwt-secret-2026";
  if (_cachedMiddlewareSecret && _cachedMiddlewareSecretRaw === secret) {
    return _cachedMiddlewareSecret;
  }
  _cachedMiddlewareSecretRaw = secret;
  _cachedMiddlewareSecret = new TextEncoder().encode(secret);
  return _cachedMiddlewareSecret;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Client Portal Protection (/dashboard)
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      const role = payload.role as string;
      if (role !== "CLIENT" && role !== "ADMIN") {
        if (role === "DEVELOPER") {
          return NextResponse.redirect(new URL("/dev", request.url));
        }
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  // 2. Developer Portal Protection (/dev)
  if (pathname.startsWith("/dev")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      const role = payload.role as string;
      if (role !== "DEVELOPER" && role !== "ADMIN") {
        if (role === "CLIENT") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  // 3. Admin Portal Protection (/admin)
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      // Redirect legacy admin login to unified login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      const role = payload.role as string;
      if (role !== "ADMIN") {
        if (role === "DEVELOPER") return NextResponse.redirect(new URL("/dev", request.url));
        if (role === "CLIENT") return NextResponse.redirect(new URL("/dashboard", request.url));
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dev/:path*", "/admin/:path*"],
};
