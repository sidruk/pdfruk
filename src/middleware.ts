import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminSession,
} from "@/lib/analytics/auth";
import { shouldTrackPageView } from "@/lib/analytics/pageview";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/dashboard")) {
    const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifyAdminSession(session))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname === "/admin/login") {
    const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (await verifyAdminSession(session)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  if (shouldTrackPageView(request)) {
    const pageviewUrl = request.nextUrl.clone();
    pageviewUrl.pathname = "/api/analytics/pageview";
    pageviewUrl.search = "";
    void fetch(pageviewUrl, { method: "POST" }).catch(() => undefined);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
