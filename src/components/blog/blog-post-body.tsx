import type { ComponentType } from "react";

import { FreePdfToolsNoWatermarksContent } from "@/components/blog/posts/free-pdf-tools-no-watermarks";
import { MergePdfWithoutUploadingContent } from "@/components/blog/posts/merge-pdf-without-uploading";
import { WhyBrowserPdfToolsAreSaferContent } from "@/components/blog/posts/why-browser-pdf-tools-are-safer";
import type { BlogPostMeta } from "@/lib/content/blog-posts";

const BLOG_POST_BODIES: Record<string, ComponentType> = {
  "why-browser-pdf-tools-are-safer": WhyBrowserPdfToolsAreSaferContent,
  "merge-pdf-without-uploading": MergePdfWithoutUploadingContent,
  "free-pdf-tools-no-watermarks": FreePdfToolsNoWatermarksContent,
};

export function BlogPostBody({ post }: { post: BlogPostMeta }) {
  const Body = BLOG_POST_BODIES[post.slug];

  if (!Body) {
    return null;
  }

  return <Body />;
}
