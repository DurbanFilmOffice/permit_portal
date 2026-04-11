// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   // TODO: Replace with Auth.js middleware once configured
//   // See .claude/architecture.md for route protection rules
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
// };

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // This function can be marked `async` if using `await` inside
// export function proxy(request: NextRequest) {
//   return NextResponse.redirect(new URL("/home", request.url));
// }

// export const config = {
//   matcher: "/about/:path*",
// };

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Role } from "@/lib/validations/roles";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role as Role | undefined;
  const path = nextUrl.pathname;

  // ── Public paths — always allow ───────────────────────────
  const publicPaths = [
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ];
  const isPublicPath = publicPaths.some((p) => path.startsWith(p));

  if (isPublicPath) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(getDashboardUrl(role), nextUrl));
    }
    return NextResponse.next();
  }

  // ── Not logged in ─────────────────────────────────────────
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // ── /admin/config — super_admin only ──────────────────────
  if (path.startsWith("/admin/config") && role !== "super_admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
  }

  // ── /admin/users — admin | super_admin only ───────────────
  if (
    path.startsWith("/admin/users") &&
    !(["admin", "permit_admin", "super_admin"] as Role[]).includes(role as Role)
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
  }

  // ── /admin/* — internal roles only ────────────────────────
  const internalRoles: Role[] = [
    "external_user",
    "permit_officer",
    "permit_admin",
    "admin",
    "super_admin",
  ];
  if (path.startsWith("/admin") && !internalRoles.includes(role as Role)) {
    return NextResponse.redirect(new URL("/applications", nextUrl));
  }

  return NextResponse.next();
});

function getDashboardUrl(role: Role | undefined): string {
  if (!role || role === "applicant") return "/applications";
  return "/admin/dashboard";
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
