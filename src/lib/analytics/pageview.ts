import type { NextRequest } from "next/server";

const IGNORED_PREFIXES = [
  "/api/",
  "/admin/",
  "/_next/",
  "/favicon",
];

const IGNORED_EXTENSIONS = /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$/i;

export function shouldTrackPageView(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/analytics/pageview") return false;
  if (pathname === "/api/analytics/event") return false;
  if (IGNORED_EXTENSIONS.test(pathname)) return false;

  return !IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
