"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TOOLS } from "@/config/tools";
import type { TrackableToolId } from "@/lib/analytics/constants";

type DashboardStats = {
  date: string;
  pageviews: number;
  tools: Record<TrackableToolId, number>;
  totalToolUses: number;
  configured: boolean;
};

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function shiftDate(date: string, days: number): string {
  const parsed = new Date(`${date}T12:00:00`);
  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function AdminDashboard() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async (targetDate: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/stats?date=${targetDate}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load analytics.");
      }

      const data = (await response.json()) as DashboardStats;
      setStats(data);
    } catch {
      setError("Unable to load analytics.");
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats(date);
  }, [date, loadStats]);

  const toolRows = TOOLS.filter((tool) => tool.status === "live").map((tool) => ({
    id: tool.id as TrackableToolId,
    title: tool.title,
    count: stats?.tools[tool.id as TrackableToolId] ?? 0,
  }));

  const sortedToolRows = [...toolRows].sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-brand-red">
            <BarChart3 className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Admin
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-charcoal dark:text-foreground">
            Analytics dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Anonymous usage counts for pdfruk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDate((current) => shiftDate(current, -1))}
          >
            Previous day
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={date >= new Date().toISOString().slice(0, 10)}
            onClick={() => setDate((current) => shiftDate(current, 1))}
          >
            Next day
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Refresh stats"
            onClick={() => void loadStats(date)}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        {formatDateLabel(date)}
      </p>

      {stats && !stats.configured ? (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Redis is not configured. Counts are stored in memory only and reset
          when the server restarts. Add{" "}
          <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
            UPSTASH_REDIS_REST_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
            UPSTASH_REDIS_REST_TOKEN
          </code>{" "}
          for persistent stats in production.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Page views</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {isLoading ? "—" : (stats?.pageviews ?? 0).toLocaleString()}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Tool uses</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {isLoading ? "—" : (stats?.totalToolUses ?? 0).toLocaleString()}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Active tools</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {isLoading
              ? "—"
              : sortedToolRows.filter((row) => row.count > 0).length}
          </p>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Tool activity</h2>
        </div>
        <div className="divide-y">
          {sortedToolRows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span>{row.title}</span>
              <span className="font-semibold tabular-nums">
                {isLoading ? "—" : row.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
