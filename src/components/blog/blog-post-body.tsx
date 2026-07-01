import type { ComponentType } from "react";

import { BestFreePdfEditorFreelancersContent } from "@/components/blog/posts/best-free-pdf-editor-freelancers";
import { FreePdfToolsNoWatermarksContent } from "@/components/blog/posts/free-pdf-tools-no-watermarks";
import { IsItSafeToMergePdfOnlineContent } from "@/components/blog/posts/is-it-safe-to-merge-pdf-online";
import { MergePdfWithoutUploadingContent } from "@/components/blog/posts/merge-pdf-without-uploading";
import { PasswordProtectPdfJobApplicationsContent } from "@/components/blog/posts/password-protect-pdf-job-applications";
import { PdfToolsForHrGdprContent } from "@/components/blog/posts/pdf-tools-for-hr-gdpr";
import { WhyBrowserPdfToolsAreSaferContent } from "@/components/blog/posts/why-browser-pdf-tools-are-safer";
import type { BlogPostMeta } from "@/lib/content/blog-posts";

const BLOG_POST_BODIES: Record<string, ComponentType> = {
  "password-protect-pdf-job-applications":
    PasswordProtectPdfJobApplicationsContent,
  "pdf-tools-for-hr-gdpr": PdfToolsForHrGdprContent,
  "best-free-pdf-editor-freelancers": BestFreePdfEditorFreelancersContent,
  "is-it-safe-to-merge-pdf-online": IsItSafeToMergePdfOnlineContent,
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
