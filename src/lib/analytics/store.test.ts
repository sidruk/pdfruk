import { describe, expect, it, beforeEach } from "vitest";

import { getDailyStats, getTodayKey, incrementPageView, incrementToolUse } from "@/lib/analytics/store";

describe("analytics store", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("tracks page views and tool uses in memory", async () => {
    const date = "2099-01-15";

    await incrementPageView(date);
    await incrementPageView(date);
    await incrementToolUse("merge", date);
    await incrementToolUse("merge", date);
    await incrementToolUse("crop", date);

    const stats = await getDailyStats(date);

    expect(stats.pageviews).toBe(2);
    expect(stats.tools.merge).toBe(2);
    expect(stats.tools.crop).toBe(1);
    expect(stats.totalToolUses).toBe(3);
  });

  it("formats today key as YYYY-MM-DD", () => {
    expect(getTodayKey(new Date("2026-06-28T15:30:00.000Z"))).toBe("2026-06-28");
  });
});
