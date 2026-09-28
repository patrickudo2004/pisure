import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/upload", "/admin"];

export function middleware(req: NextRequest) {
  // Cheap cookie-presence gate (deep session verification happens server-side
  // in the route handlers / server components that need it).
  const sessionCookie = getSessionCookie(req);
  const isProtected = protectedPaths.some((p) =>
    req.nextUrl.pathname.startsWith(p),
  );

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/upload/:path*", "/admin/:path*"],
};
