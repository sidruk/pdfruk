import type { MetadataRoute } from "next";

import { getVisibleTools } from "@/config/tools";
import { isSearchEngineIndexingDiscouraged } from "@/lib/seo/indexing";
import { getSiteUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isSearchEngineIndexingDiscouraged()) {
    return [];
  }
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  const toolEntries = getVisibleTools().map((tool) => ({
    url: `${siteUrl}${tool.href}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolEntries,
  ];
}
