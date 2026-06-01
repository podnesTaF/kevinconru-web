import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Edge "proxy" (Next 16's renamed middleware). Optimistic gate for /admin/*:
// reads only the JWT cookie via the edge-safe config — no DB. The admin
// layout's server-side auth() check remains authoritative.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthed = !!req.auth?.user;
  const onLogin = nextUrl.pathname.startsWith("/admin/login");

  // Unauthenticated → bounce to login (preserve intended destination).
  if (!isAuthed && !onLogin) {
    const url = new URL("/admin/login", nextUrl);
    url.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Already authenticated visiting the login page → send to dashboard.
  if (isAuthed && onLogin) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
