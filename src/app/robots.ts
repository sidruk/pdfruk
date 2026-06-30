import type { MetadataRoute } from "next";

import {
  isSearchEngineIndexingDiscouraged,
  SOCIAL_PREVIEW_CRAWLER_USER_AGENTS,
} from "@/lib/seo/indexing";
import { getSiteUrl } from "@/lib/seo/site";

type RobotsRule = {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

function socialPreviewCrawlerRules(): RobotsRule[] {
  return SOCIAL_PREVIEW_CRAWLER_USER_AGENTS.map((userAgent) => ({
    userAgent,
    allow: "/",
  }));
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  if (isSearchEngineIndexingDiscouraged()) {
    return {
      rules: [
        ...socialPreviewCrawlerRules(),
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      ...socialPreviewCrawlerRules(),
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
