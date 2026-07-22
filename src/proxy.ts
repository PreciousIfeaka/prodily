import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/signin", "/signup", "/register", "/forgot-password", "/reset-password", "/verify", "/privacy", "/terms", "/_next", "/api", "/favicon.ico"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (/\.(?:png|jpe?g|gif|svg|ico|webp|avif|woff2?|ttf|otf|mp4|webm)$/i.test(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session_token")?.value;
  const role = req.cookies.get("session_role")?.value;

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (!token || !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = role === "team_lead" ? "/team-lead" : "/employee";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/team-lead") && role !== "team_lead") {
    const url = req.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin" : "/employee";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/employee") && role === "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
