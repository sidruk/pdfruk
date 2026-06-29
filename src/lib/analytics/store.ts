import { Redis } from "@upstash/redis";

import {
  PAGEVIEW_FIELD,
  TRACKABLE_TOOL_IDS,
  type TrackableToolId,
} from "@/lib/analytics/constants";

export type DailyStats = {
  date: string;
  pageviews: number;
  tools: Record<TrackableToolId, number>;
  totalToolUses: number;
};

const STATS_TTL_SECONDS = 90 * 24 * 60 * 60;

const UPSTASH_REDIS_REST_URL = "https://ample-flea-154744.upstash.io";
const UPSTASH_REDIS_REST_TOKEN =
  "gQAAAAAAAlx4AAIgcDE0YmI0NDkwNzE5YTg0YjZkYTRjNzZmMzQ2NDc0ZWI4ZA";

const memoryCounters = new Map<string, number>();

function getRedisClient(): Redis | null {
  if (process.env.NODE_ENV === "test") return null;
  return new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });
}

export function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function statsHashKey(date: string): string {
  return `pdfruk:stats:${date}`;
}

function memoryKey(date: string, field: string): string {
  return `${statsHashKey(date)}:${field}`;
}

async function incrementField(date: string, field: string): Promise<void> {
  const redis = getRedisClient();

  if (redis) {
    const key = statsHashKey(date);
    await redis.hincrby(key, field, 1);
    await redis.expire(key, STATS_TTL_SECONDS);
    return;
  }

  const key = memoryKey(date, field);
  memoryCounters.set(key, (memoryCounters.get(key) ?? 0) + 1);
}

export async function incrementPageView(date = getTodayKey()): Promise<void> {
  await incrementField(date, PAGEVIEW_FIELD);
}

export async function incrementToolUse(
  toolId: TrackableToolId,
  date = getTodayKey(),
): Promise<void> {
  await incrementField(date, toolId);
}

export async function getDailyStats(date = getTodayKey()): Promise<DailyStats> {
  const redis = getRedisClient();
  const key = statsHashKey(date);

  let raw: Record<string, number> | null = null;

  if (redis) {
    raw = await redis.hgetall<Record<string, number>>(key);
  } else {
    raw = {};
    Array.from(memoryCounters.entries()).forEach(([entryKey, count]) => {
      if (!entryKey.startsWith(`${key}:`)) return;
      const field = entryKey.slice(key.length + 1);
      raw![field] = count;
    });
  }

  const tools = Object.fromEntries(
    TRACKABLE_TOOL_IDS.map((toolId) => [toolId, raw?.[toolId] ?? 0]),
  ) as Record<TrackableToolId, number>;

  const totalToolUses = TRACKABLE_TOOL_IDS.reduce(
    (sum, toolId) => sum + tools[toolId],
    0,
  );

  return {
    date,
    pageviews: raw?.[PAGEVIEW_FIELD] ?? 0,
    tools,
    totalToolUses,
  };
}

export function isAnalyticsStorageConfigured(): boolean {
  if (process.env.NODE_ENV === "test") return false;
  return Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);
}
