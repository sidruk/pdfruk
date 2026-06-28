import { NextResponse } from "next/server";

import { incrementPageView } from "@/lib/analytics/store";

export async function POST() {
  await incrementPageView();
  return NextResponse.json({ ok: true });
}
