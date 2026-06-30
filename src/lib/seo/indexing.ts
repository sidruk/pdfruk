import type { Metadata } from "next";

/** Meta, X, and LinkedIn crawlers that fetch Open Graph previews. */
export const SOCIAL_PREVIEW_CRAWLER_USER_AGENTS = [
  "facebookexternalhit",
  "Facebot",
  "meta-externalagent",
  "meta-externalfetcher",
  "Twitterbot",
  "LinkedInBot",
] as const;

export function isSocialPreviewCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;

  const normalized = userAgent.toLowerCase();
  return SOCIAL_PREVIEW_CRAWLER_USER_AGENTS.some((crawler) =>
    normalized.includes(crawler.toLowerCase()),
  );
}

/**
 * Indexing is allowed in production by default.
 * Set SEARCH_ENGINE_INDEXING=discourage to block crawlers (e.g. staging).
 */
export function isSearchEngineIndexingDiscouraged(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (process.env.VERCEL_ENV === "preview") return true;

  const flag = process.env.SEARCH_ENGINE_INDEXING?.trim().toLowerCase();
  return flag === "discourage" || flag === "block" || flag === "no";
}

export const DISCOURAGED_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export const ALLOWED_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export function getRobotsMetadata(noIndex = false): NonNullable<Metadata["robots"]> {
  return noIndex || isSearchEngineIndexingDiscouraged()
    ? DISCOURAGED_ROBOTS
    : ALLOWED_ROBOTS;
}
