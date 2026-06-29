import type { Metadata } from "next";

/** Default is discourage until SEARCH_ENGINE_INDEXING=allow is set. */
export function isSearchEngineIndexingDiscouraged(): boolean {
  return (
    process.env.SEARCH_ENGINE_INDEXING?.trim().toLowerCase() !== "allow"
  );
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
