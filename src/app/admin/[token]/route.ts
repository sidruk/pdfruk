import { NextResponse } from "next/server";

import {
  getAdminCookieOptions,
  getAdminSessionToken,
  verifyAdminToken,
} from "@/lib/analytics/auth";

export async function GET(
  _request: Request,
  { params }: { params: { token: string } },
) {
  if (!verifyAdminToken(params.token)) {
    return NextResponse.redirect(new URL("/", _request.url));
  }

  const sessionToken = await getAdminSessionToken();
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/", _request.url));
  }

  const response = NextResponse.redirect(new URL("/admin/dashboard", _request.url));
  response.cookies.set("pdfruk_admin_auth", sessionToken, getAdminCookieOptions());
  return response;
}
