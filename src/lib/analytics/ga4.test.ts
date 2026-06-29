import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  GA_MEASUREMENT_ID,
  isGa4Enabled,
  trackGa4Event,
  trackGa4PageView,
} from "@/lib/analytics/ga4";

describe("ga4", () => {
  beforeEach(() => {
    window.gtag = vi.fn();
  });

  afterEach(() => {
    delete window.gtag;
  });

  it("isGa4Enabled returns true", () => {
    expect(isGa4Enabled()).toBe(true);
  });

  it("trackGa4PageView sends a config event", () => {
    trackGa4PageView("/merge");
    expect(window.gtag).toHaveBeenCalledWith("config", GA_MEASUREMENT_ID, {
      page_path: "/merge",
    });
  });

  it("trackGa4Event sends a custom event", () => {
    trackGa4Event("tool_complete", { tool_name: "merge" });
    expect(window.gtag).toHaveBeenCalledWith("event", "tool_complete", {
      tool_name: "merge",
    });
  });
});
