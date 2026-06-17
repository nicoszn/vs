import { NextRequest, NextResponse } from "next/server";

// Next.js 16: middleware.ts → proxy.ts, middleware() → proxy()
// This is a THIN routing layer only — cookie presence check for fast redirects.
// Actual session validation happens in the (authed) layout via DB lookup.

const PROTECTED = /^\/(dashboard|portfolio|games|settings)(\/|$)/;
const AUTH_ROUTES = /^\/(login|register)(\/|$)/;
const SESSION_COOKIE = "invex_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Redirect logged-in users away from auth pages
  if (AUTH_ROUTES.test(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (PROTECTED.test(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static files, api routes, Next internals
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
