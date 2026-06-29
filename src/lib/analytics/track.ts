import type { TrackableToolId } from "@/lib/analytics/constants";
import { trackGa4Event } from "@/lib/analytics/ga4";

type AnalyticsEvent =
  | { type: "tool_complete"; tool: TrackableToolId }
  | { type: "pageview" };

function sendEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify(event);

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/event", blob);
    return;
  }

  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function trackToolComplete(tool: TrackableToolId): void {
  sendEvent({ type: "tool_complete", tool });
  trackGa4Event("tool_complete", { tool_name: tool });
}

export function trackPageView(): void {
  sendEvent({ type: "pageview" });
}
