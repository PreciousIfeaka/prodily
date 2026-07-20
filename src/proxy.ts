import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that never need auth
const PUBLIC_PATHS = ["/signin", "/signup", "/register", "/verify", "/_next", "/api", "/favicon.ico"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip all Next.js internals and static files
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session_token")?.value;
  const role = req.cookies.get("session_role")?.value; // "admin" | "team_lead" | "team_member"

  // Not authenticated → send to sign in
  if (!token || !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  // Root → redirect to role-specific home (only once, no loop)
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    if (role === "admin") url.pathname = "/admin";
    else if (role === "team_lead") url.pathname = "/team-lead";
    else url.pathname = "/employee";
    return NextResponse.redirect(url);
  }

  // Enforce Admin-only section
  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = role === "team_lead" ? "/team-lead" : "/employee";
    return NextResponse.redirect(url);
  }

  // Enforce Team-Lead-only section
  if (pathname.startsWith("/team-lead") && role !== "team_lead") {
    const url = req.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin" : "/employee";
    return NextResponse.redirect(url);
  }

  // /employee is accessible to team_member AND team_lead (they're also employees)
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
