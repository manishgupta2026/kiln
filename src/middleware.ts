import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "kiln_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    "kiln-production-client-portal-jwt-secret-2026"
);

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
      const { payload } = await jwtVerify(token, JWT_SECRET);
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
      const { payload } = await jwtVerify(token, JWT_SECRET);
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
      const { payload } = await jwtVerify(token, JWT_SECRET);
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
