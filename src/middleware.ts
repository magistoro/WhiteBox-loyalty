import { decodeJwt } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "wb_access_token";
const ROLES = new Set(["CLIENT", "ADMIN", "COMPANY"]);

function redirectToLogin(request: NextRequest) {
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  /** Public auth pages — no token required */
  if (path === "/login" || path === "/register") {
    return NextResponse.next();
  }

  /** Help & legal — readable without auth */
  if (path.startsWith("/help")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    /*
     * The web middleware is a UX router, not the security boundary.
     * API guards still verify JWT signatures before returning private data.
     * Decoding here avoids production lockouts when web/api env secrets drift.
     */
    const payload = decodeJwt(token);
    const role = typeof payload.role === "string" ? payload.role : undefined;
    const expiresAt = typeof payload.exp === "number" ? payload.exp * 1000 : 0;

    if (!role || !ROLES.has(role) || expiresAt <= Date.now()) {
      return redirectToLogin(request);
    }

    /** Partner / admin portals */
    if (path.startsWith("/admin")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }
    if (path.startsWith("/company")) {
      if (role !== "COMPANY" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    /**
     * Main TWA (Home, Map, History, Profile, Scan, loyalty flows) — **CLIENT only**.
     * Bottom nav: /, /map, /history, /settings; FAB /scan; plus companies, marketplace, wallet.
     */
    if (role === "CLIENT") {
      return NextResponse.next();
    }
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (role === "COMPANY") {
      return NextResponse.redirect(new URL("/company", request.url));
    }

    return redirectToLogin(request);
  } catch {
    return redirectToLogin(request);
  }
}

/**
 * Run on app routes only (not static assets handled by Next).
 * Includes all TWA client surfaces + auth pages + portals.
 */
export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/map",
    "/history",
    "/settings/:path*",
    "/scan",
    "/categories/:path*",
    "/companies/:path*",
    "/marketplace/:path*",
    "/wallet/:path*",
    "/admin/:path*",
    "/company/:path*",
    "/help/:path*",
  ],
};
