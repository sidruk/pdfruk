import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/analytics/auth";
import { getDailyStats, getTodayKey, isAnalyticsStorageConfigured } from "@/lib/analytics/store";

export async function GET(request: Request) {
  const session = cookies().get(ADMIN_COOKIE_NAME)?.value;

  if (!(await verifyAdminSession(session))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? getTodayKey();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
  }

  const stats = await getDailyStats(date);

  return NextResponse.json({
    ...stats,
    configured: isAnalyticsStorageConfigured(),
  });
}
