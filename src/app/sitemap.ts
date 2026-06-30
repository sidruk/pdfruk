import type { MetadataRoute } from "next";

import { getLiveTools } from "@/config/tools";
import { getAllBlogPosts, getBlogPostPath } from "@/lib/content/blog-posts";
import { isSearchEngineIndexingDiscouraged } from "@/lib/seo/indexing";
import { ALL_STATIC_PAGES } from "@/lib/seo/static-pages";
import { getSiteUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isSearchEngineIndexingDiscouraged()) {
    return [];
  }
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  const toolEntries = getLiveTools().map((tool) => ({
    url: `${siteUrl}${tool.href}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const staticEntries = ALL_STATIC_PAGES.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: new Date(page.dateModified),
    changeFrequency: "monthly" as const,
    priority: page.sitemapPriority,
  }));

  const blogEntries = getAllBlogPosts().map((post) => ({
    url: `${siteUrl}${getBlogPostPath(post.slug)}`,
    lastModified: new Date(post.dateModified),
    changeFrequency: "monthly" as const,
    priority: post.sitemapPriority,
  }));

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolEntries,
    ...staticEntries,
    ...blogEntries,
  ];
}
