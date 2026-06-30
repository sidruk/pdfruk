import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminSession,
} from "@/lib/analytics/auth";
import { shouldTrackPageView } from "@/lib/analytics/pageview";
import { isSocialPreviewCrawler } from "@/lib/seo/indexing";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent");

  if (isSocialPreviewCrawler(userAgent) && request.headers.has("range")) {
    const headers = new Headers(request.headers);
    headers.delete("range");

    return NextResponse.next({
      request: { headers },
    });
  }

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
