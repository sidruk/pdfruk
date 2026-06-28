import { NextResponse } from "next/server";

import { isTrackableToolId } from "@/lib/analytics/constants";
import { incrementPageView, incrementToolUse } from "@/lib/analytics/store";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("type" in body)) {
    return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
  }

  const event = body as { type: string; tool?: string };

  if (event.type === "pageview") {
    await incrementPageView();
    return NextResponse.json({ ok: true });
  }

  if (event.type === "tool_complete") {
    if (!event.tool || !isTrackableToolId(event.tool)) {
      return NextResponse.json({ error: "Invalid tool id." }, { status: 400 });
    }

    await incrementToolUse(event.tool);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown event type." }, { status: 400 });
}
