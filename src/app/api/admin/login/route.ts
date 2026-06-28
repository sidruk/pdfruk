import { NextResponse } from "next/server";

import {
  getAdminCookieOptions,
  getAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/analytics/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/analytics/constants";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };

  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!verifyAdminCredentials(body.username, body.password)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const sessionToken = await getAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, sessionToken, getAdminCookieOptions());
  return response;
}
